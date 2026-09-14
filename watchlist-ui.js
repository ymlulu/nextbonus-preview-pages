(() => {
  'use strict';

  const LEGACY_KEY = 'nextbonus-local-v8-state';
  let historyOpen = false;
  let lastLegacySnapshot = null;
  let queued = false;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));

  function offerInfo(offerId){
    const fact = window.NextBonusOfferData?.[offerId] || null;
    const product = fact ? window.NextBonusOfferProducts?.[fact.productId] : null;
    if(!fact || !product) return null;
    const visual = window.NextBonusOfferVisuals?.[product.visualId || offerId] || null;
    return { offerId, fact, product, visual };
  }

  function syncLegacy(){
    const api = window.NextBonusWatchlistState;
    if(!api) return;
    let raw = null;
    try { raw = localStorage.getItem(LEGACY_KEY); } catch (_) { return; }
    if(!raw || raw === lastLegacySnapshot) return;
    lastLegacySnapshot = raw;
    try { api.syncLegacyStateObject(JSON.parse(raw)); } catch (_) {}
  }

  function formatDate(value){
    if(!value) return '';
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
  }

  function statusView(item){
    const status = String(item?.status || '');
    const table = {
      saved:['已关注','neutral'],
      in_progress:['进行中','active'],
      deal_active:['进行中','active'],
      awaiting_result:['待确认申请结果','pending'],
      pending:['审核中','pending'],
      waiting_reward:['等待到账','pending'],
      approved:['申请通过','success'],
      denied:['未通过','danger'],
      not_submitted:['未提交','neutral'],
      completed:['已完成','success'],
      expired:['已结束','neutral'],
      failed:['未完成','danger']
    };
    return table[status] || [item?.stage === 'history' ? '已结束' : item?.stage === 'in_progress' ? '进行中' : '已关注', item?.stage === 'in_progress' ? 'active' : 'neutral'];
  }

  function thumb(info){
    const visual = info?.visual;
    const name = info?.product?.name || info?.offerId || 'NB';
    if(visual?.src){
      return `<span class="nb-watchlist-thumb ${visual.kind === 'logo' ? 'is-logo' : 'is-image'}"><img src="${esc(visual.src)}" alt="" /></span>`;
    }
    const initials = name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase().slice(0,3);
    return `<span class="nb-watchlist-thumb is-fallback"><b>${esc(initials || 'NB')}</b></span>`;
  }

  function itemCard(item){
    const info = offerInfo(item.offerId);
    if(!info) return '';
    const [label,tone] = statusView(item);
    const date = item.stage === 'history' ? formatDate(item.completedAt || item.updatedAt) : '';
    const meta = item.stage === 'history'
      ? [label, date].filter(Boolean).join(' · ')
      : info.fact.primaryRequirement || '';
    return `<article class="nb-watchlist-item" data-action="open-offer" data-id="${esc(item.offerId)}" tabindex="0" role="button" aria-label="${esc(info.product.name)}">
      ${thumb(info)}
      <span class="nb-watchlist-copy">
        <span class="nb-watchlist-provider">${esc(info.product.provider || '')}</span>
        <strong>${esc(info.product.name)}</strong>
        <small>${esc(meta)}</small>
      </span>
      <span class="nb-watchlist-value">${esc(info.fact.primaryValue || '')}</span>
      <span class="nb-watchlist-status tone-${esc(tone)}">${esc(label)}</span>
      <span class="nb-watchlist-chevron" aria-hidden="true">›</span>
    </article>`;
  }

  function section(title, items, cls, subtitle=''){
    if(!items.length && cls === 'in-progress') return '';
    if(!items.length){
      return `<section class="nb-watchlist-section ${cls}">
        <div class="nb-watchlist-section-head"><div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><span class="nb-watchlist-count">0</span></div>
        <div class="nb-watchlist-section-empty">暂时没有内容</div>
      </section>`;
    }
    return `<section class="nb-watchlist-section ${cls}">
      <div class="nb-watchlist-section-head"><div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><span class="nb-watchlist-count">${items.length}</span></div>
      <div class="nb-watchlist-list">${items.map(itemCard).join('')}</div>
    </section>`;
  }

  function historySection(items){
    if(!items.length) return '';
    return `<section class="nb-watchlist-history ${historyOpen?'is-open':''}">
      <button class="nb-watchlist-history-head" type="button" data-nb-watchlist-action="toggle-history" aria-expanded="${historyOpen?'true':'false'}">
        <span><strong>历史记录</strong><small>${items.length}</small></span><span class="nb-watchlist-history-chevron">›</span>
      </button>
      ${historyOpen?`<div class="nb-watchlist-history-body">${items.map(itemCard).join('')}</div>`:''}
    </section>`;
  }

  function renderWatchlistPage(){
    const page = document.querySelector('.wishlist-page');
    const api = window.NextBonusWatchlistState;
    if(!page || !api) return;
    syncLegacy();
    const store = api.read();
    const inProgress = store.items.filter(x=>x.stage === 'in_progress');
    const saved = store.items.filter(x=>x.stage === 'saved');
    const history = store.items.filter(x=>x.stage === 'history');
    const activeCount = inProgress.length + saved.length;

    page.classList.add('nb-watchlist-page','nb-watchlist-rendered');
    page.innerHTML = `<div class="nb-watchlist-header">
        <div><h1>关注</h1><p>正在做、以后想做，以及已经结束的 Offer。</p></div>
        <div class="nb-watchlist-total">${activeCount ? `正在关注 ${activeCount} 个` : '暂无进行中的关注'}</div>
      </div>
      ${!activeCount && !history.length ? `<div class="nb-watchlist-empty"><div class="nb-watchlist-empty-icon">♡</div><h2>还没有关注的内容</h2><p>看到值得以后再看或继续处理的 Offer 时，点一下关注。</p><button class="mock-add-btn" data-action="nav" data-route="discover">去发现</button></div>` : `
        ${section('进行中',inProgress,'in-progress','你正在处理的申请或活动，完成后会进入历史记录。')}
        ${section('已关注',saved,'saved','感兴趣，但暂时还没有开始。')}
        ${historySection(history)}
      `}`;
  }

  function renameUi(){
    const navLabel = document.querySelector('.nav-item[data-route="wishlist"] .nav-label');
    if(navLabel && navLabel.textContent !== '关注') navLabel.textContent = '关注';

    const detailSave = document.querySelector('.v4-detail-save[data-action="bookmark"]');
    if(detailSave){
      const span = detailSave.querySelector('span');
      if(span) span.textContent = detailSave.classList.contains('saved') ? '已关注' : '关注';
    }

    document.querySelectorAll('.bookmark[data-action="bookmark"]').forEach(button=>{
      button.setAttribute('aria-label',button.classList.contains('saved')?'取消关注':'关注');
    });

    const back = document.querySelector('.detail-back-button');
    if(back && /返回收藏/.test(back.textContent || '')) back.innerHTML='<span aria-hidden="true">←</span><span>返回关注</span>';

    const loginCopy = document.querySelector('.login-page .login-card p');
    if(loginCopy && /收藏、产品和提醒/.test(loginCopy.textContent || '')) loginCopy.textContent='继续查看你的关注、产品和提醒。';
  }

  function renameToast(){
    const root = document.getElementById('toast-root');
    if(!root) return;
    root.querySelectorAll('span').forEach(span=>{
      if(span.textContent === '已收藏') span.textContent = '已关注';
      else if(span.textContent === '已取消收藏') span.textContent = '已取消关注';
    });
  }

  function enhance(){
    renameUi();
    const page = document.querySelector('.wishlist-page');
    if(page && !page.classList.contains('nb-watchlist-rendered')) renderWatchlistPage();
    renameToast();
  }

  function queueEnhance(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(()=>{
      queued = false;
      enhance();
    });
  }

  document.addEventListener('click',event=>{
    const toggle = event.target.closest('[data-nb-watchlist-action="toggle-history"]');
    if(!toggle) return;
    event.preventDefault();
    event.stopPropagation();
    historyOpen = !historyOpen;
    const page = document.querySelector('.wishlist-page');
    if(page) page.classList.remove('nb-watchlist-rendered');
    renderWatchlistPage();
  },true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();

  const app = document.getElementById('app');
  if(app) new MutationObserver(queueEnhance).observe(app,{childList:true,subtree:true});
  const toast = document.getElementById('toast-root');
  if(toast) new MutationObserver(queueEnhance).observe(toast,{childList:true,subtree:true,characterData:true});

  window.NextBonusWatchlistUI = Object.freeze({
    refresh(){
      const page = document.querySelector('.wishlist-page');
      if(page) page.classList.remove('nb-watchlist-rendered');
      enhance();
    }
  });
})();
