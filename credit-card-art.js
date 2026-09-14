(() => {
  'use strict';

  // Canonical credit-card art contract:
  // one product identity -> one approved local canonical card face.
  // Issuer/web sources are used only to source/update these local assets; runtime never hotlinks them.
  const ART_VERSION='20260914-3';
  const local=path=>`${path}?v=${ART_VERSION}`;
  const ART = Object.freeze({
    'amex-platinum': Object.freeze({key:'amex-platinum',local:local('assets/product-cards/amex-platinum.png'),source:'American Express'}),
    'amex-gold': Object.freeze({key:'amex-gold',local:local('assets/product-cards/amex-gold.png'),source:'American Express'}),
    'chase-sapphire-preferred': Object.freeze({key:'chase-sapphire-preferred',local:local('assets/product-cards/chase-sapphire-preferred.png'),source:'Chase'}),
    'bilt-palladium': Object.freeze({key:'bilt-palladium',local:local('assets/product-cards/bilt-palladium.webp'),source:'public 4K card-art mirror'}),
    'capitalone-venturex': Object.freeze({key:'capitalone-venturex',local:local('assets/product-cards/capitalone-venturex.png'),source:'Capital One'}),
    'citi-strata-elite': Object.freeze({key:'citi-strata-elite',local:local('assets/product-cards/citi-strata-elite.png'),source:'Citi'}),
    'hilton-aspire': Object.freeze({key:'hilton-aspire',local:local('assets/product-cards/hilton-aspire.png'),source:'approved local card art'}),
    'chase-sapphire-reserve': Object.freeze({key:'chase-sapphire-reserve',local:local('assets/product-cards/chase-sapphire-reserve.png'),source:'Chase'}),
    'marriott-brilliant': Object.freeze({key:'marriott-brilliant',local:local('assets/product-cards/marriott-brilliant.png'),source:'American Express'}),
    'amex-blue-business-plus': Object.freeze({key:'amex-blue-business-plus',local:local('assets/product-cards/amex-blue-business-plus.png'),source:'American Express'}),
    'chase-freedom-unlimited': Object.freeze({key:'chase-freedom-unlimited',local:local('assets/product-cards/chase-freedom-unlimited.png'),source:'Chase'}),
    'citi-double-cash': Object.freeze({key:'citi-double-cash',local:local('assets/product-cards/citi-double-cash.png'),source:'Citi'})
  });

  const byOfferId=Object.freeze({
    'amex-platinum':ART['amex-platinum'],'amex-gold':ART['amex-gold'],'chase-sapphire':ART['chase-sapphire-preferred'],'bilt-palladium':ART['bilt-palladium'],'capitalone-venturex':ART['capitalone-venturex'],'citi-strata':ART['citi-strata-elite']
  });

  const byProductId=Object.freeze({
    'p-amex-plat-1005':ART['amex-platinum'],'p-hilton-aspire-2308':ART['hilton-aspire'],'p-csr-2948':ART['chase-sapphire-reserve'],'p-marriott-brilliant-6503':ART['marriott-brilliant'],'p-amex-biz-4321':ART['amex-blue-business-plus'],'p-freedom-7182':ART['chase-freedom-unlimited'],'p-citi-3490':ART['citi-double-cash']
  });

  const byName=Object.freeze({
    'amex platinum':ART['amex-platinum'],'amex platinum card':ART['amex-platinum'],'the platinum card from american express':ART['amex-platinum'],'amex gold':ART['amex-gold'],'amex gold card':ART['amex-gold'],'american express gold card':ART['amex-gold'],'chase sapphire preferred':ART['chase-sapphire-preferred'],'chase sapphire preferred card':ART['chase-sapphire-preferred'],'bilt palladium card':ART['bilt-palladium'],'capital one venture x':ART['capitalone-venturex'],'capital one venture x rewards':ART['capitalone-venturex'],'citi strata elite':ART['citi-strata-elite'],'hilton aspire':ART['hilton-aspire'],'hilton honors aspire':ART['hilton-aspire'],'hilton honors american express aspire card':ART['hilton-aspire'],'chase sapphire reserve':ART['chase-sapphire-reserve'],'marriott bonvoy brilliant':ART['marriott-brilliant'],'marriott bonvoy brilliant american express card':ART['marriott-brilliant'],'amex business plus':ART['amex-blue-business-plus'],'blue business plus':ART['amex-blue-business-plus'],'blue business plus credit card from american express':ART['amex-blue-business-plus'],'chase freedom unlimited':ART['chase-freedom-unlimited'],'citi double cash':ART['citi-double-cash'],'citi double cash card':ART['citi-double-cash']
  });

  const normalizeName=value=>String(value||'').toLowerCase().replace(/[®™℠]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const resolveAsset=product=>{
    if(!product||product.type!=='信用卡') return null;
    if(product.offerId&&byOfferId[product.offerId]) return byOfferId[product.offerId];
    if(product.id&&byProductId[product.id]) return byProductId[product.id];
    return byName[normalizeName(product.name)]||null;
  };
  const resolve=product=>resolveAsset(product)?.local||null;
  const resolveOfferAsset=offerId=>byOfferId[offerId]||null;
  const resolveOffer=offerId=>resolveOfferAsset(offerId)?.local||null;

  window.NextBonusCreditCardArt=Object.freeze({ART_VERSION,ART,byOfferId,byProductId,byName,resolve,resolveAsset,resolveOffer,resolveOfferAsset});
  window.dispatchEvent(new CustomEvent('nextbonus-card-art-ready'));
})();
