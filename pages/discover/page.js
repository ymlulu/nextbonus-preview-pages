(() => {
  'use strict';
  window.NextBonusPageRegistry.register('discover',function(ctx){
    window.NextBonusEvents?.bind('discover',ctx);
    const { state, esc, categories, categoryIcon, offerCard }=ctx;
    const model=window.NextBonusPageModels?.discover;
    if(!model) throw new Error('Discover page model unavailable');
    const {items}=model.build(ctx);

    return `<div class="content discover-page">
      <header class="nb-primary-page-head"><h1>发现</h1></header>
      <div class="discover-search-row">
        <div class="search-wrap"><span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg></span><input id="discover-search" class="search" value="${esc(state.offerSearch)}" placeholder="搜索信用卡、银行、券商或优惠…" />${state.offerSearch?`<button class="search-clear" data-action="discover-clear-search" aria-label="清除搜索">×</button>`:''}</div>
      </div>
      <div class="filters">${categories.map(c=>`<button class="pill cat-${c} ${state.offerCategory===c?'active':''}" data-action="discover-category" data-category="${c}"><span class="pill-icon">${categoryIcon(c)}</span><span>${c}</span></button>`).join('')}</div>
      ${items.length?`<div class="offer-grid">${items.map(offerCard).join('')}</div>`:`<div class="empty compact-empty"><h3>没有匹配的内容</h3><p>换一个关键词或分类试试。</p></div>`}
    </div>`;
  });
})();
