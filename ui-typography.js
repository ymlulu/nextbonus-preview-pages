(() => {
  'use strict';

  const ROOT = document.documentElement;
  const APP = document.getElementById('app');
  const TYPE_ATTR = 'data-nb-type';
  const EMPHASIS_ATTR = 'data-nb-emphasis';
  const TONE_ATTR = 'data-nb-tone';
  const EXEMPT_ATTR = 'data-nb-typography-exempt';

  const MARKETING_ROOTS = [
    '.poster-stage',
    '.v4-generic-poster',
    '.deal-poster',
    '.remaining-poster',
    '.v4-reference-poster'
  ];

  const RULES = [
    /* App shell */
    ['.nav-item', 'headline', true],
    ['.nav-badge', 'caption2', true],
    ['.account-pop button', 'callout', false],

    /* Primary page titles */
    ['.nb-primary-page-head h1,.nb-watchlist-header h1,.v4-products-head h1,.attention-page .mock-page-title', 'title1', true],
    ['.nb-watchlist-header p,.v4-products-head>div>div,.mock-page-subtitle,.mock-page-count', 'subheadline', false, 'secondary'],

    /* Discover */
    ['.discover-page .search', 'callout'],
    ['.discover-page .pill', 'subheadline', true],
    ['.nb-offer-card .nb-offer-name,.fallback-offer-card .offer-name', 'headline', true],
    ['.nb-offer-card .nb-primary-value.is-short', 'display-value', true],
    ['.nb-offer-card .nb-primary-value.is-medium', 'display-value-compact', true],
    ['.nb-offer-card .nb-primary-value.is-long', 'display-value-compact', true],
    ['.fallback-offer-card .primary-value', 'display-value-compact', true],
    ['.nb-offer-card .nb-requirement,.fallback-offer-card .requirement', 'subheadline', false, 'secondary'],
    ['.nb-offer-card .nb-provider-text,.nb-offer-card .nb-status-tag,.nb-offer-card .nb-tag,.fallback-offer-card .provider,.fallback-offer-card .status-tag,.fallback-offer-card .soft-tag', 'caption2', true],

    /* Watchlist / 关注 */
    ['.nb-watchlist-section-head h2,.nb-watchlist-history-head strong', 'title3', true],
    ['.nb-watchlist-section-head p', 'subheadline', false, 'secondary'],
    ['.nb-watchlist-copy strong', 'headline', true],
    ['.nb-watchlist-copy small', 'caption1', false, 'secondary'],
    ['.nb-watchlist-provider,.nb-watchlist-status,.nb-watchlist-count,.nb-watchlist-history-head small', 'caption2', true, 'secondary'],
    ['.nb-watchlist-value', 'subheadline', true],
    ['.nb-watchlist-section-empty', 'subheadline', false, 'tertiary'],
    ['.nb-watchlist-empty h2', 'title2', true],
    ['.nb-watchlist-empty p', 'body', false, 'secondary'],
    ['.nb-watchlist-deal-complete', 'callout', true],

    /* Wallet */
    ['.v4-add-product', 'callout', true],
    ['.v4-product-search .search', 'callout'],
    ['.v4-section-head h2,.mock-section-title', 'title3', true],
    ['.v4-section-head .section-count,.section-count,.attention-count-dot', 'caption2', true],
    ['.mock-link,.v4-needs-attention .mock-link', 'subheadline', true, 'link'],
    ['.v4-pp-product', 'headline', true],
    ['.v4-pp-action', 'subheadline', false, 'secondary'],
    ['.v4-pp-time', 'caption1', false, 'secondary'],
    ['.v4-show-more,.product-sort-button', 'caption1', true, 'link'],
    ['.product-sort-menu button', 'caption1'],
    ['.v4-past-head', 'headline', true],
    ['.v4-past-head b', 'caption2', true],
    ['.v4-past-row span', 'subheadline'],
    ['.v4-past-row small', 'caption1', false, 'secondary'],
    ['.owned-product-meta strong,.v10-info-copy strong,.owned-product-copy strong', 'headline', true],
    ['.owned-product-meta small,.v10-info-copy small,.owned-product-copy small', 'caption1', false, 'secondary'],
    ['.account-products .fallback-brand,.membership-products .fallback-brand,.other-products .fallback-brand', 'subheadline', true],
    ['.attention-zero-state', 'caption1', false, 'secondary'],

    /* Attention / 提醒 */
    ['.mock-tabs .tab,.mock-filter-select,.mock-status-select', 'subheadline', true],
    ['.active-filter-chip', 'caption2', true],
    ['.att-product-copy strong,.att-action-cell strong,.att-product,.att-action', 'headline', true],
    ['.att-product-copy small,.att-action-cell small', 'caption1', false, 'secondary'],
    ['.att-time,.history-status', 'caption1', true],
    ['.att-thumb', 'caption2', true],
    ['.attention-summary', 'body'],
    ['.key-card strong', 'headline', true],
    ['.key-card .muted', 'caption1', false, 'secondary'],
    ['.instruction-title', 'headline', true],
    ['.check', 'body'],
    ['.attention-actions .btn.small', 'callout', true],

    /* Product detail */
    ['.v4-pd-title-row h1,.pd-name,.overview-name', 'title2', true],
    ['.detail-back,.mock-back', 'subheadline', true, 'secondary'],
    ['.v4-pd-actions button,.pd-quick-actions button', 'callout', true, 'link'],
    ['.v4-pd-actions button span,.pd-quick-actions button span,.v4-pd-edit,.pd-edit', 'caption1', true, 'secondary'],
    ['.v4-pd-status,.pd-status-strip', 'subheadline'],
    ['.v4-pd-status>strong', 'subheadline', true],
    ['.v4-pd-facts small,.pd-facts .fact-label,.fact-label', 'caption1', false, 'secondary'],
    ['.v4-pd-facts strong,.pd-facts .fact-value,.fact-value', 'body', true],
    ['.v4-pd-earning b', 'title3', true],
    ['.v4-pd-earning small', 'caption1', false, 'secondary'],
    ['.v4-pd-section .v4-section-head h2', 'title3', true],
    ['.v4-pd-att-copy strong', 'headline', true],
    ['.v4-pd-att-copy small', 'caption1', false, 'secondary'],
    ['.v4-pd-att-time', 'caption1', false, 'secondary'],
    ['.v4-feature-benefit strong,.pd-benefit-grid .benefit-title,.benefit-title', 'headline', true],
    ['.v4-feature-benefit small,.pd-benefit-grid .benefit-short,.benefit-short', 'caption1', false, 'secondary'],
    ['.v4-benefit-row strong', 'headline', true],
    ['.v4-benefit-row small', 'caption1', false, 'secondary'],
    ['.v4-benefit-expanded,.pd-benefit-grid .benefit-detail,.benefit-detail', 'body'],
    ['.v4-benefit-expanded .official-link', 'caption1', true, 'link'],
    ['.timeline-date', 'caption1', false, 'secondary'],
    ['.timeline-copy,.timeline-empty', 'subheadline'],
    ['.pd-id,.pd-inline-note', 'caption1', false, 'secondary'],

    /* Account product detail */
    ['.nb-account-section .v4-section-head h2,.nb-account-notice .v4-section-head h2', 'title3', true],
    ['.nb-account-row strong', 'headline', true],
    ['.nb-account-row span,.nb-account-notice p', 'body', false, 'secondary'],
    ['.nb-account-source', 'caption1', false, 'tertiary'],

    /* Shared Offer Detail right rail */
    ['.v4-decision-panel h1,.decision-brand-title,.decision-product', 'title2', true],
    ['.v4-decision-copy,.decision-brand-copy,.decision-sub', 'subheadline', false, 'secondary'],
    ['.v4-detail-save,.detail-save', 'callout', true],
    ['.v4-result-meta,.mock-result-block .result-meta,.result-meta', 'caption1', false, 'secondary'],
    ['.v4-recommendation,.mock-result-block .recommendation,.recommendation', 'result-value', true],
    ['.v4-metric .metric-label,.mock-result-block .metric-label,.metric-label', 'caption1', false, 'secondary'],
    ['.v4-metric .metric-value,.mock-result-block .metric-value,.metric-value', 'headline', true],
    ['.v4-metric .metric-sub', 'caption2', false, 'tertiary'],
    ['.v4-result-note,.result-disclaimer,.v4-security-line,.v4-trust-row b,.v4-trust-row small,.detail-trust-row span', 'caption2', false, 'tertiary'],
    ['.v4-detail-actions .btn,.mock-detail-actions .btn', 'callout', true],
    ['.v4-no-action-note', 'caption1', false, 'secondary'],

    /* U.S. Bank Offer Detail right rail */
    ['.nb-bank-brand strong', 'headline', true],
    ['.nb-bank-brand small', 'caption1', false, 'secondary'],
    ['.nb-bank-save', 'callout', true],
    ['.nb-bank-reward-label', 'caption1', true],
    ['.nb-bank-reward-value', 'title3', true],
    ['.nb-bank-reward-value b', 'result-value', true],
    ['.nb-bank-tier-head', 'caption2', true],
    ['.nb-bank-tier', 'caption1'],
    ['.nb-bank-tier strong', 'subheadline', true],
    ['.nb-best-pill', 'caption2', true],
    ['.nb-bank-flow h2', 'title3', true],
    ['.nb-bank-step-num,.nb-bank-step-time', 'caption2', true],
    ['.nb-bank-step-title', 'headline', true],
    ['.nb-bank-step-card ul', 'body', false, 'secondary'],
    ['.nb-bank-cta', 'callout', true],
    ['.nb-bank-deadline', 'caption1', false, 'tertiary'],
    ['.nb-bank-eligibility summary', 'subheadline', true],
    ['.nb-bank-eligibility-copy', 'body', false, 'secondary'],

    /* Dynamically loaded Deal / Remaining Offer right rails */
    ['.deal-brand strong,.remaining-head strong', 'headline', true],
    ['.deal-brand small,.remaining-head small', 'caption1', false, 'secondary'],
    ['.deal-save,.remaining-save', 'callout', true],
    ['.deal-value-label,.deal-value-sub,.remaining-reward-label,.remaining-reward-sub', 'caption1', false, 'secondary'],
    ['.deal-value,.remaining-reward-value', 'result-value', true],
    ['.deal-section-title,.remaining-section-title', 'title3', true],
    ['.deal-time-card,.remaining-tier', 'caption1'],
    ['.deal-urgent,.deal-step-num,.remaining-tier-head,.remaining-num,.remaining-time', 'caption2', true],
    ['.deal-step-copy b,.remaining-step-title', 'headline', true],
    ['.deal-step-copy small,.remaining-step-card ul', 'body', false, 'secondary'],
    ['.deal-cta,.remaining-cta', 'callout', true],
    ['.deal-terms summary,.remaining-eligibility summary', 'subheadline', true],
    ['.deal-terms-copy,.remaining-eligibility-copy', 'body', false, 'secondary'],
    ['.remaining-deadline', 'caption1', false, 'tertiary'],

    /* Add Product / forms */
    ['.add-product-modal .modal-title,.modal-title', 'title2', true],
    ['.modal-kicker', 'caption2', true, 'tertiary'],
    ['.add-progress span,.add-progress-labels', 'caption2', true, 'secondary'],
    ['.add-product-modal .category-title,.category-title', 'headline', true],
    ['.add-product-modal .category-sub,.category-sub', 'caption1', false, 'secondary'],
    ['.add-product-modal .option-title,.option-title', 'headline', true],
    ['.add-product-modal .option-sub,.option-sub', 'caption1', false, 'secondary'],
    ['.add-product-modal .label,.label', 'subheadline', true],
    ['.add-product-modal .input,.add-product-modal .textarea,.input,.textarea', 'callout'],
    ['.add-product-modal .btn,.btn', 'callout', true],
    ['.add-product-modal .pill,.add-more-filter button', 'caption1', true],
    ['.hint', 'footnote', false, 'secondary'],
    ['.duplicate-warning strong', 'headline', true],
    ['.duplicate-warning p,.submitted-note', 'footnote', false, 'secondary'],

    /* Assessment visual layer only */
    ['.assessment-progress-head h1', 'title1', true],
    ['.assessment-progress-head>strong', 'subheadline', true, 'secondary'],
    ['.assessment-choice', 'body', true],
    ['.assessment-subq-title', 'headline', true],
    ['.assessment-subq-title>span', 'caption2', true],
    ['.assessment-help,.assessment-footnote', 'footnote', false, 'secondary'],
    ['.v5-short-summary', 'subheadline', true, 'secondary'],
    ['.v5-primary-alert,.v5-reassess', 'caption1', true],
    ['.v5-report-summary,.v5-tip-list strong', 'subheadline'],
    ['.v5-tip-list p', 'body'],
    ['.assessment-inline-number label', 'caption1', true],
    ['.assessment-result-reasons h3', 'headline', true],
    ['.assessment-result-reasons p', 'body', false, 'secondary'],
    ['.canonical-modal-body h2', 'title2', true],
    ['.canonical-modal-body h3', 'title3', true],
    ['.canonical-modal-body p', 'body'],
    ['.canonical-dimensions dt', 'caption1', false, 'secondary'],
    ['.canonical-dimensions dd', 'body', true],
    ['.nb-oh-stat-name', 'caption2', false, 'secondary'],
    ['.nb-oh-stat-value', 'title3', true],
    ['.nb-oh-title', 'headline', true],
    ['.nb-oh-ranges button', 'caption2', true],
    ['.nb-oh-details', 'caption1'],
    ['.nb-oh-note,.nb-oh-empty', 'caption2', false, 'secondary'],
    ['.nb-oh-axis', 'caption2', false, 'secondary'],

    /* Application result flow injected after the main app. */
    ['#nb-application-handoff-root .nb-ah-banner strong,#nb-application-handoff-root .nb-ah-success strong', 'headline', true],
    ['#nb-application-handoff-root .nb-ah-banner p,#nb-application-handoff-root .nb-ah-success p,#nb-application-handoff-root .nb-ah-note', 'body', false, 'secondary'],
    ['#nb-application-handoff-root .nb-ah-btn', 'callout', true],
    ['#nb-application-handoff-root .nb-ah-title', 'title2', true],
    ['#nb-application-handoff-root .nb-ah-sub', 'subheadline', false, 'secondary'],
    ['#nb-application-handoff-root .nb-ah-field label', 'subheadline', true],
    ['#nb-application-handoff-root .nb-ah-field input', 'callout'],
    ['#nb-application-handoff-root .nb-ah-result', 'callout', true],

    /* Login / empty / success / generic helpers */
    ['.mock-login-card h1,.login-card h1', 'title2', true],
    ['.mock-login-card p,.login-card p', 'body', false, 'secondary'],
    ['.empty h3,.success h2', 'title2', true],
    ['.empty p,.success p,.report p', 'body', false, 'secondary'],
    ['.report h3', 'title3', true],
    ['.toast', 'subheadline'],
    ['.toast button', 'subheadline', true, 'link'],
    ['.legal,.prototype-note', 'caption2', false, 'tertiary']
  ];

  const FALLBACKS = [
    ['h1', 'title1', true],
    ['h2', 'title2', true],
    ['h3', 'title3', true],
    ['p', 'body', false],
    ['label', 'subheadline', true],
    ['small', 'caption1', false, 'secondary'],
    ['dt', 'caption1', false, 'secondary'],
    ['dd', 'body', false],
    ['li', 'body', false],
    ['button', 'callout', true],
    ['input,textarea,select', 'callout', false]
  ];

  function isMarketing(node) {
    return !!node.closest?.(`[${EXEMPT_ATTR}="marketing"]`);
  }

  function mark(node, type, emphasis = false, tone = null) {
    if (!(node instanceof Element) || isMarketing(node)) return;
    node.setAttribute(TYPE_ATTR, type);
    if (emphasis) node.setAttribute(EMPHASIS_ATTR, 'true');
    else node.removeAttribute(EMPHASIS_ATTR);
    if (tone) node.setAttribute(TONE_ATTR, tone);
    else node.removeAttribute(TONE_ATTR);
  }

  function markMarketingRoots(root = document) {
    MARKETING_ROOTS.forEach(selector => {
      root.querySelectorAll?.(selector).forEach(node => node.setAttribute(EXEMPT_ATTR, 'marketing'));
      if (root.matches?.(selector)) root.setAttribute(EXEMPT_ATTR, 'marketing');
    });
  }

  function ensureDiscoverTitle() {
    const page = document.querySelector('.discover-page');
    if (!page) return;
    if (page.querySelector(':scope > .nb-primary-page-head')) return;
    const head = document.createElement('header');
    head.className = 'nb-primary-page-head';
    head.innerHTML = '<h1>发现</h1>';
    page.insertBefore(head, page.firstElementChild || null);
  }

  function applyRules(root = document) {
    RULES.forEach(([selector, type, emphasis = false, tone = null]) => {
      root.querySelectorAll?.(selector).forEach(node => mark(node, type, emphasis, tone));
      if (root.matches?.(selector)) mark(root, type, emphasis, tone);
    });
  }

  function applyFallbacks(root = document) {
    FALLBACKS.forEach(([selector, type, emphasis = false, tone = null]) => {
      root.querySelectorAll?.(`${selector}:not([${TYPE_ATTR}])`).forEach(node => mark(node, type, emphasis, tone));
      if (root.matches?.(selector) && !root.hasAttribute(TYPE_ATTR)) mark(root, type, emphasis, tone);
    });
  }

  function sync(root = document) {
    ensureDiscoverTitle();
    markMarketingRoots(root);
    applyRules(root);
    applyFallbacks(root);
  }

  function visibleTextElements() {
    const candidates = document.querySelectorAll('#app h1,#app h2,#app h3,#app p,#app label,#app small,#app dt,#app dd,#app li,#app button,#app input,#app textarea,#app select,#nb-application-handoff-root h1,#nb-application-handoff-root h2,#nb-application-handoff-root h3,#nb-application-handoff-root p,#nb-application-handoff-root label,#nb-application-handoff-root small,#nb-application-handoff-root li,#nb-application-handoff-root button,#nb-application-handoff-root input');
    return [...candidates].filter(node => !isMarketing(node) && !node.closest('svg') && !node.hidden);
  }

  function audit() {
    const unmanaged = visibleTextElements().filter(node => !node.hasAttribute(TYPE_ATTR));
    return {
      total: visibleTextElements().length,
      managed: visibleTextElements().length - unmanaged.length,
      unmanaged,
      unmanagedCount: unmanaged.length
    };
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => sync(), { once:true });
  else sync();

  if (APP) new MutationObserver(schedule).observe(APP, { childList:true, subtree:true });
  new MutationObserver(schedule).observe(document.body, { childList:true, subtree:true });

  window.NextBonusTypography = Object.freeze({ sync, audit, rules: RULES.map(rule => [...rule]) });
  ROOT.dataset.nbTypography = 'apple-v1';
})();
