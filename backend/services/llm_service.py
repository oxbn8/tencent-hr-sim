from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from typing import Any


HUNYUAN_CHAT_DEFAULT_BASE = "https://api.hunyuan.cloud.tencent.com/v1"
HUNYUAN_CHAT_DEFAULT_MODEL = "hunyuan-turbos-latest"

TOKENHUB_CHAT_DEFAULT_BASE = "https://tokenhub.tencentmaas.com/v1"
TOKENHUB_IMAGE_LITE_URL = "https://tokenhub.tencentmaas.com/v1/api/image/lite"
TOKENHUB_IMAGE_SUBMIT_URL = "https://tokenhub.tencentmaas.com/v1/api/image/submit"
TOKENHUB_IMAGE_QUERY_URL = "https://tokenhub.tencentmaas.com/v1/api/image/query"
HUNYUAN_IMAGE_LITE_MODEL = "hy-image-lite"
HUNYUAN_IMAGE_V3_MODEL = "hy-image-v3.0"
HUNYUAN_IMAGE_DEFAULT_RESOLUTION = "1080:1920"
DEFAULT_IMAGE_NEGATIVE_PROMPT = (
    "模糊, 低质量, 畸形, 水印, 乱码文字, 变形, 噪点, 过度曝光, "
    "丑陋, 低分辨率, 扭曲手指, 多余肢体, 画面杂乱"
)


_PLACEHOLDER_KEYS = frozenset(
    {
        "your-hunyuan-api-key",
        "your-api-key",
        "sk-xxx",
        "changeme",
        "replace-me",
    }
)


def _api_key() -> str:
    return (
        os.getenv("HUNYUAN_API_KEY", "")
        or os.getenv("LLM_API_KEY", "")
        or os.getenv("IMAGE_API_KEY", "")
    ).strip()


def _is_valid_api_key(key: str) -> bool:
    if not key or len(key) < 12:
        return False
    lowered = key.lower()
    if lowered in _PLACEHOLDER_KEYS or lowered.startswith("your-"):
        return False
    return True


def resolve_llm_config() -> dict[str, str]:
    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    api_key = _api_key()

    if provider == "hunyuan":
        base_url = os.getenv("LLM_BASE_URL", HUNYUAN_CHAT_DEFAULT_BASE).rstrip("/")
        model = os.getenv("LLM_MODEL", HUNYUAN_CHAT_DEFAULT_MODEL)
    elif provider == "openai":
        base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    else:
        base_url = os.getenv("LLM_BASE_URL", "").rstrip("/")
        model = os.getenv("LLM_MODEL", "mock-hr-assistant-v1")

    return {
        "provider": provider,
        "base_url": base_url,
        "model": model,
        "api_key": api_key,
    }


def _is_v3_image_model(model: str) -> bool:
    lowered = model.lower()
    return "v3" in lowered or lowered in ("hy-image-v3.0", "hy-image-v3")


def resolve_image_config() -> dict[str, str]:
    provider = os.getenv("IMAGE_PROVIDER", "mock").lower()
    if provider == "hunyuan":
        return {
            "provider": "hunyuan",
            "model": os.getenv("IMAGE_MODEL", HUNYUAN_IMAGE_V3_MODEL),
            "api_key": _api_key(),
            "lite_url": os.getenv("HUNYUAN_IMAGE_LITE_URL", TOKENHUB_IMAGE_LITE_URL),
            "submit_url": os.getenv("HUNYUAN_IMAGE_SUBMIT_URL", TOKENHUB_IMAGE_SUBMIT_URL),
            "query_url": os.getenv("HUNYUAN_IMAGE_QUERY_URL", TOKENHUB_IMAGE_QUERY_URL),
            "resolution": os.getenv("HUNYUAN_IMAGE_RESOLUTION", HUNYUAN_IMAGE_DEFAULT_RESOLUTION),
            "negative_prompt": os.getenv("HUNYUAN_IMAGE_NEGATIVE_PROMPT", DEFAULT_IMAGE_NEGATIVE_PROMPT),
        }
    if provider == "openai":
        return {
            "provider": "openai",
            "model": os.getenv("IMAGE_MODEL", "dall-e-3"),
            "api_key": os.getenv("IMAGE_API_KEY", _api_key()),
            "base_url": os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
        }
    return {"provider": "mock", "model": "mock-poster-v1", "api_key": ""}


def get_ai_config() -> dict[str, Any]:
    llm = resolve_llm_config()
    img = resolve_image_config()
    chat_ready = llm["provider"] != "mock" and _is_valid_api_key(llm["api_key"])
    image_ready = img["provider"] != "mock" and _is_valid_api_key(img.get("api_key", ""))

    return {
        "chat": {
            "provider": llm["provider"],
            "model": llm["model"],
            "base_url": llm["base_url"] if llm["provider"] != "mock" else "",
            "upgradeable": True,
            "configured": chat_ready,
            "description": _provider_desc(llm["provider"]),
        },
        "image": {
            "provider": img["provider"],
            "model": img["model"],
            "upgradeable": True,
            "configured": image_ready,
        },
        "scoring": {
            "provider": llm["provider"] if chat_ready else "rules+mock",
            "model": os.getenv("SCORE_MODEL", "rules-engine-v1"),
        },
        "setup_hint": _setup_hint(llm, img, chat_ready, image_ready),
    }


def _provider_desc(provider: str) -> str:
    return {
        "mock": "内置规则引擎 + 模板回复（无需 API Key）",
        "openai": "OpenAI 兼容 Chat Completions",
        "hunyuan": "腾讯混元大模型（OpenAI 兼容接口）",
    }.get(provider, "自定义 LLM")


def _setup_hint(llm: dict, img: dict, chat_ready: bool, image_ready: bool) -> str:
    if llm["provider"] == "hunyuan" and not chat_ready:
        return "请设置 HUNYUAN_API_KEY 或 LLM_API_KEY，并 LLM_PROVIDER=hunyuan"
    if img["provider"] == "hunyuan" and not image_ready:
        return "出图需 TokenHub API Key（与混元控制台 Key 可能相同，见 README）"
    if chat_ready and llm["provider"] == "hunyuan":
        return f"已配置混元对话：{llm['model']}"
    return ""


def _post_json(url: str, payload: dict, api_key: str, timeout: int = 60) -> dict | None:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8", errors="replace")[:300]
        except Exception:
            err_body = str(e)
        print(f"[LLM HTTP {e.code}] {url}: {err_body}")
        return None
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError, KeyError) as e:
        print(f"[LLM error] {url}: {e}")
        return None


def llm_chat(system: str, user: str, temperature: float = 0.7) -> str | None:
    return llm_chat_messages(
        [{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=temperature,
    )


def llm_chat_messages(
    messages: list[dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int | None = None,
) -> str | None:
    cfg = resolve_llm_config()
    if cfg["provider"] == "mock" or not _is_valid_api_key(cfg["api_key"]):
        return None

    token_limit = max_tokens or int(os.getenv("LLM_MAX_TOKENS", "1024"))
    payload: dict[str, Any] = {
        "model": cfg["model"],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": token_limit,
    }
    if cfg["provider"] == "hunyuan":
        payload["enable_enhancement"] = os.getenv("HUNYUAN_ENABLE_ENHANCEMENT", "false").lower() == "true"

    chat_timeout = int(os.getenv("LLM_CHAT_TIMEOUT", "45"))
    data = _post_json(f"{cfg['base_url']}/chat/completions", payload, cfg["api_key"], timeout=chat_timeout)
    if not data:
        return None
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return None


def _generate_hunyuan_lite(prompt: str, cfg: dict[str, str], resolution: str) -> str | None:
    payload: dict[str, Any] = {
        "model": cfg["model"],
        "prompt": prompt,
        "rsp_img_type": "url",
        "resolution": resolution,
    }
    neg = cfg.get("negative_prompt", "").strip()
    if neg:
        payload["negative_prompt"] = neg

    data = _post_json(
        cfg["lite_url"],
        payload,
        cfg["api_key"],
        timeout=int(os.getenv("IMAGE_GEN_TIMEOUT", "60")),
    )
    if not data:
        return None
    try:
        return data["data"][0]["url"]
    except (KeyError, IndexError, TypeError):
        print(f"[image lite] unexpected response: {str(data)[:200]}")
        return None


def _generate_hunyuan_v3(prompt: str, cfg: dict[str, str], resolution: str) -> str | None:
    submit_payload: dict[str, Any] = {
        "model": cfg["model"],
        "prompt": prompt,
        "size": resolution,
    }
    neg = cfg.get("negative_prompt", "").strip()
    if neg:
        submit_payload["negative_prompt"] = neg

    submit = _post_json(cfg["submit_url"], submit_payload, cfg["api_key"], timeout=30)
    if not submit:
        return None

    job_id = submit.get("id")
    if not job_id:
        print(f"[image v3] submit missing id: {str(submit)[:200]}")
        return None

    poll_interval = float(os.getenv("HUNYUAN_IMAGE_POLL_INTERVAL", "2"))
    max_wait = int(os.getenv("IMAGE_GEN_TIMEOUT", "120"))
    deadline = time.monotonic() + max_wait
    query_payload = {"model": cfg["model"], "id": job_id}

    while time.monotonic() < deadline:
        time.sleep(poll_interval)
        result = _post_json(cfg["query_url"], query_payload, cfg["api_key"], timeout=30)
        if not result:
            continue

        status = result.get("status", "")
        if status == "completed":
            try:
                return result["data"][0]["url"]
            except (KeyError, IndexError, TypeError):
                print(f"[image v3] completed but no url: {str(result)[:200]}")
                return None
        if status in ("failed", "error", "cancelled"):
            print(f"[image v3] job {status}: {str(result)[:200]}")
            return None

    print(f"[image v3] poll timeout after {max_wait}s, job={job_id}")
    return None


def generate_hunyuan_image(prompt: str, resolution: str | None = None) -> str | None:
    """Call TokenHub 混元生图（默认 HY-Image-V3.0）；returns remote URL or None."""
    cfg = resolve_image_config()
    if cfg["provider"] != "hunyuan" or not _is_valid_api_key(cfg.get("api_key", "")):
        return None

    res = resolution or cfg.get("resolution", HUNYUAN_IMAGE_DEFAULT_RESOLUTION)
    model = cfg.get("model", HUNYUAN_IMAGE_V3_MODEL)

    if _is_v3_image_model(model):
        url = _generate_hunyuan_v3(prompt, cfg, res)
        if url:
            return url
        if os.getenv("HUNYUAN_IMAGE_FALLBACK_LITE", "true").lower() == "true":
            print("[image] v3 failed, falling back to hy-image-lite")
            lite_cfg = {**cfg, "model": HUNYUAN_IMAGE_LITE_MODEL}
            return _generate_hunyuan_lite(prompt, lite_cfg, res)
        return None

    return _generate_hunyuan_lite(prompt, cfg, res)
