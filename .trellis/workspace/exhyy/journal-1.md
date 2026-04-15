# Journal - exhyy (Part 1)

> AI development session journal
> Started: 2026-04-14

---



## Session 1: Bootstrap Trellis project guidance

**Date**: 2026-04-14
**Task**: Bootstrap Trellis project guidance

### Summary

(Add summary)

### Main Changes

| Area | Description |
|------|-------------|
| Trellis specs | Filled bootstrap frontend and backend guidelines for the planned local face-search app |
| Trellis indexes | Updated frontend/backend index files to mark bootstrap guidance complete and add pre-development checklists |
| Claude workflow | Added shared Claude hooks, agents, commands, and project settings |
| Git hygiene | Ignored `.claude/settings.local.json` so local Claude permissions stay untracked |

**Updated Files**:
- `.trellis/spec/frontend/*.md`
- `.trellis/spec/backend/*.md`
- `.trellis/spec/frontend/index.md`
- `.trellis/spec/backend/index.md`
- `.claude/settings.json`
- `.claude/hooks/*.py`
- `.claude/agents/*.md`
- `.claude/commands/trellis/*.md`
- `.gitignore`

**Summary**:
Bootstrapped the repo's Trellis and Claude workflow so future implementation work follows explicit project conventions for a React + TypeScript + Vite frontend and a Python + FastAPI backend, without introducing out-of-scope complexity.


### Git Commits

| Hash | Message |
|------|---------|
| `f0eec5d` | (see git log) |
| `9bf3bd1` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 2: Build initial backend scaffold

**Date**: 2026-04-14
**Task**: Build initial backend scaffold

### Summary

(Add summary)

### Main Changes

| Area | Description |
|------|-------------|
| Backend | Added a local FastAPI backend scaffold under `backend/` with `GET /health` and `POST /process` |
| Processing | Implemented placeholder image processing, structured errors, validation, logging, and collision-safe output writing |
| Quality | Added backend tests, fixed local Pyright issues, and verified endpoints end-to-end with real requests |
| Project hygiene | Ignored `.vscode/` and recorded the Trellis backend task files |

**Updated Files**:
- `backend/pyproject.toml`
- `backend/requirements.txt`
- `backend/app/main.py`
- `backend/app/api/health.py`
- `backend/app/api/process.py`
- `backend/app/schemas/health.py`
- `backend/app/schemas/process.py`
- `backend/app/services/errors.py`
- `backend/app/services/face_matching.py`
- `backend/app/services/image_loading.py`
- `backend/app/services/cropping.py`
- `backend/app/services/output_writer.py`
- `backend/app/utils/logging.py`
- `backend/app/utils/paths.py`
- `backend/tests/test_health.py`
- `backend/tests/test_process.py`
- `.gitignore`
- `.trellis/tasks/archive/2026-04/04-14-backend-scaffold/*`


### Git Commits

| Hash | Message |
|------|---------|
| `1c9db39` | (see git log) |
| `4f8c14a` | (see git log) |
| `afee66c` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 3: Implement real backend face matching

**Date**: 2026-04-14
**Task**: Implement real backend face matching

### Summary

(Add summary)

### Main Changes

| Area | Description |
|------|-------------|
| Backend | Replaced the placeholder `/process` flow with a real InsightFace-based local face detection, embedding matching, and crop saving pipeline |
| Matching | Added threshold-based best-match selection, largest-target-face policy, and real cropped output generation |
| Validation | Kept structured error responses and reused the existing filesystem/image validation helpers |
| Quality | Updated backend tests, verified the new default threshold, and ran end-to-end checks with a real local image |
| Project hygiene | Recorded and archived the Trellis task for the real backend implementation |

**Updated Files**:
- `backend/pyproject.toml`
- `backend/requirements.txt`
- `backend/app/core/config.py`
- `backend/app/schemas/process.py`
- `backend/app/services/cropping.py`
- `backend/app/services/errors.py`
- `backend/app/services/face_matching.py`
- `backend/app/services/image_loading.py`
- `backend/tests/test_process.py`
- `.trellis/tasks/archive/2026-04/04-14-backend-real-impl/*`


### Git Commits

| Hash | Message |
|------|---------|
| `306107b` | (see git log) |
| `ad04c71` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 4: Implement initial frontend app

**Date**: 2026-04-15
**Task**: Implement initial frontend app

### Summary

Added the first React/Vite frontend, connected it to backend health/process APIs, and enabled local frontend-backend integration with validation and checks.

### Main Changes

| Feature | Description |
|---------|-------------|
| Frontend app | Added a new Vite + React + TypeScript app under `frontend/` |
| Face search UI | Built the initial single-page workflow for target path, candidate paths, output dir, threshold, padding, and match mode |
| API integration | Added typed health/process API clients and feature hooks for request lifecycle handling |
| Result rendering | Added processing status, summary metrics, and result list UI |
| Validation | Added frontend form validation and unit tests for request mapping |
| Backend integration | Enabled CORS in `backend/app/main.py` so the local frontend can call FastAPI |

**Updated Files**:
- `frontend/package.json`
- `frontend/src/features/face-search/components/FaceSearchPage.tsx`
- `frontend/src/features/face-search/components/SearchForm.tsx`
- `frontend/src/features/face-search/hooks/useProcessFaces.ts`
- `frontend/src/features/face-search/api/process.ts`
- `frontend/src/features/face-search/utils/validation.ts`
- `frontend/src/features/face-search/utils/validation.test.ts`
- `backend/app/main.py`


### Git Commits

| Hash | Message |
|------|---------|
| `dd382d2` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 5: Switch face processing to browser uploads

**Date**: 2026-04-15
**Task**: Switch face processing to browser uploads

### Summary

Reworked the app from backend path entry to browser file uploads, staged uploads into per-run backend directories under runs/, removed obsolete dialog/filesystem picker code, and updated frontend/backend tests plus gitignore.

### Main Changes



### Git Commits

| Hash | Message |
|------|---------|
| `a2cf426` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 6: Refine face search frontend redesign

**Date**: 2026-04-15
**Task**: Refine face search frontend redesign

### Summary

(Add summary)

### Main Changes

| Area | Description |
|------|-------------|
| Visual design | Reworked the face search frontend toward a calmer Claude-inspired aesthetic with lighter cards, softer colors, and more refined typography |
| Tool UX | Reduced hero copy, compressed the header, and moved more actionable content into the first viewport to make the page feel like a focused professional tool |
| Workflow UI | Redesigned search input, health/run status, summary, and results presentation while preserving the existing upload, validation, and processing flow |

**Updated Files**:
- `frontend/src/features/face-search/components/FaceSearchPage.tsx`
- `frontend/src/features/face-search/components/SearchForm.tsx`
- `frontend/src/features/face-search/components/HealthStatus.tsx`
- `frontend/src/features/face-search/components/ProcessStatus.tsx`
- `frontend/src/features/face-search/components/ProcessSummary.tsx`
- `frontend/src/features/face-search/components/CropResultList.tsx`
- `frontend/src/styles/index.css`
- `frontend/src/styles/app.css`


### Git Commits

| Hash | Message |
|------|---------|
| `0279b3c` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 7: Add interactive target face selection

**Date**: 2026-04-15
**Task**: Add interactive target face selection

### Summary

Added target image preview with backend face detection, selectable target face boxes, and refined notice/highlight UI for the face search flow.

### Main Changes



### Git Commits

| Hash | Message |
|------|---------|
| `e24ce64` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 8: Enhance candidate preview workflow

**Date**: 2026-04-15
**Task**: Enhance candidate preview workflow

### Summary

(Add summary)

### Main Changes

| Area | Description |
|------|-------------|
| Candidate preview | Added large preview with thumbnail switching for candidate images |
| Match visualization | Reused target-style face highlighting on candidate previews after search |
| Downloads | Added backend zip endpoint and frontend download action for all saved crops |
| UX polish | Improved settings cards, moved the download button next to Run search, removed candidate filename list, lowered default threshold to 0.6, and added empty-result guidance |
| Backend | Added candidateIndex in process results and expanded CORS for local dev ports |

**Updated Files**:
- `backend/app/api/process.py`
- `backend/app/main.py`
- `backend/app/schemas/process.py`
- `backend/app/services/crop_archive.py`
- `backend/app/services/face_matching.py`
- `backend/tests/test_process.py`
- `frontend/src/features/face-search/api/process.ts`
- `frontend/src/features/face-search/components/CropResultList.tsx`
- `frontend/src/features/face-search/components/FaceOverlayPreview.tsx`
- `frontend/src/features/face-search/components/FaceSearchPage.tsx`
- `frontend/src/features/face-search/components/SearchForm.tsx`
- `frontend/src/features/face-search/components/TargetImagePreview.tsx`
- `frontend/src/features/face-search/types/process.ts`
- `frontend/src/features/face-search/utils/validation.ts`
- `frontend/src/styles/app.css`


### Git Commits

| Hash | Message |
|------|---------|
| `6191b44` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 9: Simplify backend CORS config

**Date**: 2026-04-15
**Task**: Simplify backend CORS config

### Summary

Replaced hardcoded local allow_origins entries in backend/app/main.py with a localhost/127.0.0.1 regex-based CORS rule for local development.

### Main Changes



### Git Commits

| Hash | Message |
|------|---------|
| `3c17541` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 10: Streamline face search preview workflow

**Date**: 2026-04-15
**Task**: Streamline face search preview workflow

### Summary

Removed the separate Results panel and consolidated selection, controls, settings, and match review into the candidate preview workflow.

### Main Changes

| Area | Description |
|------|-------------|
| Face search UI | Removed the dedicated Results panel and deleted `CropResultList.tsx` |
| Candidate workflow | Consolidated image selection, run controls, download, and settings into the Candidate images toolbar |
| Preview UX | Moved candidate thumbnails above the main preview and restored the no-results threshold hint |
| Input consistency | Matched the Target image file picker to the Candidate images button style |

**Updated Files**:
- `frontend/src/features/face-search/components/FaceSearchPage.tsx`
- `frontend/src/features/face-search/components/SearchForm.tsx`
- `frontend/src/features/face-search/components/CropResultList.tsx`
- `frontend/src/styles/app.css`


### Git Commits

| Hash | Message |
|------|---------|
| `684659d` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 11: Replace run summary with usage guide

**Date**: 2026-04-15
**Task**: Replace run summary with usage guide

### Summary

Replaced the dynamic Run summary panel with a static usage/help guide in the face search sidebar.

### Main Changes

| Area | Description |
|------|-------------|
| Sidebar panel | Removed the dynamic Run summary metrics and replaced them with a stable usage/help guide |
| Face search UX | Kept the existing right-hand aside layout while making the content onboarding-focused instead of result-driven |
| Styling | Removed summary-card styles and added lightweight help-panel styling |

**Updated Files**:
- `frontend/src/features/face-search/components/FaceSearchPage.tsx`
- `frontend/src/features/face-search/components/ProcessSummary.tsx`
- `frontend/src/styles/app.css`


### Git Commits

| Hash | Message |
|------|---------|
| `5c63063` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 12: Add bilingual README files

**Date**: 2026-04-15
**Task**: Add bilingual README files

### Summary

Added English and Chinese README files with installation, local usage, language switch links, and emoji-styled section headings.

### Main Changes

| Area | Description |
|------|-------------|
| Documentation | Added `README.md` in English and `README_cn.md` in Chinese |
| Setup guide | Documented installation and local run commands for backend and frontend |
| Usability | Added language switch links below the title in both README files |
| Presentation | Unified the title as `Face Crop` and added emoji to all level-2 headings |

**Updated Files**:
- `README.md`
- `README_cn.md`


### Git Commits

| Hash | Message |
|------|---------|
| `f1391ee` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 13: Add rotated candidate matching

**Date**: 2026-04-15
**Task**: Add rotated candidate matching

### Summary

Added optional candidate auto-rotation matching, fixed rotated-match overlay coordinates, updated frontend toggle wiring, and added backend/frontend tests.

### Main Changes



### Git Commits

| Hash | Message |
|------|---------|
| `0a791bc` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 14: Square candidate boxes

**Date**: 2026-04-15
**Task**: Square candidate boxes

### Summary

Squared candidate face boxes and crops, then recorded the Trellis task artifacts.

### Main Changes

| Area | Description |
|------|-------------|
| Backend | Added square face-box normalization so candidate boxes expand the short side to match the long side in original-image coordinates |
| Cropping | Reused the square face box for saved crops so overlays and crop outputs stay aligned |
| Tests | Updated backend process tests to assert square face boxes, square crops, and rotated-match behavior |
| Trellis | Archived the completed task and recorded its PRD/context artifacts |

**Updated Files**:
- `backend/app/services/cropping.py`
- `backend/app/services/face_matching.py`
- `backend/tests/test_process.py`
- `.trellis/tasks/04-15-square-candidate-boxes/*`


### Git Commits

| Hash | Message |
|------|---------|
| `9c4ac25` | (see git log) |
| `e6489dc` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete
