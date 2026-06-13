from __future__ import annotations

import json
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
_trees: dict[str, Any] | None = None


def _load_trees() -> dict[str, Any]:
    global _trees
    if _trees is None:
        path = DATA_DIR / "dialogue_trees.json"
        _trees = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    return _trees


def get_tree(task_id: str) -> dict[str, Any] | None:
    return _load_trees().get(task_id)


def get_node(task_id: str, node_id: str) -> dict[str, Any] | None:
    tree = get_tree(task_id)
    if not tree:
        return None
    return tree.get("nodes", {}).get(node_id)


def start_node_id(task_id: str) -> str | None:
    tree = get_tree(task_id)
    return tree.get("start_node") if tree else None


def apply_choice(task_id: str, node_id: str, choice_id: str) -> dict[str, Any] | None:
    """Returns {user_line, npc_node, choices, terminal, mentor_note}."""
    node = get_node(task_id, node_id)
    if not node:
        return None
    choice = next((c for c in node.get("choices", []) if c["id"] == choice_id), None)
    if not choice:
        return None
    next_id = choice.get("next", "")
    npc = get_node(task_id, next_id) or {}
    return {
        "user_line": choice.get("user_line", ""),
        "npc_node_id": next_id,
        "speaker": npc.get("speaker", "对方"),
        "npc_text": npc.get("text", ""),
        "choices": [
            {"id": c["id"], "label": c["label"]}
            for c in npc.get("choices", [])
        ],
        "terminal": bool(npc.get("terminal")),
        "mentor_note": npc.get("mentor_note", ""),
    }


def opening_message(task_id: str) -> dict[str, Any] | None:
    tree = get_tree(task_id)
    if not tree:
        return None
    start = tree.get("start_node", "")
    node = get_node(task_id, start)
    if not node:
        return None
    return {
        "node_id": start,
        "speaker": node.get("speaker", "对方"),
        "text": node.get("text", ""),
        "choices": [{"id": c["id"], "label": c["label"]} for c in node.get("choices", [])],
    }
