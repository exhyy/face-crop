# Error Handling

> How errors are handled in this project.

---

## Overview

This repository currently has no backend implementation yet. These are the **bootstrap error-handling conventions** for the FastAPI application.

The backend will process user-supplied images and filesystem paths, so most real errors will happen at system boundaries. Handle those clearly and return user-meaningful responses without exposing stack traces or low-level library noise.

---

## Error Types

Prefer a small set of explicit failure categories:
- invalid input: no target image, no candidate images, invalid threshold, invalid padding;
- unsupported or unreadable image data;
- output directory problems;
- no face found in target image;
- processing failure during matching, cropping, or saving.

Bootstrap example categories:
- `400 Bad Request` for invalid user-provided parameters;
- `422 Unprocessable Entity` when uploaded content cannot be interpreted as expected;
- `500 Internal Server Error` for unexpected library or filesystem failures.

Keep custom exception types small and meaningful if they are introduced.

---

## Error Handling Patterns

Recommended pattern:
1. validate request data early;
2. keep route handlers thin;
3. raise clear domain-focused exceptions from services when a known failure occurs;
4. convert known failures to structured HTTP responses;
5. log unexpected exceptions with enough context for debugging.

Bootstrap example:

```py
if not target_face_found:
    raise ValueError("No face detected in target image")
```

Then map that failure to a predictable API response rather than returning a raw traceback.

Do not swallow processing errors silently. The user should know why a run failed.

---

## API Error Responses

Use a simple, consistent error shape.

Bootstrap example:

```json
{
  "error": {
    "code": "no_target_face",
    "message": "No face detected in the target image."
  }
}
```

Guidelines:
- `code` should be stable and machine-friendly;
- `message` should be readable by end users;
- avoid exposing internal file paths or raw third-party exception dumps unless needed for local debugging and explicitly intended.

---

## Common Mistakes

- Returning raw exceptions from image libraries directly to the client.
- Mixing validation, logging, and response formatting in every route handler.
- Treating “no match found” as a server error instead of a valid processing outcome.
- Hiding partial-save failures when one image succeeds and another fails.
- Assuming every uploaded target image contains exactly one detectable face.
