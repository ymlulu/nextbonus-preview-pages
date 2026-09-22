(() => {
  'use strict';

  function shortBrand(value){
    return String(value||'NB').split(/\s+/).slice(0,2).map(item=>item[0]||'').join('').toUpperCase().slice(0,3);
  }

  function thumb(ctx,item,identity){
    const product=ctx.state.products.find(p=>p.id===item.productId)||ctx.state.pastProducts.find(p=>p.id===item.productId)||null;
    const asset=window.NextBonusProductArtRegistry?.resolveProduct?.(product)||
      window.NextBonusProductArtRegistry?.resolveByName?.(identity.name);
    const src=asset?.web||asset?.local||'';
    return src?`<img src="${ctx.esc(src)}" alt="" />`:`<span>${ctx.esc(shortBrand(product?.institution||identity.name))}</span>`;
  }

  function attentionDateLabel(item){
    const raw=String(item?.dueDate||'').slice(0,10);
    const match=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match) return String(item?.time||'');
    const year=Number(match[1]);
    const month=Number(match[2]);
    const day=Number(match[3]);
    const now=new Date();
    const date=year===now.getFullYear()?`${month} 月 ${day} 日`:`${year} 年 ${month} 月 ${day} 日`;
    const suffix=item.type==='bonus'?'截止'
      :item.type==='benefit'?'到期'
      :item.type==='annual'?'收取'
      :item.type==='change'?'生效'
      :'';
    return suffix?`${date} ${suffix}`:date;
  }

  function attentionSecondary(item){
    const secondary=String(item?.secondary||'').trim();
    if(item?.type==='change'&&/^生效日期\s*/.test(secondary)) return '年费及部分福利发生调整';
    return secondary;
  }

  function activeItem(ctx,item){
    const {state,esc,attentionIdentity}=ctx;
    const expanded=state.expandedAttentionId===item.id;
    const timeLabel=attentionDateLabel(item);
    const secondary=attentionSecondary(item);
    const tone=item.type==='bonus'||item.type==='benefit'?'due':item.type==='change'?'info':'soft';
    const identity=attentionIdentity(item);
    const details=window.NextBonusAttentionUI;
    if(!details) throw new Error('Attention UI unavailable');
    return `<div class="attention-item"><button class="attention-row" data-action="toggle-attention" data-id="${esc(item.id)}" data-history="0">
      <span class="att-product-cell"><span class="att-thumb">${thumb(ctx,item,identity)}</span><span class="att-product-copy"><strong>${esc(identity.name)}</strong><small>${esc(identity.instance)}</small></span></span>
      <span class="att-action-cell"><strong>${esc(item.action)}</strong>${secondary?`<small>${esc(secondary)}</small>`:''}</span>
      <span class="att-time att-time-${tone}">${esc(timeLabel)}</span><span class="chev ${expanded?'up':''}">›</span>
    </button>${expanded?details.expanded(ctx,item):''}</div>`;
  }

  window.NextBonusPageRegistry.register('attention',function(ctx){
    window.NextBonusEvents?.bind('attention',ctx);
    const { state, esc }=ctx;
    if(!state.loggedIn) return ctx.renderRoute('login');
    const model=window.NextBonusPageModels?.attention;
    if(!model) throw new Error('Attention page model unavailable');
    const {active,shownHistory,hasMore}=model.build(ctx);
    const historyView=window.NextBonusAttentionHistoryView;
    if(!historyView) throw new Error('Attention history view unavailable');

    return `<div class="content narrow attention-page"><div class="mock-page-top attention-top"><div><h1 class="mock-page-title">提醒</h1></div></div>
      <div class="attention-toolbar"><div class="tabs mock-tabs"><button class="tab ${state.attentionTab==='active'?'active':''}" data-action="attention-view-tab" data-tab="active">待处理 (${active.length})</button><button class="tab ${state.attentionTab==='history'?'active':''}" data-action="attention-view-tab" data-tab="history">历史记录</button></div></div>
      ${state.attentionTab==='active'?`<div class="attention-box all-attention-box">${active.length?active.map(item=>activeItem(ctx,item)).join(''):`<div class="attention-compact-empty success-empty"><span class="success-dot">✓</span><div><strong>目前没有需要处理的事项</strong></div></div>`}</div>`:
      `<div class="attention-box all-attention-box history-attention-box">${shownHistory.length?shownHistory.map(item=>historyView.render(ctx,item)).join(''):`<div class="attention-compact-empty">还没有历史记录</div>`}</div>${hasMore?`<div class="load-more-wrap"><button class="btn secondary" data-action="attention-history-load-more">加载更多</button></div>`:''}`}
    </div>`;
  });
})();
