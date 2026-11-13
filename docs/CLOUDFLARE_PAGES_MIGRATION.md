# NextBonus Discover: migrate front end to Cloudflare Pages

Keep the private source repository `ymlulu/nextbonus-preview`, the existing Deals Worker, its D1 database, and its R2 bucket. Only the static front-end host changes.

## Cloudflare Pages setup (one time)

1. In **Cloudflare > Workers & Pages**, create a **Pages** project using **Import an existing Git repository**.
2. Connect the **private** GitHub repository `ymlulu/nextbonus-preview` (grant the Cloudflare GitHub app access to this repository if prompted).
3. Set **production branch** to `main`, **root directory** to repository root, **build command** to `node scripts/build-cloudflare-pages.mjs`, and **build output directory** to `dist/cloudflare-pages`. This project has no npm build dependencies.
4. Name the Pages project `nextbonus-deals` if that name is available (the project name affects its `pages.dev` URL only).
5. Keep `ymlulu.github.io/nextbonus-preview-pages/` online until all checks below pass.
6. In the Pages project, go to **Custom domains > Set up a domain**, enter `deals.nextbonus.app`, and confirm. For a Cloudflare-managed `nextbonus.app` zone the CNAME can be created automatically. Always attach the domain in Pages first; do not only add DNS manually.
7. The existing Deals Worker config supports both `https://ymlulu.github.io` and `https://deals.nextbonus.app` while transitioning. Deploy the Worker changes first via its existing `Setup and Deploy Preview Deals (Cloudflare)` workflow.
8. After confirming the custom domain works, use a Cloudflare **account-level Bulk Redirect** for the project's production `*.pages.dev` hostname to `https://deals.nextbonus.app` (preserve path suffix and query string). Protect preview deployment aliases with Cloudflare Access if you do not want previews publicly accessible. This requires dashboard setup; `_redirects` does **not** support hostname-specific redirects.

## Verify before retiring GitHub Pages

- `https://deals.nextbonus.app/`: homepage loads all CSS/JS and images, and browser navigation and refresh work.
- Discover: live Deals loads, prices/images/affiliate click targets work.
- `https://deals.nextbonus.app/admin/`: admin password login, CRUD, image uploads, credit-card and bank-offer tabs work.
- Browser DevTools shows no CORS, 403, 404, or mixed-content errors.
- `https://ymlulu.github.io/nextbonus-preview-pages/` continues working during the migration.
- New commit to private `main` produces a successful Cloudflare Pages production deployment.

Only **after** these pass: disable/delete the `Publish Public Preview` workflow and stop publishing to `ymlulu/nextbonus-preview-pages`. Archive or privatize that mirror after confirming that nothing else depends on it. The prior public repository history is not made private retroactively.

## Notes

- All browser JavaScript/CSS/HTML and public catalog JSON remain viewable to anyone visiting the site, even though the GitHub source repository is private.
- Cloudflare Pages hosts static assets; it does not need a DD-style path allowlist. Admin authentication stays in the existing Deals Worker.
- The Worker may still be contacted directly; CORS is not an authentication mechanism.
- The Pages project's `pages.dev` hostname and preview aliases are separate from `deals.nextbonus.app`. Custom domain registration does not automatically disable them.
