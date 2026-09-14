(() => {
  'use strict';
  function apply(){
    const registry=window.NextBonusProductLogoRegistry;
    if(!registry) return;
    document.querySelectorAll('.v4-owned-product-card[data-id]').forEach(function(card){
      const productId=card.dataset.id || '';
      const src=registry.resolve(productId, '', card.getAttribute('aria-label') || '');
      const slot=card.querySelector('.v10-info-logo');
      if(!src || !slot) return;
      slot.dataset.productId=productId;
      if(slot.dataset.logoSrc===src) return;
      const img=document.createElement('img');
      img.src=src;
      img.alt='';
      slot.replaceChildren(img);
      slot.dataset.logoSrc=src;
    });
  }
  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    queueMicrotask(function(){queued=false;apply();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('storage',schedule);
  schedule();
})();
