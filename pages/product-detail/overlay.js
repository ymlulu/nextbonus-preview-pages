(() => {
  'use strict';

  const RESUME_KEY = 'nextbonus-product-detail-resume-v1';
  const root = document.getElementById('app');
  if(!root) return;

  let overlay = null;
  let host = null;
  let detail = null;
  let baseHtml = null;
  let baseScrollY = 0;
  let currentProductId = null;
  let reconciling = false;
  let resumeConsumed = false;

  function readState(){
    try{return JSON.parse(localStorage.getItem('nextbonus-local-v8-state') || '{}');}
    catch(_err){return {};}
  }

  function captureWalletBase(trigger){
    if(overlay) return;
    const action = trigger?.dataset?.action;
    if(action !== 'open-product' && action !== 'add-view-product') return;

    const shell = root.querySelector(':scope > .shell');
    if(shell){
      baseHtml = shell.outerHTML;
      baseScrollY = window.scrollY || 0;
    }
    currentProductId = trigger.dataset.id || null;
  }

  function ensureOverlay(){
    if(overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'nb-product-detail-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','产品详情');
    overlay.innerHTML = `
      <section class="nb-product-detail-panel">
        <button class="nb-product-detail-close" type="button" aria-label="关闭产品详情">×</button>
        <div class="nb-product-detail-host"></div>
      </section>`;

    host = overlay.querySelector('.nb-product-detail-host');
    overlay.querySelector('.nb-product-detail-close').addEventListener('click',requestClose);
    overlay.addEventListener('click',event=>{
      if(event.target === overlay) requestClose();
    });
    document.body.appendChild(overlay);
    document.body.classList.add('nb-product-overlay-open');
    return overlay;
  }

  function restoreWalletVisual(){
    if(baseHtml == null) return;
    root.innerHTML = baseHtml;
    requestAnimationFrame(()=>window.scrollTo({top:baseScrollY,behavior:'instant'}));
  }

  function mountedProductId(node){
    const saved = readState();
    if(saved.currentProductId) return String(saved.currentProductId);
    return node?.dataset?.productId || currentProductId || null;
  }

  function mountIncoming(node){
    if(!node || reconciling) return;
    reconciling = true;
    try{
      ensureOverlay();
      currentProductId = mountedProductId(node);
      detail = node;
      host.replaceChildren(node);
      node.classList.add('nb-product-overlay-detail');
      restoreWalletVisual();
      document.dispatchEvent(new CustomEvent('nb:product-detail-mounted',{
        detail:{productId:currentProductId}
      }));
    }finally{
      reconciling = false;
    }
  }

  function teardownOverlay(){
    if(!overlay) return;
    overlay.remove();
    overlay = null;
    host = null;
    detail = null;
    currentProductId = null;
    document.body.classList.remove('nb-product-overlay-open');
  }

  function fireBackProducts(){
    const button = document.createElement('button');
    button.type = 'button';
    button.hidden = true;
    button.dataset.action = 'back-products';
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function requestClose(){
    if(!overlay) return;
    const scroll = baseScrollY;
    teardownOverlay();
    fireBackProducts();
    requestAnimationFrame(()=>window.scrollTo({top:scroll,behavior:'instant'}));
  }

  function reconcile(){
    if(reconciling) return;

    const incoming = root.querySelector('.v4-product-detail-page,.edit-product-page');
    if(incoming){
      mountIncoming(incoming);
      return;
    }

    const saved = readState();
    if(overlay && saved.route !== 'product-detail'){
      teardownOverlay();
    }
  }

  function openFromResume(){
    if(resumeConsumed || overlay) return;
    if(!root.querySelector('.v4-products-page')) return;

    let info = null;
    try{
      const raw = sessionStorage.getItem(RESUME_KEY);
      if(!raw) return;
      info = JSON.parse(raw);
      sessionStorage.removeItem(RESUME_KEY);
    }catch(_err){
      try{sessionStorage.removeItem(RESUME_KEY);}catch(__err){}
      return;
    }

    if(!info?.productId) return;
    resumeConsumed = true;
    const shell = root.querySelector(':scope > .shell');
    if(shell) baseHtml = shell.outerHTML;
    baseScrollY = Number(info.scrollY || 0);
    currentProductId = String(info.productId);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.hidden = true;
    trigger.dataset.action = 'open-product';
    trigger.dataset.id = currentProductId;
    document.body.appendChild(trigger);
    trigger.click();
    trigger.remove();
  }

  document.addEventListener('click',event=>{
    const trigger = event.target.closest?.('[data-action="open-product"],[data-action="add-view-product"]');
    if(trigger) captureWalletBase(trigger);

    const back = event.target.closest?.('[data-action="back-products"]');
    if(back && overlay){
      queueMicrotask(()=>{
        const saved = readState();
        if(saved.route !== 'product-detail') teardownOverlay();
      });
    }
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key === 'Escape' && overlay) requestClose();
  });

  new MutationObserver(()=>{
    reconcile();
    openFromResume();
  }).observe(root,{childList:true,subtree:true});

  window.addEventListener('popstate',()=>queueMicrotask(reconcile));

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      reconcile();
      openFromResume();
    },{once:true});
  }else{
    reconcile();
    openFromResume();
  }

  window.NextBonusProductDetailOverlay = Object.freeze({
    close:requestClose,
    isOpen(){return !!overlay;},
    productId(){return currentProductId;}
  });
})();
