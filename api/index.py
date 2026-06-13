import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from mangum import Mangum  # noqa: E402
from main import app  # noqa: E402

handler = Mangum(app, lifespan="off")
