# NextBonus coding instructions

These instructions are mandatory for any GPT, coding agent, or human making code changes in this repository.

## Mandatory preflight — do this before editing any code

1. Read this `AGENTS.md` in full.
2. Read the latest `ARCHITECTURE.md`.
3. Fetch the latest `main` and inspect open pull requests so you do not overwrite newer work.
4. Identify the existing owner for the requested behavior.
5. Read that owner and any relevant tests/guards before changing implementation.
6. Keep the change to the smallest owner-correct scope requested by the user.

Do not start writing code before completing the preflight above.

## Architecture rules

- One behavior has one formal owner.
- `app.js` is App Shell / cross-page orchestration only.
- `core/` owns state, persistence, router/history, events, and registry infrastructure.
- `features/` owns reusable business lifecycles and deterministic rules.
- `pages/<page>/` owns page presentation and page-local interactions.
- `ui/` owns reusable presentation primitives and global UI finalization.
- Do not restore retired compatibility runtimes or DOM takeover patchers.
- Do not introduce runtime `MutationObserver`; render synchronization is explicit.

## Typography and user-facing language

Global typography and terminology are formal owners.

- Do not add local `font-family`, `font-size`, `font-weight`, `line-height`, or `letter-spacing` declarations in page/component CSS, JS, or inline styles.
- Route App text through the global semantic typography system in `ui/typography*`.
- Intentional poster/marketing artwork is the only typography exemption and must be explicitly marked with `nb-typography-exempt: marketing`.
- Keep user-facing terminology aligned with `ui/user-facing-copy.js` and `ui/terminology.js`.

## Preview publishing is read-only

GitHub `main` is the only formal source for the Preview.

- Never publish the Preview by committing a local snapshot, generated bundle, copied directory, or stale checkout back to `main`.
- Never use a commit such as `Publish NextBonus preview` to synchronize source files.
- Preview deployment must read the already-merged `main` commit and deploy it without modifying repository source.
- If local files differ from `main`, stop and reconcile through a normal branch + PR. Do not overwrite `main`.
- Product/UI changes and deployment are separate operations: deployment must not alter owners, data, CI files, or cache-busting references.

## CI is mandatory

Every pull request to `main` must run **NextBonus CI / quality-gate**.

Before saying a change is ready to merge:
- wait for the quality gate to finish;
- confirm it is green;
- never recommend bypassing or weakening a failing guard just to merge.

If a guard fails, determine whether the implementation violates the architecture or the guard encodes a retired implementation detail. Fix the implementation or update the guard to protect the current owner/behavior.

## Pull request acknowledgement

Every PR body must include this checked line exactly:

`- [x] Preflight: read AGENTS.md and ARCHITECTURE.md before editing`

CI rejects pull requests without that acknowledgement.
