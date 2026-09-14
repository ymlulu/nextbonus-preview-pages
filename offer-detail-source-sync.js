(() => {
  'use strict';

  const esc = value => String(value || '');

  function tagLabel(id){
    return id ? (window.NextBonusOfferTags?.[id]?.label || '') : '';
  }

  function findOfferByRenderedName(name){
    const products = window.NextBonusOfferProducts || {};
    const offers = window.NextBonusOfferData || {};
    const normalized = String(name || '').trim().toLowerCase();
    if(!normalized) return null;

    for(const [offerId, offer] of Object.entries(offers)){
      const product = products[offer.productId];
      if(!product) continue;
      if(String(product.name || '').trim().toLowerCase() === normalized){
        return {offerId, offer, product};
      }
    }
    return null;
  }

  function syncGenericPoster(page){
    const poster = page.querySelector('.v4-generic-poster');
    if(!poster) return;

    const renderedName = poster.querySelector('.v4-generic-name')?.textContent || '';
    const hit = findOfferByRenderedName(renderedName);
    if(!hit) return;

    const {offer, product} = hit;
    const brand = poster.querySelector('.v4-generic-brand');
    const name = poster.querySelector('.v4-generic-name');
    if(brand) brand.textContent = product.provider || '';
    if(name) name.textContent = product.name || '';

    const tabs = Array.from(poster.querySelectorAll('.v4-generic-poster-tabs button'));
    const activeIndex = Math.max(0, tabs.findIndex(button => button.classList.contains('active')));
    if(activeIndex === 0){
      const big = poster.querySelector('.v4-generic-big');
      const copy = poster.querySelector('.v4-generic-copy');
      if(big) big.textContent = offer.primaryValue || '';
      if(copy) copy.textContent = offer.primaryRequirement || '';
    }

    const cards = poster.querySelectorAll('.v4-generic-cards span b');
    const valueLabel = tagLabel(offer.valueTag);
    const attributeLabel = tagLabel(offer.attributeTag);
    if(cards[0] && valueLabel) cards[0].textContent = valueLabel;
    if(cards[1] && attributeLabel) cards[1].textContent = attributeLabel;
  }

  function syncDealDetail(page){
    if(!page.classList.contains('deal-detail')) return;
    const renderedName = page.querySelector('.v4-generic-name')?.textContent || '';
    const hit = findOfferByRenderedName(renderedName);
    if(!hit) return;

    const value = hit.offer.primaryValue || '';
    const requirement = hit.offer.primaryRequirement || '';
    const posterValue = page.querySelector('.deal-poster-title');
    const panelValue = page.querySelector('.deal-value');
    if(posterValue && value) posterValue.textContent = value;
    if(panelValue && value) panelValue.textContent = value;

    const terms = page.querySelector('.deal-terms-copy');
    if(terms && requirement && !terms.textContent.includes(requirement)){
      const row = document.createElement('div');
      row.textContent = `• ${requirement}`;
      terms.prepend(row);
    }
  }

  function syncRemainingDetail(page){
    if(!page.classList.contains('remaining-offer')) return;
    const renderedName = page.querySelector('.v4-generic-name')?.textContent || '';
    const hit = findOfferByRenderedName(renderedName);
    if(!hit) return;

    const value = hit.offer.primaryValue || '';
    const posterValue = page.querySelector('.remaining-value');
    const rewardValue = page.querySelector('.remaining-reward-value');
    if(posterValue && value) posterValue.textContent = value;
    if(rewardValue && value) rewardValue.textContent = value;
  }

  function sync(){
    const page = document.querySelector('.v4-offer-detail-page');
    if(!page) return;
    syncGenericPoster(page);
    syncDealDetail(page);
    syncRemainingDetail(page);
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      sync();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();

  window.NextBonusOfferDetailSourceSync = Object.freeze({sync});
})();
