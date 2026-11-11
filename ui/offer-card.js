(() => {
  'use strict';

  const escapeHtml=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function productFor(id){
    const fact=window.NextBonusOfferData?.[id]||null;
    const product=fact?window.NextBonusOfferProducts?.[fact.productId]||null:null;
    return {fact,product};
  }

  function tag(id){ return id ? window.NextBonusOfferTags?.[id]||null : null; }
  function visualFor(product){ return window.NextBonusOfferVisuals?.[product?.visualId]||null; }

  function visualHtml(visual,product,esc){
    if(!visual)return `<div class="nb-brand-art">${esc(product.provider)}</div>`;
    if(visual.kind==='image'||visual.kind==='logo'){
      const kindClass=visual.kind==='logo'?' is-brand-logo':'';
      return `<div class="nb-main-art${kindClass}"><img src="${esc(visual.src)}" alt="${esc(visual.alt||product.name)}" /></div>`;
    }
    return `<div class="nb-brand-art ${esc(visual.tone||'')}">${esc(visual.label||product.provider)}</div>`;
  }

  function dynamicRender(offer,esc){
    const money=window.NextBonusDealsCatalog?.money||((cents)=>'$'+(cents/100).toFixed(2));
    const hasPrice=Number.isSafeInteger(offer.priceCents);
    const price=hasPrice?money(offer.priceCents,offer.currency):'';
    const original=Number.isSafeInteger(offer.originalPriceCents)?money(offer.originalPriceCents,offer.currency):'';
    const discount=hasPrice&&Number.isSafeInteger(offer.originalPriceCents)&&offer.originalPriceCents>offer.priceCents
      ?Math.round((1-offer.priceCents/offer.originalPriceCents)*100):null;
    const mainValue=offer.rewardText||(price||offer.value||'查看优惠');
    const image=offer.imageUrl
      ?`<img src="${esc(offer.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
      :`<div class="nb-brand-art">${esc(offer.provider||'Deal')}</div>`;
    const status=offer.featured?'<span class="nb-status-tag">Featured</span>':'';
    return `<article class="offer-card nb-offer-card nb-dynamic-deal-card" data-action="open-offer" data-id="${esc(offer.id)}" tabindex="0" role="button" aria-label="${esc(offer.name)}">
      <div class="nb-offer-visual">${image}</div>
      <div class="nb-card-body">
        <div class="nb-title-row"><div class="nb-offer-name">${esc(offer.name)}</div></div>
        <div class="nb-deal-merchant">${esc(offer.provider||'')}</div>
        <div class="nb-primary-value">${esc(mainValue)}${discount!==null?` <span class="nb-deal-discount">-${discount}%</span>`:''}</div>
        ${original?`<div class="nb-deal-was">原价 <s>${esc(original)}</s></div>`:''}
        ${offer.requirement?`<p class="nb-deal-summary">${esc(offer.requirement)}</p>`:''}
        <div class="nb-card-footer"><div class="nb-card-meta">
          ${status}<span class="nb-tag attribute">${esc(offer.category||'其他')}</span>
        </div></div>
      </div>
    </article>`;
  }

  function render(offer,{saved=false,unavailable=false,esc=escapeHtml}={}){
    const id=offer?.id;
    if(offer?.source==='deals-api')return dynamicRender(offer,esc);
    const {fact,product}=productFor(id);
    if(!id||!fact||!product)return '';
    const visual=visualFor(product);
    const status=tag(fact.statusTag);
    const attributeTag=tag(fact.attributeTag);
    const statusLabel=unavailable?'已结束或不可用':status?.label||'';

    return `<article class="offer-card nb-offer-card${unavailable?' is-unavailable':''}" data-action="open-offer" data-id="${esc(id)}" tabindex="0" role="button" aria-label="${esc(product.name)}">
      <div class="nb-offer-visual">
        ${visualHtml(visual,product,esc)}
      </div>
      <div class="nb-card-body">
        <div class="nb-title-row">
          <div class="nb-offer-name">${esc(product.name)}</div>
        </div>
        <div class="nb-primary-value">${esc(fact.primaryValue)}</div>
        <div class="nb-card-footer">
          <div class="nb-card-meta">
            ${statusLabel?`<span class="nb-status-tag${unavailable?' is-unavailable':''}">${esc(statusLabel)}</span>`:''}
            ${attributeTag?`<span class="nb-tag attribute">${esc(attributeTag.label)}</span>`:''}
          </div>
        </div>
      </div>
    </article>`;
  }

  window.NextBonusOfferCard=Object.freeze({render});
})();
