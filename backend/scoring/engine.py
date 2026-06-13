from __future__ import annotations

import difflib
import re
from typing import Any


BANNED_WORDS = ["保证录取", "第一", "100%通过", "内推必过"]


def _count_user_prompts(messages: list[dict]) -> list[str]:
    return [m["content"] for m in messages if m.get("role") == "user" and m.get("content")]


def _meaningful_iterations(prompts: list[str]) -> int:
    if len(prompts) <= 1:
        return 0
    count = 0
    for i in range(1, len(prompts)):
        a, b = prompts[i - 1].strip(), prompts[i].strip()
        if not b or b in ("再生成", "重新生成", "再来一次"):
            continue
        ratio = difflib.SequenceMatcher(None, a, b).ratio()
        if ratio < 0.85:
            count += 1
    return count


def score_prompt(messages: list[dict], brief: str, task_type: str) -> dict[str, Any]:
    prompts = _count_user_prompts(messages)
    if not prompts:
        return {
            "prompt_score": 30,
            "prompt_dimensions": {
                "structure": 5,
                "specificity": 5,
                "constraints": 5,
                "style_language": 5,
                "iteration": 0,
            },
            "prompt_feedback": ["未检测到 Prompt 对话，建议在 AI Chat 中描述需求并迭代。"],
            "suggested_prompt_rewrite": "请补充：用途、版式、主色、必含文字、禁止项。",
        }

    combined = " ".join(prompts).lower()
    structure = 8
    if any(k in combined for k in ["风格", "构图", "布局", "结构", "主体"]):
        structure += 8
    if task_type == "aigc_poster" and any(k in combined for k in ["竖版", "9:16", "1080", "1920"]):
        structure += 4

    specificity = 8
    for kw, pts in [("1080", 4), ("1920", 4), ("9:16", 4), ("竖版", 3), ("腾讯蓝", 3), ("#006eff", 3)]:
        if kw in combined:
            specificity += pts
    specificity = min(25, specificity)

    constraints = 8
    if "2026" in combined or "校招" in combined:
        constraints += 6
    if any(k in combined for k in ["禁止", "无 ip", "未授权", "不要"]):
        constraints += 6
    constraints = min(20, constraints)

    style_language = 8
    for kw in ["极简", "flat", "3d", "赛博", "科技", "年轻", "插画", "渐变"]:
        if kw in combined:
            style_language += 3
    style_language = min(15, style_language)

    iterations = _meaningful_iterations(prompts)
    iteration = min(20, max(0, iterations * 7))

    prompt_score = round(structure + specificity + constraints + style_language + iteration)

    feedback: list[str] = []
    if specificity < 15:
        feedback.append("Prompt 不够具体，建议补充尺寸、色调、必含文案。")
    if constraints < 12:
        feedback.append("未充分体现 Brief 约束（2026 校招、禁 IP 等）。")
    if iterations == 0 and len(prompts) > 1:
        feedback.append("有多轮对话但未做有效迭代，避免只写「再生成」。")
    if iterations >= 1:
        feedback.append(f"检测到 {iterations} 轮有效 Prompt 迭代，表现良好。")
    if not feedback:
        feedback.append("Prompt 结构完整，可继续细化风格关键词。")

    rewrite = prompts[-1]
    if len(rewrite) < 40:
        rewrite = (
            f"一张 1080x1920 竖版校招海报，腾讯蓝(#006EFF)为主色，"
            f"体现年轻科技与 AI 赋能，主标题含「2026 校招」，"
            f"无未授权 IP，风格：{prompts[-1][:60]}"
        )

    return {
        "prompt_score": min(100, prompt_score),
        "prompt_dimensions": {
            "structure": min(20, structure),
            "specificity": specificity,
            "constraints": constraints,
            "style_language": style_language,
            "iteration": iteration,
        },
        "prompt_feedback": feedback[:4],
        "suggested_prompt_rewrite": rewrite[:200],
    }


def score_deliverable(
    deliverable: dict[str, Any],
    brief: str,
    task: dict[str, Any],
    elapsed_seconds: int,
    time_limit: int,
) -> dict[str, Any]:
    text_parts = []
    for v in deliverable.values():
        if isinstance(v, str):
            text_parts.append(v)
    text = " ".join(text_parts)
    lower = text.lower()

    brand_fit = 15
    if any(k in text for k in ["腾讯", "校招", "2026", "AI", "赋能"]):
        brand_fit += 8
    if "006eff" in lower or "腾讯蓝" in text:
        brand_fit += 2

    brief_compliance = 10
    if task.get("type") == "aigc_poster":
        if deliverable.get("main_title") and "校招" in str(deliverable.get("main_title", "")):
            brief_compliance += 8
        if deliverable.get("sub_title"):
            brief_compliance += 4
        if deliverable.get("image_url"):
            brief_compliance += 3
    else:
        for field in task.get("submit_schema", []):
            if field.get("required") and deliverable.get(field["key"]):
                brief_compliance += 4
    brief_compliance = min(25, brief_compliance)

    creativity = 12
    if len(text) > 80:
        creativity += 5
    if task.get("type") == "aigc_copy" and deliverable.get("slogan") and len(str(deliverable["slogan"])) <= 20:
        creativity += 5

    completeness = 10
    for field in task.get("submit_schema", []):
        if field.get("required") and deliverable.get(field["key"]):
            completeness += 3
    completeness = min(15, completeness)

    professionalism = 12
    for banned in BANNED_WORDS:
        if banned in text:
            professionalism -= 8
    professionalism = max(5, min(15, professionalism))

    deliverable_score = round(brand_fit + brief_compliance + creativity + completeness + professionalism)

    if elapsed_seconds > time_limit:
        deliverable_score = round(deliverable_score * 0.85)

    feedback: list[str] = []
    if brand_fit < 20:
        feedback.append("品牌契合度可加强，建议融入校招、AI 赋能等关键词。")
    if brief_compliance < 18:
        feedback.append("未完全满足 Brief 硬性要求，检查主标题与必填项。")
    if any(b in text for b in BANNED_WORDS):
        feedback.append("检测到夸大承诺用语，请修改。")
    if deliverable.get("image_url"):
        feedback.append("已提交视觉成稿，请确保与标题信息一致。")
    if not feedback:
        feedback.append("成稿整体达标，细节可继续打磨。")

    return {
        "deliverable_score": min(100, deliverable_score),
        "deliverable_dimensions": {
            "brand_fit": brand_fit,
            "brief_compliance": brief_compliance,
            "creativity": creativity,
            "completeness": completeness,
            "professionalism": professionalism,
        },
        "deliverable_feedback": feedback[:4],
    }


def score_communication(
    deliverable: dict[str, Any],
    messages: list[dict],
    elapsed_seconds: int,
    time_limit: int,
) -> dict[str, Any]:
    reply = str(deliverable.get("reply", ""))
    ai_drafts = [m["content"] for m in messages if m.get("role") == "assistant" and m.get("content")]
    last_ai = ai_drafts[-1] if ai_drafts else ""

    deliverable_score = 50
    if len(reply) >= 100:
        deliverable_score += 15
    if any(k in reply for k in ["感谢", "理解", "建议", "下一步", "确认"]):
        deliverable_score += 10
    if re.search(r"[1-9]\.", reply) or "：" in reply:
        deliverable_score += 5
    for banned in BANNED_WORDS:
        if banned in reply:
            deliverable_score -= 15
    deliverable_score = max(20, min(100, deliverable_score))

    if last_ai:
        ratio = difflib.SequenceMatcher(None, last_ai[:500], reply[:500]).ratio()
        human_edit = round((1 - ratio) * 100)
    else:
        human_edit = 80 if len(reply) > 50 else 40

    if human_edit < 10:
        human_edit = 20
    elif human_edit > 95:
        human_edit = 85

    process = 80 if messages else 50
    if elapsed_seconds <= time_limit:
        process += 10
    process = min(100, process)

    overall = round(deliverable_score * 0.7 + human_edit * 0.2 + process * 0.1)
    if elapsed_seconds > time_limit:
        overall = round(overall * 0.9)

    feedback = []
    if human_edit < 30:
        feedback.append("与 AI 草稿过于相似，请体现更多人工改写与业务判断。")
    if len(reply) < 80:
        feedback.append("回复偏短，建议补充事实对齐与下一步安排。")
    if deliverable_score >= 70:
        feedback.append("沟通结构清晰，语气专业。")
    if not feedback:
        feedback.append("可进一步优化：结论先行、分点回应。")

    return {
        "overall": min(100, overall),
        "deliverable_score": deliverable_score,
        "human_edit_score": human_edit,
        "process_score": process,
        "deliverable_feedback": feedback[:4],
        "prompt_feedback": [],
    }
