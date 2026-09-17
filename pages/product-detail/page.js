(() => {
  'use strict';
  window.NextBonusPageRegistry.register('product-detail',function(ctx){
  const { state, currentProduct, openLogin, activeAttentionSorted, currentActiveAttention, productCardDisplay, productTimelineItems, editProductPage, esc, shortBrand, formatLongDate, earningBlock, pdAttentionItem, benefitsFor, benefitCard, timelineFor }=ctx;

    if(!state.loggedIn){ openLogin('product-detail',null,'products'); return ''; }
    const p=currentProduct();
    if(state.editFlow && state.editFlow.productId===p.id) return editProductPage(p);
    const related=activeAttentionSorted(currentActiveAttention().filter(a=>a.productId===p.id));
    const top=related.slice(0,3);
    const isPast=state.pastProducts.some(x=>x.id===p.id);
    const detailArt=productCardDisplay(p,true);
    const timeline=productTimelineItems(p);
    return `<div class="content v4-product-detail-page">
      <section class="v4-pd-overview">
        <div class="v4-pd-left"><div class="v4-pd-card ${p.type==='信用卡'?'credit-card-art':''}">${detailArt.primarySrc?`<img src="${detailArt.primarySrc}"${detailArt.fallbackAttr} alt="${esc(p.name)}" />`:`<span class="fallback-brand large">${esc(shortBrand(p.institution))}</span>`}</div>${(p.phone||p.loginUrl)?`<div class="v4-pd-actions">${p.phone?`<button data-action="product-call" data-phone="${esc(p.phone)}">☎ <span>致电</span></button>`:''}${p.phone&&p.loginUrl?'<i></i>':''}${p.loginUrl?`<button data-action="product-login-external" data-url="${esc(p.loginUrl)}">↗ <span>登录</span></button>`:''}</div>`:''}</div>
        <div class="v4-pd-right"><div class="v4-pd-title-row"><div><h1>${esc(p.name)}</h1><div class="v4-pd-status"><span>${esc(p.instance||'')}</span>${p.instance?'<i></i>':''}<b class="${isPast?'past':''}"></b><strong>${isPast?'历史产品':esc(p.status||'不确定')}</strong></div></div>${isPast?'':`<button class="v4-pd-edit" data-action="edit-product">✎　编辑</button>`}</div>
          <div class="v4-pd-facts"><div><span class="fact-icon">▣</span><span><small>${p.type==='信用卡'?'开卡日期':'开户日期'}</small><strong>${p.opened?formatLongDate(p.opened):'未填写'}</strong></span></div>${p.type==='信用卡'?`<div><span class="fact-icon">♙</span><span><small>周年日</small><strong>${esc(p.anniversary||'—')}</strong></span></div><div><span class="fact-icon">$</span><span><small>年费</small><strong>${esc(p.annualFee||'—')}</strong></span></div>`:''}</div>
          ${earningBlock(p)}
        </div>
      </section>
      ${related.length?`<section class="v4-pd-section v4-pd-attention"><div class="v4-section-head"><h2>需要关注 <span class="attention-count-dot">${related.length}</span></h2>${related.length>3?`<button class="mock-link" data-action="attention-for-product" data-id="${p.id}">查看全部 ${related.length}</button>`:''}</div><div class="v4-pd-attention-list">${top.map(pdAttentionItem).join('')}</div></section>`:''}
      <section class="v4-pd-section v4-pd-benefits"><div class="v4-section-head"><h2>福利</h2></div>${benefitsFor(p).length?`<div class="benefit-grid pd-benefit-grid">${benefitsFor(p).map(benefitCard).join('')}</div>`:`<div class="timeline-empty">暂时没有可展示的结构化福利信息</div>`}</section>
      <section class="v4-pd-section v4-pd-history"><button class="v4-past-head" data-action="toggle-product-history"><span>历史记录 <b>${timeline.length}</b></span><span class="chev ${state.productHistoryOpen?'up':''}">›</span></button>${state.productHistoryOpen?timelineFor(p,timeline):''}</section>
    </div>`;
  
  });
})();
