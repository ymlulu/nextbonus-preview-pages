(() => {
  'use strict';
  const base=window.NextBonusProductLogoRegistry;
  if(!base) return;

  const icon={
    usbank:'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e3/06/3a/e3063af9-19fe-15b5-3ecd-93285842d724/AppIcon-USB-Staging-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.png',
    truist:'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c1/d7/4c/c1d74ce4-9c06-5535-308b-95fe1899a9ad/AppIcon-0-0-1x_U007epad-0-11-0-85-220.png/640x640bb.webp',
    hilton:'https://d1iiooxwdowqwr.cloudfront.net/pub/appsubmissions/20191126184943_HiltonAppLogo.jpg',
    ihg:'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/e4/d4/01/e4d401c4-226c-6233-ca16-6edd40c81ad8/Placeholder.mill/512x512bb.jpg',
    hyatt:'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/de/72/32/de7232b9-8e08-e0ff-f2b7-1a3005a6e208/AppIcon-WOH-0-1x_U007emarketing-0-6-0-85-220-0.png/512x512bb.png',
    awardwallet:'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fd/02/ec/fd02ec5a-a542-3ef2-5f9c-7a436f08d677/AppIcon-0-0-1x_U007emarketing-0-0-0-11-0-0-85-220.png/512x512bb.png',
    cardpointers:'https://impresskit.net/media/press-kit-icons/cardpointers_icon_26_sml.png',
    maxrewards:'https://cdn.jim-nielsen.com/ios/512/maxrewards-rewards-cashback-2024-06-04.png?rf=1024',
    pointsyeah:'https://fastly.mwm-storage.mwmcdn.com/raw_files/0e9b7866-7c74-4c54-a36f-76afbae9fd3e'
  };

  const byProductId={
    'p-chase-checking':'assets/product-logo-marks/chase.svg',
    'p-fidelity':'assets/product-logo-marks/fidelity.svg',
    'p-robinhood':'assets/product-logo-marks/robinhood.svg',
    'p-truist':icon.truist,
    'p-usbank':icon.usbank,
    'p-wf-checking':'assets/product-logo-marks/wells-fargo.svg',
    'p-hilton':icon.hilton,
    'p-ihg':icon.ihg,
    'p-marriott-status':'assets/product-logo-marks/marriott.svg',
    'p-hyatt':icon.hyatt,
    'p-awardwallet':icon.awardwallet,
    'p-pointsyeah':icon.pointsyeah,
    'p-cardpointers':icon.cardpointers,
    'p-maxrewards':icon.maxrewards,
    'p-rakuten':'assets/product-logo-marks/rakuten.svg',
    'p-google-one':'assets/product-logo-marks/google-one.svg'
  };
  const byOfferProductId={
    'chase-sapphire':'assets/product-logo-marks/chase.svg',
    'amex-gold':'assets/product-logo-marks/amex.svg',
    'amex-platinum':'assets/product-logo-marks/amex.svg',
    'capitalone-venturex':'assets/product-logo-marks/capital-one.svg',
    'citi-strata':'assets/product-logo-marks/citi.svg',
    'chase-checking':'assets/product-logo-marks/chase.svg',
    'usbank-checking':icon.usbank,
    'truist-checking':icon.truist,
    'hsbc-checking':'assets/product-logo-marks/hsbc.svg',
    'moomoo':'assets/product-logo-marks/moomoo.svg',
    'robinhood':'assets/product-logo-marks/robinhood.svg',
    'travel-transfer':'assets/product-logo-marks/flying-blue.svg',
    'amazon-gift':'assets/product-logo-marks/amazon.svg',
    'panda-mobile':'assets/product-logo-marks/panda-mobile.svg'
  };
  const byProductName={
    'chase total checking':'assets/product-logo-marks/chase.svg',
    'fidelity cash management account':'assets/product-logo-marks/fidelity.svg',
    'robinhood':'assets/product-logo-marks/robinhood.svg',
    'robinhood brokerage account':'assets/product-logo-marks/robinhood.svg',
    'truist one checking':icon.truist,
    'u.s. bank smartly checking':icon.usbank,
    'us bank smartly checking':icon.usbank,
    'hsbc premier checking':'assets/product-logo-marks/hsbc.svg',
    'moomoo brokerage':'assets/product-logo-marks/moomoo.svg',
    'hilton honors gold status':icon.hilton,
    'hilton honors diamond status':icon.hilton,
    'hilton honors diamond':icon.hilton,
    'ihg one rewards platinum':icon.ihg,
    'marriott bonvoy titanium':'assets/product-logo-marks/marriott.svg',
    'world of hyatt globalist':icon.hyatt,
    'awardwallet':icon.awardwallet,
    'pointsyeah':icon.pointsyeah,
    'cardpointers':icon.cardpointers,
    'maxrewards':icon.maxrewards,
    'rakuten':'assets/product-logo-marks/rakuten.svg',
    'google one':'assets/product-logo-marks/google-one.svg'
  };
  const normalize=value=>String(value||'').toLowerCase().replace(/[®™℠]/g,'').replace(/[^a-z0-9.]+/g,' ').trim().replace(/\s+/g,' ');
  const resolve=(productId,offerProductId,productName)=>byProductId[productId]||byOfferProductId[offerProductId]||byProductName[normalize(productName)]||base.resolve(productId,offerProductId,productName);
  window.NextBonusProductLogoRegistry=Object.freeze({...base,byProductId:{...base.byProductId,...byProductId},byOfferProductId:{...base.byOfferProductId,...byOfferProductId},byProductName:{...base.byProductName,...byProductName},resolve});
})();
