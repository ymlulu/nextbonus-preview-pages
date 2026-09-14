(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';

  const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));

  function tagLabel(id){
    return id ? (window.NextBonusOfferTags?.[id]?.label || '') : '';
  }

  function canonicalOffers(){
    const offers = window.NextBonusOfferData || {};
    const products = window.NextBonusOfferProducts || {};

    return Object.entries(offers).map(([id, offer]) => {
      const product = products[offer.productId];
      if(!product) return null;

      const status = tagLabel(offer.statusTag);
      const valueTag = tagLabel(offer.valueTag);
      const attributeTag = tagLabel(offer.attributeTag);
      const searchText = [
        product.name,
        product.provider,
        product.category,
        offer.primaryValue,
        offer.primaryRequirement,
        status,
        valueTag,
        attributeTag
      ].filter(Boolean).join(' ').toLowerCase();

      return {
        id,
        category: product.category,
        searchText
      };
    }).filter(Boolean);
  }

  function savedOfferIds(){
    try{
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return new Set([
        ...(Array.isArray(stored.savedOfferIds) ? stored.savedOfferIds : []),
        ...(Array.isArray(stored.unavailableSavedIds) ? stored.unavailableSavedIds : [])
      ]);
    }catch(_err){
      return new Set();
    }
  }

  function bookmarkIcon(saved){
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-3.7-5.5 3.7v-17z" ${saved?'fill="currentColor"':'fill="none"'}></path></svg>`;
  }

  function placeholderCard(id, saved){
    return `<article class="offer-card" data-action="open-offer" data-id="${esc(id)}" tabindex="0" role="button">
      <button class="bookmark ${saved?'saved':''}" data-action="bookmark" data-id="${esc(id)}" aria-label="${saved?'取消收藏':'收藏'}">${bookmarkIcon(saved)}</button>
    </article>`;
  }

  function emptyMarkup(){
    return `<div class="empty compact-empty"><h3>没有匹配的内容</h3><p>换一个关键词或分类试试。</p></div>`;
  }

  function currentCategory(page){
    return page.querySelector('[data-action="offer-category"].active')?.dataset.category || '全部';
  }

  function currentQuery(page){
    return (page.querySelector('#offer-search')?.value || '').trim().toLowerCase();
  }

  function sameIds(grid, desiredIds){
    if(!grid) return false;
    const currentIds = Array.from(grid.querySelectorAll(':scope > .offer-card[data-id]')).map(el => el.dataset.id);
    return currentIds.length === desiredIds.length && currentIds.every((id, index) => id === desiredIds[index]);
  }

  function syncDiscover(){
    const page = document.querySelector('.discover-page');
    if(!page) return;
    if(!window.NextBonusOfferData || !window.NextBonusOfferProducts || !window.NextBonusOfferTags) return;

    const category = currentCategory(page);
    const query = currentQuery(page);
    const matches = canonicalOffers().filter(item =>
      (category === '全部' || item.category === category) &&
      (!query || item.searchText.includes(query))
    );

    const desiredIds = matches.map(item => item.id);
    const grid = page.querySelector('.offer-grid');
    const empty = page.querySelector('.compact-empty');

    if(matches.length && sameIds(grid, desiredIds)) return;
    if(!matches.length && !grid && empty) return;

    if(matches.length){
      const saved = savedOfferIds();
      const markup = `<div class="offer-grid">${desiredIds.map(id => placeholderCard(id, saved.has(id))).join('')}</div>`;
      if(grid) grid.outerHTML = markup;
      else if(empty) empty.outerHTML = markup;
      else page.insertAdjacentHTML('beforeend', markup);
      queueMicrotask(() => window.NextBonusOfferCard?.renderAll?.());
      return;
    }

    if(grid) grid.outerHTML = emptyMarkup();
    else if(!empty) page.insertAdjacentHTML('beforeend', emptyMarkup());
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      syncDiscover();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('storage', schedule);
  schedule();

  window.NextBonusOfferPageRuntime = Object.freeze({canonicalOffers, syncDiscover});
})();
