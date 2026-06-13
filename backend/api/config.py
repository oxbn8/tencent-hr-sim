from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

from services.llm_service import get_ai_config

router = APIRouter(prefix="/api/config", tags=["config"])

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def _load_tasks(role: str) -> list[dict]:
    path = DATA_DIR / "tasks" / f"{role}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


@router.get("/org")
def get_org():
    return json.loads((DATA_DIR / "org_tree.json").read_text(encoding="utf-8"))


@router.get("/ai-model")
def get_ai_model():
    return get_ai_config()


@router.get("/roles")
def get_roles():
    return json.loads((DATA_DIR / "roles.json").read_text(encoding="utf-8"))


def _map_brief(template: str, bg_name: str, team_name: str, player_name: str, max_len: int = 110) -> str:
    brief = template.format(bg_name=bg_name, team_name=team_name, player_name=player_name)
    lines = [
        ln.strip()
        for ln in brief.split("\n")
        if ln.strip() and not ln.startswith("【")
    ]
    text = " ".join(lines[:3])
    if len(text) > max_len:
        return text[: max_len - 1] + "…"
    return text


@router.get("/tasks")
def list_tasks(
    role: str = Query(..., pattern="^(creative|comm)$"),
    bg_name: str = "腾讯",
    team_name: str = "业务团队",
    player_name: str = "培训生",
):
    tasks = _load_tasks(role)
    return [
        {
            "id": t["id"],
            "day": t["day"],
            "title": t["title"],
            "title_rendered": t["title"].format(team_name=team_name, bg_name=bg_name),
            "map_brief": _map_brief(t["brief_template"], bg_name, team_name, player_name),
            "type": t["type"],
            "time_limit_seconds": t["time_limit_seconds"],
            "scoring_mode": t["scoring"]["mode"],
        }
        for t in tasks
    ]


@router.get("/task/{task_id}")
def get_task(
    task_id: str,
    bg_name: str = "腾讯",
    team_name: str = "业务团队",
    player_name: str = "培训生",
):
    for role in ("creative", "comm"):
        for t in _load_tasks(role):
            if t["id"] == task_id:
                brief = t["brief_template"].format(
                    bg_name=bg_name,
                    team_name=team_name,
                    player_name=player_name,
                )
                title = t["title"].format(team_name=team_name, bg_name=bg_name)
                return {**t, "brief_rendered": brief, "title_rendered": title}
    raise HTTPException(404, "Task not found")


@router.get("/admin-stats")
def get_admin_stats():
    """管理看板数据（与 /api/admin/stats 相同，兼容旧版后端热更新）。"""
    from api.admin import admin_stats

    return admin_stats()
