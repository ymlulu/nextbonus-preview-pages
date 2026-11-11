(() => {
  'use strict';
  const money=(cents,currency)=>window.NextBonusDealsCatalog?.money?.(cents,currency)||'';
  const clean=value=>typeof value==='string'?value.trim():'';

  function splitInstructions(offer){
    // Show only verified editorial words from the API. Never make up deal steps.
    const summary=clean(offer.requirement);
    const description=clean(offer.description);
    const source=description||summary;
    if(!source)return [];
    const segments=source.split(/[；;\n]+/).map(x=>x.trim()).filter(Boolean);
    return segments.length>1&&segments.length<=6?segments:[source];
  }

  function render(offer,{esc,saved,mobileToolbar}){
    if(offer?.source!=='deals-api')return '';
    const expired=!!(offer.expiresOn&&offer.expiresOn<new Date().toISOString().slice(0,10));
    const hasPrice=Number.isSafeInteger(offer.priceCents);
    const original=Number.isSafeInteger(offer.originalPriceCents)?money(offer.originalPriceCents,offer.currency):'';
    const reward=offer.rewardText||(hasPrice?money(offer.priceCents,offer.currency):offer.value||'查看优惠');
    const provider=clean(offer.provider)||'NextBonus';
    const fullTitle=clean(offer.name);
    const title=reward&&fullTitle.endsWith(' '+reward)?fullTitle.slice(0,-reward.length-1).trim()||fullTitle:fullTitle;
    const follow=saved?'已关注':'关注';
    const steps=splitInstructions(offer);
    const summary=clean(offer.requirement);
    const description=clean(offer.description);
    const notes=[];
    if(description&&description!==summary&&steps.indexOf(description)===-1)notes.push(description);
    if(offer.expiresOn)notes.push('活动截止：'+offer.expiresOn+(expired?'（已过期）':''));
    if(offer.startsOn)notes.push('活动开始：'+offer.startsOn);
    if(offer.promoCode)notes.push('Promo Code：'+offer.promoCode);
    const image=offer.imageUrl
      ?'<div class="nb-deal-poster-image-wrap"><img class="nb-deal-poster-image" src="'+esc(offer.imageUrl)+'" alt="'+esc(title)+'" referrerpolicy="no-referrer" /></div>'
      :'';
    const listing=steps.map((step,index)=>
      '<div class="deal-step"><div class="deal-step-num pink">'+(index+1)+'</div>'+
      '<div class="deal-step-copy"><b>'+esc(step)+'</b></div></div>').join('');
    const cta=expired
      ?'<button class="deal-cta pink" disabled type="button">优惠已结束</button>'
      :offer.goUrl
        ?'<a class="deal-cta pink" href="'+esc(offer.goUrl)+'" target="_blank" rel="noopener noreferrer">查看优惠 ↗</a>'
        :'<p class="v4-no-action-note">当前没有可用的优惠入口。</p>';
    return '<div class="content v4-offer-detail-page deal-detail nb-dynamic-detail-page nb-curated-deal-detail">'+
      mobileToolbar+
      '<div class="v4-offer-detail-grid">'+
        '<section class="v4-offer-poster-shell">'+
          '<div class="deal-poster nb-curated-deal-poster">'+
            '<div class="deal-poster-brand">'+esc(provider)+'</div>'+
            '<div class="deal-poster-kicker">CURRENT OFFER</div>'+
            '<div class="deal-poster-title">'+esc(reward)+'</div>'+
            '<div class="deal-poster-copy">'+esc(title)+'</div>'+image+
          '</div>'+
        '</section>'+
        '<aside class="v4-decision-panel nb-dynamic-deal-panel">'+
          '<div class="deal-head nb-offer-detail-head">'+
            '<div class="deal-brand"><strong>'+esc(fullTitle)+'</strong></div>'+
            '<button class="deal-save nb-follow-control '+(saved?'saved':'')+'" data-action="bookmark" data-id="'+esc(offer.id)+'" type="button" aria-label="'+(saved?'已关注，点击取消':'关注')+'"><span class="nb-follow-label">'+follow+'</span></button>'+
          '</div>'+
          '<section class="deal-value-card pink">'+
            '<div class="deal-value-label">'+(hasPrice?'优惠价格':'当前优惠')+'</div>'+
            '<div class="deal-value">'+esc(reward)+'</div>'+
            (original?'<div class="deal-value-sub">原价 <s>'+esc(original)+'</s></div>':'')+
          '</section>'+
          (listing?'<div class="deal-section-title">优惠条件</div><div class="deal-steps">'+listing+'</div>':'')+
          cta+
          '<details class="deal-terms"><summary>重要信息</summary><div class="deal-terms-copy">'+notes.map(s=>'<div>• '+esc(s)+'</div>').join('')+'<div>• 具体优惠及资格以商家当前条款为准。</div></div></details>'+
          '<p class="nb-dynamic-disclosure">具体优惠及资格以商家当前条款为准。本站可能通过推广链接获得佣金。</p>'+
        '</aside>'+
      '</div>'+
    '</div>';
  }
  window.NextBonusDynamicDealDetail=Object.freeze({render});
})();