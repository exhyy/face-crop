# Logging Guidelines

> How logging is done in this project.

---

## Overview

This repository currently has no backend logging setup yet. These are the **bootstrap logging conventions** for the local FastAPI image-processing service.

Logging should help debug local processing runs without turning the app into an observability project. Keep logs readable, structured enough to trace one run, and careful about not dumping unnecessary sensitive data.

---

## Log Levels

Use a small, practical set of levels:
- `INFO` for process start, process completion, summary counts, and normal major milestones;
- `WARNING` for recoverable issues such as unreadable candidate files that are skipped;
- `ERROR` for request failures and save failures that prevent successful completion;
- `DEBUG` only for local diagnosis of matching details when explicitly useful.

Do not spam logs for every trivial internal step unless a real debugging need appears.

---

## Structured Logging

Use Python’s standard `logging` module unless a stronger reason emerges.

Preferred context fields when logging a processing run:
- request or run identifier if available;
- source filename;
- output path when a crop is saved;
- total image count;
- matched face count;
- failure reason code for known errors.

Bootstrap example message style:

```py
logger.info(
    "processing completed",
    extra={"total_images": 120, "matched_faces": 8}
)
```

If structured `extra` fields are awkward in the first implementation, clear formatted messages are acceptable. Simplicity is preferred over elaborate logging infrastructure.

---

## What to Log

Log these events:
- service startup and health-check availability;
- processing request start;
- target-face extraction failures;
- skipped invalid images when relevant;
- crop save success summaries;
- final totals returned to the client;
- unexpected exceptions.

---

## What NOT to Log

Do not log:
- full image binary data;
- large base64 payloads;
- unnecessary personal image metadata;
- secrets or environment values;
- noisy per-pixel or per-embedding details in normal runs.

Source filenames may be logged because this is a local single-user tool, but keep logs purposeful.
