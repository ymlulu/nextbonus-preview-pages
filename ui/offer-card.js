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
    // API-backed Deals (Admin and JSONL imports) use the same uncluttered
    // Discover card contract as the original product/offer cards.
    const money=window.NextBonusDealsCatalog?.money||((cents)=>'$'+(cents/100).toFixed(2));
    const mainValue=offer.rewardText||(
      Number.isSafeInteger(offer.priceCents)?money(offer.priceCents,offer.currency):offer.value||'查看优惠'
    );
    const fullTitle=String(offer.name||'').trim();
    const title=mainValue&&fullTitle.endsWith(' '+mainValue)
      ?fullTitle.slice(0,-mainValue.length-1).trim()||fullTitle
      :fullTitle;
    const art=offer.imageUrl
      ?'<div class="nb-main-art is-brand-logo nb-deal-card-art"><img src="'+esc(offer.imageUrl)+'" alt="" loading="lazy" referrerpolicy="no-referrer" /></div>'
      :'<div class="nb-brand-art nb-deal-card-art">'+esc(offer.provider||'Deal')+'</div>';
    const status=offer.featured?'<span class="nb-status-tag">精选</span>':'';
    return '<article class="offer-card nb-offer-card nb-dynamic-deal-card" data-action="open-offer" data-id="'+esc(offer.id)+'" tabindex="0" role="button" aria-label="'+esc(offer.name)+'">'+
      '<div class="nb-offer-visual">'+art+'</div>'+
      '<div class="nb-card-body">'+
        '<div class="nb-title-row"><div class="nb-offer-name">'+esc(title)+'</div></div>'+
        '<div class="nb-primary-value">'+esc(mainValue)+'</div>'+
        '<div class="nb-card-footer"><div class="nb-card-meta">'+
          status+'<span class="nb-tag attribute">'+esc(offer.category||'其他')+'</span>'+
        '</div></div>'+
      '</div>'+
    '</article>';
  }
  function bankRender(offer,esc){
    // Reuse the existing product-offer card layout, but source text only from DD.
    return `<article class="offer-card nb-offer-card nb-bank-api-card" data-action="open-offer" data-id="${esc(offer.id)}" tabindex="0" role="button" aria-label="${esc(offer.name)}">
      <div class="nb-offer-visual"><div class="nb-brand-art">${esc(offer.provider||'Bank')}</div></div>
      <div class="nb-card-body">
        <div class="nb-title-row"><div class="nb-offer-name">${esc(offer.name)}</div></div>
        <div class="nb-primary-value">${esc(offer.value)}</div>
        <div class="nb-card-footer"><div class="nb-card-meta">
          <span class="nb-tag attribute">银行账户</span>
        </div></div>
      </div>
    </article>`;
  }

  function render(offer,{saved=false,unavailable=false,esc=escapeHtml}={}){
    const id=offer?.id;
    if(offer?.source==='deals-api')return dynamicRender(offer,esc);
    if(offer?.source==='bank-offers-api')return bankRender(offer,esc);
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
