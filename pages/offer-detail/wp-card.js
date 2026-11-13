(() => {
  'use strict';
  const escape=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  // Preserve the original copy; only put editorial separators on separate lines.
  const segments=value=>String(value??'').split(/[；;\r\n]+/).map(part=>part.trim()).filter(Boolean);
  const fact=(esc,label,value)=>{
    const parts=segments(value);
    if(!parts.length)return '';
    return '<div class="nb-wp-card-fact">'+
      '<div class="nb-wp-card-fact-label" data-nb-type="headline">'+label+'</div>'+
      '<p class="nb-wp-card-fact-value" data-nb-type="body">'+
        parts.map(part=>'<span class="nb-wp-card-fact-line">'+esc(part)+'</span>').join('')+
      '</p></div>';
  };
  const highlights=(esc,value)=>{
    const parts=segments(value);
    if(!parts.length)return '';
    return '<section class="nb-wp-card-highlights-section" aria-label="卡片亮点">'+
      '<h2 class="nb-wp-card-section-title" data-nb-type="headline">卡片亮点</h2>'+
      '<ul class="nb-wp-card-highlights">'+
        parts.map(part=>'<li data-nb-type="body">'+esc(part)+'</li>').join('')+
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
      fact(esc,'消费返点',o.spending),
      fact(esc,'积分 / 返点兑换',o.reward),
      fact(esc,'年费',feeDetail)
    ].filter(Boolean).join('');
    const factSection=facts
      ?'<section class="nb-wp-card-facts" aria-label="权益与费用">'+
        '<h2 class="nb-wp-card-section-title" data-nb-type="headline">权益与费用</h2>'+
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
            '<div class="nb-current-offer-label" data-nb-type="subheadline" data-nb-tone="secondary">当前开卡奖励</div>'+
            '<div class="nb-current-offer-value" data-nb-type="'+valueType+'" data-nb-tone="info">'+esc(o.value)+'</div>'+
            (o.requirement?'<p class="nb-current-offer-requirement" data-nb-type="body" data-nb-tone="secondary">'+esc(o.requirement)+'</p>':'')+
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
