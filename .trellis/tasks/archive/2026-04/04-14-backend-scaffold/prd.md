# Initial FastAPI backend scaffold

## Goal
Implement the first backend scaffold for this repository as a local FastAPI service.

## Requirements
- Create a runnable Python + FastAPI backend under `backend/`
- Expose `GET /health`
- Expose `POST /process`
- Use JSON request payloads with local filesystem paths
- Keep processing logic placeholder-only for now
- Validate user-controlled input and filesystem boundaries
- Return structured error responses with `error.code` and `error.message`
- Keep route handlers thin and move processing into service modules
- Keep logging/config simple and local-only
- Do not add database, auth, queue, websocket, or cloud assumptions

## Acceptance Criteria
- [ ] Backend project structure matches Trellis bootstrap guidance
- [ ] `GET /health` returns a typed success payload
- [ ] `POST /process` accepts target path, candidate paths, output dir, and padding
- [ ] Placeholder processing writes output files with collision-safe names
- [ ] `POST /process` returns `totalImages`, `detectedFaces`, `matchedFaces`, and `results`
- [ ] Invalid input and invalid filesystem/image scenarios return structured errors
- [ ] Local verification commands pass for happy path and key failure cases

## Technical Notes
- Initial contract should align with `.trellis/spec/frontend/type-safety.md`
- Placeholder behavior: treat readable candidate images as matched and save copy/minimal crop outputs
- Prefer minimal dependencies; FastAPI + Uvicorn + Pydantic + Pillow is sufficient for scaffold stage
