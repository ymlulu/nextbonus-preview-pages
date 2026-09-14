(() => {
'use strict';
if(!document.querySelector('link[data-deal-watchlist-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='deal-watchlist-ui.css';link.dataset.dealWatchlistStyle='1';document.head.appendChild(link);}
let queued=false;
function enhance(){
  const lifecycle=window.NextBonusDealWatchlistLifecycle;
  const state=window.NextBonusWatchlistState;
  if(!lifecycle?.ready||!state)return;
  lifecycle.expireDueDeals();
  document.querySelectorAll('.nb-watchlist-item[data-id]').forEach(card=>{
    const offerId=card.dataset.id;
    const item=state.getActive(offerId);
    if(!item||item.stage!=='in_progress'||item.status!=='deal_active')return;
    const config=lifecycle.lifecycleFor(offerId);
    if(!config)return;
    const meta=card.querySelector('.nb-watchlist-copy small');
    if(meta&&config.endDate&&!meta.dataset.dealEndDate){meta.textContent=meta.textContent+' · 截止 '+config.endDate;meta.dataset.dealEndDate=config.endDate;}
    if(card.querySelector('.nb-watchlist-deal-complete'))return;
    const button=document.createElement('button');button.type='button';button.className='nb-watchlist-deal-complete';button.dataset.offerId=offerId;button.textContent='已完成';
    const chevron=card.querySelector('.nb-watchlist-chevron');if(chevron)card.insertBefore(button,chevron);else card.appendChild(button);
  });
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}
document.addEventListener('click',event=>{const button=event.target.closest('.nb-watchlist-deal-complete');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const result=window.NextBonusDealWatchlistLifecycle?.complete?.(button.dataset.offerId);if(result)window.NextBonusWatchlistUI?.refresh?.();},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
const app=document.getElementById('app');if(app)new MutationObserver(queue).observe(app,{childList:true,subtree:true});window.addEventListener('focus',queue);window.addEventListener('pageshow',queue);
})();
