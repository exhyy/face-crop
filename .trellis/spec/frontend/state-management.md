# State Management

> How state is managed in this project.

---

## Overview

This repository currently has no frontend state management code yet. This document defines the **bootstrap state strategy** for the first version of the app.

The default rule is: **use the smallest state scope that works**.

Because the product is a local single-workflow tool, most state should remain local to the face-search feature.

---

## State Categories

Use these categories:

### 1. Local component state
Use for:
- selected target image;
- selected folder files;
- form inputs like threshold and padding;
- submit/loading/error state;
- preview selection and small UI toggles.

Preferred tools:
- `useState`
- `useMemo` for cheap derived display values only when needed

### 2. Feature container state
Use for:
- the latest processing response;
- combined status shown across multiple child components;
- transient state shared inside the face-search feature tree.

This can still live in one top-level feature component or one custom hook.

### 3. Global app state
Avoid by default.

This app should not introduce Redux, Zustand, MobX, or context-heavy architecture unless a real second workflow or cross-page requirement appears.

---

## When to Use Global State

Global state is allowed only if at least one of these becomes true later:
- multiple distant branches of the UI need the same mutable state;
- the app grows beyond a single workflow screen;
- prop passing becomes confusing across many layers;
- there is a persistent app-wide concept such as settings shared across multiple pages.

Even then, prefer React context for small app-wide settings before adding a dedicated state library.

Right now, threshold, padding, status, and results are **not** global state.

---

## Server State

For the initial version, server state is simple:
- `GET /health` can be fetched on app load or on demand;
- `POST /process` is a user-triggered action that returns one result payload.

Do not build caching or synchronization layers for this first workflow.

Recommended pattern:
- call the backend from a feature API module;
- store the latest response in local or feature state;
- reset or replace state on each new processing run.

---

## Common Mistakes

- Adding a global store before the app has multiple independent screens.
- Storing values globally that are only used by one form.
- Duplicating backend response data into many pieces of derived local state.
- Keeping stale results around without making it clear whether they belong to the latest run.
- Adding persistence to local storage before the real UX need is proven.
