(() => {
  'use strict';

  if (!document.querySelector('link[data-deal-offers-style]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'deal-offers.css';
    link.dataset.dealOffersStyle = '1';
    document.head.appendChild(link);
  }

  const DEALS = {
    'cashback-deal': {match:'TopCashback 限时返现', poster:'tcb', brand:'TopCashback', sub:'全球购物返现平台', logo:'TCB', value:'最高 100% 返现', tone:'pink', title:'如何获得返现', steps:['注册 TopCashback','进入指定商家并完成购买','等待返现追踪与确认'], cta:'立即注册 · 开始返现', terms:['仅限符合活动条件的新用户','不同商家返现比例不同','购买前请确保从 TopCashback 正确跳转到商家']},
    'travel-transfer': {match:'MR → Flying Blue 转点活动', poster:'fb', brand:'Flying Blue', sub:'AIR FRANCE / KLM', logo:'FB', value:'30% 额外里程', tone:'blue', title:'如何参与', steps:['登录 American Express 账户','选择 Flying Blue 并输入转点数量','完成转点并等待里程到账'], cta:'立即转点', terms:['活动卡片显示 9 月 30 日前完成转点','实际加成与资格以转点页面为准','转点通常不可逆']},
    'amazon-gift': {match:'Amazon Mastercard Gift Card', poster:'amazon', brand:'Amazon', sub:'Mastercard Offer', logo:'a', value:'最高 $100 礼品卡', tone:'orange', title:'如何检查是否符合条件', steps:['登录 Amazon 账户','查看是否出现该 Targeted Offer','按页面要求完成符合条件的消费'], cta:'查看 Offer', terms:['这是 Targeted Offer','并非所有账户都有','具体消费与期限以账户页面为准']},
    'panda-mobile': {match:'Panda Mobile 新用户优惠', poster:'panda', brand:'panda mobile', sub:'美国手机网络服务', logo:'P', value:'首月低至 $10', tone:'blue', title:'如何参与', steps:['进入 Panda Mobile','选择符合活动条件的套餐','完成注册、下单和激活'], cta:'立即申请', terms:['当前 Offer 面向新用户','首月低至 $10 适用于指定套餐或活动条件','实际价格与套餐内容以当前页面为准']}
  };

  function poster(type){
    const map = {
      tcb: ['TopCashback','最高 100% 返现','海量商家 · 新用户专享 · 限时优惠','🛒','海量商家','＄','平均返现 5%+','◇','免费注册'],
      fb: ['AIR FRANCE / KLM','MR 转点 30% 加成','用更少的积分，飞更远的世界','✈','覆盖全球','🎁','商务舱','☆','SkyTeam 联盟'],
      amazon: ['amazon','最高 $100 Amazon Gift Card','符合条件账户可见 · Targeted Offer','🎁','最高 $100','▣','账户可见','🛒','日常消费'],
      panda: ['panda mobile','新用户首月低至 $10','全美覆盖 · 高性价比 · 中文支持','◉','全美覆盖','⌕','灵活套餐','♧','中文客服']
    };
    const x = map[type];
    return `<div class="deal-poster deal-${type}"><div class="deal-poster-brand">${x[0]}</div><div class="deal-poster-kicker">CURRENT OFFER</div><div class="deal-poster-title">${x[1]}</div><div class="deal-poster-copy">${x[2]}</div><div class="deal-poster-features"><div class="deal-poster-feature"><i>${x[3]}</i><b>${x[4]}</b></div><div class="deal-poster-feature"><i>${x[5]}</i><b>${x[6]}</b></div><div class="deal-poster-feature"><i>${x[7]}</i><b>${x[8]}</b></div></div></div>`;
  }

  function panel(id,d,saved){
    return `<div class="deal-head"><div class="deal-brand"><div class="deal-logo ${d.tone}">${d.logo}</div><div><strong>${d.brand}</strong><small>${d.sub}</small></div></div><button class="deal-save ${saved?'saved':''}" data-action="bookmark" data-id="${id}">♡ ${saved?'已收藏':'收藏'}</button></div><section class="deal-value-card ${d.tone}"><div class="deal-value-label">当前优惠</div><div class="deal-value">${d.value}</div></section><div class="deal-section-title">${d.title}</div><div class="deal-steps">${d.steps.map((s,i)=>`<div class="deal-step"><div class="deal-step-num ${d.tone}">${i+1}</div><div class="deal-step-copy"><b>${s}</b></div></div>`).join('')}</div><button class="deal-cta ${d.tone}" type="button">${d.cta}</button><details class="deal-terms"><summary>重要信息</summary><div class="deal-terms-copy">${d.terms.map(x=>`<div>• ${x}</div>`).join('')}</div></details>`;
  }

  function enhance(){
    const page = document.querySelector('.v4-offer-detail-page');
    if(!page) return;
    const name = (page.querySelector('.v4-generic-name')?.textContent || '').trim();
    const hit = Object.entries(DEALS).find(([,d]) => name.includes(d.match));
    if(!hit) return;
    const [id,d] = hit;
    if(page.dataset.dealReady === id) return;
    const posterShell = page.querySelector('.v4-offer-poster-shell');
    const panelEl = page.querySelector('.v4-decision-panel');
    if(!posterShell || !panelEl) return;
    const saved = !!panelEl.querySelector('.v4-detail-save.saved');
    page.classList.add('deal-detail');
    posterShell.innerHTML = poster(d.poster);
    panelEl.innerHTML = panel(id,d,saved);
    page.dataset.dealReady = id;
  }

  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',enhance);
  enhance();
})();

import('./remaining-offers.js');
