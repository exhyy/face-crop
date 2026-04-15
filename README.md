# Face Crop

**English | [中文](./README_cn.md)**

A local face-search / face-crop web app with a FastAPI backend and a React + Vite frontend.

It lets you:
- upload a target face image
- upload candidate images
- detect and match faces locally
- download the generated crop results

## 📁 Project Structure

- `backend/` — FastAPI service
- `frontend/` — React + Vite web UI

## ⚙️ Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/)
- Node.js
- [pnpm](https://pnpm.io/)

## 📦 Installation

### Backend

```bash
cd backend
uv sync
```

### Frontend

```bash
cd frontend
pnpm install
```

## 🚀 Run Locally

### Start the backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

### Start the frontend

```bash
cd frontend
pnpm dev
```

The frontend runs at:

```text
http://127.0.0.1:5173
```

The frontend is configured to talk to the backend at `http://127.0.0.1:8000` by default.

## 🧭 Basic Usage

1. Start the backend.
2. Start the frontend.
3. Open `http://127.0.0.1:5173` in your browser.
4. Upload a target face image.
5. Upload candidate images.
6. Adjust settings if needed.
7. Run the search and review the matches.
8. Download the generated results.

## 🔌 API Endpoints

- `GET /health`
- `POST /process/target-faces`
- `POST /process`
- `GET /process/{run_id}/download`

## 🛠️ Troubleshooting

- Make sure the backend is running before using the frontend.
- Make sure port `8000` is available for the backend.
- Make sure port `5173` is available for the frontend.
- If the frontend cannot connect, verify that the backend is reachable at `http://127.0.0.1:8000`.

## ✅ Verify Setup

- Open `http://127.0.0.1:8000/health` and confirm the backend responds.
- Open `http://127.0.0.1:5173` and confirm the UI loads.
- Run one small test job and verify that results can be downloaded.
