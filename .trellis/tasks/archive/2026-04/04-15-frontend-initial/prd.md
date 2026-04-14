# Initial frontend implementation

## Goal
Implement the first frontend for the local face-search and crop app.

## Requirements
- Create a React + TypeScript + Vite app under `frontend/`
- Add a single workflow page for the face-search flow
- Show backend health status from `GET /health`
- Collect target image path, candidate image paths, output directory, threshold, padding, and optional match mode
- Call `POST /process` using the existing backend contract
- Render loading, error, summary, and result states
- Keep state local/feature-scoped and use thin fetch wrappers
- Follow Trellis frontend and cross-layer specs

## Acceptance Criteria
- [ ] Frontend app boots locally
- [ ] Health check is displayed in the UI
- [ ] Valid form submission sends the expected backend payload
- [ ] Validation errors are shown before request submission
- [ ] Backend errors are shown in-page
- [ ] Success response renders summary counts and result items
- [ ] Lint, type-check, and tests pass

## Technical Notes
- Backend schema source of truth: `backend/app/schemas/health.py` and `backend/app/schemas/process.py`
- Keep feature code under `frontend/src/features/face-search/`
- Avoid router, global store, and React Query in the initial version
- Browser file/path limitations may affect how local filesystem paths are collected; stay aligned with the current backend path-based contract for now
