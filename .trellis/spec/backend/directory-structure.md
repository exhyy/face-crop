# Directory Structure

> How backend code is organized in this project.

---

## Overview

This repository currently has no backend implementation yet. This document defines the **bootstrap backend structure** for the future Python + FastAPI application that processes portrait matching and face crops.

The backend should be small and focused on one local workflow:
- receive the target image, candidate images, and simple options;
- detect and compare faces;
- crop matched faces with padding;
- save outputs locally;
- return a concise processing summary to the frontend.

Do not design this backend like a large service platform. There is no database, no queue, no auth layer, and no cloud runtime requirement in the initial version.

---

## Directory Layout

Bootstrap target layout:

```text
backend/
├── pyproject.toml
├── requirements.txt
└── app/
    ├── main.py
    ├── api/
    │   ├── health.py
    │   └── process.py
    ├── schemas/
    │   ├── health.py
    │   └── process.py
    ├── services/
    │   ├── face_matching.py
    │   ├── image_loading.py
    │   ├── cropping.py
    │   └── output_writer.py
    ├── utils/
    │   ├── paths.py
    │   └── logging.py
    └── core/
        └── config.py
```

Notes:
- `main.py` should create the FastAPI app and include routers.
- `api/` defines HTTP routes only.
- `schemas/` defines request and response models.
- `services/` contains image-processing logic.
- `utils/` is for lightweight shared helpers only.
- `core/config.py` may hold simple settings when needed, but do not create a large settings system prematurely.

---

## Module Organization

Keep HTTP concerns separate from processing concerns.

Recommended ownership:
- route handlers parse inputs and call one orchestration service;
- services handle traversal, face detection, matching, cropping, and saving;
- schemas define the public API contract;
- utilities stay small and generic.

Good bootstrap split:
- `api/process.py` handles `POST /process`;
- `schemas/process.py` defines `ProcessResponse` and related item models;
- `services/face_matching.py` owns embedding comparison logic;
- `services/cropping.py` owns box expansion and image crop logic;
- `services/output_writer.py` owns filename conflict avoidance and save paths.

Avoid:
- putting OpenCV or face-recognition code directly in route handlers;
- creating repository, manager, controller, and facade layers with no real need;
- placing all processing logic in `main.py`.

---

## Naming Conventions

- Use lowercase snake_case for Python modules.
- Name route modules after resources or actions, such as `process.py` and `health.py`.
- Name services after the business operation they own, such as `face_matching.py`.
- Use explicit model names like `ProcessResultItem` instead of vague names like `DataModel`.
- Keep function names action-oriented, for example `match_faces`, `crop_face`, and `save_cropped_image`.

---

## Bootstrap Examples

These are starter patterns, not references to existing implementation files.

Example call flow:

```text
POST /process
  -> api/process.py
  -> services/face_matching.py
  -> services/cropping.py
  -> services/output_writer.py
  -> schemas/process.py response
```

Example ownership rule:
- `api/process.py` validates the request boundary.
- `face_matching.py` decides whether a face matches the target.
- `cropping.py` applies padding and clipping.
- `output_writer.py` handles directory writes and filename collisions.

---

## Common Mistakes To Avoid

- Mixing request parsing, file iteration, matching, cropping, and saving in one function.
- Designing for distributed processing before the local single-machine version works.
- Treating filesystem paths as trusted without validation.
- Making the route layer aware of low-level image library details.
- Adding a database or job queue even though they are explicitly out of scope.
