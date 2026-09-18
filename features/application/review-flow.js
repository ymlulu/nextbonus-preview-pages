(() => {
  'use strict';

  const HANDOFF_KEY = 'nextbonus-application-handoff-v1';
  const ROOT_ID = 'nb-application-handoff-root';
  const REVIEW_STATUSES = new Set(['awaiting_result','deferred','pending','approved_needs_login']);
  let openedFromWatchlistAttemptId = null;

  function readStore(){
    try{
      const raw = localStorage.getItem(HANDOFF_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(_){
      return null;
    }
  }

  function writeStore(store){
    if(store) localStorage.setItem(HANDOFF_KEY,JSON.stringify(store));
  }

  function activeAttempt(){
    const store = readStore();
    return store?.attempts?.find(x=>x.id===store.activeId) || null;
  }

  function setActiveAttempt(attemptId){
    const store = readStore();
    if(!store || !Array.isArray(store.attempts)) return null;
    const attempt = store.attempts.find(x=>x.id===attemptId) || null;
    if(!attempt) return null;
    store.activeId = attempt.id;
    writeStore(store);
    return attempt;
  }

  function clearActiveAttempt(attemptId = null){
    const store = readStore();
    if(!store) return;
    if(!attemptId || store.activeId===attemptId) store.activeId = null;
    writeStore(store);
  }

  function clearHandoffUi(){
    const root = document.getElementById(ROOT_ID);
    if(root) root.innerHTML = '';
  }

  function goWatchlist(){
    const nav = document.querySelector('[data-action="nav"][data-route="wishlist"]');
    if(nav) nav.click();
  }

  function finishPendingSelection(attemptId){
    window.NextBonusApplicationWatchlistLifecycle?.sync?.();
    clearActiveAttempt(attemptId);
    clearHandoffUi();
    goWatchlist();
    setTimeout(()=>{
      clearHandoffUi();
      window.NextBonusWatchlistUI?.refresh?.();
    },0);
  }

  function finishDeniedSelection(){
    const store = readStore();
    if(!store || !Array.isArray(store.attempts) || !store.activeId) return false;
    const index = store.attempts.findIndex(x=>x.id===store.activeId);
    if(index<0) return false;
    const stamp = new Date().toISOString();
    const attempt = {...store.attempts[index],status:'denied',resultConfirmedAt:stamp,updatedAt:stamp};
    store.attempts[index] = attempt;
    store.activeId = null;
    writeStore(store);
    window.NextBonusApplicationWatchlistLifecycle?.sync?.();
    window.NextBonusWatchlistUI?.refresh?.();
    const root = document.getElementById(ROOT_ID);
    if(root) root.innerHTML = window.NextBonusApplicationResultPage?.denied?.(attempt) || '';
    openedFromWatchlistAttemptId = null;
    return true;
  }

  function openApplicationReview(item){
    if(!item?.sourceId || item.sourceType!=='application' || item.stage!=='in_progress' || !REVIEW_STATUSES.has(item.status)) return false;
    const attempt = setActiveAttempt(item.sourceId);
    if(!attempt) return false;
    openedFromWatchlistAttemptId = attempt.id;
    window.NextBonusApplicationHandoff?.open?.();
    return true;
  }

  document.addEventListener('click',event=>{
    const card = event.target.closest?.('.nb-watchlist-item[data-id]');
    if(card){
      const item = window.NextBonusWatchlistState?.getActive?.(card.dataset.id);
      if(item?.sourceType==='application' && item?.stage==='in_progress' && REVIEW_STATUSES.has(item.status)){
        event.preventDefault();
        event.stopImmediatePropagation();
        openApplicationReview(item);
        return;
      }
    }

    const denied = event.target.closest?.('[data-handoff-action="result"][data-result="denied"]');
    if(denied){
      event.preventDefault();
      event.stopImmediatePropagation();
      finishDeniedSelection();
      return;
    }

    const dismissDenied = event.target.closest?.('[data-denied-action="dismiss"]');
    if(dismissDenied){
      event.preventDefault();
      event.stopImmediatePropagation();
      clearHandoffUi();
    }
  },true);

  document.addEventListener('click',event=>{
    const control = event.target.closest?.('[data-handoff-action]');
    if(!control) return;
    const action = control.dataset.handoffAction;
    const result = control.dataset.result;
    const current = activeAttempt();

    if(action==='result' && result==='pending' && current){
      const attemptId = current.id;
      setTimeout(()=>finishPendingSelection(attemptId),0);
      openedFromWatchlistAttemptId = null;
      return;
    }

    if(openedFromWatchlistAttemptId && ['hide','defer'].includes(action)){
      const attemptId = openedFromWatchlistAttemptId;
      openedFromWatchlistAttemptId = null;
      setTimeout(()=>{
        clearActiveAttempt(attemptId);
        clearHandoffUi();
        window.NextBonusWatchlistUI?.refresh?.();
      },0);
    }
  });

  function suppressPassivePendingBanner(){
    const root = document.getElementById(ROOT_ID);
    if(!root?.querySelector('.nb-ah-banner')) return;
    const attempt = activeAttempt();
    if(attempt?.status==='pending'){
      clearActiveAttempt(attempt.id);
      clearHandoffUi();
    }
  }

  const rootObserver = new MutationObserver(()=>queueMicrotask(suppressPassivePendingBanner));
  function observeRoot(){
    const root = document.getElementById(ROOT_ID);
    if(root) rootObserver.observe(root,{childList:true,subtree:true});
    suppressPassivePendingBanner();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observeRoot,{once:true});
  else observeRoot();

  window.NextBonusApplicationReviewFlow = Object.freeze({openApplicationReview,finishPendingSelection,finishDeniedSelection});
})();
