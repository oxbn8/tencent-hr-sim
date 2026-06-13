from __future__ import annotations

import re


def format_chat_reply(text: str) -> str:
    """Strip raw Markdown headings and normalize HR assistant output."""
    if not text:
        return text

    lines: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if re.match(r"^#{1,6}\s+", stripped):
            title = re.sub(r"^#{1,6}\s+", "", stripped).strip()
            if title:
                lines.append(f"【{title}】")
            continue
        if stripped in ("---", "***", "___"):
            continue
        line = re.sub(r"\*\*(.+?)\*\*", r"\1", line)
        line = re.sub(r"`([^`]+)`", r"\1", line)
        lines.append(line.rstrip())

    out = "\n".join(lines)
    out = re.sub(r"\n{3,}", "\n\n", out).strip()
    return out
