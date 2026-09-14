(() => {
  'use strict';
  const byProductId = {
    'p-chase-checking':'assets/product-logos/chase.png',
    'p-fidelity':'assets/product-logos/fidelity.png',
    'p-robinhood':'assets/product-logos/robinhood.png',
    'p-truist':'assets/product-logos/truist.png',
    'p-usbank':'assets/product-logos/usbank.png',
    'p-wf-checking':'assets/product-logos/wells-fargo.png',
    'p-delta-status':'assets/product-logos/delta.png',
    'p-hilton':'assets/product-logos/hilton.png',
    'p-ihg':'assets/product-logos/ihg.png',
    'p-marriott-status':'assets/product-logos/marriott.png',
    'p-hyatt':'assets/product-logos/hyatt.png',
    'p-awardwallet':'assets/product-logos/awardwallet.png',
    'p-rakuten':'assets/product-logos/rakuten.png',
    'p-topcashback':'assets/product-logos/topcashback.png',
    'p-rebatesme':'assets/product-logos/rebatesme.png',
    'p-gocashback':'assets/product-logos/gocashback.png',
    'p-pointsyeah':'assets/product-logos/pointsyeah.png',
    'p-cardpointers':'assets/product-logos/cardpointers.png',
    'p-maxrewards':'assets/product-logos/maxrewards.png',
    'p-bilt-rent':'assets/product-logos/bilt.png',
    'p-google-one':'assets/product-logos/google-one.png'
  };
  const byOfferProductId = {
    'chase-checking':'assets/product-logos/chase.png',
    'usbank-checking':'assets/product-logos/usbank.png',
    'truist-checking':'assets/product-logos/truist.png',
    'hsbc-checking':'assets/product-logos/hsbc.svg',
    'moomoo':'assets/product-logos/moomoo.svg',
    'robinhood':'assets/product-logos/robinhood.png',
    'cashback-deal':'assets/product-logos/topcashback.png'
  };
  const byProductName = {
    'chase total checking':'assets/product-logos/chase.png',
    'u.s. bank smartly checking':'assets/product-logos/usbank.png',
    'us bank smartly checking':'assets/product-logos/usbank.png',
    'truist one checking':'assets/product-logos/truist.png',
    'hsbc premier checking':'assets/product-logos/hsbc.svg',
    'fidelity cash management account':'assets/product-logos/fidelity.png',
    'robinhood brokerage account':'assets/product-logos/robinhood.png',
    'moomoo brokerage':'assets/product-logos/moomoo.svg',
    'hilton honors gold status':'assets/product-logos/hilton.png',
    'hilton honors diamond status':'assets/product-logos/hilton.png',
    'hilton honors diamond':'assets/product-logos/hilton.png',
    'ihg one rewards platinum':'assets/product-logos/ihg.png',
    'marriott bonvoy titanium':'assets/product-logos/marriott.png',
    'world of hyatt globalist':'assets/product-logos/hyatt.png',
    'delta skymiles platinum':'assets/product-logos/delta.png',
    'rakuten':'assets/product-logos/rakuten.png',
    'topcashback':'assets/product-logos/topcashback.png',
    'rebatesme':'assets/product-logos/rebatesme.png',
    'gocashback':'assets/product-logos/gocashback.png',
    'awardwallet':'assets/product-logos/awardwallet.png',
    'pointsyeah':'assets/product-logos/pointsyeah.png',
    'cardpointers':'assets/product-logos/cardpointers.png',
    'maxrewards':'assets/product-logos/maxrewards.png',
    'bilt rewards':'assets/product-logos/bilt.png',
    'google one':'assets/product-logos/google-one.png'
  };
  const normalize = value => String(value || '').toLowerCase().replace(/[®™℠]/g,'').replace(/[^a-z0-9.]+/g,' ').trim().replace(/\s+/g,' ');
  function resolve(productId, offerProductId, productName){
    return byProductId[productId] || byOfferProductId[offerProductId] || byProductName[normalize(productName)] || '';
  }
  window.NextBonusProductLogoRegistry = Object.freeze({byProductId,byOfferProductId,byProductName,resolve});
})();
