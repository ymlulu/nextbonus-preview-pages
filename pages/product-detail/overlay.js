(() => {
  'use strict';

  let overlay=null;
  let host=null;
  let detail=null;
  let currentProductId=null;
  let lastContext=null;
  let openedFromHistory=false;

  function detailInfo(ctx=lastContext){
    const state=ctx?.state;
    if(state?.route==='product-detail'&&state.currentProductId){
      return {
        productId:String(state.currentProductId),
        scrollY:Number(state.pageScroll?.products||0)
      };
    }
    if(state?.productOverlay?.productId){
      return {
        productId:String(state.productOverlay.productId),
        scrollY:Number(state.productOverlay.scrollY||0)
      };
    }
    return null;
  }

  function ensureOverlay(){
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.className='nb-product-detail-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','产品详情');
    overlay.innerHTML=
      '<section class="nb-product-detail-panel">'+
        '<div class="nb-product-detail-host"></div>'+
      '</section>';
    host=overlay.querySelector('.nb-product-detail-host');
    overlay.addEventListener('click',event=>{ if(event.target===overlay) requestClose(); });
    document.body.appendChild(overlay);
    document.body.classList.add('nb-product-overlay-open');
    return overlay;
  }

  function teardown(){
    if(!overlay) return;
    overlay.remove();
    overlay=null;
    host=null;
    detail=null;
    currentProductId=null;
    openedFromHistory=false;
    document.body.classList.remove('nb-product-overlay-open');
  }

  function renderMarkup(markup,ctx){
    lastContext=ctx||lastContext;
    ensureOverlay();
    if(!host) return null;
    host.innerHTML=markup;
    detail=host.querySelector('.v4-product-detail-page,.edit-product-page');
    const info=detailInfo();
    currentProductId=info?.productId||lastContext?.state?.currentProductId||currentProductId;
    if(detail){
      detail.classList.add('nb-product-overlay-detail');
      document.dispatchEvent(new CustomEvent('nb:product-detail-mounted',{detail:{productId:currentProductId}}));
    }
    return host;
  }

  function renderCurrent(ctx){
    lastContext=ctx||lastContext;
    const info=detailInfo();
    if(!info){
      teardown();
      return null;
    }
    currentProductId=info.productId;
    if(lastContext?.state) lastContext.state.currentProductId=info.productId;
    const registry=window.NextBonusPageRegistry;
    if(!registry) return null;
    return renderMarkup(registry.render('product-detail',lastContext),lastContext);
  }

  function requestClose(){
    if(!overlay) return;
    const state=lastContext?.state;
    if((state?.route==='product-detail'||openedFromHistory)&&history.state?.nbProductOverlay&&history.length>1){
      history.back();
      return;
    }
    lastContext?.closeProductDetail?.();
  }

  document.addEventListener('keydown',event=>{ if(event.key==='Escape'&&overlay) requestClose(); });
  window.addEventListener('popstate',event=>{
    openedFromHistory=!!event.state?.nbProductOverlay;
  });

  function renderSurface(markup,ctx){
    return renderMarkup(markup,ctx);
  }

  window.NextBonusEvents?.registerRenderSurface?.('product-detail',renderSurface);

  window.NextBonusProductDetailOverlay=Object.freeze({
    close:requestClose,
    afterAppRender(ctx){
      lastContext=ctx||lastContext;
      renderCurrent(lastContext);
    },
    isOpen(){return !!overlay;},
    productId(){return currentProductId;}
  });
})();