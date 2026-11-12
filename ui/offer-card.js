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
    // Shopping Deals: product name, current price, crossed-out original price,
    // and merchant only. Keep the shared visual panel and card dimensions.
    const money=window.NextBonusDealsCatalog?.money||((cents)=>'$'+(cents/100).toFixed(2));
    const hasPrice=Number.isSafeInteger(offer.priceCents);
    const currentPrice=hasPrice?money(offer.priceCents,offer.currency):'';
    const showOriginal=hasPrice&&Number.isSafeInteger(offer.originalPriceCents)&&
      offer.originalPriceCents>offer.priceCents;
    const originalPrice=showOriginal?money(offer.originalPriceCents,offer.currency):'';
    const fullTitle=String(offer.name||'').trim();
    // Existing imports may already include "$23.38" in their titles.
    // Strip it only when it equals the structured price; preserve model numbers.
    const normalizedPrice=currentPrice.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const title=hasPrice
      ?fullTitle.replace(new RegExp('\\s+'+normalizedPrice+'\\s*$'),'').trim()||fullTitle
      :fullTitle;
    const art=offer.imageUrl
      ?'<div class="nb-main-art is-brand-logo nb-deal-card-art"><img src="'+esc(offer.imageUrl)+'" alt="" loading="lazy" referrerpolicy="no-referrer" /></div>'
      :'<div class="nb-brand-art nb-deal-card-art">'+esc(offer.provider||'Deal')+'</div>';
    const status=offer.featured?'<span class="nb-status-tag nb-deal-featured">精选</span>':'';
    // Shopping items go directly through the existing click-tracking Worker.
    // Never link to an unverified merchant/Dealmoon URL from the card.
    const apiBase=String(window.NextBonusDealsConfig?.apiBase||'').trim().replace(/\/+$/,'');
    const expectedGoUrl=apiBase+'/go/deal/'+encodeURIComponent(offer.id);
    const goUrl=String(offer.goUrl||'').trim();
    const direct=offer.category==='购物'&&apiBase.startsWith('https://')&&goUrl===expectedGoUrl;
    const cardStart=direct
      ?'<a class="offer-card nb-offer-card nb-dynamic-deal-card" data-id="'+esc(offer.id)+'" href="'+esc(goUrl)+'" target="_blank" rel="noopener noreferrer sponsored" aria-label="'+esc(offer.name)+'，前往商家购买">'
      :'<article class="offer-card nb-offer-card nb-dynamic-deal-card" data-action="open-offer" data-id="'+esc(offer.id)+'" tabindex="0" role="button" aria-label="'+esc(offer.name)+'">';
    const cardEnd=direct?'</a>':'</article>';
    const priceHtml=hasPrice
      ?'<div class="nb-deal-prices"><span class="nb-primary-value nb-deal-current-price">'+esc(currentPrice)+'</span>'+
        (showOriginal?'<del class="nb-deal-original-price" data-nb-type="callout">'+esc(originalPrice)+'</del>':'')+'</div>'
      :'<div class="nb-deal-prices"><span class="nb-deal-price-fallback" data-nb-type="callout">'+esc(offer.rewardText||offer.value||'查看优惠')+'</span></div>';
    return cardStart+
      '<div class="nb-offer-visual">'+art+status+'</div>'+
      '<div class="nb-card-body">'+
        '<div class="nb-title-row"><div class="nb-offer-name" title="'+esc(title)+'">'+esc(title)+'</div></div>'+
        priceHtml+
        '<div class="nb-card-footer"><div class="nb-card-meta"><span class="nb-deal-merchant" data-nb-type="caption2">'+esc(offer.provider||'Deals')+'</span></div></div>'+
      '</div>'+
    cardEnd;
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

  function creditCardRender(offer,esc){
    const image=offer.imageUrl?'<div class="nb-main-art"><img src="'+esc(offer.imageUrl)+'" alt="'+esc(offer.name)+'" loading="lazy" /></div>':
      '<div class="nb-brand-art">'+esc(offer.provider)+'</div>';
    return '<article class="offer-card nb-offer-card nb-wp-api-card" data-action="open-offer" data-id="'+esc(offer.id)+'" tabindex="0" role="button" aria-label="'+esc(offer.name)+'">'+
      '<div class="nb-offer-visual">'+image+'</div>'+
      '<div class="nb-card-body"><div class="nb-title-row"><div class="nb-offer-name">'+esc(offer.name)+'</div></div>'+
      '<div class="nb-primary-value">'+esc(offer.value)+'</div>'+
      '<div class="nb-card-footer"><div class="nb-card-meta"><span class="nb-tag attribute">信用卡</span></div></div></div></article>';
  }
  function render(offer,{saved=false,unavailable=false,esc=escapeHtml}={}){
    const id=offer?.id;
    if(offer?.source==='deals-api')return dynamicRender(offer,esc);
    if(offer?.source==='credit-cards-api')return creditCardRender(offer,esc);
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
