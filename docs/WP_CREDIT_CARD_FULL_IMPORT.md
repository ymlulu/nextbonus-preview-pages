# NextBonus Preview: full WordPress credit card import

This extends the five-card pilot. Target: \`ymlulu/nextbonus-preview\`,
Preview D1 \`nextbonus-preview-deals\`, existing Preview Deals Worker and Admin.
It does **not** touch the production NextBonus repository, DD Database or Shopping Deals.

## Scope and source audit (2026-11-12)

- Authenticated WordPress Content Workspace search returned **239** \`uscc101_card\`
  records (237 published). Published cards: **237**.
- All **237** have \`_thumbnail_id\`, and the full read-only importer was able to
  resolve **237 HTTPS featured image URLs**.
- All published cards have readable product snapshots, optional linked articles
  and Go Link snapshot access. A completed dry-run reported **0 source errors**.
- **Three products contain duplicate \`public\` Go Link Offer IDs:**
  \`boa-alaska-infinite\`, \`chase-southwest-premier-business\`,
  \`chase-sapphire-reserve\`.
  Duplicate IDs cannot identify a unique source Offer. Do not invent an ID or
  redirect. The importer excludes **every occurrence** of those ambiguous Offer IDs
  while importing the other usable Offers and the products themselves.
  Resolve duplicate IDs in WordPress and resync the affected drafts if desired.

The WordPress Content Workspace \`/posts/search\` endpoint caps results at 1,000.
The importer deliberately aborts at that cap rather than silently truncating.
The current dataset (239 search results) is below it.

## Import contract

1. Read **published** WordPress \`uscc101_card\` posts only.
2. Require a real resolved HTTPS featured image URL; skip cards without it.
3. Keep the real WordPress slug and WP post ID as stable keys. Resolve card fields,
   linked article and current Go Link Offer records. Preserve original bonus text.
4. Stage new cards to **Draft**, with no auto-selection of the primary Offer.
5. Keep already published D1 credit cards **unchanged** during this bulk import.
   No bulk run may unpublish them or silently change the manually chosen Offer.
6. For existing *draft* records, sync updated WP source data and retain Draft.
7. Report source errors and fail before D1 writes; report per-record write failures,
   and fail at the end so an interrupted run can be safely retried.
8. Never auto-publish; manually select the intended Offer and publish under
   \`/admin/\` > 信用卡, using the existing authentication.

## Runbook

- Run \`node --test services/deals/test/sync-all-credit-cards.test.mjs\`.
- Apply the updated Worker by rerunning the existing
  \`Setup and Deploy Preview Deals (Cloudflare)\` workflow.
  This change requires **no new migration**.
- Run \`Sync All WordPress Card Faces to Preview D1\`, first \`dry-run\`,
  then \`sync\`, against \`main\`. WordPress / Worker secrets are already
  configured in the Preview repository.
- Review the Action's \`SOURCE_SUMMARY\`, \`OFFER_WARNING\`,
  \`IMPORT_SUMMARY\` and per-record error lines.
- Open the existing Preview \`/admin/\` > 信用卡 Tab. All records are returned
  through paginated Admin API (\`?offset=0,100,200,...\`).
  Choose the correct current Offer individually before publishing.
- Public API and Preview Discover also paginate published cards to avoid
  silently dropping cards after 100 entries.

No WordPress credentials or admin passwords are committed into this repository.
