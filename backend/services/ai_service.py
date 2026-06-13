from __future__ import annotations

import re
import uuid
from pathlib import Path
from urllib.request import urlopen

from PIL import Image, ImageDraw

from services.llm_service import (
    generate_hunyuan_image,
    llm_chat_messages,
    resolve_image_config,
    resolve_llm_config,
    _is_valid_api_key,
)
from services.reply_format import format_chat_reply

GENERATED_DIR = Path(__file__).resolve().parents[1] / "generated"
GENERATED_DIR.mkdir(exist_ok=True)

HR_OUTPUT_RULES = (
    "【输出规范】\n"
    "1. 用自然、专业的中文，像资深 HR 同事在聊天，不要像文档模板。\n"
    "2. 禁止使用 Markdown 标题（不要用 #、##、###）。\n"
    "3. 需要分节时用「一、二、三」或「版本 A / B / C」，不要加粗符号 **。\n"
    "4. 回复尽量简洁，优先给可直接改用的成稿。\n"
)

IMAGE_KEYWORDS = (
    "海报", "出图", "生图", "主视觉", "配图", "画面", "设计一张", "生成图",
    "AIGC", "竖版", "主标题", "视觉", "KV", "banner",
)
STRONG_IMAGE_HINTS = ("海报", "出图", "生图", "主视觉", "生成图", "设计一张", "AIGC")
TEXT_ONLY_HINTS = ("怎么写", "如何写", "技巧", "建议", "解释", "什么是", "什么意思", "区别", "注意", "什么意思")


TEXT_ONLY_OPT_OUT = ("仅文字", "不要出图", "不用生图", "只回答", "文字说明", "不用生成")


def wants_image_generation(content: str, mode: str) -> bool:
    text = content.strip()
    if not text:
        return False
    if any(o in text for o in TEXT_ONLY_OPT_OUT):
        return False
    if mode == "image_gen":
        if any(h in text for h in TEXT_ONLY_HINTS):
            return any(k in text for k in STRONG_IMAGE_HINTS)
        return True
    return any(k.lower() in text.lower() for k in IMAGE_KEYWORDS)


def image_tool_available(task: dict, chat_cfg: dict, *, force_image: bool = False) -> bool:
    """任意任务均可调用混元生图（需 IMAGE_PROVIDER=hunyuan 且 Key 有效）。"""
    img_cfg = resolve_image_config()
    return img_cfg["provider"] == "hunyuan" and _is_valid_api_key(img_cfg.get("api_key", ""))


def effective_max_images(task: dict, chat_cfg: dict) -> int:
    n = int(chat_cfg.get("max_images") or 0)
    return n if n > 0 else 5


def should_run_image_gen(
    content: str,
    mode: str,
    task: dict,
    chat_cfg: dict,
    force_image: bool = False,
) -> bool:
    if not image_tool_available(task, chat_cfg, force_image=force_image):
        return False
    if force_image:
        return True
    if any(o in content for o in TEXT_ONLY_OPT_OUT):
        return False
    if mode == "image_gen" or task.get("type") == "aigc_poster":
        if any(h in content for h in TEXT_ONLY_HINTS) and not any(k in content for k in STRONG_IMAGE_HINTS):
            return False
        return True
    return wants_image_generation(content, mode)


def build_hr_system_prompt(task_title: str, brief: str = "", mode: str = "text_gen") -> str:
    base = (
        "你是腾讯 HR 实训场景的 AI 助手，帮助培训生完成雇主品牌、招聘沟通等任务。\n"
        f"{HR_OUTPUT_RULES}\n"
        f"当前任务：{task_title}\n"
    )
    if brief:
        base += f"\n【任务 Brief】\n{brief}\n"
    if mode == "image_gen":
        base += (
            "\n【AIGC 模式】\n"
            "用户描述海报需求时，你会协助润色 Prompt；实际出图由混元生图完成。\n"
            "若用户只是在问写法或技巧，用文字回答，不要假装已经出图。\n"
        )
    elif mode == "dialogue_sim":
        base += "\n你正在模拟业务方对话，语气真实但专业，一次只推进一个关切点。\n"
    else:
        base += "\n优先给出 2–3 个可直接选用的版本，并标注适用场景。\n"
    return base


POSTER_QUALITY_SUFFIX = (
    "竖版商业招聘海报，1080×1920构图，主视觉居中偏上，上方三分之一留白供后期加标题，"
    "腾讯品牌蓝#006EFF点缀，年轻科技与人文并存，精致插画或高端3D渲染，"
    "柔和侧光，层次分明，高清细节，专业平面设计质感"
)


def _prompt_already_rich(text: str) -> bool:
    markers = ("主视觉", "构图", "留白", "光影", "腾讯蓝", "1080", "3D", "插画")
    return sum(1 for m in markers if m in text) >= 3 and len(text) >= 40


def enhance_image_prompt(user_content: str, task_title: str, brief: str = "") -> str:
    """Turn natural language into a high-quality poster prompt for 混元生图."""
    text = user_content.strip()
    if not text:
        return POSTER_QUALITY_SUFFIX + "。"

    if _prompt_already_rich(text):
        return text if text.endswith("。") else f"{text}。"

    system = (
        "你是资深 AIGC 商业海报 Prompt 工程师，为腾讯 HR 校招/雇主品牌出图。\n"
        "根据用户描述，输出一段中文生图 Prompt（120–220 字），须包含：\n"
        "1. 画面主题与 1–2 个核心意象\n"
        "2. 构图：竖版海报，主视觉位置，留白区域（供后期加标题）\n"
        "3. 风格：年轻科技、专业可信、腾讯雇主品牌气质\n"
        "4. 色彩：腾讯蓝 #006EFF 为主点缀，搭配白/浅灰留白\n"
        "5. 光影与质感：商业插画或高端 3D，柔和光线，高清细节\n"
        "禁止 Markdown、禁止解释，只输出 Prompt 正文。"
    )
    user = f"任务：{task_title}\nBrief 摘要：{brief[:400]}\n用户需求：{text}"
    refined = llm_chat_messages(
        [{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.35,
        max_tokens=384,
    )
    if refined:
        cleaned = format_chat_reply(refined).strip()
        if len(cleaned) >= 20:
            if "1080" not in cleaned and "竖版" not in cleaned:
                cleaned = f"{cleaned}。{POSTER_QUALITY_SUFFIX}。"
            return cleaned if cleaned.endswith("。") else f"{cleaned}。"

    extras = []
    if "2026" in text or "校招" in text:
        extras.append("2026校园招聘主视觉")
    extras.append(POSTER_QUALITY_SUFFIX)
    return f"{text}。{'，'.join(extras)}。"


def generate_mock_poster(prompt: str, title: str = "") -> str:
    w, h = 540, 960
    img = Image.new("RGB", (w, h), color=(0, 110, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, h - 200, w, h], fill=(255, 255, 255))
    lines = [title or "2026 校招", "Tencent HR Sim", "Mock Preview"]
    snippet = (prompt[:36] + "…") if len(prompt) > 36 else prompt
    if snippet:
        lines.append(snippet)
    y = 80
    for i, line in enumerate(lines):
        draw.text((40, y + i * 48), line, fill=(255, 255, 255) if i < 3 else (200, 230, 255))
    file_id = uuid.uuid4().hex[:12]
    path = GENERATED_DIR / f"{file_id}.png"
    img.save(path, format="PNG")
    return f"/generated/{file_id}.png"


def _save_remote_image(url: str) -> str | None:
    try:
        with urlopen(url, timeout=60) as resp:
            data = resp.read()
            content_type = (resp.headers.get("Content-Type") or "").lower()
        ext = ".jpg"
        if "png" in content_type or url.lower().endswith(".png"):
            ext = ".png"
        elif "webp" in content_type or url.lower().endswith(".webp"):
            ext = ".webp"
        file_id = uuid.uuid4().hex[:12]
        path = GENERATED_DIR / f"{file_id}{ext}"
        path.write_bytes(data)
        return f"/generated/{file_id}{ext}"
    except Exception as e:
        print(f"[image save] {e}")
        return None


def generate_poster(prompt: str, title: str = "") -> tuple[str, str, str]:
    """Returns (url_path, provider_label, prompt_used)."""
    img_cfg = resolve_image_config()
    full_prompt = prompt.strip()
    if title and title not in full_prompt:
        full_prompt = f"{full_prompt}。海报主标题：{title}。"

    if img_cfg["provider"] == "hunyuan":
        remote = generate_hunyuan_image(full_prompt)
        if remote:
            local = _save_remote_image(remote)
            if local:
                return local, "hunyuan", full_prompt
            return remote, "hunyuan-remote", full_prompt
        print("[image] hunyuan generation failed, falling back to mock")

    return generate_mock_poster(prompt, title), "mock", full_prompt


def chat_text_response(
    mode: str,
    user_content: str,
    task_title: str,
    system_context: str = "",
    history: list[dict[str, str]] | None = None,
) -> tuple[str, str]:
    """Returns (reply_text, source) where source is hunyuan|mock."""
    system = system_context or build_hr_system_prompt(task_title, mode=mode)

    messages: list[dict[str, str]] = [{"role": "system", "content": system}]
    if history:
        for m in history:
            if m.get("role") in ("user", "assistant") and m.get("content"):
                messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": user_content})

    llm_reply = llm_chat_messages(messages, temperature=0.55, max_tokens=1024)
    if llm_reply:
        return format_chat_reply(llm_reply), resolve_llm_config()["provider"]

    if mode == "dialogue_sim":
        return (
            "（模拟业务方）你说的我理解，但我们需要的是本周内能到岗的人。"
            "你们 HR 能不能给个明确数字？",
            "mock",
        )
    if "3 版" in user_content or "三版" in user_content or "草稿" in user_content:
        return (
            "版本 A（正式）：感谢关注，经核对目前可发 Offer 2 名，最早到岗时间为 4 周后…\n\n"
            "版本 B（简洁）：HC 确认 2 名，4 周到岗；若需加急我可协调实习生转正路径。\n\n"
            "版本 C（共情）：理解业务急迫，我们同步梳理 HC 与 timeline，今日 18:00 前书面确认…",
            "mock",
        )
    if re.search(r"slogan", task_title, re.I):
        return "建议方向：① 码上未来 ② AI 与你，共创无限 ③ 在腾讯，定义下一行代码", "mock"
    return (
        f"已根据你的描述生成草案。建议补充：受众、语气、字数限制。\n"
        f"针对「{user_content[:40]}…」可尝试更具体的场景与行动号召。",
        "mock",
    )
