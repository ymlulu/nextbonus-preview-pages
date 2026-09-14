(() => {
  'use strict';

  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function productFor(offer){ return window.NextBonusOfferProducts?.[offer?.productId] || null; }
  function visualFor(product){ return window.NextBonusOfferVisuals?.[product?.visualId] || null; }
  function tagFor(id){ return id ? window.NextBonusOfferTags?.[id] || null : null; }

  function bookmarkHtml(card,id){
    const old=card.querySelector('.bookmark');
    if(old){
      old.setAttribute('data-id',id);
      return old.outerHTML;
    }
    return `<button class="bookmark" data-action="bookmark" data-id="${esc(id)}" aria-label="收藏"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-3.7-5.5 3.7v-17z" fill="none"></path></svg></button>`;
  }

  function providerLogoFor(product){
    const registry=window.NextBonusProductLogoRegistry;
    return registry?.resolve?.('',product?.id||'',product?.name||'') || product?.logo || '';
  }

  function providerHtml(product){
    const logo=providerLogoFor(product);
    if(logo) return `<span class="nb-provider"><img src="${esc(logo)}" alt="${esc(product.provider)}" /></span>`;
    return `<span class="nb-provider"><span class="nb-provider-text">${esc(product.provider)}</span></span>`;
  }

  function visualHtml(visual,product){
    if(!visual) return `<div class="nb-brand-art">${esc(product.provider)}</div>`;
    if(visual.kind==='image'||visual.kind==='logo') return `<div class="nb-main-art"><img src="${esc(visual.src)}" alt="${esc(visual.alt||product.name)}" /></div>`;
    return `<div class="nb-brand-art ${esc(visual.tone||'')}">${esc(visual.label||product.provider)}</div>`;
  }

  function renderCard(card,id){
    const offer=window.NextBonusOfferData?.[id];
    const product=productFor(offer);
    if(!offer||!product) return;

    const visual=visualFor(product);
    const status=tagFor(offer.statusTag);
    const valueTag=tagFor(offer.valueTag);
    const attributeTag=tagFor(offer.attributeTag);
    const unavailable=!!card.closest('.unavailable-grid');
    const statusLabel=unavailable?'已结束或不可用':status?.label||'';

    const bookmark=bookmarkHtml(card,id);
    card.className=`offer-card nb-offer-card${unavailable?' is-unavailable':''}`;
    card.setAttribute('data-action','open-offer');
    card.setAttribute('data-id',id);
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.setAttribute('aria-label',product.name);
    card.innerHTML=`
      <div class="nb-offer-visual">
        ${providerHtml(product)}
        ${bookmark}
        ${visualHtml(visual,product)}
        ${statusLabel?`<span class="nb-status-tag">${esc(statusLabel)}</span>`:''}
      </div>
      <div class="nb-card-body">
        <div class="nb-offer-name">${esc(product.name)}</div>
        <div class="nb-primary-value">${esc(offer.primaryValue)}</div>
        <div class="nb-requirement">${esc(offer.primaryRequirement||'')}</div>
        <div class="nb-tag-row">
          ${valueTag?`<span class="nb-tag value">${esc(valueTag.label)}</span>`:''}
          ${attributeTag?`<span class="nb-tag attribute">${esc(attributeTag.label)}</span>`:''}
        </div>
      </div>`;
    card.dataset.offerCardComposed='1';
  }

  function renderAll(){
    if(!window.NextBonusOfferProducts||!window.NextBonusOfferVisuals||!window.NextBonusOfferTags||!window.NextBonusOfferData) return;
    document.querySelectorAll('.offer-card[data-id]').forEach(card=>{
      if(card.dataset.offerCardComposed==='1') return;
      const id=card.dataset.id;
      if(!window.NextBonusOfferData[id]) return;
      renderCard(card,id);
    });
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    queueMicrotask(()=>{queued=false;renderAll();});
  }

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('storage',schedule);
  schedule();

  window.NextBonusOfferCard=Object.freeze({renderAll});
})();
