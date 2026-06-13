from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ai_service import (
    build_hr_system_prompt,
    chat_text_response,
    enhance_image_prompt,
    generate_poster,
    image_tool_available,
    should_run_image_gen,
)
from services.dialogue_service import apply_choice, get_tree, opening_message
from services.llm_service import get_ai_config

router = APIRouter(prefix="/api/chat", tags=["chat"])

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
SESSIONS: dict[str, dict[str, Any]] = {}


def _load_tasks() -> dict[str, dict]:
    tasks: dict[str, dict] = {}
    for name in ("creative", "comm"):
        path = DATA_DIR / "tasks" / f"{name}.json"
        for t in json.loads(path.read_text(encoding="utf-8")):
            tasks[t["id"]] = t
    return tasks


TASKS = _load_tasks()


class SessionCreate(BaseModel):
    task_id: str
    context: dict[str, str] = Field(default_factory=dict)


class MessageCreate(BaseModel):
    session_id: str
    content: str = ""
    choice_id: str = ""
    force_image: bool = False


def _public_messages(sess: dict[str, Any]) -> list[dict]:
    return [m for m in sess["messages"] if m.get("role") != "system"]


@router.post("/session")
def create_session(body: SessionCreate):
    task = TASKS.get(body.task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    sid = uuid.uuid4().hex
    brief = task["brief_template"].format(
        bg_name=body.context.get("bg_name", "腾讯"),
        team_name=body.context.get("team_name", "业务团队"),
        player_name=body.context.get("player_name", "培训生"),
    )
    chat_mode = task["chat"]["mode"]
    system = build_hr_system_prompt(task["title"], brief, chat_mode)
    SESSIONS[sid] = {
        "task_id": body.task_id,
        "task": task,
        "brief": brief,
        "messages": [{"role": "system", "content": system, "id": uuid.uuid4().hex}],
        "images_generated": 0,
        "last_ai_draft": "",
        "dialogue_node": None,
    }

    welcome: str | None = None
    dialogue_opening = None
    dialogue_choices: list[dict] = []

    ai_cfg = get_ai_config()
    img_tool = image_tool_available(task, task["chat"], force_image=True) and ai_cfg["image"].get(
        "configured", False
    )

    if chat_mode == "dialogue_sim":
        welcome = None
    elif img_tool:
        welcome = (
            "你好，我是混元 AI 助手。输入提示词后点「生图」可 AIGC 出图（约 10–30 秒）；"
            "点「文字」获取话术/文案草稿。"
        )
    elif chat_mode == "text_gen":
        welcome = "你好，我是 HR 助手。告诉我你的场景和需求，我会给出 2–3 版可直接改用的草稿。"

    if welcome:
        SESSIONS[sid]["messages"].append(
            {"role": "assistant", "content": welcome, "id": uuid.uuid4().hex}
        )

    if chat_mode == "dialogue_sim" and get_tree(body.task_id):
        opening = opening_message(body.task_id)
        if opening:
            SESSIONS[sid]["dialogue_node"] = opening["node_id"]
            npc_line = f"【{opening['speaker']}】{opening['text']}"
            SESSIONS[sid]["messages"].append(
                {
                    "role": "assistant",
                    "content": npc_line,
                    "id": uuid.uuid4().hex,
                    "speaker": opening["speaker"],
                    "dialogue": True,
                }
            )
            dialogue_opening = npc_line
            dialogue_choices = opening["choices"]

    return {
        "session_id": sid,
        "system_message": system,
        "chat_mode": chat_mode,
        "image_tool_enabled": img_tool,
        "prompt_tips": task["chat"].get("prompt_tips_checklist", []),
        "ai_model": ai_cfg["chat"],
        "image_model": ai_cfg["image"],
        "ai_setup_hint": ai_cfg.get("setup_hint", ""),
        "dialogue_choices": dialogue_choices,
        "dialogue_opening": dialogue_opening,
        "initial_messages": _public_messages(SESSIONS[sid]),
    }


@router.get("/session/{session_id}")
def get_session(session_id: str):
    sess = SESSIONS.get(session_id)
    if not sess:
        raise HTTPException(404, "Session not found")
    return {
        "messages": _public_messages(sess),
        "last_ai_draft": sess.get("last_ai_draft", ""),
    }


@router.post("/message")
def send_message(body: MessageCreate):
    sess = SESSIONS.get(body.session_id)
    if not sess:
        raise HTTPException(404, "Session not found")
    task = sess["task"]
    chat_cfg = task["chat"]
    user_turns = len([m for m in sess["messages"] if m["role"] == "user"])
    if user_turns >= chat_cfg.get("max_turns", 20):
        raise HTTPException(400, "已达最大对话轮次")

    mode = chat_cfg["mode"]
    images: list[dict] = []
    assistant_text = ""
    dialogue_choices: list[dict] = []
    mentor_note = ""
    ai_source = "mock"
    action = "text"

    if mode == "dialogue_sim" and get_tree(task["id"]) and body.choice_id:
        node_id = sess.get("dialogue_node") or ""
        result = apply_choice(task["id"], node_id, body.choice_id)
        if not result:
            raise HTTPException(400, "无效的分支选择")
        user_msg = {
            "role": "user",
            "content": result["user_line"],
            "id": uuid.uuid4().hex,
            "dialogue": True,
        }
        sess["messages"].append(user_msg)
        npc_line = f"【{result['speaker']}】{result['npc_text']}"
        sess["dialogue_node"] = result["npc_node_id"]
        sess["messages"].append(
            {
                "role": "assistant",
                "content": npc_line,
                "id": uuid.uuid4().hex,
                "speaker": result["speaker"],
                "dialogue": True,
            }
        )
        assistant_text = npc_line
        dialogue_choices = result["choices"]
        mentor_note = result.get("mentor_note", "")
        sess["last_ai_draft"] = result["user_line"]
        return {
            "messages": _public_messages(sess),
            "assistant_text": assistant_text,
            "images": images,
            "last_ai_draft": sess.get("last_ai_draft", ""),
            "ai_source": "dialogue_tree",
            "action": "dialogue",
            "dialogue_choices": dialogue_choices,
            "dialogue_terminal": result.get("terminal", False),
            "mentor_note": mentor_note,
        }

    if not body.content.strip():
        raise HTTPException(400, "消息不能为空")

    user_msg = {"role": "user", "content": body.content, "id": uuid.uuid4().hex}
    sess["messages"].append(user_msg)

    should_gen_image = body.force_image or should_run_image_gen(
        body.content,
        mode,
        task,
        chat_cfg,
        force_image=body.force_image,
    )

    img_cfg = get_ai_config()["image"]
    if body.force_image and not img_cfg.get("configured"):
        should_gen_image = False
        assistant_text = (
            "混元 AIGC 生图未就绪。请确认 backend/.env 中：\n"
            "IMAGE_PROVIDER=hunyuan\n"
            "HUNYUAN_API_KEY=你的Key\n"
            "并重启后端 python main.py"
        )
        sess["messages"].append(
            {"role": "assistant", "content": assistant_text, "id": uuid.uuid4().hex}
        )
        return {
            "messages": _public_messages(sess),
            "assistant_text": assistant_text,
            "images": [],
            "last_ai_draft": sess.get("last_ai_draft", ""),
            "ai_source": "none",
            "action": "error",
        }

    if should_gen_image and not image_tool_available(task, chat_cfg, force_image=body.force_image):
        should_gen_image = False

    if should_gen_image:
        action = "image_gen"
        max_img = effective_max_images(task, chat_cfg)
        if sess["images_generated"] >= max_img:
            assistant_text = "本轮任务图片生成次数已达上限，请从已有图片中选择一张提交。"
            sess["messages"].append(
                {"role": "assistant", "content": assistant_text, "id": uuid.uuid4().hex}
            )
        else:
            title_hint = "2026 校招" if ("2026" in body.content or "校招" in body.content) else ""
            prompt_used = enhance_image_prompt(body.content, task["title"], sess.get("brief", ""))
            url, img_provider, final_prompt = generate_poster(prompt_used, title_hint)
            sess["images_generated"] += 1
            msg_id = uuid.uuid4().hex
            images.append({"message_id": msg_id, "url": url, "index": 0, "prompt": final_prompt})
            ai_source = img_provider
            if img_provider in ("hunyuan", "hunyuan-remote"):
                assistant_text = (
                    f"已根据你的描述生成海报（混元 HY-Image V3.0）。\n"
                    f"使用 Prompt：{final_prompt[:120]}{'…' if len(final_prompt) > 120 else ''}\n"
                    "提示：描述越具体（主题、构图、色彩、留白）效果越好；可继续迭代或点击「选为提交海报」。"
                )
            else:
                assistant_text = (
                    "生图服务暂不可用，以下为演示预览。\n"
                    "请确认 backend/.env 中 IMAGE_PROVIDER=hunyuan 且 API Key 有效。"
                )
            sess["messages"].append(
                {
                    "role": "assistant",
                    "content": assistant_text,
                    "id": msg_id,
                    "images": [url],
                    "prompt_used": final_prompt,
                }
            )
    else:
        action = "text"
        history = [m for m in sess["messages"] if m["role"] in ("user", "assistant")]
        assistant_text, ai_source = chat_text_response(
            mode,
            body.content,
            task["title"],
            sess["messages"][0]["content"],
            history=history[:-1],
        )
        sess["last_ai_draft"] = assistant_text
        sess["messages"].append(
            {"role": "assistant", "content": assistant_text, "id": uuid.uuid4().hex}
        )

    return {
        "messages": _public_messages(sess),
        "assistant_text": assistant_text,
        "images": images,
        "last_ai_draft": sess.get("last_ai_draft", ""),
        "ai_source": ai_source,
        "action": action,
    }
