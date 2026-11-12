# WordPress credit-card pilot (5 cards)

Scope: `ymlulu/nextbonus-preview` only. This reuses the Preview Deals Worker / D1 deployment but creates independent credit-card tables. It never modifies Shopping Deals rows, DD Database or the official NextBonus app.

## Pilot selection

The importer searches published WordPress `uscc101_card` entries by title, rejects missing/ambiguous matches, and fetches their original WP IDs:
- AMEX Hilton Aspire
- AMEX Hilton Surpass
- AMEX Hilton Honors (exclude Aspire / Surpass / Business)
- AMEX Marriott Bonvoy Brilliant
- Chase Freedom Unlimited

No card values are hardcoded into the import script. It reads WP Content Workspace card fields, WordPress media, the linked article, and each Go Link offer ID and bonus. A requirement is extracted only when a trailing parenthetical spend clause exists. No inferred bank rules, benefits or assessment facts are generated.

## Setup and actual dry-run

GitHub Actions secrets must be configured in **ymlulu/nextbonus-preview**:
`WP_CW_USERNAME`, `WP_CW_APPLICATION_PASSWORD`, `NEXTBONUS_DEALS_ADMIN_PASSWORD`, plus the existing Cloudflare secrets used by `deploy-deals-cloudflare.yml`. Credentials in a different repo are not inherited.

1. Merge this PR after review and CI.
2. Actions > **Setup and Deploy Preview Deals (Cloudflare)** > Run workflow on main. This applies migration 0003 and redeploys the existing Preview Worker.
3. Actions > **Five WordPress Credit Cards to Preview D1** > `dry-run`. Verify five real WP card IDs, source bonus records, image URLs and linked articles.
4. Run `sync`. New or changed source records are written to **draft** only, using an atomic D1 batch.
5. Verify each draft's title, issuer, annual fee, reward value/requirement, featured image, article link and WP Go Link offer IDs.
6. Run `publish` once per approved card, with the source **card_slug** and **offer_id**. An Offer requires a non-empty bonus and Go Link to publish.
7. Visit the Preview GitHub Pages Discover > 信用卡 > Card Detail, test direct apply, WordPress article link, Watchlist, Add Product, mobile layout, and the existing six full Assessment cards.

## API

`GET /api/public/credit-cards` and `GET /api/public/credit-cards/:slug` return published cards only. `GET/PUT /api/admin/credit-cards/:slug` reuse the existing signed admin session. The browser never receives WordPress credentials, nor does the public API return underlying fixed/referral destination URLs. It only returns the selected WP Go Link.

## Limitations

Live WordPress authenticated reads, real D1 writes, migrations and deployment **are not verified yet**: they require the above Actions secrets and manual workflow runs. Unapproved WP source changes put the pilot card back into draft instead of silently publishing new financial claims. This pilot is deliberately capped at five source titles, with no automatic daily publish. Scaling beyond 100 public cards needs API pagination and a broader review process.
