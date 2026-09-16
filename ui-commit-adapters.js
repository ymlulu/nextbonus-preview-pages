(() => {
  'use strict';

  const commit = window.NextBonusUICommit;
  if(!commit) return;

  const adapters = [
    ['offer-page', () => window.NextBonusOfferPageRuntime?.syncDiscover?.()],
    ['offer-card', () => window.NextBonusOfferCard?.renderAll?.()],
    ['user-facing-copy', () => window.NextBonusUserFacingCopy?.polish?.(document.body)],
    ['terminology', () => window.NextBonusTerminologyUI?.polish?.(document.body)],
    ['typography', () => window.NextBonusTypography?.sync?.(document.body)],
    ['semantic-typography', () => window.NextBonusSemanticTypography?.sync?.(document.body)],
    ['attention-history', () => window.NextBonusAttentionHistoryEvents?.decorate?.()],
    ['navigation-enhancements', () => window.NextBonusNavigationEnhancements?.refresh?.()]
  ];

  adapters.forEach(([name, handler]) => commit.register(name, handler));
})();
