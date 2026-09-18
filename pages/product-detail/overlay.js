(() => {
  'use strict';

  const root=document.getElementById('app');
  if(!root) return;

  let overlay=null;
  let host=null;
  let detail=null;
  let baseHtml=null;
  let baseScrollY=0;
  let currentProductId=null;
  let reconciling=false;
  let openingFromHistory=false;
  let lastContext=null;

  function captureWalletBase(trigger){
    if(overlay) return;
    const action=trigger?.dataset?.action;
    if(action!=='open-product'&&action!=='add-view-product') return;
    const shell=root.querySelector(':scope > .shell');
    if(shell){
      baseHtml=shell.outerHTML;
      baseScrollY=window.scrollY||0;
    }
    currentProductId=trigger.dataset.id||null;
  }

  function ensureOverlay(){
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.className='nb-product-detail-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','产品详情');
    overlay.innerHTML=`
      <section class="nb-product-detail-panel">
        <button class="nb-product-detail-close" type="button" aria-label="关闭产品详情">×</button>
        <div class="nb-product-detail-host"></div>
      </section>`;
    host=overlay.querySelector('.nb-product-detail-host');
    overlay.querySelector('.nb-product-detail-close').addEventListener('click',requestClose);
    overlay.addEventListener('click',event=>{ if(event.target===overlay) requestClose(); });
    document.body.appendChild(overlay);
    document.body.classList.add('nb-product-overlay-open');
    return overlay;
  }

  function restoreWalletVisual(){
    if(baseHtml==null) return;
    root.innerHTML=baseHtml;
    requestAnimationFrame(()=>window.scrollTo({top:baseScrollY,behavior:'instant'}));
  }

  function mountedProductId(node){
    const id=lastContext?.state?.currentProductId;
    if(id) return String(id);
    return node?.dataset?.productId||currentProductId||null;
  }

  function mountIncoming(node){
    if(!node||reconciling) return;
    reconciling=true;
    try{
      ensureOverlay();
      currentProductId=mountedProductId(node);
      detail=node;
      host.replaceChildren(node);
      node.classList.add('nb-product-overlay-detail');
      restoreWalletVisual();
      openingFromHistory=false;
      document.dispatchEvent(new CustomEvent('nb:product-detail-mounted',{detail:{productId:currentProductId}}));
    }finally{
      reconciling=false;
    }
  }

  function teardownOverlay(){
    if(!overlay) return;
    overlay.remove();
    overlay=null;
    host=null;
    detail=null;
    currentProductId=null;
    openingFromHistory=false;
    document.body.classList.remove('nb-product-overlay-open');
  }

  function fireBackProducts(){
    const button=document.createElement('button');
    button.type='button';
    button.hidden=true;
    button.dataset.action='back-products';
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function requestClose(){
    if(!overlay) return;
    const scroll=baseScrollY;
    if(history.state?.nbProductOverlay&&history.length>1){
      history.back();
      return;
    }
    teardownOverlay();
    fireBackProducts();
    requestAnimationFrame(()=>window.scrollTo({top:scroll,behavior:'instant'}));
  }

  function reconcile(){
    if(reconciling) return;
    const incoming=root.querySelector('.v4-product-detail-page,.edit-product-page');
    if(incoming){
      mountIncoming(incoming);
      return;
    }
    if(overlay&&lastContext?.state?.route!=='product-detail'&&!lastContext?.state?.productOverlay){
      teardownOverlay();
    }
  }

  function openFromHistory(info){
    if(!info?.productId) return;
    if(currentProductId===info.productId&&(overlay||openingFromHistory)) return;
    if(overlay) teardownOverlay();
    if(!root.querySelector('.v4-products-page')) return;
    openingFromHistory=true;
    const shell=root.querySelector(':scope > .shell');
    if(shell) baseHtml=shell.outerHTML;
    baseScrollY=Number(info.scrollY||0);
    currentProductId=String(info.productId);

    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.hidden=true;
    trigger.dataset.action='open-product';
    trigger.dataset.id=currentProductId;
    document.body.appendChild(trigger);
    trigger.click();
    trigger.remove();
  }

  function onHistory(event){
    const info=event.state?.nbProductOverlay||null;
    if(!info){
      openingFromHistory=false;
      if(overlay){
        const scroll=baseScrollY;
        teardownOverlay();
        requestAnimationFrame(()=>window.scrollTo({top:scroll,behavior:'instant'}));
      }
      return;
    }
    requestAnimationFrame(()=>openFromHistory(info));
  }

  document.addEventListener('click',event=>{
    const trigger=event.target.closest?.('[data-action="open-product"],[data-action="add-view-product"]');
    if(trigger) captureWalletBase(trigger);
  },true);

  document.addEventListener('keydown',event=>{ if(event.key==='Escape'&&overlay) requestClose(); });
  window.addEventListener('popstate',onHistory);

  function renderSurface(markup,ctx){
    lastContext=ctx||lastContext;
    ensureOverlay();
    if(!host) return null;
    host.innerHTML=markup;
    detail=host.querySelector('.v4-product-detail-page,.edit-product-page');
    if(detail){
      currentProductId=mountedProductId(detail);
      detail.classList.add('nb-product-overlay-detail');
      openingFromHistory=false;
      document.dispatchEvent(new CustomEvent('nb:product-detail-mounted',{detail:{productId:currentProductId}}));
    }
    return host;
  }

  window.NextBonusEvents?.registerRenderSurface?.('product-detail',renderSurface);

  window.NextBonusProductDetailOverlay=Object.freeze({
    close:requestClose,
    afterAppRender(ctx){
      lastContext=ctx||lastContext;
      reconcile();
      const info=lastContext?.state?.productOverlay||history.state?.nbProductOverlay||null;
      if(info&&lastContext?.state?.route!=='product-detail') requestAnimationFrame(()=>openFromHistory(info));
    },
    isOpen(){return !!overlay;},
    productId(){return currentProductId;}
  });

  reconcile();
})();
