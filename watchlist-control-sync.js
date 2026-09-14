(() => {
  'use strict';

  let queued = false;

  function sync(){
    const api = window.NextBonusWatchlistState;
    if(!api) return;
    document.querySelectorAll('[data-action="bookmark"][data-id]').forEach(button=>{
      const offerId = String(button.dataset.id || '');
      if(!offerId) return;
      const followed = !!api.getActive(offerId);
      button.classList.toggle('saved',followed);
      button.setAttribute('aria-label',followed ? '取消关注' : '关注');
      const span = button.querySelector('span');
      if(span) span.textContent = followed ? '已关注' : '关注';
      else if(button.classList.contains('deal-save')) button.textContent = `♡ ${followed ? '已关注' : '关注'}`;
    });
  }

  function queue(){
    if(queued) return;
    queued = true;
    setTimeout(()=>{queued=false;sync();},0);
  }

  document.addEventListener('click',queue);
  ['focus','pageshow','popstate'].forEach(type=>window.addEventListener(type,queue));
  const app = document.getElementById('app');
  if(app) new MutationObserver(queue).observe(app,{childList:true,subtree:true});

  window.NextBonusWatchlistControlSync = Object.freeze({refresh:sync});
  sync();
})();
