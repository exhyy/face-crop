# Hook Guidelines

> How hooks are used in this project.

---

## Overview

This repository currently has no frontend hooks yet. These are the **bootstrap hook conventions** for the React + TypeScript + Vite app.

Custom hooks should exist only when they improve clarity by encapsulating:
- request lifecycle state;
- reusable file/folder input behavior;
- derived UI state shared by more than one component.

Do not create hooks just to move a few lines out of a component.

---

## Custom Hook Patterns

Use a custom hook when one of these is true:
1. the logic is stateful and reused;
2. the logic coordinates async work and status transitions;
3. the component becomes hard to read if the logic stays inline.

Bootstrap example:

```ts
export function useProcessFaces() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessResponse | null>(null)

  const run = async (payload: ProcessRequestInput) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const next = await processFaces(payload)
      setResult(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, error, result, run }
}
```

Keep hooks focused on coordination. File formatting helpers and value transforms should stay in normal utility functions unless they rely on React state.

---

## Data Fetching

For the first version, prefer plain `fetch` wrapped in small feature-level API modules.

Recommended approach:
- one thin API function for `POST /process`;
- optional one thin API function for `GET /health`;
- a custom hook may wrap the process request if the UI needs loading/error/result state.

Do not add React Query, SWR, or another server-state library until the app has repeated fetch patterns that justify it. This project’s first workflow is a single user-triggered processing action, so a simple hook plus local state is enough.

---

## Naming Conventions

- All custom hooks must start with `use`.
- Name hooks after the user-facing behavior, not vague mechanics.
- Prefer names like `useProcessFaces`, `useFolderSelection`, or `useHealthCheck`.
- Avoid names like `useManager`, `useData`, or `useHelper`.

Keep hook names aligned with product language so future agents can infer intent quickly.

---

## Common Mistakes

- Creating a hook for logic used by only one tiny component with no state complexity.
- Hiding API payload construction deep inside presentational components.
- Using hooks to store derived values that can be calculated inline.
- Letting hooks return many unrelated state variables instead of a coherent interface.
- Introducing a generic `useApi` abstraction before there are multiple endpoints with the same lifecycle needs.
