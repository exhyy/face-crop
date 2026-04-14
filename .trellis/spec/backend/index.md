# Backend Development Guidelines

> Best practices for backend development in this project.

---

## Overview

This directory contains the bootstrap backend conventions for this repository.

The product target is a **local face-search and crop web app** with a backend built using:
- Python
- FastAPI

The repository does not contain backend implementation code yet. The files in this directory define the **starting conventions** that future agents should follow until real code establishes stronger patterns.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Module organization and file layout | Bootstrap complete |
| [Database Guidelines](./database-guidelines.md) | ORM patterns, queries, migrations | Bootstrap complete |
| [Error Handling](./error-handling.md) | Error types, handling strategies | Bootstrap complete |
| [Quality Guidelines](./quality-guidelines.md) | Code standards, forbidden patterns | Bootstrap complete |
| [Logging Guidelines](./logging-guidelines.md) | Structured logging, log levels | Bootstrap complete |

---

## How to Use These Guidelines

Because the app has not been implemented yet, treat these documents as **initial project rules**, not reverse-engineered codebase patterns.

Use them to keep the first implementation aligned with project scope:
- one simple FastAPI backend;
- no database in the initial version;
- local filesystem input/output;
- image processing focused on detection, matching, cropping, and saving;
- no auth, queues, cloud deployment assumptions, or WebSocket progress system.

As real backend code is added, update these documents to reflect what the repository actually does.

---

## Pre-Development Checklist

Before working on backend code, read:
1. [Directory Structure](./directory-structure.md)
2. [Database Guidelines](./database-guidelines.md)
3. [Error Handling](./error-handling.md)
4. [Logging Guidelines](./logging-guidelines.md)
5. [Quality Guidelines](./quality-guidelines.md)

For cross-layer work, also read:
- [../guides/cross-layer-thinking-guide.md](../guides/cross-layer-thinking-guide.md)

---

**Language**: All documentation should be written in **English**.
