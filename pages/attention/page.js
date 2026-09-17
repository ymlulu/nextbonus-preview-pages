(() => {
  'use strict';
  window.NextBonusPageRegistry.register('attention',function(ctx){
  const { state, esc, uniqueAttentionProducts, activeAttentionSorted, currentActiveAttention, historyBucket, historyDateISO, attentionItem }=ctx;

    if(!state.loggedIn) return ctx.renderRoute('login');
    const productOptions=uniqueAttentionProducts();
    const af=state.attentionProductFilter;
    const active=activeAttentionSorted(currentActiveAttention().filter(a=>af==='all'||a.productId===af));
    let hist=state.attentionHistory.filter(a=>af==='all'||a.productId===af);
    if(state.historyStatusFilter!=='all') hist=hist.filter(h=>historyBucket(h)===state.historyStatusFilter);
    hist=hist.sort((a,b)=>String(historyDateISO(b.ended)||b.dueDate||'').localeCompare(String(historyDateISO(a.ended)||a.dueDate||''))||String(b.id).localeCompare(String(a.id)));
    const visible=Math.max(20,state.historyVisibleCount||20), shownHist=hist.slice(0,visible), hasMore=hist.length>shownHist.length;
    return `<div class="content narrow attention-page"><div class="mock-page-top attention-top"><div><h1 class="mock-page-title">全部提醒</h1></div><select class="select mock-filter-select" id="attention-product-filter"><option value="all">全部产品</option>${productOptions.map(p=>`<option value="${p.id}" ${af===p.id?'selected':''}>${esc(p.label)}</option>`).join('')}</select></div>
      <div class="attention-toolbar"><div class="tabs mock-tabs"><button class="tab ${state.attentionTab==='active'?'active':''}" data-action="attention-tab" data-tab="active">待处理 (${active.length})</button><button class="tab ${state.attentionTab==='history'?'active':''}" data-action="attention-tab" data-tab="history">历史记录</button></div>${state.attentionTab==='history'?`<select class="select mock-status-select" id="history-status-filter"><option value="all">全部状态</option><option value="completed" ${state.historyStatusFilter==='completed'?'selected':''}>已完成</option><option value="skipped" ${state.historyStatusFilter==='skipped'?'selected':''}>本期已忽略</option><option value="expired" ${state.historyStatusFilter==='expired'?'selected':''}>已到期</option><option value="stopped" ${state.historyStatusFilter==='stopped'?'selected':''}>已结束</option></select>`:''}</div>
      ${af!=='all'?`<div class="active-filter-chip">已筛选当前产品 <button data-action="clear-attention-filter">清除筛选</button></div>`:''}
      ${state.attentionTab==='active'?`<div class="attention-box all-attention-box">${active.length?active.map(a=>attentionItem(a,false)).join(''):`<div class="attention-compact-empty success-empty"><span class="success-dot">✓</span><div><strong>目前没有需要处理的事项</strong></div></div>`}</div>`:
      `<div class="attention-box all-attention-box history-attention-box">${shownHist.length?shownHist.map(h=>attentionItem(h,true)).join(''):`<div class="attention-compact-empty">还没有历史记录</div>`}</div>${hasMore?`<div class="load-more-wrap"><button class="btn secondary" data-action="history-load-more">加载更多</button></div>`:''}`}
    </div>`;
  
  });
})();
