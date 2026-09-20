(() => {
  'use strict';

  const DESKTOP_MIN = 1181;
  const CTA_SELECTOR = '.nb-offer-apply-primary,.nb-bank-cta,.mm-cta,.remaining-cta,.deal-cta';
  const app = document.getElementById('app');
  if(!app) return;

  let overlay = null;
  let detail = null;
  let baseScrollY = 0;
  let baseSource = 'discover';
  let currentOfferId = null;
  let openedFromHistory = false;
  let lastContext = null;
  let panelScroll = null;
  let ctaSentinel = null;
  let ctaTarget = null;
  let ctaDock = null;
  let layoutMode = window.innerWidth >= DESKTOP_MIN ? 'desktop' : 'mobile';

  function overlayInfoFromContext(){
    const state=lastContext?.state;
    return state?.offerOverlay || window.NextBonusRouter?.offerOverlayFor?.(state) || history.state?.nbOfferOverlay || null;
  }

  function sourceFromContext(){
    const state=lastContext?.state;
    const info=state?.offerOverlay || history.state?.nbOfferOverlay;
    if(info?.source==='wishlist') return 'wishlist';
    if(state?.route==='wishlist'||state?.routeSource==='wishlist') return 'wishlist';
    return 'discover';
  }

  function offerIdFrom(node){
    const info=overlayInfoFromContext();
    if(info?.offerId) return info.offerId;
    const id=lastContext?.state?.currentOfferId;
    if(id) return id;
    return node?.querySelector?.('[data-action="bookmark"][data-id]')?.dataset?.id || null;
  }

  function ensureOverlay(){
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.className='nb-offer-detail-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Offer Detail');
    overlay.innerHTML=`
      <div class="nb-offer-detail-frame">
        <button class="nb-offer-detail-close" type="button" aria-label="关闭 Offer Detail">×</button>
        <div class="nb-offer-detail-host"></div>
      </div>`;
    overlay.querySelector('.nb-offer-detail-close').addEventListener('click',requestClose);
    overlay.addEventListener('click',event=>{ if(event.target===overlay) requestClose(); });
    document.body.appendChild(overlay);
    document.body.classList.add('nb-offer-overlay-open');
    return overlay;
  }

  function disconnectPanelRuntime(){
    panelScroll?.removeEventListener('scroll',updateCTAState);
    panelScroll=null;
    ctaSentinel=null;
    ctaTarget=null;
    ctaDock=null;
  }

  function unwrapDesktopPanel(){
    const panel=detail?.querySelector('.v4-decision-panel');
    if(!panel) return;
    const scroll=panel.querySelector(':scope > .nb-offer-panel-scroll');
    const dock=panel.querySelector(':scope > .nb-offer-panel-dock');
    if(!scroll||!dock) return;
    const sentinel=scroll.querySelector('.nb-offer-cta-sentinel');
    const target=dock.querySelector(CTA_SELECTOR)||scroll.querySelector(CTA_SELECTOR);
    if(target&&sentinel?.isConnected) sentinel.replaceWith(target);
    panel.replaceChildren(...scroll.childNodes);
  }

  function updateCTAState(){
    if(layoutMode!=='desktop'||!panelScroll||!ctaSentinel||!ctaTarget||!ctaDock) return;
    if(!ctaSentinel.isConnected||!ctaTarget.isConnected||!ctaDock.isConnected) return;
    const dockRect=ctaDock.getBoundingClientRect();
    const sentinelRect=ctaSentinel.getBoundingClientRect();
    const shouldMerge=sentinelRect.top<=dockRect.top+1;
    const targetInDock=ctaTarget.parentElement===ctaDock;
    if(shouldMerge&&targetInDock){
      const h=Math.ceil(ctaTarget.getBoundingClientRect().height||44);
      ctaSentinel.style.height='0px';
      ctaSentinel.after(ctaTarget);
      ctaDock.classList.add('is-merged');
      ctaDock.style.setProperty('--nb-cta-height',`${h}px`);
    }else if(!shouldMerge&&!targetInDock){
      const h=Math.ceil(ctaTarget.getBoundingClientRect().height||44);
      ctaSentinel.style.height=`${h}px`;
      ctaDock.appendChild(ctaTarget);
      ctaDock.classList.remove('is-merged');
      ctaDock.style.setProperty('--nb-cta-height',`${h}px`);
    }
  }

  function mountDesktopCTA(){
    if(layoutMode!=='desktop'||!detail) return;
    const panel=detail.querySelector('.v4-decision-panel');
    if(!panel) return;
    const existingScroll=panel.querySelector(':scope > .nb-offer-panel-scroll');
    const existingDock=panel.querySelector(':scope > .nb-offer-panel-dock');
    if(existingScroll&&existingDock){
      panelScroll=existingScroll;
      ctaDock=existingDock;
      ctaSentinel=existingScroll.querySelector('.nb-offer-cta-sentinel');
      ctaTarget=existingDock.querySelector(CTA_SELECTOR)||existingScroll.querySelector(CTA_SELECTOR);
      if(panelScroll&&panelScroll.dataset.overlayScrollReady!=='1'){
        panelScroll.dataset.overlayScrollReady='1';
        panelScroll.addEventListener('scroll',updateCTAState,{passive:true});
      }
      updateCTAState();
      return;
    }
    if(panel.classList.contains('nb-credit-v1-final')) return;
    const target=panel.querySelector(CTA_SELECTOR);
    if(!target) return;
    const scroll=document.createElement('div');
    scroll.className='nb-offer-panel-scroll';
    while(panel.firstChild) scroll.appendChild(panel.firstChild);
    const sentinel=document.createElement('div');
    sentinel.className='nb-offer-cta-sentinel';
    target.before(sentinel);
    const dock=document.createElement('div');
    dock.className='nb-offer-panel-dock';
    const targetHeight=Math.ceil(target.getBoundingClientRect().height||44);
    sentinel.style.height=`${targetHeight}px`;
    dock.style.setProperty('--nb-cta-height',`${targetHeight}px`);
    dock.appendChild(target);
    panel.append(scroll,dock);
    panelScroll=scroll;
    panelScroll.dataset.overlayScrollReady='1';
    ctaSentinel=sentinel;
    ctaTarget=target;
    ctaDock=dock;
    panelScroll.addEventListener('scroll',updateCTAState,{passive:true});
    updateCTAState();
  }

  function syncFollowState(){
    if(!detail||!currentOfferId) return;
    const isSaved=!!window.NextBonusWatchlistState?.getActive?.(currentOfferId);
    const escaped=window.CSS?.escape?CSS.escape(currentOfferId):currentOfferId.replace(/[^a-zA-Z0-9_-]/g,'');
    detail.querySelectorAll(`[data-action="bookmark"][data-id="${escaped}"]`).forEach(button=>{
      const label=isSaved?'已关注':'关注';
      const hint=isSaved?'已关注，点击取消':'关注';
      button.classList.toggle('saved',isSaved);
      button.setAttribute('aria-label',hint);
      button.setAttribute('title',hint);
      const glyph=button.querySelector('.nb-follow-glyph');
      if(glyph) glyph.textContent=isSaved?'✓':'＋';
      const spans=button.querySelectorAll('span');
      const text=spans.length>1?spans[spans.length-1]:null;
      if(text) text.textContent=label;
    });
  }

  function teardownOverlay(){
    if(!overlay) return;
    disconnectPanelRuntime();
    overlay.remove();
    overlay=null;
    detail=null;
    document.body.classList.remove('nb-offer-overlay-open');
    currentOfferId=null;
    openedFromHistory=false;
  }

  function renderCurrent(ctx){
    lastContext=ctx||lastContext;
    const info=overlayInfoFromContext();
    if(!info?.offerId){
      teardownOverlay();
      return null;
    }
    currentOfferId=String(info.offerId);
    baseSource=info.source==='wishlist'?'wishlist':'discover';
    baseScrollY=Number(info.scrollY||0);
    if(lastContext?.state){
      lastContext.state.currentOfferId=currentOfferId;
      lastContext.state.posterIndex=Number(info.posterIndex??lastContext.state.posterIndex??0);
    }
    const registry=window.NextBonusPageRegistry;
    if(!registry) return null;
    return renderSurface(registry.render('offer-detail',lastContext),lastContext);
  }

  function requestClose(){
    if(!overlay) return;
    const state=lastContext?.state;
    if((state?.route==='offer-detail'||openedFromHistory)&&history.state?.nbOfferOverlay&&history.length>1){
      history.back();
      return;
    }
    lastContext?.closeOfferDetail?.();
  }

  function handleBreakpointChange(){
    const nextMode=window.innerWidth>=DESKTOP_MIN?'desktop':'mobile';
    if(nextMode===layoutMode) return;
    layoutMode=nextMode;
    if(!detail) return;
    if(layoutMode==='mobile'){
      unwrapDesktopPanel();
      disconnectPanelRuntime();
    }else{
      mountDesktopCTA();
    }
  }

  document.addEventListener('keydown',event=>{ if(event.key==='Escape'&&overlay) requestClose(); });
  window.addEventListener('popstate',event=>{
    openedFromHistory=!!event.state?.nbOfferOverlay;
  });
  window.addEventListener('resize',handleBreakpointChange,{passive:true});

  function hydrateTiming(){
    const offerId=currentOfferId;
    if(!offerId||window.NextBonusOfferDetailTiming?.cached?.(offerId)) return;
    void window.NextBonusOfferDetailTiming?.load?.(offerId).then(()=>{
      if(!overlay||currentOfferId!==offerId) return;
      renderCurrent(lastContext);
    });
  }

  function renderSurface(markup,ctx){
    lastContext=ctx||lastContext;
    ensureOverlay();
    const host=overlay?.querySelector('.nb-offer-detail-host');
    if(!host) return null;
    disconnectPanelRuntime();
    host.innerHTML=markup;
    window.NextBonusUIFinalize?.run?.(host);
    detail=host.querySelector('.v4-offer-detail-page');
    if(detail){
      currentOfferId=offerIdFrom(detail)||currentOfferId;
      detail.classList.add('nb-overlay-detail');
      if(layoutMode==='desktop') mountDesktopCTA();
      syncFollowState();
      window.NextBonusAssessmentPage?.afterRender?.(host,lastContext);
      hydrateTiming();
    }
    return host;
  }

  window.NextBonusEvents?.registerRenderSurface?.('offer-detail',renderSurface);

  window.NextBonusOfferDetailOverlay=Object.freeze({
    close:requestClose,
    afterAppRender(ctx){
      lastContext=ctx||lastContext;
      renderCurrent(lastContext);
    },
    isOpen(){return !!overlay;},
    offerId(){return currentOfferId;}
  });

})();
