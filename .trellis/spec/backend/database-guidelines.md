# Database Guidelines

> Database patterns and conventions for this project.

---

## Overview

The initial version of this project has **no database**.

This is an intentional product constraint, not a missing implementation detail. The app is a local tool that processes uploaded images, saves cropped outputs to a user-selected directory, and returns results directly. There is no requirement for persistence beyond local file output.

Future AI agents should treat “no database” as the default unless the user explicitly changes project scope.

---

## Query Patterns

Not applicable for the bootstrap version.

Instead of database queries, the backend works with:
- in-memory request processing;
- filesystem reads for uploaded images;
- filesystem writes for cropped outputs.

If a future feature requires persistence, document the decision first rather than silently introducing an ORM.

---

## Migrations

Not applicable for the bootstrap version.

Do not add:
- SQLAlchemy models;
- Alembic migrations;
- SQLite as “just in case” storage;
- tracking tables for jobs, users, or results.

The initial app should complete processing inside the request flow and rely on saved crop files plus the returned response payload.

---

## Naming Conventions

Since there is no database, naming guidance applies to local output instead:
- preserve the source image name when practical;
- append face index or another deterministic suffix when multiple faces match from one source file;
- avoid filename collisions by adding stable disambiguators rather than overwriting files.

Bootstrap example:
- `family_photo_face_01.jpg`
- `family_photo_face_02.jpg`
- `family_photo_face_01_1.jpg` if conflict resolution is needed

---

## Common Mistakes

- Introducing a database because result history seems convenient.
- Adding persistence for settings or sessions before there is a proven need.
- Using a database to track per-run progress for a single local request flow.
- Treating “no database yet” as permission to add one without updating these guidelines.
