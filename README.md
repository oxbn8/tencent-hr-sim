# 腾讯 AI 赋能 HR 模拟场

场景化 HR 实训游戏 — 创意型 / 沟通型 · 7 日闯关 · AI Chat AIGC

## 在线体验

部署后访问：`https://<your-render-url>/`

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
