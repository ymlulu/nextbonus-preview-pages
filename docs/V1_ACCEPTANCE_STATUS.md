# NextBonus V1 Acceptance Status

This file is a verification index only. It does not define product rules. The canonical page/interaction acceptance remains the Google Drive document `NextBonus｜页面与交互总验收` and the dedicated source-of-truth documents referenced by it.

Baseline audited: current `main` after PR #108.

## Current status

| Acceptance area | Status | Regression evidence / note |
| --- | --- | --- |
| Offer / Product detail navigation and return | PASS | `tests/desktop-detail-layer.cjs`, `tests/v1-acceptance-contract.cjs` |
| Protected personal routes and login return intent | PASS | `tests/v1-acceptance-contract.cjs` locks protected routes plus bookmark / Assessment return intents |
| Assessment deterministic integration boundary | PASS | `tests/assessment-static-integration.cjs`, `tests/canonical-assessment-all-cards.cjs` |
| Application entry / Handoff lifecycle | PASS | `tests/application-entry.cjs`, `tests/application-handoff*.cjs`, `tests/application-review-flow.cjs` |
| Approved application -> Product + Tracking + Task + Attention | PASS | `tests/application-handoff-behavior.cjs`, `tests/v1-acceptance-contract.cjs` |
| Watchlist state / application / deal lifecycle | PASS | `tests/watchlist-state.cjs`, `tests/watchlist-follow-routing.cjs`, `tests/application-watchlist-lifecycle.cjs`, `tests/deal-watchlist-lifecycle.cjs`, `tests/watchlist-integration-qa.cjs` |
| Attention structured identity and lifecycle | PASS | `tests/structured-benefit-attention.cjs`, `tests/user-product-instance-boundary.cjs` |
| Product source-of-truth cleanup | PASS | `tests/product-v1-source-cleanup.cjs` |
| Credit-card product art boundary | PASS | `tests/product-art-contract.cjs` |
| User-facing Chinese copy layer | PASS for current audited copy | PR #108; keep copy-only changes separate from deterministic business rules |
| Offer ended / profile freshness / Assessment stale precedence | BLOCKED / NOT IMPLEMENTED | Existing Issue #40. Requires frozen source fields / version inputs; do not invent thresholds or lifecycle dates. |
| Production backend persistence / multi-user auth / deployment architecture | OUTSIDE Preview acceptance | Preview is still a reference implementation; production handoff remains a separate deliverable. |

## V1 acceptance gate

A Preview change should not be treated as V1-safe unless `Assessment Integration Check` stays green. The workflow now includes the cross-module `tests/v1-acceptance-contract.cjs` in addition to the module-level regression suite.

Issue #40 is the only known page-state acceptance gap intentionally left open in this pass because its source/version inputs are not yet frozen.
