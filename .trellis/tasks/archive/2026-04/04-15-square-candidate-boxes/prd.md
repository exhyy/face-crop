# Square candidate image boxes

## Goal
Make Candidate images use square detection boxes and square crop outputs.

## Requirements
- Candidate image detection boxes must be square.
- Keep the long side unchanged.
- Expand the short side outward until it matches the long side.
- Candidate crop outputs must use the same square bounds.
- Preserve existing behavior as much as possible for clipping to image boundaries.

## Acceptance Criteria
- [ ] Candidate result faceBox values are square.
- [ ] Saved candidate crop images are square when image bounds allow.
- [ ] Square expansion keeps the original long side unchanged.
- [ ] Rotated candidate matching still maps back correctly.
- [ ] Relevant backend tests pass.

## Technical Notes
- Raw candidate detections are produced in backend/app/services/face_matching.py.
- Crop bounds are finalized in backend/app/services/cropping.py.
- Frontend overlay consumes returned faceBox dimensions directly.
