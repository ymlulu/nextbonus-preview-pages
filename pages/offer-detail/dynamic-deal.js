(() => {
  'use strict';
  const money=(cents,currency)=>window.NextBonusDealsCatalog?.money?.(cents,currency)||'';
  function render(offer,{esc,saved,mobileToolbar}){
    if(offer?.source!=='deals-api')return '';
    const expired=!!(offer.expiresOn&&offer.expiresOn<new Date().toISOString().slice(0,10));
    const image=offer.imageUrl
      ?`<img class="nb-dynamic-poster-image" src="${esc(offer.imageUrl)}" alt="${esc(offer.name)}" referrerpolicy="no-referrer" />`
      :`<div class="nb-dynamic-poster-placeholder">${esc(offer.provider||'NextBonus')}</div>`;
    const hasPrice=Number.isSafeInteger(offer.priceCents);
    const original=Number.isSafeInteger(offer.originalPriceCents)?money(offer.originalPriceCents,offer.currency):'';
    const reward=offer.rewardText||(hasPrice?money(offer.priceCents,offer.currency):offer.value||'查看优惠');
    const follow=saved?'已关注':'关注';
    return `<div class="content v4-offer-detail-page nb-dynamic-detail-page">
      ${mobileToolbar}
      <div class="v4-offer-detail-grid">
        <section class="v4-offer-poster-shell nb-dynamic-poster">
          ${image}
          <div class="nb-dynamic-poster-caption">${esc(offer.category||'其他')} · ${esc(offer.provider||'Deals')}</div>
        </section>
        <aside class="v4-decision-panel nb-dynamic-deal-panel">
          <div class="deal-head nb-offer-detail-head">
            <div class="deal-brand"><div><small>${esc(offer.provider||'Deals')}</small><strong>${esc(offer.name)}</strong></div></div>
            <button class="deal-save nb-follow-control ${saved?'saved':''}" data-action="bookmark" data-id="${esc(offer.id)}" type="button">${follow}</button>
          </div>
          <section class="deal-value-card">
            <div class="deal-value-label">${hasPrice?'优惠价格':'当前优惠'}</div>
            <div class="deal-value">${esc(reward)}</div>
            ${original?`<div class="deal-value-sub">原价 <s>${esc(original)}</s></div>`:''}
            ${offer.requirement?`<div class="deal-value-sub">${esc(offer.requirement)}</div>`:''}
          </section>
          ${offer.promoCode?`<section class="nb-dynamic-promo"><span>Promo Code</span><strong>${esc(offer.promoCode)}</strong></section>`:''}
          ${offer.description?`<section class="nb-dynamic-description"><h2>优惠详情</h2><p>${esc(offer.description)}</p></section>`:''}
          ${offer.expiresOn?`<div class="deal-time-card"><span>结束日期</span><time datetime="${esc(offer.expiresOn)}">${esc(offer.expiresOn)}${expired?' · 已过期':''}</time></div>`:''}
          ${expired?'<button class="deal-cta" disabled type="button">优惠已结束</button>'
            :`<a class="deal-cta" href="${esc(offer.goUrl)}" target="_blank" rel="noopener noreferrer">View Deal ↗</a>`}
          <p class="nb-dynamic-disclosure">优惠及资格以商家当前条款为准。本站可能通过推广链接获得佣金。</p>
        </aside>
      </div>
    </div>`;
  }
  window.NextBonusDynamicDealDetail=Object.freeze({render});
})();
