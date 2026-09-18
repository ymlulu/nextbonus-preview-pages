(() => {
  'use strict';

  const normalize=value=>String(value||'').toLowerCase().replace(/[®™℠]/g,'').replace(/[•*]{2,}\s*\d{4}\s*$/,'').replace(/[^a-z0-9.]+/g,' ').trim().replace(/\s+/g,' ');
  const cleanName=name=>String(name||'').replace(/[•*]{2,}\s*\d{4}\s*$/,'').trim();
  const offerAliases=Object.freeze({
    'hsbc premier checking':'hsbc-checking',
    'chase checking':'chase-checking',
    'chase total checking':'chase-checking',
    'u.s. bank smartly checking':'usbank-checking',
    'us bank smartly checking':'usbank-checking',
    'truist checking':'truist-checking',
    'truist one checking':'truist-checking',
    'moomoo brokerage':'moomoo',
    'robinhood gold':'robinhood',
    'topcashback limited cashback':'cashback-deal',
    'mr flying blue transfer bonus':'travel-transfer',
    'amazon mastercard gift card':'amazon-gift',
    'panda mobile new user offer':'panda-mobile'
  });

  function offerIdForName(name){
    const target=normalize(name);
    if(offerAliases[target]) return offerAliases[target];
    for(const [id,product] of Object.entries(window.NextBonusOfferProducts||{})){
      if(normalize(product?.name)===target) return id;
    }
    return '';
  }

  function sourceAsset(key,src,source){
    if(!src) return null;
    const remote=/^https?:\/\//i.test(src);
    return Object.freeze({key,web:remote?src:null,local:remote?null:src,source});
  }

  function visualAssetForOffer(offerId){
    if(!offerId) return null;
    const product=window.NextBonusOfferProducts?.[offerId];
    const visual=window.NextBonusOfferVisuals?.[product?.visualId||offerId];
    if(!visual||!['image','logo'].includes(visual.kind)||!visual.src) return null;
    return sourceAsset(`offer:${offerId}`,visual.src,'NextBonusOfferVisuals');
  }

  function logoAssetForProduct(product){
    if(!product) return null;
    const src=window.NextBonusProductLogoRegistry?.resolve?.(product.id||'',product.offerId||'',product.name||'');
    return sourceAsset(`logo:${product.id||normalize(product.name)}`,src,'NextBonusProductLogoRegistry');
  }

  function logoAssetForName(name){
    const clean=cleanName(name);
    const offerId=offerIdForName(clean);
    const src=window.NextBonusProductLogoRegistry?.resolve?.('',offerId,clean);
    return sourceAsset(`logo:${offerId||normalize(clean)}`,src,'NextBonusProductLogoRegistry');
  }

  function resolveByName(name){
    const clean=cleanName(name);
    const credit=window.NextBonusCreditCardArt?.resolveAsset?.({type:'信用卡',name:clean});
    if(credit) return credit;
    return visualAssetForOffer(offerIdForName(clean))||logoAssetForName(clean);
  }

  function resolveProduct(product){
    if(!product) return null;
    const credit=window.NextBonusCreditCardArt?.resolveAsset?.(product);
    if(credit) return credit;
    if(product.offerId){
      const direct=visualAssetForOffer(product.offerId);
      if(direct) return direct;
    }
    const namedOffer=visualAssetForOffer(offerIdForName(product.name||''));
    if(namedOffer) return namedOffer;
    return logoAssetForProduct(product)||resolveByName(product.name||'');
  }

  window.NextBonusProductArtRegistry=Object.freeze({
    resolveByName,
    resolveProduct,
    offerIdForName,
    visualAssetForOffer,
    logoAssetForProduct,
    logoAssetForName
  });
})();