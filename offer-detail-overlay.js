(() => {
  'use strict';

  const RESUME_KEY = 'nextbonus-offer-overlay-resume-v1';
  const STATE_KEY = 'nextbonus-local-v8-state';
  const DESKTOP_MIN = 1181;
  const CTA_SELECTOR = '.v4-detail-actions,.nb-bank-cta,.mm-cta,.remaining-cta,.deal-cta';

  const app = document.getElementById('app');
  if(!app) return;

  let overlay = null;
  let frame = null;
  let detail = null;
  let baseHtml = null;
  let baseScrollY = 0;
  let baseSource = 'discover';
  let currentOfferId = null;
  let panelObserver = null;
  let panelScroll = null;
  let ctaSentinel = null;
  let ctaTarget = null;
  let ctaDock = null;
  let reconciling = false;
  let queued = false;

  function readState(){
    try{return JSON.parse(localStorage.getItem(STATE_KEY) || '{}');}catch(_err){return {};}
  }

  function inferSource(){
    const saved = readState();
    return saved.routeSource === 'wishlist' ? 'wishlist' : 'discover';
  }

  function inferOfferId(node){
    const saved = readState();
    if(saved.currentOfferId) return saved.currentOfferId;
    const bookmark = node?.querySelector?.('[data-action="bookmark"][data-id]');
    return bookmark?.dataset?.id || null;
  }

  function saveResume(){
    if(!currentOfferId) return;
    try{
      sessionStorage.setItem(RESUME_KEY, JSON.stringify({
        offerId: currentOfferId,
        source: baseSource,
        scrollY: baseScrollY
      }));
    }catch(_err){}
  }

  function clearResume(){
    try{sessionStorage.removeItem(RESUME_KEY);}catch(_err){}
  }

  function captureBaseFromOpen(event){
    const trigger = event.target.closest?.('[data-action="open-offer"][data-id]');
    if(!trigger || overlay) return;
    baseHtml = app.innerHTML;
    baseScrollY = window.scrollY || 0;
    baseSource = inferSource();
    currentOfferId = trigger.dataset.id;
    saveResume();
  }

  function ensureOverlay(){
    if(overlay) return;
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
    frame = overlay.querySelector('.nb-offer-detail-frame');
    overlay.querySelector('.nb-offer-detail-close').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', event => {
      if(event.target === overlay) closeOverlay();
    });
    document.body.appendChild(overlay);
    document.body.classList.add('nb-offer-overlay-open');
  }

  function disconnectPanel(){
    panelObserver?.disconnect();
    panelObserver = null;
    panelScroll?.removeEventListener('scroll', updateCTAState);
    panelScroll = null;
    ctaSentinel = null;
    ctaTarget = null;
    ctaDock = null;
  }

  function unwrapManagedPanel(panel){
    const scroll = panel.querySelector(':scope > .nb-offer-panel-scroll');
    const dock = panel.querySelector(':scope > .nb-offer-panel-dock');
    if(!scroll || !dock) return;
    const target = dock.querySelector(CTA_SELECTOR) || scroll.querySelector(CTA_SELECTOR);
    if(target && ctaSentinel?.isConnected){
      ctaSentinel.replaceWith(target);
    }
    const nodes = [...scroll.childNodes];
    panel.replaceChildren(...nodes);
  }

  function updateCTAState(){
    if(window.innerWidth < DESKTOP_MIN || !panelScroll || !ctaSentinel || !ctaTarget || !ctaDock) return;
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

  function mountPanelCTA(){
    if(!detail || window.innerWidth < DESKTOP_MIN) return;
    const panel = detail.querySelector('.v4-decision-panel');
    if(!panel) return;

    const existingScroll = panel.querySelector(':scope > .nb-offer-panel-scroll');
    const existingDock = panel.querySelector(':scope > .nb-offer-panel-dock');
    if(existingScroll && existingDock){
      panelScroll = existingScroll;
      ctaDock = existingDock;
      ctaSentinel = existingScroll.querySelector('.nb-offer-cta-sentinel');
      ctaTarget = existingDock.querySelector(CTA_SELECTOR) || existingScroll.querySelector(CTA_SELECTOR);
      updateCTAState();
      return;
    }

    const target = panel.querySelector(CTA_SELECTOR);
    if(!target) return;

    disconnectPanel();

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
    dock.style.setProperty('--nb-cta-height', `${targetHeight}px`);
    dock.appendChild(target);

    panel.append(scroll,dock);
    panelScroll = scroll;
    ctaSentinel = sentinel;
    ctaTarget = target;
    ctaDock = dock;
    panelScroll.addEventListener('scroll', updateCTAState, {passive:true});

    panelObserver = new MutationObserver(() => schedule());
    panelObserver.observe(panel,{childList:true,subtree:false});
    updateCTAState();
  }

  function restoreBaseVisual(){
    if(baseHtml == null) return;
    app.innerHTML = baseHtml;
    requestAnimationFrame(() => window.scrollTo({top:baseScrollY,behavior:'instant'}));
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

  function mountDetail(node){
    if(reconciling || !node) return;
    reconciling = true;
    try{
      ensureOverlay();
      disconnectPanel();
      currentOfferId = inferOfferId(node) || currentOfferId;
      baseSource = baseSource || inferSource();
      saveResume();

      if(detail && detail !== node) detail.remove();
      detail = node;
      overlay.querySelector('.nb-offer-detail-host').replaceChildren(detail);
      detail.classList.add('nb-overlay-detail');

      promoteAppModal();
      restoreBaseVisual();

      const watchPanel = detail.querySelector('.v4-decision-panel');
      if(watchPanel){
        panelObserver = new MutationObserver(() => schedule());
        panelObserver.observe(watchPanel,{childList:true,subtree:true});
      }
      mountPanelCTA();
    }finally{
      reconciling = false;
    }
  }

  function reconcile(){
    queued = false;
    if(reconciling) return;

    const incoming = app.querySelector('.v4-offer-detail-page');
    if(incoming){
      mountDetail(incoming);
      return;
    }

    if(detail){
      mountPanelCTA();
      syncOverlaySavedState();
    }
  }

  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(reconcile);
  }

  function syncOverlaySavedState(){
    if(!detail || !currentOfferId) return;
    const saved = readState();
    const isSaved = (saved.savedOfferIds||[]).includes(currentOfferId) || (saved.unavailableSavedIds||[]).includes(currentOfferId);
    detail.querySelectorAll(`[data-action="bookmark"][data-id="${CSS.escape(currentOfferId)}"]`).forEach(button => {
      button.classList.toggle('saved',isSaved);
      const text = button.querySelector('span');
      if(text) text.textContent = isSaved ? '已收藏' : '收藏';
      else if(button.classList.contains('mm-save') || button.classList.contains('nb-bank-save') || button.classList.contains('remaining-save') || button.classList.contains('deal-save')) button.textContent = `♡ ${isSaved?'已收藏':'收藏'}`;
    });
  }

  function fireBackToSource(){
    const button = document.createElement('button');
    button.type = 'button';
    button.hidden = true;
    button.dataset.action = 'back-offer-list';
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function closeOverlay(){
    if(!overlay) return;
    disconnectPanel();
    clearResume();
    overlay.remove();
    overlay = null;
    frame = null;
    detail = null;
    document.body.classList.remove('nb-offer-overlay-open');
    removePromotedModals();
    fireBackToSource();
    requestAnimationFrame(() => window.scrollTo({top:baseScrollY,behavior:'instant'}));
    baseHtml = null;
    currentOfferId = null;
  }

  function suspendForLogin(){
    if(!overlay) return;
    disconnectPanel();
    overlay.remove();
    overlay = null;
    frame = null;
    detail = null;
    document.body.classList.remove('nb-offer-overlay-open');
    removePromotedModals();
  }

  function maybeSuspendForAssessment(event){
    if(!overlay) return;
    const action = event.target.closest?.('[data-action="assessment-start"]');
    if(!action) return;
    if(readState().loggedIn) return;
    saveResume();
    requestAnimationFrame(suspendForLogin);
  }

  function restoreFromRefresh(){
    let resume = null;
    try{resume = JSON.parse(sessionStorage.getItem(RESUME_KEY) || 'null');}catch(_err){}
    if(!resume?.offerId) return;

    currentOfferId = resume.offerId;
    baseSource = resume.source === 'wishlist' ? 'wishlist' : 'discover';
    baseScrollY = Number(resume.scrollY || 0);
    baseHtml = app.innerHTML;
    requestAnimationFrame(() => {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.hidden = true;
      trigger.dataset.action = 'open-offer';
      trigger.dataset.id = resume.offerId;
      app.appendChild(trigger);
      trigger.click();
      trigger.remove();
      clearResume();
    });
  }

  document.addEventListener('click',captureBaseFromOpen,true);
  document.addEventListener('click',maybeSuspendForAssessment,true);
  document.addEventListener('keydown',event => {
    if(event.key === 'Escape' && overlay) closeOverlay();
  });
  window.addEventListener('resize',() => {
    if(window.innerWidth < DESKTOP_MIN && detail){
      const panel = detail.querySelector('.v4-decision-panel');
      if(panel) unwrapManagedPanel(panel);
      disconnectPanel();
    }else if(detail){
      mountPanelCTA();
    }
  },{passive:true});

  new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  restoreFromRefresh();
  schedule();
})();
