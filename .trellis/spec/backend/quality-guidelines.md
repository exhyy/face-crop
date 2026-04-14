# Quality Guidelines

> Code quality standards for backend development.

---

## Overview

This repository currently has no backend implementation yet. These are the **bootstrap quality standards** for the Python + FastAPI backend.

The backend’s job is simple: accept inputs, process images locally, save crops, and return useful results. Quality means the request flow is understandable, errors are handled clearly, and image-processing logic is not buried inside HTTP glue code.

---

## Forbidden Patterns

Do not introduce these in the initial version unless the project scope changes:
- database or migration setup;
- background job queues or task brokers;
- WebSocket progress infrastructure;
- cloud-storage assumptions;
- large service abstractions with one implementation each;
- route handlers that directly contain the full processing pipeline;
- silent exception swallowing around image operations.

---

## Required Patterns

- Keep FastAPI route handlers thin and schema-driven.
- Put image-processing logic in focused service modules.
- Validate user-controlled inputs and filesystem-related values at the boundary.
- Return structured summaries with counts and per-result metadata.
- Preserve traceability from saved crop back to source filename.
- Prefer mature libraries used simply over custom computer-vision code.

---

## Testing Requirements

When backend implementation begins, minimum checks should include:
- `GET /health` responds successfully;
- `POST /process` handles a happy-path request with at least one match;
- invalid target image or missing target face returns a clear error;
- invalid output directory handling is tested;
- saved filenames avoid collisions for repeated or multi-face matches.

If automated tests are added, focus first on service logic and API-boundary behavior. Avoid building heavy test harnesses before the real processing flow exists.

---

## Code Review Checklist

Reviewers and future agents should check:
- Is the backend still optimized for a local single-request workflow?
- Are route handlers thin and easy to read?
- Are image-processing responsibilities split into sensible modules?
- Are user-facing errors clear and structured?
- Are logs sufficient to debug a failed run locally?
- Did the change avoid adding database, queue, auth, or deployment complexity that the product explicitly does not need?
