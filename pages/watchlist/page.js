(() => {
  'use strict';

  function thumb(info,esc){
    const visual=info?.visual;
    const name=info?.product?.name||info?.offerId||'NB';
    if(visual?.src){
      return `<span class="nb-watchlist-thumb ${visual.kind==='logo'?'is-logo':'is-image'}"><img src="${esc(visual.src)}" alt="" /></span>`;
    }
    const initials=name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase().slice(0,3);
    return `<span class="nb-watchlist-thumb is-fallback"><b>${esc(initials||'NB')}</b></span>`;
  }

  function itemCard(view,esc){
    const {item,info,statusLabel,statusTone,meta,dealCompletable}=view;
    const saved=item.stage==='saved';
    return `<article class="nb-watchlist-item${saved?' is-saved':''}" data-action="open-offer" data-id="${esc(item.offerId)}" tabindex="0" role="button" aria-label="${esc(info.product.name)}">
      ${thumb(info,esc)}
      <span class="nb-watchlist-copy">
        <span class="nb-watchlist-provider">${esc(info.product.provider||'')}</span>
        <strong>${esc(info.product.name)}</strong>
        <small>${esc(meta)}</small>
      </span>
      <span class="nb-watchlist-value">${esc(info.fact.primaryValue||'')}</span>
      ${saved?'':`<span class="nb-watchlist-status tone-${esc(statusTone)}">${esc(statusLabel)}</span>`}
      ${dealCompletable?`<button type="button" class="nb-watchlist-deal-complete" data-action="watchlist-deal-complete" data-id="${esc(item.offerId)}">已完成</button>`:''}
      <span class="nb-watchlist-chevron" aria-hidden="true">›</span>
    </article>`;
  }

  function section(title,items,cls,subtitle,esc){
    if(!items.length&&cls==='in-progress')return '';
    if(!items.length){
      return `<section class="nb-watchlist-section ${cls}">
        <div class="nb-watchlist-section-head"><div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><span class="nb-watchlist-count">0</span></div>
        <div class="nb-watchlist-section-empty">暂时没有内容</div>
      </section>`;
    }
    return `<section class="nb-watchlist-section ${cls}">
      <div class="nb-watchlist-section-head"><div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><span class="nb-watchlist-count">${items.length}</span></div>
      <div class="nb-watchlist-list">${items.map(item=>itemCard(item,esc)).join('')}</div>
    </section>`;
  }

  function historySection(items,open,esc){
    if(!items.length)return '';
    return `<section class="nb-watchlist-history ${open?'is-open':''}">
      <button class="nb-watchlist-history-head" type="button" data-action="watchlist-history-toggle" aria-expanded="${open?'true':'false'}">
        <span><strong>历史记录</strong><small>${items.length}</small></span><span class="nb-watchlist-history-chevron">›</span>
      </button>
      ${open?`<div class="nb-watchlist-history-body">${items.map(item=>itemCard(item,esc)).join('')}</div>`:''}
    </section>`;
  }

  window.NextBonusPageRegistry.register('wishlist',function(ctx){
    window.NextBonusEvents?.bind('wishlist',ctx);
    if(!ctx.state.loggedIn)return ctx.renderRoute('login');
    const model=window.NextBonusPageModels?.watchlist;
    if(!model)throw new Error('Watchlist page model unavailable');
    const {inProgress,saved,history,empty}=model.build(ctx);
    const historyOpen=!!ctx.state.watchlistHistoryOpen;

    return `<div class="content wishlist-page nb-watchlist-page">
      <div class="nb-watchlist-header"><div><h1>关注</h1><p>正在进行、以后想做，以及已经结束的 Offer。</p></div></div>
      ${empty?`<div class="nb-watchlist-empty"><div class="nb-watchlist-empty-icon">♡</div><h2>还没有关注的内容</h2><p>看到感兴趣或准备以后做的 Offer，点一下关注。</p><button class="mock-add-btn" data-action="nav" data-route="discover">去发现</button></div>`:
      `${section('进行中',inProgress,'in-progress','你已经开始处理的申请或活动，完成后会进入历史记录。',ctx.esc)}
       ${section('已关注',saved,'saved','感兴趣，准备以后再看或开始。',ctx.esc)}
       ${historySection(history,historyOpen,ctx.esc)}`}
    </div>`;
  });
})();