# Type Safety

> Type safety patterns in this project.

---

## Overview

This repository currently has no frontend TypeScript code yet. This document defines the **bootstrap type-safety conventions** for the React + TypeScript + Vite app.

TypeScript should describe the contract between the UI and the FastAPI backend clearly enough that future agents do not guess field names, optionality, or result shapes.

The goal is straightforward correctness, not advanced type tricks.

---

## Type Organization

Use these rules:
- Keep feature-specific request/response types inside the owning feature folder.
- Promote a type to `src/types/` only when it is shared across multiple features.
- Co-locate UI-only view models near the components that use them.
- Keep backend contract types explicit, especially for `POST /process` responses.

Bootstrap example:

```ts
export interface CropResultItem {
  sourceFilename: string
  savedPath: string
  previewUrl?: string
  faceBox?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ProcessResponse {
  totalImages: number
  detectedFaces: number
  matchedFaces: number
  results: CropResultItem[]
}
```

---

## Validation

TypeScript types are not runtime validation. The frontend should still validate user-editable inputs at the UI boundary when needed.

Examples of values worth validating in the frontend:
- threshold is numeric and within the allowed range;
- padding is numeric and non-negative;
- a target photo is selected before submit;
- at least one candidate image is selected before submit;
- output directory input is not empty if the API requires it.

Keep validation lightweight and user-facing. Do not introduce schema libraries unless the payload complexity grows enough to justify them.

---

## Common Patterns

- Prefer `interface` or straightforward `type` aliases for API shapes.
- Use discriminated unions for UI states when they improve clarity.
- Type event handlers and file lists explicitly.
- Create small mapper functions when backend fields need reshaping for display.

Good bootstrap example:

```ts
type ProcessStatus = 'idle' | 'submitting' | 'success' | 'error'
```

---

## Forbidden Patterns

- `any` in application code.
- Blind type assertions for API responses.
- Encoding backend response shapes inline in JSX.
- Massive shared `types.ts` files that collect unrelated concepts.
- Overusing generics when concrete interfaces are clearer.
