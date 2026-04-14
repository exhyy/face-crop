# Frontend Development Guidelines

> Best practices for frontend development in this project.

---

## Overview

This directory contains the bootstrap frontend conventions for this repository.

The product target is a **local face-search and crop web app** built with:
- React
- TypeScript
- Vite

The repository does not contain frontend implementation code yet. The files in this directory define the **starting conventions** that future agents should follow until real code establishes stronger patterns.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Module organization and file layout | Bootstrap complete |
| [Component Guidelines](./component-guidelines.md) | Component patterns, props, composition | Bootstrap complete |
| [Hook Guidelines](./hook-guidelines.md) | Custom hooks, data fetching patterns | Bootstrap complete |
| [State Management](./state-management.md) | Local state, global state, server state | Bootstrap complete |
| [Quality Guidelines](./quality-guidelines.md) | Code standards, forbidden patterns | Bootstrap complete |
| [Type Safety](./type-safety.md) | Type patterns, validation | Bootstrap complete |

---

## How to Use These Guidelines

Because the app has not been implemented yet, treat these documents as **initial project rules**, not reverse-engineered codebase patterns.

Use them to keep the first implementation aligned with project scope:
- one simple Vite frontend;
- no SSR and no Next.js;
- no heavy global state unless a proven need appears;
- UI focused on upload, parameter input, processing status, and crop previews.

As real frontend code is added, update these documents to reflect what the repository actually does.

---

## Pre-Development Checklist

Before working on frontend code, read:
1. [Directory Structure](./directory-structure.md)
2. [Component Guidelines](./component-guidelines.md)
3. [Hook Guidelines](./hook-guidelines.md)
4. [State Management](./state-management.md)
5. [Type Safety](./type-safety.md)
6. [Quality Guidelines](./quality-guidelines.md)

For cross-layer work, also read:
- [../guides/cross-layer-thinking-guide.md](../guides/cross-layer-thinking-guide.md)

---

**Language**: All documentation should be written in **English**.
