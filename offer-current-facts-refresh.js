(() => {
  'use strict';

  const base = window.NextBonusOfferData || {};
  const verified = {
    'chase-sapphire': {
      primaryValue: '75,000 UR',
      primaryRequirement: '3 个月内消费 $5,000'
    },
    'amex-gold': {
      primaryValue: '最高 100,000 MR',
      primaryRequirement: '6 个月内消费 $4,000'
    },
    'capitalone-venturex': {
      primaryValue: '75,000 miles',
      primaryRequirement: '6 个月内消费 $4,000'
    },
    'cashback-deal': {
      primaryValue: '最高 120% 返现',
      primaryRequirement: '仅限符合条件的新用户',
      statusTag: 'limited_boost'
    }
  };

  const next = {};
  for (const [id, offer] of Object.entries(base)) {
    next[id] = Object.freeze({...offer, ...(verified[id] || {})});
  }

  window.NextBonusOfferData = Object.freeze(next);
})();
