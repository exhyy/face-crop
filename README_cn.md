# Face Crop

**[English](./README.md) | 中文**

这是一个本地运行的人脸搜索 / 人脸裁剪 Web 应用，包含 FastAPI 后端和 React + Vite 前端。

你可以使用它：
- 上传目标人脸图片
- 上传候选图片
- 在本地进行人脸检测与匹配
- 下载生成的人脸裁剪结果

## 📁 项目结构

- `backend/` — FastAPI 服务
- `frontend/` — React + Vite Web 界面

## ⚙️ 环境要求

- Python 3.10+
- [uv](https://docs.astral.sh/uv/)
- Node.js
- [pnpm](https://pnpm.io/)

## 📦 安装

### 后端

```bash
cd backend
uv sync
```

### 前端

```bash
cd frontend
pnpm install
```

## 🚀 本地运行

### 启动后端

```bash
cd backend
uv run uvicorn app.main:app --reload
```

后端默认运行在：

```text
http://127.0.0.1:8000
```

### 启动前端

```bash
cd frontend
pnpm dev
```

前端默认运行在：

```text
http://127.0.0.1:5173
```

前端默认会连接到 `http://127.0.0.1:8000`。

## 🧭 基本使用方式

1. 启动后端服务。
2. 启动前端服务。
3. 在浏览器中打开 `http://127.0.0.1:5173`。
4. 上传目标人脸图片。
5. 上传候选图片。
6. 如有需要，调整相关设置。
7. 运行搜索并查看匹配结果。
8. 下载生成的结果文件。

## 🔌 API 接口

- `GET /health`
- `POST /process/target-faces`
- `POST /process`
- `GET /process/{run_id}/download`

## 🛠️ 常见问题

- 使用前端前，请先确认后端已经启动。
- 请确认后端可用端口 `8000` 没有被占用。
- 请确认前端可用端口 `5173` 没有被占用。
- 如果前端无法连接后端，请检查 `http://127.0.0.1:8000` 是否可访问。

## ✅ 验证步骤

- 打开 `http://127.0.0.1:8000/health`，确认后端可以正常响应。
- 打开 `http://127.0.0.1:5173`，确认前端页面可以正常加载。
- 运行一次小规模测试，并确认可以下载结果。
