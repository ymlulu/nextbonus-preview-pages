# Core / Shell Phase 2

This phase extracts Preview seed data, default state creation, persisted state policy, and route classification/history semantics from `app.js` into `core/` modules without changing user-facing behavior.

Target ownership:

- `core/seed-data.js`: Preview fixtures only.
- `core/state.js`: default state factory.
- `core/storage.js`: local persisted state read/write and transient field policy.
- `core/router.js`: route classification and history snapshot semantics.
- `app.js`: shell rendering, orchestration, and UI action dispatch.

No UI redesign is part of this phase.
