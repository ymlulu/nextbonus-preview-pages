(() => {
  'use strict';
  const base=window.NextBonusOfferVisuals||{};
  const products=window.NextBonusOfferProducts||{};
  const offers=window.NextBonusOfferData||{};
  const next={...base};

  function explicitImage(offer){
    const raw=offer?.offerImage||offer?.image;
    if(!raw) return null;
    if(typeof raw==='string') return raw;
    return raw.src||raw.web||raw.url||raw.local||null;
  }

  for(const [offerId,offer] of Object.entries(offers)){
    const product=products[offer.productId];
    if(!product) continue;
    const direct=explicitImage(offer);
    if(direct){
      next[product.visualId]={kind:'image',src:direct,alt:product.name};
      continue;
    }
    if(product.type==='credit-card'){
      const art=window.NextBonusCreditCardArt?.resolveOfferAsset?.(offerId);
      const src=art?.web||art?.local;
      if(src) next[product.visualId]={kind:'image',src,alt:product.name};
    }
  }

  window.NextBonusOfferVisuals=Object.freeze(next);
})();
