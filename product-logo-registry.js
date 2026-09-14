(() => {
  'use strict';

  const icon={
    usbank:'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e3/06/3a/e3063af9-19fe-15b5-3ecd-93285842d724/AppIcon-USB-Staging-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.png',
    truist:'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c1/d7/4c/c1d74ce4-9c06-5535-308b-95fe1899a9ad/AppIcon-0-0-1x_U007epad-0-11-0-85-220.png/640x640bb.webp',
    hilton:'https://d1iiooxwdowqwr.cloudfront.net/pub/appsubmissions/20191126184943_HiltonAppLogo.jpg',
    ihg:'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/e4/d4/01/e4d401c4-226c-6233-ca16-6edd40c81ad8/Placeholder.mill/512x512bb.jpg',
    hyatt:'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/de/72/32/de7232b9-8e08-e0ff-f2b7-1a3005a6e208/AppIcon-WOH-0-1x_U007emarketing-0-6-0-85-220-0.png/512x512bb.png',
    awardwallet:'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fd/02/ec/fd02ec5a-a542-3ef2-5f9c-7a436f08d677/AppIcon-0-0-1x_U007emarketing-0-0-0-11-0-0-85-220.png/512x512bb.png',
    cardpointers:'https://impresskit.net/media/press-kit-icons/cardpointers_icon_26_sml.png',
    maxrewards:'https://cdn.jim-nielsen.com/ios/512/maxrewards-rewards-cashback-2024-06-04.png?rf=1024',
    pointsyeah:'https://fastly.mwm-storage.mwmcdn.com/raw_files/0e9b7866-7c74-4c54-a36f-76afbae9fd3e',
    delta:'https://news.delta.com/sites/default/files/2021-11/delta_c_r.png',
    topcashback:'https://ukp.tcb-cdn.com/images/media/squaretcblogo.jpg'
  };

  const mark={
    chase:'assets/product-logo-marks/chase.svg',
    fidelity:'assets/product-logo-marks/fidelity.svg',
    robinhood:'assets/product-logo-marks/robinhood.svg',
    wellsFargo:'assets/product-logo-marks/wells-fargo.svg',
    marriott:'assets/product-logo-marks/marriott.svg',
    rakuten:'assets/product-logo-marks/rakuten.svg',
    googleOne:'assets/product-logo-marks/google-one.svg',
    amex:'assets/product-logo-marks/amex.svg',
    capitalOne:'assets/product-logo-marks/capital-one.svg',
    citi:'assets/product-logo-marks/citi.svg',
    hsbc:'assets/product-logo-marks/hsbc.svg',
    moomoo:'assets/product-logo-marks/moomoo.svg',
    flyingBlue:'assets/product-logo-marks/flying-blue.svg',
    amazon:'assets/product-logo-marks/amazon.svg',
    pandaMobile:'assets/product-logo-marks/panda-mobile.svg'
  };

  const byProductId={
    'p-chase-checking':mark.chase,
    'p-fidelity':mark.fidelity,
    'p-robinhood':mark.robinhood,
    'p-truist':icon.truist,
    'p-usbank':icon.usbank,
    'p-wf-checking':mark.wellsFargo,
    'p-delta-status':icon.delta,
    'p-hilton':icon.hilton,
    'p-ihg':icon.ihg,
    'p-marriott-status':mark.marriott,
    'p-hyatt':icon.hyatt,
    'p-awardwallet':icon.awardwallet,
    'p-rakuten':mark.rakuten,
    'p-topcashback':icon.topcashback,
    'p-rebatesme':'assets/product-logos/rebatesme.png',
    'p-gocashback':'assets/product-logos/gocashback.png',
    'p-pointsyeah':icon.pointsyeah,
    'p-cardpointers':icon.cardpointers,
    'p-maxrewards':icon.maxrewards,
    'p-bilt-rent':'assets/product-logos/bilt.png',
    'p-google-one':mark.googleOne
  };

  const byOfferProductId={
    'chase-sapphire':mark.chase,
    'amex-gold':mark.amex,
    'amex-platinum':mark.amex,
    'capitalone-venturex':mark.capitalOne,
    'citi-strata':mark.citi,
    'chase-checking':mark.chase,
    'usbank-checking':icon.usbank,
    'truist-checking':icon.truist,
    'hsbc-checking':mark.hsbc,
    'moomoo':mark.moomoo,
    'robinhood':mark.robinhood,
    'cashback-deal':icon.topcashback,
    'travel-transfer':mark.flyingBlue,
    'amazon-gift':mark.amazon,
    'panda-mobile':mark.pandaMobile
  };

  const byProductName={
    'chase total checking':mark.chase,
    'u.s. bank smartly checking':icon.usbank,
    'us bank smartly checking':icon.usbank,
    'truist one checking':icon.truist,
    'hsbc premier checking':mark.hsbc,
    'fidelity cash management account':mark.fidelity,
    'robinhood':mark.robinhood,
    'robinhood brokerage account':mark.robinhood,
    'moomoo brokerage':mark.moomoo,
    'hilton honors gold status':icon.hilton,
    'hilton honors diamond status':icon.hilton,
    'hilton honors diamond':icon.hilton,
    'ihg one rewards platinum':icon.ihg,
    'marriott bonvoy titanium':mark.marriott,
    'world of hyatt globalist':icon.hyatt,
    'delta skymiles platinum':icon.delta,
    'rakuten':mark.rakuten,
    'topcashback':icon.topcashback,
    'rebatesme':'assets/product-logos/rebatesme.png',
    'gocashback':'assets/product-logos/gocashback.png',
    'awardwallet':icon.awardwallet,
    'pointsyeah':icon.pointsyeah,
    'cardpointers':icon.cardpointers,
    'maxrewards':icon.maxrewards,
    'bilt rewards':'assets/product-logos/bilt.png',
    'google one':mark.googleOne
  };

  const normalize=value=>String(value||'').toLowerCase().replace(/[®™℠]/g,'').replace(/[^a-z0-9.]+/g,' ').trim().replace(/\s+/g,' ');
  const resolve=(productId,offerProductId,productName)=>byProductId[productId]||byOfferProductId[offerProductId]||byProductName[normalize(productName)]||'';

  window.NextBonusProductLogoRegistry=Object.freeze({schemaVersion:'2.1',byProductId,byOfferProductId,byProductName,resolve});
})();
