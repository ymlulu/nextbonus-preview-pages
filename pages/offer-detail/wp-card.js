(() => {
  'use strict';
  const escape=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fact=(esc,label,value)=>value
    ?'<div class="nb-wp-card-fact"><div class="nb-wp-card-fact-label" data-nb-type="headline">'+label+'</div>'+
      '<p class="nb-wp-card-fact-value" data-nb-type="callout" data-nb-tone="secondary">'+esc(value)+'</p></div>'
    :'';

  function render(o,{esc=escape,saved=false,mobileToolbar=''}={}){
    const image=o.imageUrl
      ?'<img class="nb-wp-card-photo" src="'+esc(o.imageUrl)+'" alt="'+esc(o.name)+'" loading="lazy" />'
      :'<div class="nb-wp-card-fallback" data-nb-type="headline">'+esc(o.provider)+'</div>';
    const currency=o.feeCurrency==='CNY'?'¥':o.feeCurrency==='USD'?'$':'';
    const annualFee=o.fee!==null&&o.fee!==undefined&&String(o.fee).trim()!==''
      ?currency+String(o.fee):'未提供';
    const feeDetail=o.feeExtra?annualFee+' · '+o.feeExtra:annualFee;
    const valueType=String(o.value||'').length>28?'display-value-compact':'result-value';
    const apply=o.applyUrl
      ?'<div class="nb-wp-card-actions"><button class="btn primary nb-wp-card-apply" data-nb-type="headline" data-action="direct-apply">立即申请</button></div>'
      :'';

    return '<div class="content v4-offer-detail-page nb-wp-card-detail">'+mobileToolbar+
      '<div class="v4-offer-detail-grid">'+
        '<section class="v4-offer-poster-shell nb-wp-card-image-pane">'+image+'</section>'+
        '<aside class="v4-decision-panel nb-wp-card-info">'+
          '<header class="nb-credit-offer-head nb-offer-detail-head nb-wp-card-header">'+
            '<div class="nb-credit-offer-name" data-nb-type="title2">'+esc(o.name)+'</div>'+
            '<button class="v4-detail-save nb-follow-control '+(saved?'saved':'')+'" data-action="bookmark" data-id="'+esc(o.id)+'" aria-label="'+(saved?'已关注，点击取消':'关注')+'"><span class="nb-follow-label">'+(saved?'已关注':'关注')+'</span></button>'+
          '</header>'+
          (o.highlight?'<p class="nb-wp-card-highlight" data-nb-type="callout" data-nb-tone="secondary">'+esc(o.highlight)+'</p>':'')+
          '<section class="nb-current-offer nb-wp-card-offer">'+
            '<div class="nb-current-offer-label" data-nb-type="subheadline" data-nb-tone="secondary">当前开卡奖励</div>'+
            '<div class="nb-current-offer-value" data-nb-type="'+valueType+'" data-nb-tone="info">'+esc(o.value)+'</div>'+
            (o.requirement?'<div class="nb-current-offer-requirement" data-nb-type="callout" data-nb-tone="secondary">'+esc(o.requirement)+'</div>':'')+
          '</section>'+
          '<div class="nb-wp-card-facts">'+
            fact(esc,'消费返点',o.spending)+
            fact(esc,'积分 / 返点兑换',o.reward)+
            fact(esc,'年费',feeDetail)+
          '</div>'+
          apply+
        '</aside>'+
      '</div>'+
    '</div>';
  }

  window.NextBonusWordPressCardDetail=Object.freeze({render});
})();
