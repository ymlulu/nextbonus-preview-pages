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

  function providerLogoFor(product){
    return window.NextBonusProductLogoRegistry?.resolve?.('',product?.id||'',product?.name||'') || product?.logo || '';
  }

  function followIcon(saved){
    return saved
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 9.5 17 19 7"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';
  }

  function shouldShowProviderFooter(product,visual){
    if(product.type==='credit-card') return true;
    if(product.type==='bank-account') return visual?.kind!=='logo';
    return false;
  }

  function providerFooterHtml(product,visual,esc){
    if(!shouldShowProviderFooter(product,visual)) return '';
    const logo=providerLogoFor(product);
    if(logo)return `<span class="nb-provider"><img src="${esc(logo)}" alt="${esc(product.provider)}" /></span>`;
    return `<span class="nb-provider"><span class="nb-provider-text">${esc(product.provider)}</span></span>`;
  }

  function visualHtml(visual,product,esc){
    if(!visual)return `<div class="nb-brand-art">${esc(product.provider)}</div>`;
    if(visual.kind==='image'||visual.kind==='logo'){
      const kindClass=visual.kind==='logo'?' is-brand-logo':'';
      return `<div class="nb-main-art${kindClass}"><img src="${esc(visual.src)}" alt="${esc(visual.alt||product.name)}" /></div>`;
    }
    return `<div class="nb-brand-art ${esc(visual.tone||'')}">${esc(visual.label||product.provider)}</div>`;
  }

  function valueLengthClass(value){
    const n=String(value||'').trim().length;
    return n>=24?'is-long':n>=15?'is-medium':'is-short';
  }

  function render(offer,{saved=false,unavailable=false,esc=escapeHtml}={}){
    const id=offer?.id;
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
          <button class="bookmark nb-follow-toggle ${saved?'saved':''}" data-action="bookmark" data-id="${esc(id)}" aria-label="${saved?'已关注，点击取消':'关注'}" title="${saved?'已关注，点击取消':'关注'}">${followIcon(saved)}</button>
        </div>
        <div class="nb-primary-value ${valueLengthClass(fact.primaryValue)}">${esc(fact.primaryValue)}</div>
        <div class="nb-card-footer">
          <div class="nb-card-meta">
            ${statusLabel?`<span class="nb-status-tag${unavailable?' is-unavailable':''}">${esc(statusLabel)}</span>`:''}
            ${attributeTag?`<span class="nb-tag attribute">${esc(attributeTag.label)}</span>`:''}
          </div>
          ${providerFooterHtml(product,visual,esc)}
        </div>
      </div>
    </article>`;
  }

  window.NextBonusOfferCard=Object.freeze({render,valueLengthClass});
})();
