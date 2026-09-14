(() => {
  'use strict';

  // Visual identity only. No bonus amount, requirement, deadline or tag text belongs here.
  // Prefer canonical high-resolution card art or scalable local marks over legacy thumbnails.
  const VISUALS = Object.freeze({
    'chase-sapphire': {kind:'image', src:'assets/product-art/chase-sapphire.png', alt:'Chase Sapphire Preferred card'},
    'amex-gold': {kind:'image', src:'assets/product-art/amex-gold.png', alt:'AMEX Gold Card'},
    'amex-platinum': {kind:'image', src:'assets/product-art/amex-platinum.png', alt:'AMEX Platinum Card'},
    'bilt-palladium': {kind:'image', src:'assets/product-art/bilt-palladium.png', alt:'Bilt Palladium Card'},
    'capitalone-venturex': {kind:'image', src:'assets/product-art/capitalone-venturex.png', alt:'Capital One Venture X'},
    'citi-strata': {kind:'image', src:'assets/product-art/citi-strata.png', alt:'Citi Strata Elite'},

    // Bank offer visuals belong in the large center artwork slot. Provider logos are rendered
    // separately in the top-left, so this registry should point at the main product artwork.
    'hsbc-checking': {kind:'logo', src:'assets/product-logo-marks/hsbc.svg', alt:'HSBC Premier Checking'},
    'chase-checking': {kind:'logo', src:'assets/product-logo-marks/chase.svg', alt:'Chase Total Checking'},
    'usbank-checking': {kind:'image', src:'assets/product-page/bank-usbank.png', alt:'U.S. Bank Smartly Checking'},
    'truist-checking': {kind:'image', src:'https://www.truist.com/content/dam/truist/us/en/card-art/card-controls/370.png/jcr%3Acontent/renditions/original', alt:'Truist debit card'},

    'moomoo': {kind:'logo', src:'assets/product-logo-marks/moomoo.svg', alt:'Moomoo'},
    'robinhood': {kind:'logo', src:'assets/product-logo-marks/robinhood.svg', alt:'Robinhood'},

    'topcashback': {kind:'logo', src:'assets/product-page/other-tcb.png', alt:'TopCashback'},
    'flying-blue': {kind:'logo', src:'assets/product-logo-marks/flying-blue.svg', alt:'Flying Blue'},
    'amazon': {kind:'logo', src:'assets/product-logo-marks/amazon.svg', alt:'Amazon'},
    'panda': {kind:'logo', src:'assets/product-logo-marks/panda-mobile.svg', alt:'Panda Mobile'}
  });

  window.NextBonusOfferVisuals = VISUALS;
})();
