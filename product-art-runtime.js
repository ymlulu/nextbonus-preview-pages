(() => {
  'use strict';

  const STORAGE_KEY='nextbonus-local-v8-state';
  const normalize=value=>String(value||'').toLowerCase().replace(/[®™℠]/g,'').replace(/[•*]{2,}\s*\d{4}\s*$/,'').replace(/[^a-z0-9.]+/g,' ').trim().replace(/\s+/g,' ');
  const cleanName=name=>String(name||'').replace(/[•*]{2,}\s*\d{4}\s*$/,'').trim();
  const offerAliases=Object.freeze({'hsbc premier checking':'hsbc-checking','chase checking':'chase-checking','chase total checking':'chase-checking','u.s. bank smartly checking':'usbank-checking','us bank smartly checking':'usbank-checking','truist checking':'truist-checking','truist one checking':'truist-checking','moomoo brokerage':'moomoo','robinhood gold':'robinhood','topcashback limited cashback':'cashback-deal','mr flying blue transfer bonus':'travel-transfer','amazon mastercard gift card':'amazon-gift','panda mobile new user offer':'panda-mobile'});

  function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(_){return {};}}
  function writeState(state){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){}}
  function allProducts(state){return [...(Array.isArray(state.products)?state.products:[]),...(Array.isArray(state.pastProducts)?state.pastProducts:[])];}
  function productMap(state){return new Map(allProducts(state).map(product=>[product.id,product]));}

  function offerIdForName(name){
    const target=normalize(name);
    if(offerAliases[target]) return offerAliases[target];
    for(const [id,product] of Object.entries(window.NextBonusOfferProducts||{})) if(normalize(product?.name)===target) return id;
    return '';
  }

  function sourceAsset(key,src,source){if(!src) return null;const remote=/^https?:\/\//i.test(src);return Object.freeze({key,web:remote?src:null,local:remote?null:src,source});}
  function visualAssetForOffer(offerId){
    if(!offerId) return null;
    const product=window.NextBonusOfferProducts?.[offerId];
    const visual=window.NextBonusOfferVisuals?.[product?.visualId||offerId];
    if(!visual||!['image','logo'].includes(visual.kind)||!visual.src) return null;
    return sourceAsset(`offer:${offerId}`,visual.src,'NextBonusOfferVisuals');
  }
  function logoAssetForProduct(product){if(!product) return null;const src=window.NextBonusProductLogoRegistry?.resolve?.(product.id||'',product.offerId||'',product.name||'');return sourceAsset(`logo:${product.id||normalize(product.name)}`,src,'NextBonusProductLogoRegistry');}
  function logoAssetForName(name){const clean=cleanName(name);const offerId=offerIdForName(clean);const src=window.NextBonusProductLogoRegistry?.resolve?.('',offerId,clean);return sourceAsset(`logo:${offerId||normalize(clean)}`,src,'NextBonusProductLogoRegistry');}

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
    if(product.offerId){const direct=visualAssetForOffer(product.offerId);if(direct) return direct;}
    const namedOffer=visualAssetForOffer(offerIdForName(product.name||''));
    if(namedOffer) return namedOffer;
    return logoAssetForProduct(product)||resolveByName(product.name||'');
  }

  function normalizeStoredCreditCardArt(){
    const state=readState();let changed=false;
    for(const product of allProducts(state)){
      const asset=window.NextBonusCreditCardArt?.resolveAsset?.(product);if(!asset) continue;
      if(product.cardImageLocal!==asset.local){product.cardImageLocal=asset.local;changed=true;}
      if(product.cardImageWeb!==asset.web){product.cardImageWeb=asset.web;changed=true;}
      if(product.cardArtKey!==asset.key){product.cardArtKey=asset.key;changed=true;}
    }
    if(changed) writeState(state);
    return state;
  }

  function applyAsset(img,asset,alt){
    if(!img||!asset) return;
    const original=img.getAttribute('src')||'';
    const failedWeb=img.dataset.canonicalFailedFor===asset.web;
    const primary=failedWeb?(asset.local||asset.web||original):(asset.web||asset.local||original);
    const fallback=asset.local||original;
    if(!primary) return;
    if(img.getAttribute('src')!==primary) img.setAttribute('src',primary);
    if(alt) img.setAttribute('alt',alt);
    img.dataset.canonicalProductArt=asset.key||'1';
    img.dataset.productArtSource=asset.source||'';
    if(fallback&&fallback!==primary){img.onerror=()=>{img.dataset.canonicalFailedFor=asset.web||primary;if(img.getAttribute('src')!==fallback) img.setAttribute('src',fallback);};}
  }

  function patchAddProduct(){document.querySelectorAll('.add-card-art img').forEach(img=>{const name=img.getAttribute('alt')||'';const asset=resolveByName(name);if(asset) applyAsset(img,asset,name);});}
  function patchOwnedCreditCards(state,products){document.querySelectorAll('.v4-owned-product-card.credit-tile[data-id]').forEach(tile=>{const product=products.get(tile.dataset.id);const asset=resolveProduct(product);if(asset) applyAsset(tile.querySelector('.v4-owned-product-art img'),asset,product?.name||'');});}
  function patchProductDetail(state,products){const page=document.querySelector('.v4-product-detail-page');if(!page) return;const product=products.get(state.currentProductId);const asset=resolveProduct(product);if(asset) applyAsset(page.querySelector('.v4-pd-card img'),asset,product?.name||'');}
  function patchAttention(){document.querySelectorAll('.attention-item .att-product-cell').forEach(cell=>{const name=cell.querySelector('.att-product-copy strong')?.textContent?.trim()||'';const asset=resolveByName(name);if(!asset) return;const thumb=cell.querySelector('.att-thumb');if(!thumb) return;let img=thumb.querySelector('img');if(!img){img=document.createElement('img');thumb.replaceChildren(img);}applyAsset(img,asset,name);});}

  function applyCanonicalArt(){const state=normalizeStoredCreditCardArt();const products=productMap(state);patchAddProduct();patchOwnedCreditCards(state,products);patchProductDetail(state,products);patchAttention();}

  window.NextBonusProductArtRegistry=Object.freeze({resolveByName,resolveProduct,offerIdForName,visualAssetForOffer,logoAssetForProduct,logoAssetForName});

  let scheduled=false;
  function schedule(){if(scheduled) return;scheduled=true;queueMicrotask(()=>{scheduled=false;applyCanonicalArt();});}
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('storage',schedule);
  window.addEventListener('nextbonus-card-art-ready',schedule);
  schedule();
})();
