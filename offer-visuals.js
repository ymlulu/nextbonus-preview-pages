(() => {
  'use strict';

  // Visual identity only. No bonus amount, requirement, deadline or tag text belongs here.
  const VISUALS = Object.freeze({
    'chase-sapphire': {kind:'image', src:'assets/product-art/chase-sapphire.png', alt:'Chase Sapphire Preferred card'},
    'amex-gold': {kind:'image', src:'assets/product-art/amex-gold.png', alt:'AMEX Gold Card'},
    'amex-platinum': {kind:'image', src:'assets/product-art/amex-platinum.png', alt:'AMEX Platinum Card'},
    'bilt-palladium': {kind:'image', src:'assets/product-art/bilt-palladium.png', alt:'Bilt Palladium Card'},
    'capitalone-venturex': {kind:'image', src:'assets/product-art/capitalone-venturex.png', alt:'Capital One Venture X'},
    'citi-strata': {kind:'image', src:'assets/product-art/citi-strata.png', alt:'Citi Strata Elite'},

    'hsbc-checking': {kind:'image', src:'assets/product-art/hsbc-checking.png', alt:'HSBC Premier Checking'},
    'chase-checking': {kind:'image', src:'assets/product-art/chase-checking.png', alt:'Chase Total Checking'},
    'usbank-checking': {kind:'image', src:'assets/product-art/usbank-checking.png', alt:'U.S. Bank Smartly Checking'},
    'truist-checking': {kind:'image', src:'assets/product-art/truist-checking.png', alt:'Truist Checking'},

    'moomoo': {kind:'brand', label:'moomoo', tone:'green'},
    'robinhood': {kind:'logo', src:'assets/product-logos/robinhood.png', alt:'Robinhood', tone:'green'},

    'topcashback': {kind:'logo', src:'assets/product-logos/topcashback.png', alt:'TopCashback', tone:'blue'},
    'flying-blue': {kind:'brand', label:'Flying Blue', tone:'purple'},
    'amazon': {kind:'brand', label:'amazon', tone:'bank'},
    'panda': {kind:'brand', label:'panda mobile', tone:'blue'}
  });

  window.NextBonusOfferVisuals = VISUALS;
})();
