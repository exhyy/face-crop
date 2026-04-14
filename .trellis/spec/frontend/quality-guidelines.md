# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

This repository currently has no frontend implementation yet. These are the **bootstrap quality standards** for the initial React + TypeScript + Vite app.

The first goal is a local app that works end-to-end. Quality means the code stays readable, typed, and easy for future agents to extend without introducing unnecessary architecture.

---

## Forbidden Patterns

Do not introduce these in the first version unless the codebase later proves the need:
- Next.js, SSR, or server-rendering assumptions.
- Heavy global state libraries for a single workflow page.
- Generic form frameworks for one screen.
- UI abstractions created before repeated use exists.
- Silent failure handling that hides backend processing errors from the user.
- Unbounded `any`, broad type assertions, or untyped API responses.

---

## Required Patterns

- Keep the main workflow easy to trace from form input to API response to result rendering.
- Type request and response objects explicitly.
- Show loading, success, and error states in the UI.
- Keep file and folder input UX visible and understandable.
- Render source filenames with result previews so users can trace outputs.
- Prefer small feature-level modules over wide cross-app abstractions.

---

## Testing Requirements

When frontend implementation begins, minimum checks should include:
- app starts in Vite without TypeScript errors;
- happy-path manual test for selecting inputs and submitting a request;
- error-path manual test when required inputs are missing;
- result rendering check for summary counts and preview thumbnails.

If automated tests are added later, start with focused component and API-boundary tests rather than broad end-to-end infrastructure.

---

## Code Review Checklist

Reviewers and future agents should check:
- Is this still a simple local tool, or has unnecessary app framework complexity been added?
- Are API contracts typed and named clearly?
- Is state kept local unless sharing is truly needed?
- Are loading and error states visible to users?
- Are result items traceable back to source filenames?
- Did the change avoid introducing assumptions about auth, cloud deployment, or multi-user behavior?
