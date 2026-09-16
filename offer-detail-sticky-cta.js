(() => {
  'use strict';

  const DESKTOP_MIN = 1181;
  const BOTTOM_INSET = 12;
  const TARGET_SELECTOR = [
    '.v4-detail-actions',
    '.nb-bank-cta',
    '.mm-cta',
    '.remaining-cta',
    '.deal-cta'
  ].join(',');

  let dock = null;
  let currentTarget = null;
  let currentPanel = null;
  let currentSignature = '';
  let queued = false;

  function controls(root){
    const list = [];
    if(root?.matches?.('a,button')) list.push(root);
    if(root?.querySelectorAll) list.push(...root.querySelectorAll('a,button'));
    return list;
  }

  function stripDuplicateIds(root){
    root.removeAttribute?.('id');
    root.querySelectorAll?.('[id]').forEach(node => node.removeAttribute('id'));
  }

  function ensureDock(){
    if(dock) return dock;
    dock = document.createElement('div');
    dock.className = 'nb-offer-cta-dock';
    dock.setAttribute('aria-label', 'Offer 操作');
    dock.setAttribute('aria-hidden', 'true');

    dock.addEventListener('click', event => {
      if(!currentTarget) return;
      const clicked = event.target.closest('a,button');
      if(!clicked || !dock.contains(clicked)) return;

      const cloneControls = controls(dock.firstElementChild);
      const originalControls = controls(currentTarget);
      const index = cloneControls.indexOf(clicked);
      const original = originalControls[index];
      if(!original) return;

      event.preventDefault();
      event.stopPropagation();
      original.click();
    }, true);

    document.body.appendChild(dock);
    return dock;
  }

  function hideDock(){
    if(!dock) return;
    dock.classList.remove('is-visible');
    dock.setAttribute('aria-hidden', 'true');
  }

  function syncClone(target){
    const signature = target.outerHTML;
    if(target === currentTarget && signature === currentSignature && dock?.firstElementChild) return;

    currentTarget = target;
    currentSignature = signature;
    const clone = target.cloneNode(true);
    stripDuplicateIds(clone);
    clone.classList.add('nb-offer-cta-dock-content');

    ensureDock().replaceChildren(clone);
  }

  function detachPanelListener(){
    if(currentPanel) currentPanel.removeEventListener('scroll', schedule);
    currentPanel = null;
  }

  function attachPanelListener(panel){
    if(panel === currentPanel) return;
    detachPanelListener();
    currentPanel = panel;
    currentPanel.addEventListener('scroll', schedule, {passive:true});
  }

  function findContext(){
    const page = document.querySelector('.v4-offer-detail-page');
    if(!page) return null;
    const panel = page.querySelector('.v4-decision-panel');
    if(!panel) return null;
    const target = panel.querySelector(TARGET_SELECTOR);
    if(!target) return null;
    return {page,panel,target};
  }

  function update(){
    queued = false;

    if(window.innerWidth < DESKTOP_MIN){
      detachPanelListener();
      currentTarget = null;
      currentSignature = '';
      hideDock();
      return;
    }

    const context = findContext();
    if(!context){
      detachPanelListener();
      currentTarget = null;
      currentSignature = '';
      hideDock();
      return;
    }

    const {panel,target} = context;
    attachPanelListener(panel);
    syncClone(target);

    const panelRect = panel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if(panelRect.width <= 0 || panelRect.height <= 0 || targetRect.height <= 0){
      hideDock();
      return;
    }

    const dockHeight = Math.max(targetRect.height, 44);
    const mergeTop = panelRect.bottom - BOTTOM_INSET - dockHeight;
    const shouldFloat = targetRect.top > mergeTop + 1;

    if(!shouldFloat){
      hideDock();
      return;
    }

    const el = ensureDock();
    el.style.left = `${Math.round(panelRect.left)}px`;
    el.style.width = `${Math.round(panelRect.width)}px`;
    el.style.top = `${Math.round(panelRect.bottom - BOTTOM_INSET - dockHeight)}px`;
    el.style.bottom = 'auto';
    el.classList.add('is-visible');
    el.setAttribute('aria-hidden', 'false');
  }

  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  document.addEventListener('DOMContentLoaded', schedule);

  new MutationObserver(schedule).observe(document.getElementById('app') || document.documentElement, {
    childList:true,
    subtree:true,
    characterData:true,
    attributes:true,
    attributeFilter:['class','href','disabled','aria-disabled']
  });

  schedule();
})();
