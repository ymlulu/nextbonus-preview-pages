# NextBonus Architecture

Last updated: 2026-09-18

This document is the architecture contract for the NextBonus Preview repository.

The goal is not to make the file tree look tidy. The goal is to make every page, business rule, state lifecycle, and infrastructure concern have one clear owner.

Current architecture is frozen around:

```text
app.js
core/
features/
ui/
pages/
```

## 1. Core principle: one owner

Every behavior must have one formal owner.

Before changing code, identify which layer owns the behavior:

- `app.js`: App Shell, cross-page orchestration, authentication handoff, and truly global coordination.
- `core/`: application state, persistence, router/history, generic event routing, page registry, Preview seed data.
- `features/`: reusable deterministic business rules and cross-page lifecycles.
- `ui/`: reusable presentation primitives and global presentation finalization.
- `pages/<page>/`: page-owned model, markup, local interactions, and page-local styles.

Do not solve a problem by adding a second implementation next to the existing owner.

## 2. Page ownership

A page change should start in that page directory.

Typical structure:

```text
pages/<page>/
  model.js
  page.js
  actions.js
  page.css
```

Responsibilities:

- `model.js`: page-local derivation, grouping, filtering, sorting, view-model composition.
- `page.js`: markup and presentation structure.
- `actions.js`: page-local interactions and state transitions.
- `page.css`: page-local visual presentation.

Examples:

- Offer Detail belongs under `pages/offer-detail/`.
- Product Detail belongs under `pages/product-detail/`.
- Watchlist belongs under `pages/watchlist/`.
- Add Product belongs under `pages/add-product/`.
- Assessment presentation belongs under `pages/assessment/`.
- Application Result presentation belongs under `pages/application-result/`.

Pages may consume business results from `features/`, but pages must not re-implement those rules.

## 3. Feature ownership

`features/` owns deterministic business rules or lifecycles shared across more than one page or flow.

Examples currently include:

- `features/watchlist/`: Watchlist state, policy, routing, deal lifecycle.
- `features/application/`: application entry, frozen attempt context, return detection, Watchlist synchronization, review flow.
- `features/product-lifecycle/`: UserProduct creation and atomic product/bonus/task/Attention commit.
- `features/benefits/`: benefit-cycle identity, Benefit/Attention identity, cycle usage state.
- `features/bonus-tracking/`: offer choice, bonus deadline/task behavior.
- `features/assessment/`: canonical Assessment client/contract adaptation.
- `features/onboarding/`: onboarding state lifecycle.
- `features/attention/`: Attention history lifecycle.

Shared business features should remain DOM-independent unless the feature explicitly owns a UI surface.

## 4. Core ownership

`core/` owns infrastructure, not page business logic.

Current examples:

- `core/state.js`: default application state.
- `core/storage.js`: persisted-state load/save and state migrations.
- `core/router.js`: route classification and browser-history semantics.
- `core/events.js`: generic event routing.
- `core/page-registry.js`: route renderer registry.
- `core/seed-data.js`: Preview-only fixture data.

State migrations belong in `core/storage.js`, not in one-off root boot scripts.

## 5. app.js boundary

`app.js` is not a dumping ground.

It may own:

- App Shell
- navigation orchestration
- authentication handoff
- cross-page coordination
- explicit calls into page/feature/UI owners

It should not own:

- route markup
- page-local filters/tabs/sorts
- page-specific business rules
- Assessment decision rules
- Product Detail facts
- Watchlist lifecycle rules
- Application lifecycle rules
- duplicate Attention logic
- post-render page patches

When page behavior grows inside `app.js`, move it to the correct page or feature owner instead of adding another branch.

## 6. No post-render patch architecture

Runtime `MutationObserver` usage is forbidden.

The repository currently enforces:

```text
MutationObserver = 0
```

CI will fail if runtime code introduces a new `MutationObserver`.

Do not implement:

```text
render page
→ query DOM
→ wait for mutation
→ patch text / move nodes / delete buttons / inject state
```

Instead implement:

```text
canonical data / feature state
→ model
→ page render
```

If another owner must react to a render, use an explicit hook, for example:

```text
App render
→ ProductDetailOverlay.afterAppRender()
→ OfferDetailOverlay.afterAppRender()
→ UIFinalize.schedule()
```

Hidden DOM observation is not an acceptable integration mechanism.

## 7. No hidden runtime loaders

Do not use dynamic runtime imports to secretly load another page/feature implementation.

Current architecture requires explicit script ownership and loading order.

Forbidden pattern:

```js
import('./some-old-runtime.js')
```

used as a compatibility bridge or hidden owner.

If a module is required, give it a formal owner and load it explicitly through the application entry chain.

## 8. UI cannot invent business decisions

UI renders business state; it does not create a second rule engine.

Forbidden examples:

- UI infers application approval/reconsideration status from text.
- Product Detail creates its own bonus Attention because the lifecycle core did not.
- a page computes a separate Watchlist lifecycle.
- UI guesses bank rules or Assessment output.
- DOM state becomes the source of truth for business state.

Correct flow:

```text
canonical state / rule source
→ feature
→ page model
→ UI
```

If business state is missing, fix the responsible feature or data owner.

## 9. One source of truth

Do not keep two active versions of the same data or lifecycle.

When a new owner replaces an old runtime:

1. confirm the new owner covers the existing behavior;
2. add behavior/ownership tests;
3. switch runtime loading to the new owner;
4. delete the old runtime;
5. add a guard so the retired file cannot return.

Do not keep compatibility files “just in case” after the replacement owner is active.

## 10. Data and rules

Static business facts should live in a named data owner, not be copied into page markup or ad-hoc runtime patches.

Assessment is especially strict:

- same input + same data version must produce the same output;
- Runtime AI must not fill rule gaps;
- UI must not override Assessment results;
- rule changes must first enter the formal data/rule source.

Offer/Product facts should be consumed by their page/model owner during normal render.

## 11. Explicit render pipeline

Dynamic UI synchronization must be explicit.

Current global presentation pipeline:

```text
App render
→ page/overlay explicit hooks
→ NextBonusUIFinalize.schedule()
```

Global copy / terminology / typography helpers are passive finalizers. They must not observe the entire DOM.

Independent surfaces such as Application Handoff must explicitly request finalization after they render.

## 12. Storage and business state

DOM is never the persisted business state.

Use formal state/storage owners.

Rules:

- persistent app state → `core/storage.js`;
- feature-specific persisted lifecycle state → the formal feature owner;
- page markup must never be parsed to reconstruct business state;
- localStorage should not be written by presentation fallbacks when a lifecycle owner already exists.

## 13. Testing philosophy

Tests should validate behavior and ownership, not incidental source formatting.

Prefer:

- given state X, action Y produces state/result Z;
- owner A exists and retired owner B does not;
- page consumes feature C;
- lifecycle preserves identity through complete/undo;
- render uses canonical data.

Avoid tests that require:

- exact whitespace;
- a particular source-code spelling;
- a specific cache-busting version;
- a function to live at a specific line;
- implementation-specific string formatting when behavior is equivalent.

Source-boundary tests are appropriate when they protect architecture.

## 14. Current CI architecture guards

Every pull request to `main` now runs the repository-owned `NextBonus CI / quality-gate`.

The baseline gate currently enforces:

- JavaScript syntax across all runtime and CI scripts
- local `index.html` script/style references resolve to real files
- the explicit UI finalization pipeline remains wired through `app.js`
- copy, terminology, typography, and semantic typography remain owned by `ui/finalize.js`
- zero runtime `MutationObserver`
- new typography declarations cannot be added outside the global typography owner
- intentional poster/marketing typography requires an explicit `nb-typography-exempt: marketing` marker
- diff whitespace errors fail CI

These are repository-level safety rails, not a substitute for behavior tests. Owner migrations and business-lifecycle changes should add focused behavior/ownership tests as executable coverage is introduced.

Do not weaken a guard just to make a patch merge.

If a guard fails, first determine whether:

1. the new implementation violates the architecture, or
2. the guard still encodes a retired implementation detail.

If the second case is true, update the guard to validate the current owner/behavior instead of bypassing it.

## 15. Retired patterns

The following patterns were intentionally removed and should not return:

- root page runtimes used as compatibility patches
- Watchlist DOM takeover runtimes
- navigation post-render patchers
- Offer Detail source-sync observer
- Product Detail fact/benefit post-render patchers
- Product Detail non-credit fetch/DOM patch runtime
- Application Review DOM observer
- Bonus multi-task DOM observer
- Offer Detail overlay DOM observer
- Product Detail overlay DOM observer
- global terminology/copy/typography DOM observers
- standalone boot-recovery runtime
- UI fallbacks that write business state directly because a Core/feature owner “might have missed it”

## 16. How to implement a change

Before coding, use this sequence:

1. Identify the user-visible behavior.
2. Identify the existing owner.
3. Read that owner and its tests.
4. Decide whether the change is:
   - data,
   - page presentation,
   - page interaction,
   - shared business lifecycle,
   - infrastructure,
   - global UI presentation.
5. Modify the existing owner.
6. Reuse existing feature/core APIs.
7. Add or update behavior tests.
8. If replacing an old layer, delete it in the same migration once coverage exists.
9. Run integration and browser acceptance.
10. Do not create a compatibility patch unless there is a documented migration need with an explicit removal plan.

## 17. Red flags during code review

Stop and reconsider the design if a change introduces any of the following:

- `MutationObserver`
- a new root runtime for one page
- `querySelector` used to infer business state
- DOM text used as a rule/data source
- a second localStorage key for an existing lifecycle
- a page re-implementing a feature rule
- UI writing business lifecycle state as a fallback
- dynamic import of an old runtime
- duplicated Offer/Product facts
- compatibility shim with no removal plan
- large new business branches inside `app.js`

These are architecture warnings, not normal shortcuts.

## 18. Architecture freeze

As of 2026-09-18, the Preview architecture is considered frozen around the owner model described here.

Architecture freeze means:

- new product work should use the existing boundaries;
- do not reorganize directories without a concrete ownership problem;
- do not start another broad cleanup merely to improve aesthetics;
- structural changes require a real behavior/ownership reason;
- prefer product functionality, UX, data quality, and correctness work over further refactoring.

The architecture can evolve, but only when a real feature cannot be cleanly represented by the existing ownership model.

## 19. Required reading for code changes

For any NextBonus code task:

1. read this file;
2. inspect the current owner in the latest `main`;
3. inspect relevant behavior/ownership tests;
4. make the smallest owner-correct change;
5. keep old retired patterns retired.

If a proposed fix only works by adding a patch layer, the design is not finished.
