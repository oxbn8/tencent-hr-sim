from __future__ import annotations

import re
from typing import Any


DELIVERABLE_RUBRIC = [
    {"id": "brand_fit", "name": "品牌契合", "max": 25},
    {"id": "brief_compliance", "name": "Brief 合规", "max": 25},
    {"id": "creativity", "name": "创意表达", "max": 20},
    {"id": "completeness", "name": "完整性", "max": 15},
    {"id": "professionalism", "name": "专业度", "max": 15},
]

PROMPT_RUBRIC = [
    {"id": "structure", "name": "结构清晰", "max": 20},
    {"id": "specificity", "name": "具体明确", "max": 25},
    {"id": "constraints", "name": "约束完整", "max": 20},
    {"id": "style_language", "name": "风格语言", "max": 15},
    {"id": "iteration", "name": "迭代优化", "max": 20},
]

COMM_RUBRIC = [
    {"id": "deliverable", "name": "沟通成稿", "max": 100, "weight": 0.7},
    {"id": "human_edit", "name": "人工改写度", "max": 100, "weight": 0.2},
    {"id": "process", "name": "过程参与", "max": 100, "weight": 0.1},
]


def build_polished_version(
    deliverable: dict[str, Any],
    task: dict[str, Any],
    brief: str,
    suggested_prompt: str = "",
) -> dict[str, Any]:
    """Generate a polished version recommendation based on submission."""
    task_type = task.get("type", "")
    polished: dict[str, Any] = {"type": task_type, "content": {}}

    if task_type == "aigc_poster":
        main = str(deliverable.get("main_title", "")).strip()
        sub = str(deliverable.get("sub_title", "")).strip()
        if main and "2026" not in main:
            main = f"2026 {main}" if "校招" in main else f"{main} · 2026 校招"
        if not sub:
            sub = "AI 赋能 · 年轻多元 · 共创未来"
        polished["content"] = {
            "main_title": main or "2026 腾讯校招",
            "sub_title": sub,
            "prompt": suggested_prompt or "1080x1920 竖版校招海报，腾讯蓝 #006EFF，年轻科技风…",
        }
    elif task_type in ("aigc_copy", "copywriting"):
        for key in ("slogan", "script", "grid_copy", "structure", "explanation"):
            if deliverable.get(key):
                text = str(deliverable[key]).strip()
                polished["content"][key] = _polish_text(text)
        if not polished["content"] and deliverable:
            for k, v in deliverable.items():
                if isinstance(v, str) and v.strip():
                    polished["content"][k] = _polish_text(v)
    elif task.get("role") == "comm":
        reply = str(deliverable.get("reply", "")).strip()
        polished["content"]["reply"] = _polish_comm_reply(reply)
    else:
        for k, v in deliverable.items():
            if isinstance(v, str) and v.strip():
                polished["content"][k] = _polish_text(v)

    polished["summary"] = "基于你的成稿与 Brief 要求，以下是优化后的推荐版本（Polished Version）。"
    return polished


def _polish_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if not text.endswith(("。", "！", "？")) and len(text) < 80:
        text += "。"
    return text


def _polish_comm_reply(reply: str) -> str:
    if not reply.strip():
        return (
            "您好，感谢同步需求。经与 COE 核对，现回复如下：\n"
            "1. 当前可发 Offer：X 名\n"
            "2. 预计到岗时间：X 周后\n"
            "3. 若 HC 存在缺口，建议：优先保障核心岗位，其余走实习生转正/社招补充路径\n\n"
            "我们今日 18:00 前提供书面确认，如需进一步对齐欢迎随时联系。"
        )
    lines = reply.strip().split("\n")
    if not any(re.match(r"^\d+[.)]", ln.strip()) for ln in lines):
        return f"【结论先行】{lines[0]}\n\n【详细说明】\n" + "\n".join(lines[1:] or lines)
    return reply


def analyze_personality(submissions: list[dict[str, Any]], role: str) -> dict[str, Any]:
    all_text = []
    prompt_scores = []
    human_edits = []
    iteration_count = 0

    for sub in submissions:
        d = sub.get("deliverable", {})
        for v in d.values():
            if isinstance(v, str):
                all_text.append(v)
        scores = sub.get("scores", {})
        if scores.get("prompt"):
            prompt_scores.append(scores["prompt"])
        fb = sub.get("feedback", {})
        if fb.get("human_edit_score"):
            human_edits.append(fb["human_edit_score"])
        for m in sub.get("chat_log", []):
            if m.get("role") == "user":
                iteration_count += 1

    blob = " ".join(all_text)
    empathy = sum(1 for w in ["理解", "感谢", "尊重", "共情", "倾听", "支持"] if w in blob)
    structure = sum(1 for w in ["首先", "其次", "1.", "2.", "结论", "下一步"] if w in blob)
    creative = sum(1 for w in ["创意", "年轻", "多元", "AI", "赋能", "视觉", "风格"] if w in blob)
    direct = sum(1 for w in ["确认", "明确", "截止", "timeline", "HC", "数据"] if w in blob)

    traits: list[str] = []
    if empathy >= 2:
        traits.append("共情导向")
    if structure >= 2:
        traits.append("结构化表达")
    if creative >= 2:
        traits.append("创意驱动")
    if direct >= 2:
        traits.append("结果导向")
    if iteration_count >= 8:
        traits.append("迭代型学习者")
    if prompt_scores and sum(prompt_scores) / len(prompt_scores) >= 75:
        traits.append("Prompt 工程意识强")

    strengths: list[str] = []
    weaknesses: list[str] = []

    if role == "creative":
        if creative >= 2:
            strengths.append("善于用品牌语言与视觉化思维表达 HR 雇主价值")
        else:
            weaknesses.append("创意关键词与品牌要素运用偏少，可加强 AIGC 迭代")
        if prompt_scores and max(prompt_scores) - min(prompt_scores) > 15:
            strengths.append("多轮 Task 中 Prompt 质量有提升曲线")
    else:
        if empathy >= 2:
            strengths.append("沟通文稿体现对他人感受的关注")
        else:
            weaknesses.append("建议增加共情式开场与确认语")
        if human_edits and sum(human_edits) / len(human_edits) < 40:
            weaknesses.append("与 AI 草稿相似度偏高，需更多业务判断式改写")
        elif human_edits:
            strengths.append("能在 AI 辅助下保持独立判断与人工改写")

    if structure >= 2:
        strengths.append("处理事务时倾向分点、分阶段推进")
    else:
        weaknesses.append("回复结构可更明确（结论先行 + 分点说明）")

    if not strengths:
        strengths.append("完成全流程实训，具备 HR 场景的基础适应力")
    if not weaknesses:
        weaknesses.append("可继续积累跨 BG 协作与复杂冲突场景经验")

    avg_overall = round(sum(s.get("scores", {}).get("overall", 0) for s in submissions) / max(len(submissions), 1))

    work_style = "、".join(traits) if traits else ("视觉与内容并重" if role == "creative" else "协作沟通型")

    return {
        "work_style": work_style,
        "traits": traits,
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:4],
        "role_fit": _role_fit_comment(role, traits, avg_overall),
        "avg_score": avg_overall,
        "analysis_summary": (
            f"基于 7 日提交文本、Chat 用词与处理方式，你呈现「{work_style}」的工作特点。"
            f"{' 创意型' if role == 'creative' else ' 沟通型'}路径平均得分 {avg_overall}。"
        ),
    }


def _role_fit_comment(role: str, traits: list[str], avg: int) -> str:
    if role == "creative":
        if "创意驱动" in traits or avg >= 70:
            return "与创意型 HR（雇主品牌/AIGC）方向较为契合，建议继续强化 Prompt 与品牌规范。"
        return "建议加强 AIGC 迭代与品牌关键词练习，以更好匹配创意型 HR 岗位。"
    if "共情导向" in traits and "结构化表达" in traits:
        return "与沟通型 HR（HRBP/员工关系）高度契合，具备「人际感知 + 逻辑表达」双优势。"
    return "具备沟通型 HR 基础，建议在冲突场景与结构化汇报上继续刻意练习。"
