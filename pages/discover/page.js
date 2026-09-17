(() => {
  'use strict';
  window.NextBonusPageRegistry.register('discover',function(ctx){
  const { state, offers, esc, categories, categoryIcon, offerCard }=ctx;

    const q=state.offerSearch.trim().toLowerCase();
    const list=offers.filter(o=> (state.offerCategory==='全部'||o.category===state.offerCategory) && (!q || `${o.name} ${o.provider} ${o.value} ${o.requirement}`.toLowerCase().includes(q)));
    return `<div class="content discover-page">
      <div class="discover-search-row">
        <div class="search-wrap"><span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg></span><input id="offer-search" class="search" value="${esc(state.offerSearch)}" placeholder="搜索信用卡、银行、券商或优惠…" />${state.offerSearch?`<button class="search-clear" data-action="clear-offer-search" aria-label="清除搜索">×</button>`:''}</div>
      </div>
      <div class="filters">${categories.map(c=>`<button class="pill cat-${c} ${state.offerCategory===c?'active':''}" data-action="offer-category" data-category="${c}"><span class="pill-icon">${categoryIcon(c)}</span><span>${c}</span></button>`).join('')}</div>
      ${list.length?`<div class="offer-grid">${list.map(offerCard).join('')}</div>`:`<div class="empty compact-empty"><h3>没有匹配的内容</h3><p>换一个关键词或分类试试。</p></div>`}
    </div>`;
  
  });
})();
