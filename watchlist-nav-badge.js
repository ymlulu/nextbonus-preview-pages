(() => {
  'use strict';

  const STORE_KEY = 'nextbonus-watchlist-v1';
  let queued = false;

  function inProgressCount(){
    const api = window.NextBonusWatchlistState;
    if(!api) return 0;
    return api.list('in_progress').length;
  }

  function render(){
    const nav = document.querySelector('.nav-item[data-route="wishlist"]');
    if(!nav) return;
    const count = inProgressCount();
    let badge = nav.querySelector('.nb-watchlist-progress-badge');

    if(!count){
      badge?.remove();
      return;
    }

    if(!badge){
      badge = document.createElement('span');
      badge.className = 'nav-badge nb-watchlist-progress-badge';
      badge.style.background = 'var(--red)';
      nav.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.setAttribute('aria-label', `${count} 个进行中的关注`);
  }

  function queue(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(()=>{
      queued = false;
      render();
    });
  }

  const app = document.getElementById('app');
  if(app) new MutationObserver(queue).observe(app,{childList:true,subtree:true});
  const toast = document.getElementById('toast-root');
  if(toast) new MutationObserver(queue).observe(toast,{childList:true,subtree:true,characterData:true});

  document.addEventListener('click',()=>setTimeout(queue,0));
  ['focus','pageshow','popstate'].forEach(type=>window.addEventListener(type,queue));
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) queue(); });
  window.addEventListener('storage',event=>{ if(event.key===STORE_KEY) queue(); });

  window.NextBonusWatchlistNavBadge = Object.freeze({refresh:render,count:inProgressCount});
  render();
})();
