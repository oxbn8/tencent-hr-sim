"""Generate Tencent 2025-style flat Q-version penguin hero slices for 4 HR roles."""
from __future__ import annotations

import sys
from pathlib import Path
from urllib.request import urlopen

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env", override=True)

from services.llm_service import generate_hunyuan_image  # noqa: E402

OUT_DIR = ROOT.parent / "frontend" / "public" / "hero"

# 对标腾讯2025校招主视觉：Q版扁平插画 + 粗描边 + 高饱和主题色 + 漂浮图标
STYLE = (
    "腾讯2025实习生招聘主视觉设计风格，Q版扁平矢量插画，圆润可爱腾讯QQ企鹅，"
    "粗黑色描边贴纸感，大眼睛简笔表情，高饱和马卡龙配色，"
    "纯色或轻渐变背景，周围漂浮星星与主题小图标装饰，"
    "青春活泼商务感，竖版半身构图企鹅居中，简约块面阴影，"
    "无标题无文字无水印"
)

ROLES = [
    (
        "penguin-communicator.jpg",
        f"沟通型HR主题，青绿色背景，企鹅热情挥手，周围漂浮对话气泡、"
        f"爱心与连接图标，亲和传播气质。{STYLE}",
    ),
    (
        "penguin-creative.jpg",
        f"创意型HR主题，亮紫色背景，企鹅戴贝雷帽或时尚眼镜，"
        f"周围漂浮场记板、相机、调色盘、AIGC sparkle图标，视觉创意气质。{STYLE}",
    ),
    (
        "penguin-analyst.jpg",
        f"分析型HR主题，暖橙黄色背景，企鹅戴圆框眼镜抱文件夹，"
        f"周围漂浮柱状图、放大镜、灯泡与文档图标，数据洞察气质。{STYLE}",
    ),
    (
        "penguin-tech.jpg",
        f"技术型HR主题，腾讯亮蓝色背景，企鹅戴耳机操作笔记本，"
        f"周围漂浮代码括号、0101二进制、齿轮与电路图标，数字化气质。{STYLE}",
    ),
]


def save_url(url: str, path: Path) -> None:
    with urlopen(url, timeout=90) as resp:
        data = resp.read()
    path.write_bytes(data)
    print(f"  saved {path.name} ({len(data)} bytes)")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, prompt in ROLES:
        out = OUT_DIR / filename
        print(f"Generating {filename}...")
        remote = generate_hunyuan_image(prompt, resolution="768:1280")
        if not remote:
            print(f"  FAILED {filename}")
            sys.exit(1)
        save_url(remote, out)
    print("Done.")


if __name__ == "__main__":
    main()
