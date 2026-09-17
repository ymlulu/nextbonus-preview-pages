(() => {
  'use strict';
  window.NextBonusPageRegistry.register('products',function(ctx){
    window.NextBonusEvents?.bind('products',ctx);
    const { state, esc, productPageAttentionItem, productSection }=ctx;
    if(!state.loggedIn) return ctx.renderRoute('login');
    const model=window.NextBonusPageModels?.wallet;
    if(!model) throw new Error('Wallet page model unavailable');
    const {grouped,allActive,top3}=model.build(ctx);

    return `<div class="content products-page v4-products-page">
      <div class="v4-products-head"><div><h1>我的产品</h1><div>${state.products.length} 个产品</div></div><button class="mock-add-btn v4-add-product" data-action="open-add-product">＋ <span>添加产品</span></button></div>
      <div class="product-tools v4-product-search"><div class="search-wrap"><span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg></span><input id="wallet-search" class="search" value="${esc(state.productSearch)}" placeholder="搜索你的产品、银行、信用卡或账户…" />${state.productSearch?`<button class="search-clear" data-action="wallet-clear-product-search">×</button>`:''}</div></div>
      <section class="v4-product-section-card v4-needs-attention"><div class="v4-section-head"><h2>需要关注 <span class="attention-count-dot">${allActive.length}</span></h2><button class="mock-link" data-action="open-all-attention">全部提醒　&gt;</button></div>${top3.length?`<div class="v4-pp-attention-list">${top3.map(productPageAttentionItem).join('')}</div>`:`<div class="attention-zero-state">目前没有需要处理的事项</div>`}</section>
      ${grouped.length?grouped.map(([type,arr])=>productSection(type,arr)).join(''):(state.products.length===0&&!state.productSearch?`<div class="empty section"><h3>还没有添加产品</h3><p>把你正在持有的信用卡、银行账户、券商账户或会籍加入 NextBonus。</p><button class="btn primary" data-action="open-add-product">添加产品</button></div>`:`<div class="empty section"><h3>没有匹配的产品</h3><p>清除搜索词后可恢复全部当前产品。</p></div>`)}
      ${state.pastProducts.length?`<section class="v4-product-section-card v4-past-products"><button class="v4-past-head" data-action="wallet-toggle-past"><span>历史产品 <b>${state.pastProducts.length}</b></span><span class="chev ${state.pastOpen?'up':''}">›</span></button>${state.pastOpen?`<div class="v4-past-list">${state.pastProducts.map(p=>`<button class="v4-past-row" data-action="open-product" data-id="${p.id}"><span>${esc(p.name)} ${esc(p.instance||'')}</span><small>${esc(p.statusText||p.status)}</small><b>›</b></button>`).join('')}</div>`:''}</section>`:''}
    </div>`;
  });
})();
