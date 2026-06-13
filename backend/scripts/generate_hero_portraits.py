"""Generate Tencent Q-version penguin hero slices for 4 HR roles (unified 3D style)."""
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

# 窄栏 cover 填充友好：企鹅居中偏下，道具分布四角，轮廓融入背景无白边
BASE_STYLE = (
    "3D渲染可爱Q版腾讯企鹅，圆润立体胖企鹅、黑色大眼带白高光、粉色圆腮红、"
    "小巧橙色喙与脚蹼，全身站立，企鹅居中偏下约占画面高度45%，"
    "企鹅直接放置在纯色背景上，轮廓与背景自然融合，"
    "严禁白色描边、严禁白色外轮廓、严禁贴纸白边、严禁黑色描边、严禁光晕描边、严禁cutout抠图白边，"
    "头部到脚蹼完整可见，道具分布在画面四角与边缘不遮挡企鹅身体，"
    "竖版构图适合窄栏裁切，轻3D块面阴影，无标题无文字无水印"
)

ROLES = [
    (
        "penguin-communicator.jpg",
        f"沟通型HR，青绿色纯色背景，企鹅热情挥手。"
        f"配饰位置：左上角对话气泡，右上角粉色爱心，左下角小星星，"
        f"右下角人物名片卡片，均漂浮在四角。{BASE_STYLE}",
    ),
    (
        "penguin-creative.jpg",
        f"创意型HR，亮紫色纯色背景，企鹅戴粉蓝拼色贝雷帽与黑框眼镜。"
        f"配饰位置：左上角场记板，右上角复古相机，左下角调色盘，"
        f"右下角AIGC sparkle笑脸气泡，均漂浮在四角。{BASE_STYLE}",
    ),
    (
        "penguin-analyst.jpg",
        f"分析型HR，暖橙黄色纯色背景，企鹅戴圆框眼镜双手抱棕色文件夹。"
        f"配饰位置：左上角柱状图，右上角饼图，左下角放大镜，"
        f"右下角灯泡，均漂浮在四角。{BASE_STYLE}",
    ),
    (
        "penguin-tech.jpg",
        f"技术型HR，腾讯亮蓝色纯色背景，企鹅戴黑色头戴耳机双手捧笔记本电脑。"
        f"配饰位置：左上角代码大括号，右上角0101二进制，左下角齿轮，"
        f"右下角电路芯片，均漂浮在四角。{BASE_STYLE}",
    ),
]


def save_url(url: str, path: Path) -> None:
    with urlopen(url, timeout=120) as resp:
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
    print("Compositing onto panel backgrounds (remove white fringe)...")
    from clean_hero_outline import PANEL_BG, composite_on_bg  # noqa: WPS433

    for filename, bg in PANEL_BG.items():
        composite_on_bg(OUT_DIR / filename, bg)
    print("Done.")


if __name__ == "__main__":
    main()
