(() => {
  'use strict';

  if(!document.querySelector('link[data-remaining-offers-style]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='remaining-offers.css';
    link.dataset.remainingOffersStyle='1';
    document.head.appendChild(link);
  }

  const OFFERS={
    'hsbc-checking':{
      match:'HSBC Premier Checking',poster:'hsbc',brand:'HSBC',sub:'Premier Checking',mark:'HSBC',markClass:'hsbc',
      title:'HSBC Premier',posterValue:'最高 $3,000',copy:'新客户转入新资金或符合条件的投资资产，不要求 Direct Deposit。',
      features:[['$50k 起','最低档'],['3 个月','保持资金'],['12/31','活动截止']],
      reward:'最高 $3,000',rewardSub:'当前美卡101银行奖励排行榜显示活动至 2026 年 12 月 31 日。',
      tiers:[['$50,000–$99,999','$1,000'],['$100,000–$249,999','$1,500'],['$250,000–$499,999','$2,000'],['$500,000+','$3,000']],
      steps:[['开户','通过当前 Premier Offer 开户。','12/31 前'],['转入资产','从 HSBC 外部转入新资金或符合条件的投资资产。','开户后'],['保持资产','按档位保持资金 3 个完整自然月。','3 个月'],['等待奖励','完成要求后等待对应 Bonus。','完成后']],
      cta:'查看最新 HSBC Offer',source:'https://www.uscreditcards101.com/zh/cn/article/best-bank-bonus/',deadline:'活动截止：2026 年 12 月 31 日',
      eligibility:['当前活动面向新客户。','最低 $50,000 对应 $1,000 奖励。','历史 HSBC 账户可能影响资格，最终以当前活动条款为准。']
    },
    'truist-checking':{
      match:'Truist Checking',poster:'truist',brand:'Truist',sub:'Checking',mark:'T',markClass:'truist',
      title:'Truist Checking',posterValue:'$500',copy:'120 天内完成 $2,000 Direct Deposit + 20 次 Debit Card 消费。',
      features:[['$2,000 DD','总额'],['20 次','Debit Card'],['120 天','完成窗口']],
      reward:'$500',rewardSub:'当前美卡101文章将其标为史高开户奖励。',
      steps:[['开户','通过当前 Offer 开立符合条件的 Truist Checking。','2/2 前'],['完成 DD','120 天内至少 2 次 Direct Deposit，总额达到 $2,000。','120 天'],['完成消费','120 天内完成 20 次 Debit Card 消费。','120 天'],['等待 Bonus','近期 DP 显示满足条件后通常很快到账。','完成后']],
      cta:'查看 Truist Offer',source:'https://www.uscreditcards101.com/zh/cn/article/truist-checking/',deadline:'活动截止：2027 年 2 月 2 日',
      eligibility:['仅支持文章列出的州和华盛顿特区邮寄地址。','身份信息按实际情况填写。','信用卡开户 Funding 可能被算作 Cash Advance。']
    },
    'chase-checking':{
      match:'Chase Checking',poster:'chase',brand:'Chase',sub:'Total Checking',mark:'CHASE',markClass:'chase',
      title:'Chase Total Checking',posterValue:'$400',copy:'90 天内完成 $1,000 Direct Deposit，即可拿当前开户奖励。',
      features:[['$1,000 DD','90 天内'],['$400','开户奖励'],['10/14','活动截止']],
      reward:'$400',rewardSub:'当前美卡101版本显示：90 天内完成 $1,000 Direct Deposit。',
      steps:[['获取 Offer 并开户','通过当前活动入口开立 Chase Total Checking。','10/14 前'],['完成 DD','开户后 90 天内累计完成 $1,000 Direct Deposit。','90 天'],['保持账户正常','避免负余额等影响奖励资格的情况。','奖励前'],['等待奖励','完成要求后等待 Chase 发放 Bonus。','完成后']],
      cta:'查看 Chase Offer',source:'https://www.uscreditcards101.com/zh/cn/article/chase-checking-saving-account-review/',deadline:'活动截止：2026 年 10 月 14 日',
      eligibility:['近期关闭 Chase Checking 可能影响资格。','历史负余额账户可能影响 Bonus 资格。','最终资格以活动落地页条款为准。']
    },
    'robinhood':{
      match:'Robinhood Gold',poster:'robinhood',brand:'Robinhood',sub:'Brokerage + Gold',mark:'RH',markClass:'robinhood',green:true,
      title:'Robinhood Gold',posterValue:'4.75% APY',copy:'文章当前同时展示开户可得 $5–$200 碎股，Gold 提供更高闲置现金收益。',
      features:[['$5–$200','开户碎股'],['4.75% APY','Gold'],['$0','股票交易佣金']],
      reward:'4.75% APY',rewardSub:'美卡101当前 Robinhood 文章仍展示 Gold 4.75% APY，并提供 $5–$200 开户碎股。',
      steps:[['注册 Robinhood','填写账户与身份信息。','现在'],['完成开户','连接银行账户并提交申请。','开户时'],['领取碎股','符合条件的新账户可领取 $5–$200 碎股。','开户后'],['按需升级 Gold','需要更高闲置现金收益等权益时再开 Gold。','可选']],
      cta:'查看 Robinhood Offer',source:'https://www.uscreditcards101.com/zh/cn/article/robinhood-free-stock/',deadline:'当前文章：开户碎股 $5–$200；Gold 4.75% APY',
      eligibility:['开户需要提供 SSN。','开户碎股面向符合条件的新账户。','Gold APY 和会员价格可能调整，使用前以 Robinhood 当前页面为准。']
    }
  };

  function posterHtml(d){
    return `<div class="remaining-poster poster-${d.poster}"><div class="remaining-brand">${d.brand.toUpperCase()}</div><div class="remaining-title">${d.title}</div><div class="remaining-kicker">CURRENT OFFER</div><div class="remaining-value">${d.posterValue}</div><div class="remaining-copy">${d.copy}</div><div class="remaining-features">${d.features.map(x=>`<div class="remaining-feature"><b>${x[0]}</b><small>${x[1]}</small></div>`).join('')}</div></div>`;
  }

  function panelHtml(id,d,saved){
    const tiers=d.tiers?`<div class="remaining-tier-head"><span>任务金额</span><span>奖励金额</span></div>${d.tiers.map((x,i)=>`<div class="remaining-tier ${i===0?'best':''}"><span>${x[0]}</span><span><strong>${x[1]}</strong></span></div>`).join('')}`:'';
    return `<div class="remaining-head"><div class="remaining-head-brand"><div class="remaining-mark ${d.markClass}">${d.mark}</div><div><strong>${d.brand}</strong><small>${d.sub}</small></div></div><button class="remaining-save ${saved?'saved':''}" data-action="bookmark" data-id="${id}">♡ ${saved?'已收藏':'收藏'}</button></div><section class="remaining-reward"><div class="remaining-reward-top ${d.green?'green':''}"><div class="remaining-reward-label">当前核心奖励</div><div class="remaining-reward-value">${d.reward}</div><div class="remaining-reward-sub">${d.rewardSub}</div></div>${tiers}</section><div class="remaining-section-title">如何完成</div><div class="remaining-timeline">${d.steps.map((s,i)=>`<div class="remaining-step"><div class="remaining-num ${d.green?'green':''}">${i+1}</div><div class="remaining-step-card"><div class="remaining-step-title"><span>${s[0]}</span><span class="remaining-time">${s[2]}</span></div><ul><li>${s[1]}</li></ul></div></div>`).join('')}</div><a class="remaining-cta ${d.green?'green':''}" href="${d.source}" target="_blank" rel="noopener noreferrer">${d.cta} <span>↗</span></a><div class="remaining-deadline">${d.deadline}</div><details class="remaining-eligibility"><summary>申请前请确认资格要求</summary><div class="remaining-eligibility-copy">${d.eligibility.map(x=>`<div>• ${x}</div>`).join('')}</div></details>`;
  }

  function enhance(){
    const page=document.querySelector('.v4-offer-detail-page');
    if(!page) return;
    const name=(page.querySelector('.v4-generic-name')?.textContent||'').trim();
    const hit=Object.entries(OFFERS).find(([,d])=>name.includes(d.match));
    if(!hit) return;
    const [id,d]=hit;
    if(page.dataset.remainingReady===id) return;
    const posterShell=page.querySelector('.v4-offer-poster-shell');
    const panel=page.querySelector('.v4-decision-panel');
    if(!posterShell||!panel) return;
    const saved=!!panel.querySelector('.v4-detail-save.saved');
    page.classList.add('remaining-offer');
    posterShell.innerHTML=posterHtml(d);
    panel.innerHTML=panelHtml(id,d,saved);
    page.dataset.remainingReady=id;
  }

  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',enhance);
  enhance();
})();
