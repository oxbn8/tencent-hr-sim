# 腾讯 AI 赋能 HR 模拟场

场景化 HR 实训游戏 — 创意型 / 沟通型 · 7 日闯关 · AI Chat AIGC

## 在线体验

**公网 Demo**：https://learned-sauce-charlotte-possibly.trycloudflare.com

> 通过 Cloudflare Quick Tunnel 暴露本地全栈服务（前端 + API）。如需长期稳定托管，见下方 Render 一键部署。

**源码**：https://github.com/oxbn8/tencent-hr-sim

**永久部署（Render 免费层）**：[一键部署到 Render](https://render.com/deploy?repo=https://github.com/oxbn8/tencent-hr-sim)

## 本地开发

```powershell
# 后端
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python main.py

# 前端
cd frontend
npm install
npm run dev
```

## 生产部署（Render / Docker）

```bash
docker build -t tencent-hr-sim .
docker run -p 5070:5070 -e LLM_PROVIDER=mock -e IMAGE_PROVIDER=mock tencent-hr-sim
```

或连接 GitHub 仓库至 [Render](https://render.com)，使用根目录 `render.yaml` 一键部署。

## 方案说明

见 [docs/SOLUTION.md](./docs/SOLUTION.md)
