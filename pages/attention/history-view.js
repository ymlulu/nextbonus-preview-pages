(() => {
  'use strict';

  function shortBrand(value){
    return String(value||'NB').split(/\s+/).slice(0,2).map(item=>item[0]||'').join('').toUpperCase().slice(0,3);
  }

  function identity(ctx,item){
    if(typeof ctx.attentionIdentity==='function') return ctx.attentionIdentity(item);
    return {name:item?.product||'',instance:item?.productInstance||''};
  }

  function thumb(ctx,item){
    const product=ctx.state.products.find(p=>p.id===item.productId)||ctx.state.pastProducts.find(p=>p.id===item.productId)||null;
    const id=identity(ctx,item);
    const asset=window.NextBonusProductArtRegistry?.resolveProduct?.(product)||
      window.NextBonusProductArtRegistry?.resolveByName?.(id.name);
    const src=asset?.web||asset?.local||'';
    return src?`<img src="${ctx.esc(src)}" alt="" />`:`<span>${ctx.esc(shortBrand(product?.institution||id.name))}</span>`;
  }

  function detailMeta(item,esc){
    const history=window.NextBonusAttentionHistory;
    const rows=[];
    const period=history.periodLabel(item);
    const deadline=item?.dueDate||item?.source?.dueDate||'';
    if(period) rows.push(['所属周期',period]);
    if(deadline) rows.push(['原截止日期',history.formatLongDate(deadline)]);
    rows.push(['处理时间',history.formatEventTime(item)]);
    rows.push(['操作来源',history.actorLabel(item)]);
    return `<div class="nb-history-event-meta">${rows.map(([label,value])=>`<div><span data-nb-type="caption1" data-nb-tone="secondary">${esc(label)}</span><strong data-nb-type="body">${esc(value)}</strong></div>`).join('')}</div>`;
  }

  function expanded(ctx,item){
    const esc=ctx.esc;
    const correction=!item.isActivityEvent&&item.correction
      ? `<div class="attention-actions"><button class="btn secondary small" data-action="history-correction" data-id="${esc(item.id)}">${esc(item.correction)}</button></div>`
      : '';
    return `<div class="attention-expanded"><div class="attention-expanded-inner">
      <div><p class="attention-summary">${esc(item.summary||'')}</p>${item.key?`<div class="key-card"><strong>${esc(item.key)}</strong>${item.keySub?`<span class="muted">${esc(item.keySub)}</span>`:''}</div>`:''}</div>
      <div><div class="instruction-title">最终结果</div><p class="muted">${esc(item.result||'')}${item.resultReason?` · ${esc(item.resultReason)}`:''}</p>${detailMeta(item,esc)}${correction}</div>
    </div></div>`;
  }

  function render(ctx,item){
    const history=window.NextBonusAttentionHistory;
    const id=identity(ctx,item);
    const expandedNow=ctx.state.expandedAttentionId===item.id;
    const period=history.periodLabel(item);
    return `<div class="attention-item ${item.isActivityEvent?'nb-history-extra':''}">
      <button class="attention-row history-row" data-action="toggle-attention" data-id="${ctx.esc(item.id)}" data-history="1">
        <span class="att-product-cell"><span class="att-thumb">${thumb(ctx,item)}</span><span class="att-product-copy"><strong>${ctx.esc(id.name)}</strong><small>${ctx.esc(id.instance)}</small></span></span>
        <span class="att-action-cell"><strong>${ctx.esc(item.action||'')}</strong>${period?`<small data-nb-period="1">${ctx.esc(period)}</small>`:''}</span>
        <span class="att-time att-time-soft">${ctx.esc(history.formatEventTime(item))}</span>
        <span class="history-status ${ctx.esc(item.statusClass||'')}">${ctx.esc(item.result||'')}</span>
        <span class="chev ${expandedNow?'up':''}">›</span>
      </button>
      ${expandedNow?expanded(ctx,item):''}
    </div>`;
  }

  window.NextBonusAttentionHistoryView=Object.freeze({render,detailMeta});
})();