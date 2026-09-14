(() => {
  'use strict';

  if(!document.getElementById('offer-card-sync-style')){
    const style=document.createElement('style');
    style.id='offer-card-sync-style';
    style.textContent=`
      .offer-card.hybrid-offer-card{overflow:hidden;background:#fff}
      .hybrid-offer-visual{position:relative;height:164px;overflow:hidden;background:#f7f9fc}
      .hybrid-offer-visual img{display:block;width:100%;height:auto;transform:translateY(0)}
      .hybrid-offer-card .bookmark{position:absolute;right:16px;top:14px;z-index:3}
      .hybrid-offer-card .offer-body{padding:16px 18px 18px}
      .hybrid-offer-card .offer-name{font-size:17px;font-weight:800;line-height:1.25;color:#12244a}
      .hybrid-offer-card .primary-value{margin-top:15px;font-size:28px;font-weight:900;line-height:1.05;color:#0e2a64;letter-spacing:-.5px}
      .hybrid-offer-card .requirement{margin-top:8px;font-size:13px;color:#5f6f91}
      .hybrid-offer-card .tag-row{margin-top:18px}
      .offer-card .default-product-card-art{display:block;width:100%;height:100%;object-fit:contain;padding:12px 18px;box-sizing:border-box}
      .offer-card .offer-top.has-default-product-art{height:164px;overflow:hidden;background:#f7f9fc}
    `;
    document.head.appendChild(style);
  }

  const CARD_DATA = {
    'bilt-palladium': {provider:'BILT', name:'Bilt Palladium Card', value:'50,000 points + $300 Bilt Cash', requirement:'3 个月内消费 $4,000', tags:['高额奖励','日常消费'], art:'purple', hybrid:true},
    'hsbc-checking': {provider:'HSBC', name:'HSBC Premier Checking', value:'最高 $3,000', requirement:'$50,000+ 新资金 / 合格资产 · 保持 3 个完整自然月', tags:['高额奖励','银行账户'], art:'bank'},
    'chase-checking': {provider:'CHASE', name:'Chase Total Checking', value:'$400', requirement:'90 天内 Direct Deposit $1,000', tags:['高额奖励','银行账户'], art:'bank'},
    'usbank-checking': {provider:'U.S. BANK', name:'U.S. Bank Smartly® Checking', value:'最高 $450', requirement:'90 天内至少 2 次 DD · 总额 $2,000+', tags:['高额奖励','银行账户'], art:'bank'},
    'truist-checking': {provider:'TRUIST', name:'Truist Checking', value:'$500', requirement:'120 天内 DD $2,000 + 20 次 Debit Card 消费', tags:['高额奖励','银行账户'], art:'bank'},
    'moomoo': {provider:'MOOMOO', name:'Moomoo Brokerage', value:'最高 $1,000 NVDA', requirement:'按入金档位保持资产 60–180 天', tags:['高额奖励','券商账户'], art:'green'},
    'robinhood': {provider:'ROBINHOOD', name:'Robinhood Gold', value:'4.75% APY', requirement:'Gold 会员适用 · 新户可得 $5–$200 碎股', tags:['高息账户','券商账户'], art:'green'},
    'cashback-deal': {provider:'TCB', name:'TopCashback 限时返现', value:'最高 100% 返现', requirement:'仅限符合条件的新用户', tags:['高额返现','限时'], art:'blue'},
    'travel-transfer': {provider:'POINTS', name:'MR → Flying Blue 转点活动', value:'30% 转点加成', requirement:'9 月 30 日前完成转点', tags:['转点','旅行'], art:'purple'},
    'amazon-gift': {provider:'AMAZON', name:'Amazon Mastercard Gift Card', value:'最高 $100', requirement:'符合条件账户可见', tags:['购物','Gift Card'], art:'bank'},
    'panda-mobile': {provider:'PANDA', name:'Panda Mobile 新用户优惠', value:'首月低至 $10', requirement:'仅限新客户', tags:['通信','新用户'], art:'blue'}
  };

  function bodyMarkup(d){
    return `<div class="offer-body">
      <div class="offer-name">${d.name}</div>
      <div class="primary-value">${d.value}</div>
      <div class="requirement">${d.requirement}</div>
      <div class="tag-row">${d.tags.map(t=>`<span class="soft-tag">${t}</span>`).join('')}</div>
    </div>`;
  }

  function fallbackMarkup(card, d){
    const bookmark = card.querySelector('.bookmark');
    const bookmarkHtml = bookmark ? bookmark.outerHTML : '';
    return `<div class="offer-top">
      <span class="provider">${d.provider}</span>
      ${bookmarkHtml}
      <div class="mock-card-art ${d.art}"></div>
    </div>${bodyMarkup(d)}`;
  }

  function hybridMarkup(card,d){
    const img=card.querySelector('.offer-card-mock');
    const bookmark=card.querySelector('.bookmark');
    const src=img?.getAttribute('src')||'';
    const alt=img?.getAttribute('alt')||d.name;
    const bookmarkHtml=bookmark?bookmark.outerHTML:'';
    return `<div class="hybrid-offer-visual"><img src="${src}" alt="${alt}" />${bookmarkHtml}</div>${bodyMarkup(d)}`;
  }

  function applyDefaultProductArt(card){
    if(!card || card.querySelector('img')) return;
    const id=card.dataset.id;
    const src=window.NextBonusCreditCardArt?.resolveOffer?.(id);
    if(!src) return;
    const top=card.querySelector('.offer-top');
    if(!top) return;
    const placeholder=top.querySelector('.mock-card-art');
    if(placeholder) placeholder.remove();
    top.classList.add('has-default-product-art');
    const img=document.createElement('img');
    img.className='default-product-card-art';
    img.src=src;
    img.alt=card.getAttribute('aria-label')||id;
    top.appendChild(img);
    card.dataset.defaultProductArt='1';
  }

  function syncCard(card){
    const id=card.dataset.id;
    const d=CARD_DATA[id];
    if(d && card.dataset.syncedOfferCard!=='1'){
      card.setAttribute('aria-label',d.name);

      if(card.classList.contains('mock-visual-card')){
        card.classList.remove('mock-visual-card');
        if(d.hybrid){
          card.classList.add('hybrid-offer-card','synced-offer-card');
          card.innerHTML=hybridMarkup(card,d);
        }else{
          card.classList.add('fallback-offer-card','synced-offer-card');
          card.innerHTML=fallbackMarkup(card,d);
        }
      }else{
        const name=card.querySelector('.offer-name');
        const value=card.querySelector('.primary-value');
        const requirement=card.querySelector('.requirement');
        const provider=card.querySelector('.provider');
        const tags=card.querySelector('.tag-row');
        if(name) name.textContent=d.name;
        if(value) value.textContent=d.value;
        if(requirement) requirement.textContent=d.requirement;
        if(provider) provider.textContent=d.provider;
        if(tags) tags.innerHTML=d.tags.map(t=>`<span class="soft-tag">${t}</span>`).join('');
      }
      card.dataset.syncedOfferCard='1';
    }

    // Offer-specific artwork wins when an image is explicitly present.
    // Otherwise a credit-card offer inherits the canonical product card face.
    applyDefaultProductArt(card);
  }

  function syncAll(){
    document.querySelectorAll('.offer-card[data-id]').forEach(syncCard);
  }

  new MutationObserver(syncAll).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',syncAll);
  window.addEventListener('nextbonus-card-art-ready',syncAll);
  syncAll();
})();
