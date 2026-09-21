(() => {
  'use strict';

  const PRODUCT_TILE_COPY=Object.freeze({
    'p-chase-checking':['Chase','Total Checking'],
    'p-fidelity':['Fidelity','Cash Management Account'],
    'p-robinhood':['Robinhood','Brokerage Account'],
    'p-truist':['Truist','One Checking'],
    'p-usbank':['U.S. Bank','Smartly Checking'],
    'p-wf-checking':['Wells Fargo','Everyday Checking'],
    'p-delta-status':['Delta SkyMiles','Platinum'],
    'p-hilton':['Hilton Honors','Diamond'],
    'p-ihg':['IHG One Rewards','Platinum'],
    'p-marriott-status':['Marriott Bonvoy','Titanium'],
    'p-hyatt':['World of Hyatt','Globalist']
  });

  function productInfoTileCopy(product){
    if(PRODUCT_TILE_COPY[product.id]) return PRODUCT_TILE_COPY[product.id];
    if(product.type==='其他') return [product.name,product.instance||product.institution||''];
    return [product.institution||product.name,product.instance||product.name||''];
  }

  function productTile(ctx,product){
    const {state,esc,productCardDisplay,shortBrand}=ctx;
    const isCredit=product.type==='信用卡';
    if(isCredit){
      const art=productCardDisplay(product,false);
      const fallbackLabel=shortBrand(product.institution||product.name);
      const expanded=state.walletCardExpandedId===product.id;
      return `<button class="v4-owned-product-card credit-tile ${expanded?'nb-wallet-card-expanded':''}" data-action="open-product" data-id="${esc(product.id)}" aria-label="${esc(product.name)}" aria-expanded="${expanded?'true':'false'}"><span class="v4-owned-product-art">${art.primarySrc?`<img src="${art.primarySrc}"${art.fallbackAttr} alt="${esc(product.name)}" />`:`<span class="fallback-brand">${esc(fallbackLabel)}</span>`}</span><span class="owned-product-meta"><strong>${esc(product.name)}</strong><small>${esc(product.instance||product.institution||'')}</small></span><span class="owned-product-chevron">›</span></button>`;
    }
    const [primary,secondary]=productInfoTileCopy(product);
    const logo=window.NextBonusProductLogoRegistry?.resolve?.(product.id,product.offerId,product.name)||'';
    return `<button class="v4-owned-product-card compact-tile v10-info-tile" data-action="open-product" data-id="${esc(product.id)}" aria-label="${esc(product.name)}"><span class="v10-info-logo" data-product-id="${esc(product.id)}">${logo?`<img src="${logo}" alt="" />`:`<span class="v10-logo-fallback">${esc(shortBrand(product.institution||product.name))}</span>`}</span><span class="v10-info-copy"><strong>${esc(primary)}</strong><small>${esc(secondary)}</small></span><span class="v10-info-chevron">›</span></button>`;
  }

  function productSection(ctx,section){
    const {esc}=ctx;
    const {type,items,shown,expanded,collapsible,hidden,reliableDates,sortOpen,className}=section;
    return `<section class="v4-product-section-card v4-product-section ${className}"><div class="v4-section-head"><h2>${esc(type)} <span class="section-count">${items.length}</span></h2>${collapsible&&expanded?`<div class="product-sort-wrap"><button class="product-sort-button" data-action="toggle-product-sort" data-type="${esc(type)}">排序 ▾</button>${sortOpen?`<div class="product-sort-menu"><button data-action="product-sort" data-type="${esc(type)}" data-value="default">默认顺序</button><button data-action="product-sort" data-type="${esc(type)}" data-value="recent">最近添加</button>${reliableDates?`<button data-action="product-sort" data-type="${esc(type)}" data-value="date-desc">日期：最新优先</button><button data-action="product-sort" data-type="${esc(type)}" data-value="date-asc">日期：最早优先</button>`:''}</div>`:''}</div>`:''}</div><div class="v4-owned-product-grid ${type==='信用卡'&&shown.length>1?'nb-wallet-card-stack':''}">${shown.map(product=>productTile(ctx,product)).join('')}</div>${collapsible?`<button class="v4-show-more" data-action="toggle-product-section" data-type="${esc(type)}">${expanded?'收起':'再显示 '+hidden+' 个'} <span>${expanded?'⌃':'⌄'}</span></button>`:''}</section>`;
  }

  function attentionItem(ctx,item){
    const {state,esc,attentionIdentity}=ctx;
    const expanded=state.expandedAttentionId===item.id;
    const tone=item.id==='a-bonus-plat'?'urgent':item.id==='a-hilton-credit'?'soon':'normal';
    const identity=attentionIdentity(item);
    const label=[identity.name,identity.instance].filter(Boolean).join(' ');
    const details=window.NextBonusAttentionUI;
    if(!details) throw new Error('Attention UI unavailable');
    return `<div class="v4-pp-attention-item"><button class="v4-pp-attention-row" data-action="toggle-attention" data-id="${esc(item.id)}" data-history="0"><span class="v4-pp-product">${esc(label)}</span><span class="v4-pp-action">${esc(item.action)}</span><span class="v4-pp-time tone-${tone}">${esc(item.time)}</span><span class="v4-pp-chevron">›</span></button>${expanded?details.expanded(ctx,item):''}</div>`;
  }

  window.NextBonusPageRegistry.register('products',function(ctx){
    window.NextBonusEvents?.bind('products',ctx);
    const { state, esc }=ctx;
    if(!state.loggedIn) return ctx.renderRoute('login');
    const model=window.NextBonusPageModels?.wallet;
    if(!model) throw new Error('Wallet page model unavailable');
    const {grouped,allActive,top3}=model.build(ctx);

    return `<div class="content products-page v4-products-page">
      <div class="v4-products-head"><div><h1>钱包</h1></div><button class="mock-add-btn v4-add-product" data-action="open-add-product">＋ <span>添加产品</span></button></div>
      <section class="v4-product-section-card v4-needs-attention"><div class="v4-section-head"><h2>待处理 <span class="attention-count-dot">${allActive.length}</span></h2><button class="mock-link" data-action="open-all-attention">查看全部 ›</button></div>${top3.length?`<div class="v4-pp-attention-list">${top3.map(item=>attentionItem(ctx,item)).join('')}</div>`:`<div class="attention-zero-state">暂无待处理事项</div>`}</section>
      ${grouped.length?grouped.map(([, ,section])=>productSection(ctx,section)).join(''):`<div class="empty section"><h3>还没有添加产品</h3><p>把你正在持有的信用卡、银行账户、券商账户或会籍加入 NextBonus。</p><button class="btn primary" data-action="open-add-product">添加产品</button></div>`}
      ${state.pastProducts.length?`<section class="v4-past-products ${state.pastOpen?'is-open':''}"><button class="v4-past-head" type="button" data-action="wallet-toggle-past" aria-expanded="${state.pastOpen?'true':'false'}"><span class="v4-past-head-title"><strong data-nb-type="headline" data-nb-emphasis="true">历史产品</strong><small>${state.pastProducts.length}</small></span><span class="v4-past-head-chevron" aria-hidden="true">›</span></button>${state.pastOpen?`<div class="v4-past-list">${state.pastProducts.map(product=>`<button class="v4-past-row" type="button" data-action="open-product" data-id="${esc(product.id)}"><strong class="v4-past-row-title" data-nb-type="subheadline" data-nb-emphasis="true">${esc(product.name)} ${esc(product.instance||'')}</strong><small class="v4-past-row-status">${esc(product.statusText||product.status)}</small><span class="v4-past-row-chevron" aria-hidden="true">›</span></button>`).join('')}</div>`:''}</section>`:''}
    </div>`;
  });
})();
