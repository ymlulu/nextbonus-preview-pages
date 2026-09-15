(() => {
  'use strict';

  const MOBILE_QUERY='(max-width:780px)';
  const mobileQuery=window.matchMedia(MOBILE_QUERY);
  let selectedId=null;
  let queued=false;

  function walletGrid(){
    return document.querySelector('.v4-products-page .credit-products .v4-owned-product-grid');
  }

  function cards(grid){
    return grid ? Array.from(grid.querySelectorAll(':scope > .v4-owned-product-card.credit-tile[data-id]')) : [];
  }

  function sync(){
    queued=false;
    const grid=walletGrid();
    if(!grid) return;

    const items=cards(grid);
    const enabled=mobileQuery.matches && items.length>1;
    grid.classList.toggle('nb-wallet-card-stack',enabled);

    items.forEach((card,index)=>{
      if(enabled){
        card.style.zIndex=String(index+1);
        const expanded=card.dataset.id===selectedId;
        card.setAttribute('aria-expanded',expanded?'true':'false');
        card.classList.toggle('nb-wallet-card-expanded',expanded);
      }else{
        card.style.removeProperty('z-index');
        card.removeAttribute('aria-expanded');
        card.classList.remove('nb-wallet-card-expanded');
      }
    });

    if(enabled && selectedId && !items.some(card=>card.dataset.id===selectedId)) selectedId=null;
    if(!enabled) selectedId=null;
  }

  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(sync);
  }

  function onCardClick(event){
    if(!mobileQuery.matches) return;
    const card=event.target.closest?.('.v4-products-page .credit-products .v4-owned-product-card.credit-tile[data-id]');
    if(!card) return;
    const grid=card.closest('.v4-owned-product-grid');
    if(!grid || cards(grid).length<2) return;

    const id=card.dataset.id;
    if(selectedId===id){
      // Second tap keeps the existing open-product behavior untouched.
      return;
    }

    // First tap only expands/selects the card. The app's existing Product Detail
    // action is intentionally left for the second tap.
    event.preventDefault();
    event.stopPropagation();
    selectedId=id;
    sync();
    card.scrollIntoView?.({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }

  function onOutsideClick(event){
    if(!mobileQuery.matches || !selectedId) return;
    if(event.target.closest?.('.v4-products-page .credit-products .v4-owned-product-grid')) return;
    selectedId=null;
    schedule();
  }

  document.addEventListener('click',onCardClick,true);
  document.addEventListener('click',onOutsideClick,false);
  mobileQuery.addEventListener?.('change',schedule);

  const app=document.getElementById('app');
  if(app) new MutationObserver(schedule).observe(app,{childList:true,subtree:true});

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
})();
