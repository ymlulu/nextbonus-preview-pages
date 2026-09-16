(() => {
  'use strict';

  const DESKTOP_MIN = 1181;
  const BOTTOM_GAP = 16;
  const TARGET_SELECTOR = [
    '.v4-detail-actions',
    '.nb-bank-cta',
    '.mm-cta',
    '.remaining-cta',
    '.deal-cta'
  ].join(',');

  let dock = null;
  let currentTarget = null;
  let currentSignature = '';
  let queued = false;

  function controls(root){
    const list = [];
    if(root?.matches?.('a,button')) list.push(root);
    if(root?.querySelectorAll) list.push(...root.querySelectorAll('a,button'));
    return list;
  }

  function stripDuplicateIds(root){
    if(root.removeAttribute) root.removeAttribute('id');
    root.querySelectorAll?.('[id]').forEach(node => node.removeAttribute('id'));
  }

  function ensureDock(){
    if(dock) return dock;
    dock = document.createElement('div');
    dock.className = 'nb-offer-cta-dock';
    dock.setAttribute('aria-label', 'Offer 操作');

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

    const el = ensureDock();
    el.replaceChildren(clone);
  }

  function findTarget(){
    const page = document.querySelector('.v4-offer-detail-page');
    if(!page) return null;
    const panel = page.querySelector('.v4-decision-panel');
    if(!panel) return null;
    return panel.querySelector(TARGET_SELECTOR);
  }

  function update(){
    queued = false;

    if(window.innerWidth < DESKTOP_MIN){
      hideDock();
      return;
    }

    const target = findTarget();
    if(!target || !target.isConnected){
      currentTarget = null;
      currentSignature = '';
      hideDock();
      return;
    }

    syncClone(target);

    const rect = target.getBoundingClientRect();
    if(rect.width <= 0 || rect.height <= 0){
      hideDock();
      return;
    }

    const dockingTop = window.innerHeight - BOTTOM_GAP - rect.height;
    const shouldFloat = rect.top > dockingTop + 1;

    if(!shouldFloat){
      hideDock();
      return;
    }

    const el = ensureDock();
    el.style.left = `${Math.round(rect.left)}px`;
    el.style.width = `${Math.round(rect.width)}px`;
    el.style.bottom = `${BOTTOM_GAP}px`;
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
  document.addEventListener('DOMContentLoaded', schedule);

  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true,
    subtree:true,
    characterData:true,
    attributes:true,
    attributeFilter:['class','href','disabled','aria-disabled']
  });

  schedule();
})();
