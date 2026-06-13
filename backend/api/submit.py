from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from api.chat import SESSIONS, TASKS
from scoring.engine import score_communication, score_deliverable, score_prompt
from scoring.polish import (
    COMM_RUBRIC,
    DELIVERABLE_RUBRIC,
    PROMPT_RUBRIC,
    analyze_personality,
    build_polished_version,
)

router = APIRouter(prefix="/api", tags=["submit"])

SUBMISSIONS: dict[str, dict[str, Any]] = {}
FEEDBACK_DIR = Path(__file__).resolve().parents[1] / "data"
FEEDBACK_FILE = FEEDBACK_DIR / "feedback.jsonl"
SUBMISSIONS_LOG = FEEDBACK_DIR / "submissions.jsonl"


def _persist_submission(record: dict[str, Any]) -> None:
    FEEDBACK_DIR.mkdir(parents=True, exist_ok=True)
    entry = {**record, "submitted_at": datetime.utcnow().isoformat()}
    with SUBMISSIONS_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


class SubmitBody(BaseModel):
    task_id: str
    deliverable: dict[str, Any] = Field(default_factory=dict)
    chat_session_id: str = ""
    elapsed_seconds: int = 0
    attempt: int = 1
    context: dict[str, str] = Field(default_factory=dict)


class PersonalityBody(BaseModel):
    role: str
    submissions: list[dict[str, Any]]


class FeedbackBody(BaseModel):
    player_name: str = ""
    role: str = ""
    rating: int = Field(ge=1, le=5)
    comment: str = ""
    meta: dict[str, Any] = Field(default_factory=dict)


@router.post("/submit")
def submit_task(body: SubmitBody):
    task = TASKS.get(body.task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    brief = task["brief_template"].format(
        bg_name=body.context.get("bg_name", "腾讯"),
        team_name=body.context.get("team_name", "业务团队"),
        player_name=body.context.get("player_name", "培训生"),
    )

    messages = []
    last_ai_draft = ""
    if body.chat_session_id:
        sess = SESSIONS.get(body.chat_session_id)
        if sess:
            messages = sess["messages"]
            last_ai_draft = sess.get("last_ai_draft", "")

    scoring_mode = task["scoring"]["mode"]
    time_limit = task["time_limit_seconds"]
    pass_score = task["scoring"].get("pass_score", 60)

    deliverable_dimensions: dict[str, int] = {}
    prompt_dimensions: dict[str, int] = {}
    comm_dimensions: dict[str, int] = {}
    suggested_prompt = ""

    if scoring_mode == "comm":
        comm_result = score_communication(body.deliverable, messages, body.elapsed_seconds, time_limit)
        overall = comm_result["overall"]
        deliverable_score = comm_result["deliverable_score"]
        prompt_score = None
        comm_dimensions = {
            "deliverable": comm_result["deliverable_score"],
            "human_edit": comm_result["human_edit_score"],
            "process": comm_result["process_score"],
        }
        feedback = {
            "deliverable": comm_result["deliverable_feedback"],
            "prompt": [],
            "suggested_prompt": "",
            "human_edit_score": comm_result["human_edit_score"],
        }
        del_result = {"deliverable_dimensions": {}}
    elif scoring_mode == "dual":
        del_result = score_deliverable(body.deliverable, brief, task, body.elapsed_seconds, time_limit)
        pr_result = score_prompt(messages, brief, task.get("type", ""))
        w = task["scoring"]["weights"]
        wd, wp = w.get("deliverable", 0.55), w.get("prompt", 0.45)
        deliverable_score = del_result["deliverable_score"]
        prompt_score = pr_result["prompt_score"]
        overall = round(deliverable_score * wd + prompt_score * wp)
        deliverable_dimensions = del_result["deliverable_dimensions"]
        prompt_dimensions = pr_result["prompt_dimensions"]
        suggested_prompt = pr_result["suggested_prompt_rewrite"]
        feedback = {
            "deliverable": del_result["deliverable_feedback"],
            "prompt": pr_result["prompt_feedback"],
            "suggested_prompt": suggested_prompt,
        }
    else:
        del_result = score_deliverable(body.deliverable, brief, task, body.elapsed_seconds, time_limit)
        deliverable_score = del_result["deliverable_score"]
        prompt_score = None
        deliverable_dimensions = del_result["deliverable_dimensions"]
        overall = deliverable_score
        feedback = {
            "deliverable": del_result["deliverable_feedback"],
            "prompt": [],
            "suggested_prompt": "",
        }

    if body.attempt > 1:
        overall = round(overall * 0.9)

    passed = overall >= pass_score
    polished = build_polished_version(body.deliverable, task, brief, suggested_prompt)

    rubric = {
        "deliverable": DELIVERABLE_RUBRIC if deliverable_dimensions else [],
        "prompt": PROMPT_RUBRIC if prompt_dimensions else [],
        "comm": COMM_RUBRIC if comm_dimensions else [],
    }

    sub_id = uuid.uuid4().hex
    record = {
        "submission_id": sub_id,
        "task_id": body.task_id,
        "day": task["day"],
        "role": task["role"],
        "passed": passed,
        "scores": {
            "overall": overall,
            "deliverable": deliverable_score,
            "prompt": prompt_score,
        },
        "dimensions": {
            "deliverable": deliverable_dimensions,
            "prompt": prompt_dimensions,
            "comm": comm_dimensions,
        },
        "rubric": rubric,
        "feedback": feedback,
        "polished_version": polished,
        "deliverable": body.deliverable,
        "chat_log": [m for m in messages if m.get("role") != "system"],
        "last_ai_draft": last_ai_draft,
        "context": body.context,
    }
    SUBMISSIONS[sub_id] = record
    _persist_submission(record)

    return {
        "submission_id": sub_id,
        "passed": passed,
        "scores": record["scores"],
        "dimensions": record["dimensions"],
        "rubric": rubric,
        "feedback": record["feedback"],
        "polished_version": polished,
        "unlocked_next_day": task["day"] + 1 if passed and task["day"] < 7 else None,
    }


@router.get("/submission/{submission_id}")
def get_submission(submission_id: str):
    sub = SUBMISSIONS.get(submission_id)
    if not sub:
        raise HTTPException(404, "Submission not found")
    return sub


@router.post("/analyze-personality")
def personality(body: PersonalityBody):
    if not body.submissions:
        raise HTTPException(400, "需要提交记录")
    return analyze_personality(body.submissions, body.role)


@router.post("/feedback")
def collect_feedback(body: FeedbackBody):
    FEEDBACK_DIR.mkdir(parents=True, exist_ok=True)
    entry = {
        "id": uuid.uuid4().hex,
        "timestamp": datetime.utcnow().isoformat(),
        "player_name": body.player_name,
        "role": body.role,
        "rating": body.rating,
        "comment": body.comment,
        "meta": body.meta,
    }
    with FEEDBACK_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return {"ok": True, "id": entry["id"]}
