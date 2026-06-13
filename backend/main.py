from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# 必须在其它模块 import 之前加载，且 .env 优先于系统环境变量
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(_ENV_PATH, override=True)

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from api import admin, chat, config, submit

app = FastAPI(title="Tencent HR Sim API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config.router)
app.include_router(chat.router)
app.include_router(submit.router)
app.include_router(admin.router)

GENERATED_DIR = Path(__file__).resolve().parent / "generated"
GENERATED_DIR.mkdir(exist_ok=True)
app.mount("/generated", StaticFiles(directory=str(GENERATED_DIR)), name="generated")


@app.get("/api/health")
def health():
    paths = [getattr(r, "path", "") for r in app.routes]
    return {
        "status": "ok",
        "admin_api": "/api/admin/stats" in paths or "/api/config/admin-stats" in paths,
    }


_STATIC_DIR = Path(os.getenv("STATIC_DIR", str(Path(__file__).resolve().parent.parent / "frontend" / "dist")))
if _STATIC_DIR.is_dir():
    _assets = _STATIC_DIR / "assets"
    if _assets.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_assets)), name="assets")

    @app.get("/")
    def spa_index():
        return FileResponse(_STATIC_DIR / "index.html")

    @app.get("/{path:path}")
    def spa_fallback(path: str):
        if path.startswith("api/") or path.startswith("generated/"):
            raise HTTPException(status_code=404)
        candidate = _STATIC_DIR / path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_STATIC_DIR / "index.html")


if __name__ == "__main__":
    from services.llm_service import get_ai_config

    port = int(os.getenv("PORT", "5070"))
    ai = get_ai_config()
    print("=" * 50)
    print("  Tencent HR Sim API")
    print(f"  http://127.0.0.1:{port}")
    print(f"  Chat: {ai['chat']['provider']} / {ai['chat']['model']} configured={ai['chat'].get('configured')}")
    print(f"  Image: {ai['image']['provider']} / {ai['image']['model']} configured={ai['image'].get('configured')}")
    if ai.get("setup_hint"):
        print(f"  Hint: {ai['setup_hint']}")
    print("=" * 50)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_includes=["*.env", "*.py"],
    )
