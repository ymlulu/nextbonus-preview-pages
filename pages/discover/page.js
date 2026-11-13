(() => {
  'use strict';
  function pagination({page,pageCount,total}){
    if(pageCount<=1)return '';
    const first=Math.max(1,Math.min(page-2,pageCount-4));
    const count=Math.min(5,pageCount);
    const numbers=Array.from({length:count},(_,index)=>first+index);
    const button=(number,label,active=false,disabled=false)=>`<button type="button" class="discover-pagination-button ${active?'is-active':''}" data-action="discover-page" data-page="${number}" aria-label="${label}" ${active?'aria-current="page"':''} ${disabled?'disabled':''}>${label}</button>`;
    return `<nav class="discover-pagination" aria-label="发现结果分页">
      <span class="discover-pagination-total">共 ${total} 条 · 每页 20 条</span>
      <div class="discover-pagination-controls">
        ${button(page-1,'上一页',false,page===1)}
        ${numbers.map(number=>button(number,String(number),number===page)).join('')}
        ${button(page+1,'下一页',false,page===pageCount)}
      </div>
    </nav>`;
  }

  window.NextBonusPageRegistry.register('discover',function(ctx){
    window.NextBonusEvents?.bind('discover',ctx);
    const { state, esc, categories, categoryIcon, offerCard }=ctx;
    const model=window.NextBonusPageModels?.discover;
    if(!model) throw new Error('Discover page model unavailable');
    const {items,pageItems,page,pageCount,total,categories:availableCategories,category,sort}=model.build({...ctx,offers:ctx.discoverOffers||[]});
    const catalog=window.NextBonusDealsCatalog;
    const catalogState=catalog?.isConfigured?.()?catalog.getState():null;
    // Normal API loading is silent: other approved offers can be browsed immediately.
    // Only surface a recoverable error if Deals failed and no cached Deals exist.
    const statusMessage=catalogState?.status==='error'&&!catalog?.list?.()?.length
      ?'<div class="nb-deals-status is-error">Deals 暂时无法加载。 <button type="button" data-action="discover-retry-deals">重试</button></div>':'';
    const sourceStatuses=[
      catalogState?.status,
      window.NextBonusCreditCardsCatalog?.getState?.()?.status,
      window.NextBonusDiscoverBankOffers?.getState?.()?.status
    ];
    const stillLoading=sourceStatuses.some(status=>['idle','loading','refreshing'].includes(status));
    const emptyState=stillLoading
      ?'<div class="empty compact-empty"><h3>正在加载优惠…</h3><p>正在读取最新信用卡、银行和 Deals 数据。</p></div>'
      :'<div class="empty compact-empty"><h3>没有匹配的内容</h3><p>换一个关键词或分类试试。</p></div>';

    return `<div class="content discover-page">
      <header class="nb-primary-page-head"><h1>发现</h1></header>
      <div class="discover-search-row ${state.offerSearch?'has-query':''}">
        <div class="search-wrap">
          <span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg></span>
          <input id="discover-search" class="search" value="${esc(state.offerSearch)}" placeholder="搜索信用卡、银行、券商或优惠…" aria-label="搜索" />
          ${state.offerSearch?`<button class="search-clear nb-icon-button nb-icon-button--round nb-icon-button--soft" data-action="discover-clear-search" aria-label="清除搜索">${window.NextBonusIcons?.svg?.('close')||''}</button>`:''}
        </div>
      </div>
      <div class="discover-toolbar">
        <div class="discover-sort" role="group" aria-label="内容排序">
          <button type="button" class="discover-sort-button ${sort==='personal'?'is-active':''}" data-action="discover-sort" data-sort="personal" data-nb-type="${sort==='personal'?'title3':'callout'}" aria-pressed="${sort==='personal'}">为你推荐</button>
          <button type="button" class="discover-sort-button ${sort==='latest'?'is-active':''}" data-action="discover-sort" data-sort="latest" data-nb-type="${sort==='latest'?'title3':'callout'}" aria-pressed="${sort==='latest'}">最新发布</button>
        </div>
        <div class="filters discover-filters" role="group" aria-label="分类筛选">${availableCategories.map(c=>`<button class="pill cat-${esc(c)} ${category===c?'active':''}" data-action="discover-category" data-category="${esc(c)}"><span class="pill-icon">${categoryIcon(c)}</span><span>${esc(c)}</span></button>`).join('')}</div>
      </div>
      ${statusMessage}
      ${items.length?`<div class="offer-grid">${pageItems.map(offerCard).join('')}</div>${pagination({page,pageCount,total})}`:emptyState}
    </div>`;
  });
})();
