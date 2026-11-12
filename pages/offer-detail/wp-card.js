(() => {
 'use strict';
 const escape=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
 function render(o,{esc=escape,saved=false,mobileToolbar=''}={}){
   const image=o.imageUrl
     ?'<img class="nb-wp-card-photo" src="'+esc(o.imageUrl)+'" alt="'+esc(o.name)+'" loading="lazy" />'
     :'<div class="nb-wp-card-fallback">'+esc(o.provider)+'</div>';
   const fee=o.feeCurrency==='CNY'?'¥':o.feeCurrency==='USD'?'$':'';
   const feeText=o.fee?fee+esc(o.fee):'未提供';
   const apply=o.applyUrl?'<button class="btn primary" data-action="direct-apply">立即申请</button>':'';
   const article=o.articleUrl?'<a href="'+esc(o.articleUrl)+'" target="_blank" rel="noopener noreferrer" class="nb-wp-card-article">查看美卡101详细介绍</a>':'';
   return '<div class="content v4-offer-detail-page nb-wp-card-detail">'+mobileToolbar+
     '<div class="v4-offer-detail-grid">'+
       '<section class="v4-offer-poster-shell nb-wp-card-image-pane">'+image+'</section>'+
       '<aside class="v4-decision-panel nb-wp-card-info">'+
         '<header class="nb-credit-offer-head nb-offer-detail-head">'+
         '<div class="nb-credit-offer-name" data-nb-type="title2">'+esc(o.name)+'</div>'+
         '<button class="v4-detail-save nb-follow-control '+(saved?'saved':'')+'" data-action="bookmark" data-id="'+esc(o.id)+'" aria-label="关注"><span class="nb-follow-label">'+(saved?'已关注':'关注')+'</span></button></header>'+
         (o.highlight?'<p class="nb-wp-card-highlight">'+esc(o.highlight)+'</p>':'')+
         '<section class="nb-current-offer"><div class="nb-current-offer-label">当前开卡奖励</div>'+
         '<div class="nb-current-offer-value">'+esc(o.value)+'</div>'+
         (o.requirement?'<div class="nb-current-offer-requirement">'+esc(o.requirement)+'</div>':'')+'</section>'+
         '<div class="nb-wp-card-facts">'+
         (o.spending?'<div><b>消费返点</b><p>'+esc(o.spending)+'</p></div>':'')+
         (o.reward?'<div><b>积分 / 返点兑换</b><p>'+esc(o.reward)+'</p></div>':'')+
         '<div><b>年费</b><p>'+feeText+(o.feeExtra?' · '+esc(o.feeExtra):'')+'</p></div></div>'+
         '<div class="nb-wp-card-actions">'+apply+article+'</div>'+
       '</aside></div></div>';
 }
 window.NextBonusWordPressCardDetail=Object.freeze({render});
})();
