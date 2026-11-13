(() => {
  'use strict';
  const escape=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  // Inline SVG symbols are scoped to this card's right-hand information rail.
  const shapes=Object.freeze({
    gift:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8H7.5a2.5 2.5 0 1 1 2.2-3.7L12 8Zm0 0h4.5a2.5 2.5 0 1 0-2.2-3.7L12 8Z"/>',
    sparkle:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    cart:'<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.5 12h13l2-9H5"/>',
    coins:'<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    percent:'<circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/><path d="M19 5 5 19"/>'
  });
  const svg=name=>'<svg class="nb-wp-card-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(shapes[name]||shapes.sparkle)+'</svg>';
  const highlightIcon=value=>{
    if(/年费|annual fee|no fee/i.test(value))return 'coins';
    if(/返现|消费|购物|超市|餐饮|Amazon|Whole Foods|cash.?back/i.test(value))return 'cart';
    return 'sparkle';
  };

  // Preserve the original copy; only put editorial separators on separate lines.
  const segments=value=>String(value??'').split(/[；;\r\n]+/).map(part=>part.trim()).filter(Boolean);
  const fact=(esc,label,value,iconName)=>{
    const parts=segments(value);
    if(!parts.length)return '';
    return '<div class="nb-wp-card-fact">'+
      '<span class="nb-wp-card-fact-icon">'+svg(iconName)+'</span>'+
      '<div class="nb-wp-card-fact-content">'+
        '<div class="nb-wp-card-fact-label" data-nb-type="headline">'+label+'</div>'+
        '<p class="nb-wp-card-fact-value" data-nb-type="body">'+
          parts.map(part=>'<span class="nb-wp-card-fact-line">'+esc(part)+'</span>').join('')+
        '</p></div></div>';
  };
  const highlights=(esc,value)=>{
    const parts=segments(value);
    if(!parts.length)return '';
    return '<section class="nb-wp-card-highlights-section" aria-label="卡片亮点">'+
      '<h2 class="nb-wp-card-section-title" data-nb-type="title3">'+
        '<span class="nb-wp-card-section-icon">'+svg('sparkle')+'</span>卡片亮点</h2>'+
      '<ul class="nb-wp-card-highlights">'+
        parts.map(part=>'<li data-nb-type="body">'+
          '<span class="nb-wp-card-highlight-icon">'+svg(highlightIcon(part))+'</span>'+
          '<span class="nb-wp-card-highlight-copy">'+esc(part)+'</span></li>').join('')+
      '</ul></section>';
  };

  function render(o,{esc=escape,saved=false,mobileToolbar=''}={}){
    const image=o.imageUrl
      ?'<img class="nb-wp-card-photo" src="'+esc(o.imageUrl)+'" alt="'+esc(o.name)+'" loading="lazy" />'
      :'<div class="nb-wp-card-fallback" data-nb-type="headline">'+esc(o.provider)+'</div>';
    const currency=o.feeCurrency==='CNY'?'¥':o.feeCurrency==='USD'?'$':'';
    const annualFee=o.fee!==null&&o.fee!==undefined&&String(o.fee).trim()!==''
      ?currency+String(o.fee):'未提供';
    const feeDetail=o.feeExtra?annualFee+' · '+o.feeExtra:annualFee;
    const valueType=String(o.value||'').length>28?'display-value-compact':'result-value';
    const facts=[
      fact(esc,'消费返点',o.spending,'percent'),
      fact(esc,'积分 / 返点兑换',o.reward,'gift'),
      fact(esc,'年费',feeDetail,'coins')
    ].filter(Boolean).join('');
    const factSection=facts
      ?'<section class="nb-wp-card-facts" aria-label="权益与费用">'+
        '<h2 class="nb-wp-card-section-title" data-nb-type="title3"><span class="nb-wp-card-section-icon">'+svg('grid')+'</span>权益与费用</h2>'+
        '<div class="nb-wp-card-facts-list">'+facts+'</div></section>'
      :'';
    const apply=o.applyUrl
      ?'<div class="nb-wp-card-actions"><button class="btn primary nb-wp-card-apply" data-nb-type="headline" data-action="direct-apply">立即申请</button></div>'
      :'';

    return '<div class="content v4-offer-detail-page nb-wp-card-detail">'+mobileToolbar+
      '<div class="v4-offer-detail-grid">'+
        '<section class="v4-offer-poster-shell nb-wp-card-image-pane">'+image+'</section>'+
        '<aside class="v4-decision-panel nb-wp-card-info">'+
          '<header class="nb-credit-offer-head nb-offer-detail-head nb-wp-card-header">'+
            '<div class="nb-wp-card-kicker">'+
              '<span class="nb-wp-card-provider" data-nb-type="subheadline" data-nb-tone="secondary">'+esc(o.provider||'信用卡')+'</span>'+
              '<button class="v4-detail-save nb-follow-control '+(saved?'saved':'')+'" data-action="bookmark" data-id="'+esc(o.id)+'" aria-label="'+(saved?'已关注，点击取消':'关注')+'"><span class="nb-follow-label">'+(saved?'已关注':'关注')+'</span></button>'+
            '</div>'+
            '<h1 class="nb-credit-offer-name nb-wp-card-name" data-nb-type="title1">'+esc(o.name)+'</h1>'+
          '</header>'+
          '<section class="nb-current-offer nb-wp-card-offer">'+
            '<span class="nb-wp-card-offer-icon">'+svg('gift')+'</span>'+
            '<div class="nb-wp-card-offer-body">'+
              '<div class="nb-current-offer-label" data-nb-type="subheadline" data-nb-tone="secondary">当前开卡奖励</div>'+
              '<div class="nb-current-offer-value" data-nb-type="'+valueType+'" data-nb-tone="info">'+esc(o.value)+'</div>'+
              (o.requirement?'<p class="nb-current-offer-requirement" data-nb-type="body" data-nb-tone="secondary">'+esc(o.requirement)+'</p>':'')+
            '</div>'+
          '</section>'+
          highlights(esc,o.highlight)+
          factSection+
          apply+
        '</aside>'+
      '</div>'+
    '</div>';
  }

  window.NextBonusWordPressCardDetail=Object.freeze({render});
})();
