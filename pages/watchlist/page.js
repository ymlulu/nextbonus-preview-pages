(() => {
  'use strict';
  window.NextBonusPageRegistry.register('wishlist',function(ctx){
  const { state, offers, esc, offerCard }=ctx;

    if(!state.loggedIn) return ctx.renderRoute('login');
    const index=new Map(state.savedOfferIds.map((id,i)=>[id,i]));
    const priority=o=>{
      if(['新奖励'].includes(o.status)) return 1;
      if(['今日截止','即将结束'].includes(o.status)) return 2;
      if(o.status) return 3;
      return 4;
    };
    const active=state.savedOfferIds.map(id=>offers.find(o=>o.id===id)).filter(Boolean).sort((a,b)=>priority(a)-priority(b)||(index.get(b.id)??0)-(index.get(a.id)??0));
    const unavailable=state.unavailableSavedIds.map(id=>offers.find(o=>o.id===id)).filter(Boolean);
    const count=active.length+unavailable.length;
    const empty=count===0;
    return `<div class="content wishlist-page">
      <div class="mock-page-top wishlist-head"><div><h1 class="mock-page-title">收藏</h1><div class="mock-page-subtitle">你收藏、还没决定的 Offer。</div></div><div class="mock-page-count">共 ${count} 个收藏</div></div>
      ${empty?`<div class="empty mock-empty-state"><div class="empty-icon">♡</div><h3>还没有收藏的内容</h3><p>看到感兴趣的优惠时，点一下收藏，就可以稍后回来继续看。</p><button class="mock-add-btn" data-action="nav" data-route="discover">去发现</button></div>`:
      `<div class="offer-grid wishlist-grid">${active.map(offerCard).join('')}</div>
       ${unavailable.length?`<section class="wishlist-unavailable"><button class="past-products-head" data-action="toggle-unavailable"><span>已结束或不可用 <b>${unavailable.length}</b></span><span class="chev ${state.wishlistUnavailableOpen?'up':''}">›</span></button>${state.wishlistUnavailableOpen?`<div class="offer-grid wishlist-grid unavailable-grid">${unavailable.map(o=>offerCard({...o,status:'已结束或不可用'})).join('')}</div>`:''}</section>`:''}`}
    </div>`;
  
  });
})();
