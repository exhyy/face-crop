# Directory Structure

> How frontend code is organized in this project.

---

## Overview

This repository currently has no frontend implementation yet. This document defines the **bootstrap structure** that future AI agents and developers should follow when creating the React + TypeScript + Vite application for the local face-search app.

The frontend should stay intentionally small:
- one Vite app;
- no SSR and no Next.js;
- no heavy global state library unless a real need appears;
- no premature feature folders for functionality that does not exist yet.

The frontend is responsible for:
- collecting the target portrait image;
- collecting the image folder input;
- collecting output directory and simple processing parameters;
- calling backend APIs;
- displaying status, summary metrics, and crop previews.

---

## Directory Layout

Bootstrap target layout:

```text
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── app/
    │   └── providers/
    ├── components/
    │   ├── ui/
    │   └── layout/
    ├── features/
    │   └── face-search/
    │       ├── components/
    │       ├── hooks/
    │       ├── api/
    │       ├── types/
    │       └── utils/
    ├── api/
    │   └── client.ts
    ├── types/
    ├── utils/
    ├── assets/
    └── styles/
```

Notes:
- `features/face-search/` should contain the first product-specific flow instead of scattering files across the app.
- `components/ui/` is for small reusable display components only after duplication appears.
- `api/client.ts` should contain shared fetch setup for the FastAPI backend.
- `types/` is for cross-feature frontend types only. Feature-local types stay near the feature.

---

## Module Organization

Start simple and organize by **feature first**, not by technical layer alone.

Recommended rules:
1. Put face-search page logic inside `features/face-search/`.
2. Keep page composition in feature components, not in `App.tsx`.
3. Reusable primitives go to `components/ui/` only when reused in multiple places.
4. Generic helpers go to `utils/` only when they are truly app-wide.
5. Keep API request/response mapping close to the feature that consumes it.

Good bootstrap split:
- `features/face-search/components/SearchForm.tsx`
- `features/face-search/components/ResultsPanel.tsx`
- `features/face-search/hooks/useProcessFaces.ts`
- `features/face-search/api/process.ts`
- `features/face-search/types/process.ts`

Avoid:
- creating `services/`, `managers/`, and `stores/` directories before the app actually needs them;
- creating separate folders for one-file concepts;
- placing all components in a single global `components/` bucket.

---

## Naming Conventions

- Use `PascalCase.tsx` for React components.
- Use `camelCase.ts` for hooks, helpers, and API modules.
- Prefix custom hooks with `use`, for example `useFolderUpload.ts`.
- Use descriptive names tied to the product flow, for example `ProcessSummary.tsx` instead of vague names like `Panel.tsx`.
- Keep folder names lowercase with hyphens only when needed for clarity; prefer `face-search` for the main feature folder.

---

## Bootstrap Examples

These are starter patterns, not references to existing implementation files.

Example feature slice:

```text
src/features/face-search/
├── components/
│   ├── SearchForm.tsx
│   ├── ProcessStatus.tsx
│   └── CropResultList.tsx
├── hooks/
│   └── useProcessFaces.ts
├── api/
│   └── process.ts
└── types/
    └── process.ts
```

Example ownership rule:
- `SearchForm.tsx` owns browser file/folder input UX.
- `process.ts` owns the `POST /process` request.
- `useProcessFaces.ts` coordinates submit state and response handling.
- `CropResultList.tsx` renders returned preview items.

---

## Common Mistakes To Avoid

- Building the frontend as if it were a multi-page SaaS product.
- Introducing router, auth, theme system, or global app shell before they are needed.
- Putting backend response shape assumptions directly into JSX without defining shared types.
- Creating reusable abstractions before two real call sites exist.
- Treating browser folder selection as a backend concern. The frontend owns collecting files and parameters; the backend owns processing and saving.
