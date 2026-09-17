(() => {
  'use strict';

  const STATE_KEY = 'nextbonus-local-v8-state';
  const DESKTOP_MIN = 1181;
  const CTA_SELECTOR = '.v4-detail-actions,.nb-bank-cta,.mm-cta,.remaining-cta,.deal-cta';
  const bridge = window.NBOfferOverlayBridge || null;
  const app = document.getElementById('app');
  if(!app) return;

  let overlay = null;
  let detail = null;
  let baseHtml = null;
  let baseScrollY = 0;
  let baseSource = 'discover';
  let currentOfferId = null;
  let reconcileQueued = false;
  let reconciling = false;
  let closing = false;
  let panelObserver = null;
  let panelScroll = null;
  let ctaSentinel = null;
  let ctaTarget = null;
  let ctaDock = null;
  let layoutMode = window.innerWidth >= DESKTOP_MIN ? 'desktop' : 'mobile';

  function readState(){
    try{return JSON.parse(localStorage.getItem(STATE_KEY) || '{}');}
    catch(_err){return {};}
  }

  function sourceFromState(saved = readState()){
    if(saved.offerOverlay?.source === 'wishlist') return 'wishlist';
    if(saved.offerOverlay?.source === 'discover') return 'discover';
    if(saved.route === 'wishlist' || saved.routeSource === 'wishlist') return 'wishlist';
    return 'discover';
  }

  function activeOverlayInfo(){
    return history.state?.nbOfferOverlay || bridge?.getActive?.() || readState().offerOverlay || null;
  }

  function offerIdFrom(node){
    const info = activeOverlayInfo();
    if(info?.offerId) return info.offerId;
    const saved = readState();
    if(saved.currentOfferId) return saved.currentOfferId;
    return node?.querySelector?.('[data-action="bookmark"][data-id]')?.dataset?.id || null;
  }

  function captureBaseBeforeOpen(event){
    const trigger = event.target.closest?.('[data-action="open-offer"][data-id]');
    if(!trigger || overlay) return;
    baseHtml = app.innerHTML;
    baseScrollY = window.scrollY || 0;
    baseSource = sourceFromState();
    currentOfferId = trigger.dataset.id;
  }

  function ensureOverlay(){
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'nb-offer-detail-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Offer Detail');
    overlay.innerHTML = `
      <div class="nb-offer-detail-frame">
        <button class="nb-offer-detail-close" type="button" aria-label="关闭 Offer Detail">×</button>
        <div class="nb-offer-detail-host"></div>
      </div>`;
    overlay.querySelector('.nb-offer-detail-close').addEventListener('click', requestClose);
    overlay.addEventListener('click', event => {
      if(event.target === overlay) requestClose();
    });
    document.body.appendChild(overlay);
    document.body.classList.add('nb-offer-overlay-open');
    return overlay;
  }

  function disconnectPanelRuntime(){
    panelObserver?.disconnect();
    panelObserver = null;
    panelScroll?.removeEventListener('scroll', updateCTAState);
    panelScroll = null;
    ctaSentinel = null;
    ctaTarget = null;
    ctaDock = null;
  }

  function unwrapDesktopPanel(){
    const panel = detail?.querySelector('.v4-decision-panel');
    if(!panel) return;
    const scroll = panel.querySelector(':scope > .nb-offer-panel-scroll');
    const dock = panel.querySelector(':scope > .nb-offer-panel-dock');
    if(!scroll || !dock) return;

    const sentinel = scroll.querySelector('.nb-offer-cta-sentinel');
    const target = dock.querySelector(CTA_SELECTOR) || scroll.querySelector(CTA_SELECTOR);
    if(target && sentinel?.isConnected) sentinel.replaceWith(target);
    panel.replaceChildren(...scroll.childNodes);
  }

  function updateCTAState(){
    if(layoutMode !== 'desktop' || !panelScroll || !ctaSentinel || !ctaTarget || !ctaDock) return;
    if(!ctaSentinel.isConnected || !ctaTarget.isConnected || !ctaDock.isConnected) return;

    const dockRect = ctaDock.getBoundingClientRect();
    const sentinelRect = ctaSentinel.getBoundingClientRect();
    const shouldMerge = sentinelRect.top <= dockRect.top + 1;
    const targetInDock = ctaTarget.parentElement === ctaDock;

    if(shouldMerge && targetInDock){
      const h = Math.ceil(ctaTarget.getBoundingClientRect().height || 44);
      ctaSentinel.style.height = '0px';
      ctaSentinel.after(ctaTarget);
      ctaDock.classList.add('is-merged');
      ctaDock.style.setProperty('--nb-cta-height', `${h}px`);
    }else if(!shouldMerge && !targetInDock){
      const h = Math.ceil(ctaTarget.getBoundingClientRect().height || 44);
      ctaSentinel.style.height = `${h}px`;
      ctaDock.appendChild(ctaTarget);
      ctaDock.classList.remove('is-merged');
      ctaDock.style.setProperty('--nb-cta-height', `${h}px`);
    }
  }

  function attachPanelObserver(panel){
    panelObserver?.disconnect();
    panelObserver = new MutationObserver(() => scheduleReconcile());
    panelObserver.observe(panel,{childList:true,subtree:true});
  }

  function mountDesktopCTA(){
    if(layoutMode !== 'desktop' || !detail) return;
    const panel = detail.querySelector('.v4-decision-panel');
    if(!panel) return;

    const existingScroll = panel.querySelector(':scope > .nb-offer-panel-scroll');
    const existingDock = panel.querySelector(':scope > .nb-offer-panel-dock');
    if(existingScroll && existingDock){
      panelScroll = existingScroll;
      ctaDock = existingDock;
      ctaSentinel = existingScroll.querySelector('.nb-offer-cta-sentinel');
      ctaTarget = existingDock.querySelector(CTA_SELECTOR) || existingScroll.querySelector(CTA_SELECTOR);
      if(panelScroll && panelScroll.dataset.overlayScrollReady !== '1'){
        panelScroll.dataset.overlayScrollReady = '1';
        panelScroll.addEventListener('scroll',updateCTAState,{passive:true});
      }
      updateCTAState();
      return;
    }

    const target = panel.querySelector(CTA_SELECTOR);
    if(!target) return;

    panelObserver?.disconnect();
    const scroll = document.createElement('div');
    scroll.className = 'nb-offer-panel-scroll';
    while(panel.firstChild) scroll.appendChild(panel.firstChild);

    const sentinel = document.createElement('div');
    sentinel.className = 'nb-offer-cta-sentinel';
    target.before(sentinel);

    const dock = document.createElement('div');
    dock.className = 'nb-offer-panel-dock';
    const targetHeight = Math.ceil(target.getBoundingClientRect().height || 44);
    sentinel.style.height = `${targetHeight}px`;
    dock.style.setProperty('--nb-cta-height',`${targetHeight}px`);
    dock.appendChild(target);

    panel.append(scroll,dock);
    panelScroll = scroll;
    panelScroll.dataset.overlayScrollReady = '1';
    ctaSentinel = sentinel;
    ctaTarget = target;
    ctaDock = dock;
    panelScroll.addEventListener('scroll',updateCTAState,{passive:true});
    attachPanelObserver(panel);
    updateCTAState();
  }

  function syncBookmarkState(){
    if(!detail || !currentOfferId) return;
    const saved = readState();
    const isSaved = (saved.savedOfferIds||[]).includes(currentOfferId) || (saved.unavailableSavedIds||[]).includes(currentOfferId);
    const escaped = window.CSS?.escape ? CSS.escape(currentOfferId) : currentOfferId.replace(/[^a-zA-Z0-9_-]/g,'');
    detail.querySelectorAll(`[data-action="bookmark"][data-id="${escaped}"]`).forEach(button => {
      button.classList.toggle('saved',isSaved);
      const span = button.querySelector('span');
      if(span) span.textContent = isSaved ? '已收藏' : '收藏';
      else if(button.matches('.mm-save,.nb-bank-save,.remaining-save,.deal-save')){
        button.textContent = `♡ ${isSaved ? '已收藏' : '收藏'}`;
      }
    });
  }

  function restoreBaseVisual(){
    if(baseHtml == null) return;
    app.innerHTML = baseHtml;
    requestAnimationFrame(() => window.scrollTo({top:baseScrollY,behavior:'instant'}));
  }

  function prepareBaseBeforeReveal(){
    if(baseSource !== 'wishlist' || baseHtml == null) return;

    // Keep the Offer overlay covering the page while the source view is rebuilt.
    // The captured HTML already contains the fully-finalized Watchlist shell, so
    // restoring it avoids exposing app.js's legacy wishlist markup for a frame.
    app.innerHTML = baseHtml;

    // Re-render only the Watchlist body from current state so changes made inside
    // Offer Detail (for example bookmark state) are reflected before reveal.
    window.NextBonusWatchlistUI?.refresh?.();
    window.scrollTo({top:baseScrollY,behavior:'instant'});
  }

  function revealBaseAfterSettle(){
    if(!overlay){
      closing = false;
      return;
    }

    // popstate is dispatched before app.js has finished rebuilding the source page.
    // Move preparation to the microtask checkpoint, then keep the overlay mounted
    // through one full animation frame so route-scoped copy/layout runtimes can settle.
    queueMicrotask(() => {
      if(!overlay){
        closing = false;
        return;
      }

      prepareBaseBeforeReveal();
      const y = baseScrollY;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if(!overlay){
            closing = false;
            return;
          }
          teardownOverlay();
          window.scrollTo({top:y,behavior:'instant'});
        });
      });
    });
  }

  function promoteAppModal(){
    const modal = app.querySelector(':scope > .modal-backdrop, .shell + .modal-backdrop');
    if(!modal) return;
    modal.classList.add('nb-promoted-app-modal');
    document.body.appendChild(modal);
  }

  function removePromotedModals(){
    document.querySelectorAll('.nb-promoted-app-modal').forEach(node => node.remove());
  }

  function mountIncomingDetail(node){
    if(reconciling || !node) return;
    reconciling = true;
    try{
      ensureOverlay();
      disconnectPanelRuntime();
      currentOfferId = offerIdFrom(node) || currentOfferId;
      const info = activeOverlayInfo();
      if(info){
        baseSource = info.source === 'wishlist' ? 'wishlist' : 'discover';
        if(baseHtml == null) baseScrollY = Number(info.scrollY || 0);
      }

      if(detail && detail !== node) detail.remove();
      detail = node;
      detail.classList.add('nb-overlay-detail');
      overlay.querySelector('.nb-offer-detail-host').replaceChildren(detail);

      promoteAppModal();
      restoreBaseVisual();

      const panel = detail.querySelector('.v4-decision-panel');
      if(panel) attachPanelObserver(panel);
      if(layoutMode === 'desktop') mountDesktopCTA();
      bridge?.endRestore?.();
    }finally{
      reconciling = false;
    }
  }

  function reconcile(){
    reconcileQueued = false;
    if(reconciling) return;
    const incoming = app.querySelector('.v4-offer-detail-page');
    if(incoming){
      mountIncomingDetail(incoming);
      return;
    }
    if(!detail) return;
    if(layoutMode === 'desktop') mountDesktopCTA();
    syncBookmarkState();
  }

  function scheduleReconcile(){
    if(reconcileQueued) return;
    reconcileQueued = true;
    requestAnimationFrame(reconcile);
  }

  function teardownOverlay(){
    if(!overlay) return;
    disconnectPanelRuntime();
    overlay.remove();
    overlay = null;
    detail = null;
    document.body.classList.remove('nb-offer-overlay-open');
    removePromotedModals();
    baseHtml = null;
    currentOfferId = null;
    closing = false;
  }

  function fireLegacyBackFallback(){
    const button = document.createElement('button');
    button.type = 'button';
    button.hidden = true;
    button.dataset.action = 'back-offer-list';
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function requestClose(){
    if(closing) return;
    closing = true;

    const info = history.state?.nbOfferOverlay || bridge?.getActive?.();
    if(info && history.length > 1){
      history.back();
      return;
    }

    // Fallback navigation must also happen while the overlay is still mounted.
    // Otherwise the app's source-page reconstruction becomes visible mid-transition.
    bridge?.clear?.();
    fireLegacyBackFallback();
    revealBaseAfterSettle();
  }

  function suspendForLogin(){
    if(!overlay) return;
    disconnectPanelRuntime();
    overlay.remove();
    overlay = null;
    detail = null;
    document.body.classList.remove('nb-offer-overlay-open');
    removePromotedModals();
    closing = false;
  }

  function maybeSuspendForAssessment(event){
    if(!overlay) return;
    const action = event.target.closest?.('[data-action="assessment-start"]');
    if(!action || readState().loggedIn) return;
    requestAnimationFrame(suspendForLogin);
  }

  function openFromHistory(info){
    if(!info?.offerId) return;
    closing = false;
    if(overlay && currentOfferId === info.offerId) return;
    if(overlay) teardownOverlay();

    currentOfferId = info.offerId;
    baseSource = info.source === 'wishlist' ? 'wishlist' : 'discover';
    baseScrollY = Number(info.scrollY || 0);
    baseHtml = app.innerHTML;
    bridge?.beginRestore?.(info);

    requestAnimationFrame(() => {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.hidden = true;
      trigger.dataset.action = 'open-offer';
      trigger.dataset.id = info.offerId;
      app.appendChild(trigger);
      trigger.click();
      trigger.remove();
    });
  }

  function onOverlayHistory(event){
    const info = event.detail?.overlay || null;
    if(!info){
      if(overlay) revealBaseAfterSettle();
      else closing = false;
      return;
    }

    requestAnimationFrame(() => openFromHistory(info));
  }

  function handleBreakpointChange(){
    const nextMode = window.innerWidth >= DESKTOP_MIN ? 'desktop' : 'mobile';
    if(nextMode === layoutMode) return;
    layoutMode = nextMode;
    if(!detail) return;

    if(layoutMode === 'mobile'){
      unwrapDesktopPanel();
      disconnectPanelRuntime();
      const panel = detail.querySelector('.v4-decision-panel');
      if(panel) attachPanelObserver(panel);
    }else{
      mountDesktopCTA();
    }
  }

  document.addEventListener('click',captureBaseBeforeOpen,true);
  document.addEventListener('click',maybeSuspendForAssessment,true);
  document.addEventListener('keydown',event => {
    if(event.key === 'Escape' && overlay) requestClose();
  });
  window.addEventListener('nb:offer-overlay-history',onOverlayHistory);
  window.addEventListener('resize',handleBreakpointChange,{passive:true});

  new MutationObserver(scheduleReconcile).observe(app,{childList:true,subtree:true});

  const initial = activeOverlayInfo();
  if(initial) openFromHistory(initial);
  scheduleReconcile();
})();
