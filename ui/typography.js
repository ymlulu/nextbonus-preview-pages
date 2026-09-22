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
    '.mm-poster',
    '.v4-reference-poster'
  ];

  const RULES = [
    /* App shell */
    ['.nav-item', 'callout', false],
    ['.nav-badge', 'caption2', false],
    ['.account-pop button', 'callout', false],

    /* Primary page titles */
    ['.nb-primary-page-head h1,.nb-watchlist-header h1,.v4-products-head h1,.attention-page .mock-page-title', 'title1', false],
    ['.nb-watchlist-header p,.v4-products-head>div>div,.mock-page-subtitle,.mock-page-count', 'subheadline', false, 'secondary'],

    /* Discover */
    ['.discover-page .search', 'callout'],
    ['.discover-page .pill', 'callout', false],
    ['.nb-offer-card .nb-offer-name,.fallback-offer-card .offer-name', 'headline', false],
    ['.nb-offer-card .nb-primary-value,.fallback-offer-card .primary-value', 'display-value-compact', false],
    ['.nb-offer-card .nb-requirement,.fallback-offer-card .requirement', 'subheadline', false, 'secondary'],
    ['.nb-offer-card .nb-provider-text,.nb-offer-card .nb-status-tag,.nb-offer-card .nb-tag,.fallback-offer-card .provider,.fallback-offer-card .status-tag,.fallback-offer-card .soft-tag', 'caption2', false],

    /* Watchlist / 关注 */
    ['.nb-watchlist-section-head h2,.nb-watchlist-history-head strong', 'title3', false],
    ['.nb-watchlist-section-head p', 'subheadline', false, 'secondary'],
    ['.nb-watchlist-copy strong', 'headline', false],
    ['.nb-watchlist-copy small', 'caption1', false, 'secondary'],
    ['.nb-watchlist-provider,.nb-watchlist-status,.nb-watchlist-count,.nb-watchlist-history-head small', 'caption2', false, 'secondary'],
    ['.nb-watchlist-value', 'callout', false],
    ['.nb-watchlist-section-empty', 'subheadline', false, 'tertiary'],
    ['.nb-watchlist-empty h2', 'title2', false],
    ['.nb-watchlist-empty p', 'body', false, 'secondary'],
    ['.nb-watchlist-deal-complete', 'callout', false],

    /* Wallet */
    ['.v4-add-product', 'callout', false],
    ['.v4-product-search .search', 'callout'],
    ['.v4-section-head h2,.mock-section-title', 'title3', false],
    ['.v4-section-head .section-count,.section-count,.attention-count-dot', 'caption2', false],
    ['.mock-link,.v4-needs-attention .mock-link', 'subheadline', false, 'link'],
    ['.v4-pp-product', 'headline', false],
    ['.v4-pp-action', 'subheadline', false, 'secondary'],
    ['.v4-pp-time', 'caption1', false, 'secondary'],
    ['.product-sort-button', 'caption1', false],
    ['.product-sort-menu button', 'caption1'],
    ['.v4-past-head', 'headline', false],
    ['.v4-past-head b', 'caption2', false],
    ['.v4-past-row span', 'subheadline'],
    ['.v4-past-row small', 'caption1', false, 'secondary'],
    ['.owned-product-meta strong,.v10-info-copy strong,.owned-product-copy strong', 'headline', false],
    ['.owned-product-meta small,.v10-info-copy small,.owned-product-copy small', 'caption1', false, 'secondary'],
    ['.account-products .fallback-brand,.membership-products .fallback-brand,.other-products .fallback-brand', 'subheadline', false],
    ['.attention-zero-state', 'caption1', false, 'secondary'],

    /* Attention / 提醒 */
    ['.mock-tabs .tab,.mock-filter-select,.mock-status-select', 'callout', false],
    ['.active-filter-chip', 'caption2', false],
    ['.att-product-copy strong,.att-product', 'subheadline', false],
    ['.att-action-cell strong,.att-action', 'headline', false],
    ['.att-product-copy small,.att-action-cell small', 'subheadline', false, 'secondary'],
    ['.att-time', 'subheadline', false, 'secondary'],
    ['.history-status', 'caption1', false],
    ['.att-thumb', 'caption2', false],
    ['.attention-summary', 'body'],
    ['.key-card strong', 'headline', false],
    ['.key-card .muted', 'caption1', false, 'secondary'],
    ['.instruction-title', 'headline', false],
    ['.check', 'body'],
    ['.attention-actions .btn.small', 'callout', false],

    /* Product detail */
    ['.v4-pd-title-row h1,.pd-name,.overview-name', 'title2', false],
    ['.detail-back,.mock-back', 'subheadline', false, 'secondary'],
    ['.v4-pd-actions button,.pd-quick-actions button', 'caption1', false, 'link'],
    ['.v4-pd-actions button span,.pd-quick-actions button span', 'caption1', false, 'link'],
    ['.v4-pd-edit,.pd-edit', 'callout', false],
    ['.v4-pd-status,.pd-status-strip', 'subheadline'],
    ['.v4-pd-status>strong', 'subheadline', false],
    ['.v4-pd-facts small,.pd-facts .fact-label,.fact-label', 'caption1', false, 'secondary'],
    ['.v4-pd-facts strong,.pd-facts .fact-value,.fact-value', 'body', false],
    ['.v4-pd-facts.credit-card-facts small,.v4-pd-facts.credit-card-facts strong', 'body', false],
    ['.v4-pd-earning b', 'title3', false],
    ['.v4-pd-earning small', 'caption1', false, 'secondary'],
    ['.v4-pd-section .v4-section-head h2', 'title3', false],
    ['.v4-pd-att-copy strong', 'headline', false],
    ['.v4-pd-att-copy small', 'caption1', false, 'secondary'],
    ['.v4-pd-att-time', 'caption1', false, 'secondary'],
    ['.v4-feature-benefit strong,.pd-benefit-grid .benefit-title,.benefit-title', 'headline', false],
    ['.v4-feature-benefit small,.pd-benefit-grid .benefit-short,.benefit-short', 'caption1', false, 'secondary'],
    ['.v4-benefit-row strong', 'headline', false],
    ['.v4-benefit-row small', 'caption1', false, 'secondary'],
    ['.v4-benefit-expanded,.pd-benefit-grid .benefit-detail,.benefit-detail', 'body'],
    ['.v4-benefit-expanded .official-link', 'caption1', false, 'link'],
    ['.timeline-date', 'caption1', false, 'secondary'],
    ['.timeline-copy,.timeline-empty', 'subheadline'],
    ['.pd-id,.pd-inline-note', 'caption1', false, 'secondary'],

    /* Account product detail */
    ['.nb-account-section .v4-section-head h2,.nb-account-notice .v4-section-head h2', 'title3', false],
    ['.nb-account-row strong', 'headline', false],
    ['.nb-account-row span,.nb-account-notice p', 'body', false, 'secondary'],
    ['.nb-account-source', 'caption1', false, 'tertiary'],

    /* Shared Offer Detail right rail */
    ['.v4-decision-panel h1,.decision-brand-title,.decision-product', 'title2', false],
    ['.v4-decision-copy,.decision-brand-copy,.decision-sub', 'subheadline', false, 'secondary'],
    ['.v4-detail-save,.detail-save', 'callout', false],
    ['.v4-result-meta,.mock-result-block .result-meta,.result-meta', 'caption1', false, 'secondary'],
    ['.v4-recommendation,.mock-result-block .recommendation,.recommendation', 'result-value', false],
    ['.v4-metric .metric-label,.mock-result-block .metric-label,.metric-label', 'caption1', false, 'secondary'],
    ['.v4-metric .metric-value,.mock-result-block .metric-value,.metric-value', 'headline', false],
    ['.v4-metric .metric-sub', 'caption2', false, 'tertiary'],
    ['.v4-result-note,.result-disclaimer,.v4-security-line,.v4-trust-row b,.v4-trust-row small,.detail-trust-row span', 'caption2', false, 'tertiary'],
    ['.v4-detail-actions .btn,.mock-detail-actions .btn', 'callout', false],
    ['.v4-no-action-note', 'caption1', false, 'secondary'],

    /* U.S. Bank Offer Detail right rail */
    ['.nb-bank-brand strong', 'headline', false],
    ['.nb-bank-brand small', 'caption1', false, 'secondary'],
    ['.nb-bank-save', 'callout', false],
    ['.nb-bank-reward-label', 'caption1', false],
    ['.nb-bank-reward-value', 'title3', false],
    ['.nb-bank-reward-value b', 'result-value', false],
    ['.nb-bank-tier-head', 'caption2', false],
    ['.nb-bank-tier', 'caption1'],
    ['.nb-bank-tier strong', 'subheadline', false],
    ['.nb-best-pill', 'caption2', false],
    ['.nb-bank-flow h2', 'title3', false],
    ['.nb-bank-step-num,.nb-bank-step-time', 'caption2', false],
    ['.nb-bank-step-title', 'headline', false],
    ['.nb-bank-step-card ul', 'body', false, 'secondary'],
    ['.nb-bank-cta', 'callout', false],
    ['.nb-bank-deadline', 'caption1', false, 'tertiary'],
    ['.nb-bank-eligibility summary', 'subheadline', false],
    ['.nb-bank-eligibility-copy', 'body', false, 'secondary'],

    /* Dynamically loaded Deal / Remaining Offer right rails */
    ['.deal-brand strong,.remaining-head strong', 'headline', false],
    ['.deal-brand small,.remaining-head small', 'caption1', false, 'secondary'],
    ['.deal-save,.remaining-save', 'callout', false],
    ['.deal-value-label,.deal-value-sub,.remaining-reward-label,.remaining-reward-sub', 'caption1', false, 'secondary'],
    ['.deal-value,.remaining-reward-value', 'result-value', false],
    ['.deal-section-title,.remaining-section-title', 'title3', false],
    ['.deal-time-card,.remaining-tier', 'caption1'],
    ['.deal-urgent,.deal-step-num,.remaining-tier-head,.remaining-num,.remaining-time', 'caption2', false],
    ['.deal-step-copy b,.remaining-step-title', 'headline', false],
    ['.deal-step-copy small,.remaining-step-card ul', 'body', false, 'secondary'],
    ['.deal-cta,.remaining-cta', 'callout', false],
    ['.deal-terms summary,.remaining-eligibility summary', 'subheadline', false],
    ['.deal-terms-copy,.remaining-eligibility-copy', 'body', false, 'secondary'],
    ['.remaining-deadline', 'caption1', false, 'tertiary'],

    /* Assessment rail / report */
    ['.nb-assessment-rail-head h2', 'title3', false],
    ['.nb-assessment-rail-head button', 'subheadline', false, 'link'],
    ['.nb-assessment-progress span,.nb-assessment-group-title', 'caption2', false, 'secondary'],
    ['.nb-assessment-progress b,.nb-assessment-question h3', 'headline', false],
    ['.nb-assessment-progress p,.canonical-error', 'footnote', false, 'secondary'],
    ['.nb-assessment-number', 'body', false],
    ['.nb-assessment-rail-footer .btn,.nb-assessment-result-buttons .btn,.nb-assessment-report-actions .btn', 'callout', false],
    ['.nb-assessment-loading', 'body', false, 'secondary'],
    ['.nb-assessment-error h3', 'headline', false],
    ['.nb-assessment-error p', 'body', false, 'secondary'],
    ['.nb-assessment-result-kicker', 'caption1', false, 'secondary'],
    ['.nb-assessment-result-summary h2,.nb-assessment-report h2', 'title2', false],
    ['.nb-assessment-result-summary>p,.nb-assessment-report-summary', 'body', false, 'secondary'],
    ['.nb-assessment-result-points span', 'subheadline', false, 'secondary'],
    ['.nb-assessment-result-points b', 'headline', false],
    ['.nb-assessment-text-action', 'subheadline', false, 'link'],
    ['.nb-assessment-report>section h3', 'headline', false],
    ['.nb-assessment-report>section p', 'body', false],
    ['.nb-assessment-report>small', 'caption2', false, 'tertiary'],

    /* Credit-card Product Detail */
    ['.nb-card-section-title h2', 'title3', false],
    ['.nb-card-section-title p', 'subheadline', false, 'secondary'],
    ['.nb-card-bonus-main strong,.nb-welcome-bonus-value', 'result-value', false],
    ['.nb-card-bonus-main>span', 'title3', false],
    ['.nb-card-bonus-due,.nb-welcome-bonus-requirement,.nb-card-single-task,.nb-card-bonus-check', 'body', false, 'secondary'],
    ['.nb-card-complete-btn', 'callout', false],
    ['.nb-card-benefit-columns .v4-benefit-row strong,.nb-card-generic-benefit-item .benefit-title', 'headline', false],
    ['.nb-card-benefit-columns .v4-benefit-row small,.nb-card-generic-benefit-item .benefit-short', 'caption1', false, 'secondary'],
    ['.nb-card-benefit-due,.nb-benefit-cycle-quick', 'caption1', false, 'secondary'],
    ['.nb-bonus-deadline-label', 'subheadline', false, 'secondary'],
    ['.nb-bonus-deadline-value', 'headline', false],
    ['.nb-bonus-edit-link', 'subheadline', false, 'link'],

    /* Credit-card story navigation is app chrome; poster copy itself stays marketing-exempt. */
    ['.nb-credit-story-nav-item', 'callout', false],
    ['.nb-credit-story-nav-label', 'callout', false],

    /* Credit-card Offer Detail supporting UI / calculator */
    ['.nb-annual-value-personalized', 'subheadline', false, 'success'],
    ['.nb-annual-calc-head h2', 'title3', false],
    ['.nb-annual-calc-head button', 'subheadline', false, 'link'],
    ['.nb-annual-calc-result span', 'subheadline', false, 'secondary'],
    ['.nb-annual-calc-result strong', 'result-value', false],
    ['.nb-annual-calc-result small', 'caption1', false, 'secondary'],
    ['.nb-annual-calc-section-title>span', 'caption2', false],
    ['.nb-annual-calc-section-title h3', 'headline', false],
    ['.nb-annual-calc-copy b,.nb-annual-calc-spend-row b', 'headline', false],
    ['.nb-annual-calc-copy small,.nb-annual-calc-spend-row small', 'caption1', false, 'secondary'],
    ['.nb-annual-calc-segment button', 'subheadline', false],
    ['.nb-annual-calc-input-wrap,.nb-annual-calc-input-wrap input', 'body', false],
    ['.nb-annual-calc-input-wrap small,.nb-annual-calc-baseline,.nb-annual-calc-unquantified', 'caption1', false, 'secondary'],
    ['.nb-annual-calc-summary>div:not(.nb-annual-calc-section-title)', 'body', false],
    ['.nb-annual-calc-summary b', 'headline', false],
    ['.nb-annual-calc-summary .total strong', 'display-value-compact', false],
    ['.nb-annual-calc-done', 'callout', false],
    ['.nb-assessment-inline-result>div>span,.nb-assessment-inline-result>div>small,.nb-credit-assessment-line', 'subheadline', false, 'secondary'],
    ['.nb-assessment-inline-result>div>strong', 'title3', false],
    ['.nb-assessment-inline-result>button,.nb-credit-assessment-line button', 'subheadline', false, 'link'],

    /* Moomoo Offer Detail right rail (poster remains marketing-exempt). */
    ['.mm-head-brand strong', 'headline', false],
    ['.mm-head-brand small', 'caption1', false, 'secondary'],
    ['.mm-save', 'callout', false],
    ['.mm-reward-label', 'caption1', false],
    ['.mm-reward-value', 'title3', false],
    ['.mm-reward-value b', 'result-value', false],
    ['.mm-tier-head', 'caption2', false],
    ['.mm-tier', 'caption1', false],
    ['.mm-pill', 'caption2', false],
    ['.mm-stack b,.mm-step-title', 'headline', false],
    ['.mm-stack small', 'caption1', false, 'secondary'],
    ['.mm-flow h2', 'title3', false],
    ['.mm-num', 'caption2', false],
    ['.mm-time', 'caption2', false, 'secondary'],
    ['.mm-step-card ul', 'body', false, 'secondary'],
    ['.mm-cta', 'callout', false],
    ['.mm-deadline', 'caption1', false, 'tertiary'],
    ['.mm-eligibility summary', 'subheadline', false],
    ['.mm-eligibility-copy', 'body', false, 'secondary'],

    /* Remaining shared page typography gaps. */
    ['.nb-watchlist-total', 'subheadline', false, 'secondary'],
    ['.nb-watchlist-thumb.is-fallback b', 'caption2', false],
    ['.nb-onboarding-error', 'body', false, 'critical'],
    ['.nb-onboarding-btn', 'callout', false],

    /* Add Product / forms */
    ['.add-product-modal .modal-title,.modal-title', 'title2', false],
    ['.modal-kicker', 'caption2', false, 'tertiary'],
    ['.add-progress span,.add-progress-labels', 'caption2', false, 'secondary'],
    ['.add-product-modal .category-title,.category-title', 'headline', false],
    ['.add-product-modal .category-sub,.category-sub', 'caption1', false, 'secondary'],
    ['.add-product-modal .option-title,.option-title', 'headline', false],
    ['.add-product-modal .add-reward-prompt', 'title3', false],
    ['.add-product-modal .add-info-section-title', 'title3', false],
    ['.add-product-modal .option-sub,.option-sub', 'caption1', false, 'secondary'],
    ['.add-product-modal .label,.label', 'subheadline', false],
    ['.add-product-modal .input,.add-product-modal .textarea,.input,.textarea', 'callout'],
    ['.add-product-modal .btn,.btn', 'callout', false],
    ['.add-product-modal .pill,.add-more-filter button', 'callout', false],
    ['.hint', 'footnote', false, 'secondary'],
    ['.duplicate-warning strong', 'headline', false],
    ['.duplicate-warning p,.submitted-note', 'footnote', false, 'secondary'],

    /* Assessment visual layer only */
    ['.assessment-progress-head h1', 'title1', false],
    ['.assessment-progress-head>strong', 'subheadline', false, 'secondary'],
    ['.assessment-choice', 'body', false],
    ['.assessment-subq-title', 'headline', false],
    ['.assessment-subq-title>span', 'caption2', false],
    ['.assessment-help,.assessment-footnote', 'footnote', false, 'secondary'],
    ['.v5-short-summary', 'subheadline', false, 'secondary'],
    ['.v5-primary-alert,.v5-reassess', 'caption1', false],
    ['.v5-report-summary,.v5-tip-list strong', 'subheadline'],
    ['.v5-tip-list p', 'body'],
    ['.assessment-inline-number label', 'caption1', false],
    ['.assessment-result-reasons h3', 'headline', false],
    ['.assessment-result-reasons p', 'body', false, 'secondary'],
    ['.canonical-modal-body h2', 'title2', false],
    ['.canonical-modal-body h3', 'title3', false],
    ['.canonical-modal-body p', 'body'],
    ['.canonical-dimensions dt', 'caption1', false, 'secondary'],
    ['.canonical-dimensions dd', 'body', false],
    ['.nb-oh-stat-name', 'caption2', false, 'secondary'],
    ['.nb-oh-stat-value', 'title3', false],
    ['.nb-oh-title', 'headline', false],
    ['.nb-oh-ranges button', 'caption2', false],
    ['.nb-oh-details', 'caption1'],
    ['.nb-oh-note,.nb-oh-empty', 'caption2', false, 'secondary'],
    ['.nb-oh-axis', 'caption2', false, 'secondary'],

    /* Application result flow injected after the main app. */
    ['#nb-application-handoff-root .nb-ah-banner strong,#nb-application-handoff-root .nb-ah-success strong', 'headline', false],
    ['#nb-application-handoff-root .nb-ah-banner p,#nb-application-handoff-root .nb-ah-success p,#nb-application-handoff-root .nb-ah-note', 'body', false, 'secondary'],
    ['#nb-application-handoff-root .nb-ah-btn', 'callout', false],
    ['#nb-application-handoff-root .nb-ah-title', 'title2', false],
    ['#nb-application-handoff-root .nb-ah-sub', 'subheadline', false, 'secondary'],
    ['#nb-application-handoff-root .nb-ah-field label', 'subheadline', false],
    ['#nb-application-handoff-root .nb-ah-field input', 'callout'],
    ['#nb-application-handoff-root .nb-ah-result', 'callout', false],

    /* Legacy shared UI selectors still used by current pages. */
    ['.eyebrow,.option-tag', 'caption2', false, 'tertiary'],
    ['.page-title', 'title1', false],
    ['.count-soft', 'headline', false, 'secondary'],
    ['.section-title', 'title3', false],
    ['.link-btn,.show-more', 'subheadline', false, 'link'],
    ['.collapse-head,.product-name,.task-head,.past-products-head', 'headline', false],
    ['.past-products-head b', 'caption2', false, 'secondary'],
    ['.decision-note,.confirm-copy', 'body', false, 'secondary'],
    ['.product-meta', 'caption1', false, 'secondary'],
    ['.mock-add-btn', 'callout', false],
    ['.mock-product-search .search', 'callout', false],
    ['.mock-past-list .past-row', 'subheadline', false],
    ['.success-empty span', 'subheadline', false, 'secondary'],
    ['.history-section .timeline', 'body', false],
    ['.wishlist-page .past-products-head', 'headline', false],

    /* Login / empty / success / generic helpers */
    ['.mock-login-card h1,.login-card h1', 'title2', false],
    ['.mock-login-card p,.login-card p', 'body', false, 'secondary'],
    ['.empty h3,.success h2', 'title2', false],
    ['.empty p,.success p,.report p', 'body', false, 'secondary'],
    ['.report h3', 'title3', false],
    ['.toast', 'subheadline'],
    ['.toast button', 'subheadline', false, 'link'],
    ['.legal,.prototype-note', 'caption2', false, 'tertiary']
  ];

  const FALLBACKS = [
    ['h1', 'title1', false],
    ['h2', 'title2', false],
    ['h3', 'title3', false],
    ['p', 'body', false],
    ['label', 'subheadline', false],
    ['small', 'caption1', false, 'secondary'],
    ['dt', 'caption1', false, 'secondary'],
    ['dd', 'body', false],
    ['li', 'body', false],
    ['button', 'callout', false],
    ['input,textarea,select', 'callout', false]
  ];

  function isMarketing(node) {
    return !!node.closest?.(`[${EXEMPT_ATTR}="marketing"]`);
  }

  function mark(node, type, _legacyEmphasis = false, tone = null) {
    if (!(node instanceof Element) || isMarketing(node)) return;
    node.setAttribute(TYPE_ATTR, type);
    node.removeAttribute(EMPHASIS_ATTR);
    if (tone) node.setAttribute(TONE_ATTR, tone);
    else node.removeAttribute(TONE_ATTR);
  }

  function markMarketingRoots(root = document) {
    MARKETING_ROOTS.forEach(selector => {
      root.querySelectorAll?.(selector).forEach(node => node.setAttribute(EXEMPT_ATTR, 'marketing'));
      if (root.matches?.(selector)) root.setAttribute(EXEMPT_ATTR, 'marketing');
    });
  }

  function applyRules(root = document) {
    RULES.forEach(([selector, type, legacyEmphasis = false, tone = null]) => {
      root.querySelectorAll?.(selector).forEach(node => mark(node, type, legacyEmphasis, tone));
      if (root.matches?.(selector)) mark(root, type, legacyEmphasis, tone);
    });
  }

  function applyFallbacks(root = document) {
    FALLBACKS.forEach(([selector, type, legacyEmphasis = false, tone = null]) => {
      root.querySelectorAll?.(`${selector}:not([${TYPE_ATTR}])`).forEach(node => mark(node, type, legacyEmphasis, tone));
      if (root.matches?.(selector) && !root.hasAttribute(TYPE_ATTR)) mark(root, type, legacyEmphasis, tone);
    });
  }

  function sync(root = document) {
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

  window.NextBonusTypography = Object.freeze({ sync, audit, rules: RULES.map(rule => [...rule]) });
  ROOT.dataset.nbTypography = 'apple-fixed-v1';
})();