"""Composite hero penguins onto flat panel background (no white sticker fringe)."""
from __future__ import annotations

import io
from pathlib import Path

from PIL import Image
from rembg import remove

OUT_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public" / "hero"

PANEL_BG: dict[str, tuple[int, int, int]] = {
    "penguin-communicator.jpg": (0x5E, 0xD4, 0xC8),
    "penguin-creative.jpg": (0x9B, 0x6C, 0xF0),
    "penguin-analyst.jpg": (0xF5, 0xA6, 0x23),
    "penguin-tech.jpg": (0x3D, 0x8B, 0xFF),
}


def composite_on_bg(path: Path, bg: tuple[int, int, int]) -> None:
    raw = path.read_bytes()
    cut = remove(raw)
    fg = Image.open(io.BytesIO(cut)).convert("RGBA")
    canvas = Image.new("RGB", fg.size, bg)
    canvas.paste(fg, mask=fg.split()[3])
    canvas.save(path, quality=95)
    print(f"  composited {path.name} on {bg}")


def main() -> None:
    for name, bg in PANEL_BG.items():
        path = OUT_DIR / name
        if not path.exists():
            print(f"  skip missing {name}")
            continue
        composite_on_bg(path, bg)
    print("Done.")


if __name__ == "__main__":
    main()
