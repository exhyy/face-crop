# Real face matching backend implementation

## Goal
Replace the placeholder backend processing with real local face detection, face matching, and face cropping.

## Requirements
- Keep the FastAPI backend local-only and synchronous
- Replace placeholder matching with real face detection and embedding-based matching
- Use InsightFace + ONNX Runtime + OpenCV for local inference
- Keep route handlers thin and preserve structured error handling
- Reuse existing path validation and output naming helpers where appropriate
- If target image contains multiple faces, choose the largest face
- For each candidate image, detect all faces and keep only the single best match
- Save only real cropped face images, not full-image copies
- Preserve top-level response shape where practical
- Add real processing metadata such as match score if useful
- Keep logging practical and local-only
- Do not add database, auth, queue, websocket, or cloud complexity

## Acceptance Criteria
- [ ] `POST /process` performs real face detection on target and candidates
- [ ] Target image with no detectable face returns a structured error
- [ ] Multiple faces in target image use the largest face policy
- [ ] Candidate images produce a crop only when the best face passes threshold
- [ ] Saved outputs are actual cropped faces with padding and clipping applied
- [ ] Existing collision-safe naming still works
- [ ] Backend tests cover real-processing success and failure behavior
- [ ] Local verification confirms real matching and crop output

## Technical Notes
- Prefer minimal contract changes, but remove the placeholder-only `matchMode` restriction
- Most tests should mock the face engine to stay stable and fast
- Real end-to-end verification should still be performed locally with actual images
