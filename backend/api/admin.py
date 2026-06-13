from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from api.submit import SUBMISSIONS, FEEDBACK_FILE
from services.llm_service import get_ai_config

router = APIRouter(prefix="/api/admin", tags=["admin"])

SUBMISSIONS_LOG = Path(__file__).resolve().parents[1] / "data" / "submissions.jsonl"


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def _all_submissions() -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for row in _read_jsonl(SUBMISSIONS_LOG):
        by_id[row.get("submission_id", row.get("id", ""))] = row
    for sid, row in SUBMISSIONS.items():
        by_id[sid] = row
    return list(by_id.values())


@router.get("/stats")
def admin_stats():
    subs = _all_submissions()
    feedback = _read_jsonl(FEEDBACK_FILE)

    total = len(subs)
    passed = sum(1 for s in subs if s.get("passed"))
    roles: dict[str, int] = {}
    days: dict[str, int] = {}
    overall_scores: list[int] = []
    prompt_dims: dict[str, list[int]] = {}
    deliverable_dims: dict[str, list[int]] = {}

    for s in subs:
        role = s.get("role", "unknown")
        roles[role] = roles.get(role, 0) + 1
        day = str(s.get("day", "?"))
        days[day] = days.get(day, 0) + 1
        sc = s.get("scores", {})
        if isinstance(sc.get("overall"), (int, float)):
            overall_scores.append(int(sc["overall"]))
        dims = s.get("dimensions") or {}
        for k, v in (dims.get("prompt") or {}).items():
            prompt_dims.setdefault(k, []).append(int(v))
        for k, v in (dims.get("deliverable") or {}).items():
            deliverable_dims.setdefault(k, []).append(int(v))

    avg = round(sum(overall_scores) / len(overall_scores), 1) if overall_scores else 0

    ai = get_ai_config()

    recent = sorted(subs, key=lambda x: x.get("submitted_at", ""), reverse=True)[:15]

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "totals": {
            "submissions": total,
            "passed": passed,
            "pass_rate": round(passed / total * 100, 1) if total else 0,
            "avg_overall_score": avg,
            "feedback_count": len(feedback),
        },
        "by_role": roles,
        "by_day": days,
        "prompt_dimension_avg": {k: round(sum(v) / len(v), 1) for k, v in prompt_dims.items() if v},
        "deliverable_dimension_avg": {k: round(sum(v) / len(v), 1) for k, v in deliverable_dims.items() if v},
        "ai_config": {
            "chat_provider": ai["chat"]["provider"],
            "chat_configured": ai["chat"].get("configured", False),
        },
        "recent_submissions": [
            {
                "submission_id": r.get("submission_id"),
                "task_id": r.get("task_id"),
                "day": r.get("day"),
                "role": r.get("role"),
                "passed": r.get("passed"),
                "overall": (r.get("scores") or {}).get("overall"),
                "submitted_at": r.get("submitted_at"),
            }
            for r in recent
        ],
        "recent_feedback": feedback[-10:],
    }


@router.get("/mentor-tips")
def mentor_tips():
    path = Path(__file__).resolve().parents[1] / "data" / "mentor_tips.json"
    return json.loads(path.read_text(encoding="utf-8"))


@router.post("/sync-submission")
def sync_submission(body: dict[str, Any]):
    """客户端存档同步到服务端（可选，用于离线 localStorage 汇总）。"""
    entry = {**body, "synced_at": datetime.utcnow().isoformat()}
    SUBMISSIONS_LOG.parent.mkdir(parents=True, exist_ok=True)
    with SUBMISSIONS_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    sid = entry.get("submission_id", "")
    if sid:
        SUBMISSIONS[sid] = entry
    return {"ok": True}
