(() => {
  'use strict';

  const TYPE_ATTR = 'data-nb-type';
  const TONE_ATTR = 'data-nb-tone';
  const EXEMPT_ATTR = 'data-nb-typography-exempt';
  const MOBILE_QUERY = '(max-width:780px)';
  const mobileQuery = window.matchMedia(MOBILE_QUERY);

  // Page-level semantic corrections only. This file never defines font size,
  // weight, line-height or tracking; those stay owned by the fixed text styles.
  const RULES = [
    /* Discover: provider is context; status/tag is metadata. */
    ['.nb-offer-card .nb-provider-text,.fallback-offer-card .provider', 'caption1', 'secondary'],
    ['.nb-offer-card .nb-status-tag,.nb-offer-card .nb-tag,.fallback-offer-card .status-tag,.fallback-offer-card .soft-tag', 'caption2', 'secondary'],

    /* Watchlist: product + reward are scan targets; requirement is supporting copy. */
    ['.nb-watchlist-copy strong', 'headline', null],
    ['.nb-watchlist-copy small', 'subheadline', 'secondary'],
    ['.nb-watchlist-provider', 'caption1', 'secondary'],
    ['.nb-watchlist-status,.nb-watchlist-count,.nb-watchlist-history-head small', 'caption2', 'secondary'],
    ['.nb-watchlist-value', 'headline', null],

    /* Wallet: Attention action is focal; card suffix sits on artwork. */
    ['.v4-pp-product', 'callout', 'secondary'],
    ['.v4-pp-action', 'headline', null],
    ['.v4-pp-time', 'caption1', 'secondary'],
    ['.credit-products .owned-product-meta small', 'caption1', 'on-accent'],

    /* Attention page: keep product/action hierarchy explicit and time subordinate. */
    ['.att-product-copy strong,.att-product', 'callout', 'secondary'],
    ['.att-action-cell strong,.att-action', 'headline', null],
    ['.att-product-copy small,.att-action-cell small', 'caption1', 'secondary'],
    ['.att-time,.history-status', 'caption1', 'secondary'],

    /* Offer Detail: useful decision explanation must not read like legal fine print. */
    ['.v4-metric .metric-sub,.mock-result-block .metric-sub,.metric-sub', 'subheadline', 'secondary'],
    ['.v4-result-note', 'footnote', 'secondary'],
    ['.result-disclaimer,.v4-security-line,.v4-trust-row b,.v4-trust-row small,.detail-trust-row span', 'caption2', 'tertiary'],
    ['.v4-no-action-note', 'footnote', 'secondary'],

    /* Assessment: help text explains the task; footnotes remain footnotes. */
    ['.assessment-help', 'subheadline', 'secondary'],
    ['.assessment-footnote', 'footnote', 'secondary'],
    ['.nb-oh-note,.nb-oh-empty', 'footnote', 'secondary'],
    ['.nb-oh-axis', 'caption2', 'secondary']
  ];

  function isMarketing(node) {
    return !!node.closest?.(`[${EXEMPT_ATTR}="marketing"]`);
  }

  function mark(node, type, tone) {
    if (!(node instanceof Element) || isMarketing(node)) return;
    node.setAttribute(TYPE_ATTR, type);
    if (tone) node.setAttribute(TONE_ATTR, tone);
    else node.removeAttribute(TONE_ATTR);
  }

  function desktopDiscoverValueType(node) {
    if (node.matches('.fallback-offer-card .primary-value')) return 'display-value-compact';
    if (node.classList.contains('is-short')) return 'display-value';
    return 'display-value-compact';
  }

  function syncDiscoverValueHierarchy(root = document) {
    const selector = '.discover-page .nb-offer-card .nb-primary-value,.discover-page .fallback-offer-card .primary-value';
    const nodes = [];
    root.querySelectorAll?.(selector).forEach(node => nodes.push(node));
    if (root.matches?.(selector)) nodes.push(root);
    nodes.forEach(node => mark(node, mobileQuery.matches ? 'title3' : desktopDiscoverValueType(node), null));
  }

  function sync(root = document) {
    RULES.forEach(([selector, type, tone]) => {
      root.querySelectorAll?.(selector).forEach(node => mark(node, type, tone));
      if (root.matches?.(selector)) mark(root, type, tone);
    });
    syncDiscoverValueHierarchy(root);
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

  const app = document.getElementById('app');
  if (app) new MutationObserver(schedule).observe(app, { childList:true, subtree:true });
  const handoff = document.getElementById('nb-application-handoff-root');
  if (handoff) new MutationObserver(schedule).observe(handoff, { childList:true, subtree:true });
  mobileQuery.addEventListener?.('change', schedule);

  window.NextBonusSemanticTypography = Object.freeze({ sync, rules: RULES.map(rule => [...rule]) });
})();
