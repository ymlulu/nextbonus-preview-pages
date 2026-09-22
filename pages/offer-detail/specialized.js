(() => {
  'use strict';

  const icon=(name,className='')=>window.NextBonusIcons?.svg?.(name,className)||'';

  const DEALS={
    'cashback-deal':{poster:'tcb',brand:'TopCashback',sub:'全球购物返现平台',logo:'TCB',value:'最高 100% 返现',tone:'pink',title:'如何获得返现',steps:['注册 TopCashback','进入指定商家并完成购买','等待返现追踪与确认'],cta:'立即注册 · 开始返现',terms:['仅限符合活动条件的新用户','不同商家返现比例不同','购买前请确保从 TopCashback 正确跳转到商家']},
    'travel-transfer':{poster:'fb',brand:'Flying Blue',sub:'AIR FRANCE / KLM',logo:'FB',value:'30% 额外里程',tone:'blue',title:'如何参与',steps:['登录 American Express 账户','选择 Flying Blue 并输入转点数量','完成转点并等待里程到账'],cta:'立即转点',terms:['活动卡片显示 9 月 30 日前完成转点','实际加成与资格以转点页面为准','转点通常不可逆']},
    'amazon-gift':{poster:'amazon',brand:'Amazon',sub:'Mastercard Offer',logo:'a',value:'最高 $100 礼品卡',tone:'orange',title:'如何检查是否符合条件',steps:['登录 Amazon 账户','查看是否出现该 Targeted Offer','按页面要求完成符合条件的消费'],cta:'查看 Offer',terms:['这是 Targeted Offer','并非所有账户都有','具体消费与期限以账户页面为准']},
    'panda-mobile':{poster:'panda',brand:'panda mobile',sub:'美国手机网络服务',logo:'P',value:'首月低至 $10',tone:'blue',title:'如何参与',steps:['进入 Panda Mobile','选择符合活动条件的套餐','完成注册、下单和激活'],cta:'立即申请',terms:['当前 Offer 面向新用户','首月低至 $10 适用于指定套餐或活动条件','实际价格与套餐内容以当前页面为准']}
  };

  function followButton(className,id,saved){
    const label=saved?'已关注':'关注';
    const hint=saved?'已关注，点击取消':'关注';
    return `<button class="${className} nb-follow-control ${saved?'saved':''}" data-action="bookmark" data-id="${id}" aria-label="${hint}" title="${hint}"><span class="nb-follow-label">${label}</span></button>`;
  }

  function productName(offer){
    return window.NextBonusOfferProducts?.[offer?.id]?.name||offer?.name||'';
  }

  function panelHead(className,followClass,offer,saved){
    return `<div class="${className}"><div class="nb-specialized-offer-title" data-nb-type="title2">${productName(offer)}</div>${followButton(followClass,offer.id,saved)}</div>`;
  }

  const REMAINING={
    'hsbc-checking':{
      poster:'hsbc',brand:'HSBC',sub:'Premier Checking',mark:'HSBC',markClass:'hsbc',title:'HSBC Premier',posterValue:'最高 $3,000',
      copy:'新客户转入新资金或符合条件的投资资产，不要求 Direct Deposit。',features:[['$50k 起','最低档'],['3 个月','保持资金'],['12/31','活动截止']],
      reward:'最高 $3,000',rewardSub:'当前美卡101银行奖励排行榜显示活动至 2026 年 12 月 31 日。',
      tiers:[['$50,000–$99,999','$1,000'],['$100,000–$249,999','$1,500'],['$250,000–$499,999','$2,000'],['$500,000+','$3,000']],
      steps:[['开户','通过当前 Premier Offer 开户。','12/31 前'],['转入资产','从 HSBC 外部转入新资金或符合条件的投资资产。','开户后'],['保持资产','按档位保持资金 3 个完整自然月。','3 个月'],['等待奖励','完成要求后等待对应 Bonus。','完成后']],
      cta:'查看最新 HSBC Offer',source:'https://www.uscreditcards101.com/zh/cn/article/best-bank-bonus/',deadline:'活动截止：2026 年 12 月 31 日',
      eligibility:['当前活动面向新客户。','最低 $50,000 对应 $1,000 奖励。','历史 HSBC 账户可能影响资格，最终以当前活动条款为准。']
    },
    'truist-checking':{
      poster:'truist',brand:'Truist',sub:'Checking',mark:'T',markClass:'truist',title:'Truist Checking',posterValue:'$500',
      copy:'120 天内完成 $2,000 Direct Deposit + 20 次 Debit Card 消费。',features:[['$2,000 DD','总额'],['20 次','Debit Card'],['120 天','完成窗口']],
      reward:'$500',rewardSub:'当前美卡101文章将其标为史高开户奖励。',
      steps:[['开户','通过当前 Offer 开立符合条件的 Truist Checking。','2/2 前'],['完成 DD','120 天内至少 2 次 Direct Deposit，总额达到 $2,000。','120 天'],['完成消费','120 天内完成 20 次 Debit Card 消费。','120 天'],['等待 Bonus','近期 DP 显示满足条件后通常很快到账。','完成后']],
      cta:'查看 Truist Offer',source:'https://www.uscreditcards101.com/zh/cn/article/truist-checking/',deadline:'活动截止：2027 年 2 月 2 日',
      eligibility:['仅支持文章列出的州和华盛顿特区邮寄地址。','身份信息按实际情况填写。','信用卡开户 Funding 可能被算作 Cash Advance。']
    },
    'chase-checking':{
      poster:'chase',brand:'Chase',sub:'Total Checking',mark:'CHASE',markClass:'chase',title:'Chase Total Checking',posterValue:'$400',
      copy:'90 天内完成 $1,000 Direct Deposit，即可拿当前开户奖励。',features:[['$1,000 DD','90 天内'],['$400','开户奖励'],['10/14','活动截止']],
      reward:'$400',rewardSub:'当前美卡101版本显示：90 天内完成 $1,000 Direct Deposit。',
      steps:[['获取 Offer 并开户','通过当前活动入口开立 Chase Total Checking。','10/14 前'],['完成 DD','开户后 90 天内累计完成 $1,000 Direct Deposit。','90 天'],['保持账户正常','避免负余额等影响奖励资格的情况。','奖励前'],['等待奖励','完成要求后等待 Chase 发放 Bonus。','完成后']],
      cta:'查看 Chase Offer',source:'https://www.uscreditcards101.com/zh/cn/article/chase-checking-saving-account-review/',deadline:'活动截止：2026 年 10 月 14 日',
      eligibility:['近期关闭 Chase Checking 可能影响资格。','历史负余额账户可能影响 Bonus 资格。','最终资格以活动落地页条款为准。']
    },
    'robinhood':{
      poster:'robinhood',brand:'Robinhood',sub:'Brokerage + Gold',mark:'RH',markClass:'robinhood',green:true,title:'Robinhood Gold',posterValue:'4.75% APY',
      copy:'文章当前同时展示开户可得 $5–$200 碎股，Gold 提供更高闲置现金收益。',features:[['$5–$200','开户碎股'],['4.75% APY','Gold'],['$0','股票交易佣金']],
      reward:'4.75% APY',rewardSub:'美卡101当前 Robinhood 文章仍展示 Gold 4.75% APY，并提供 $5–$200 开户碎股。',
      steps:[['注册 Robinhood','填写账户与身份信息。','现在'],['完成开户','连接银行账户并提交申请。','开户时'],['领取碎股','符合条件的新账户可领取 $5–$200 碎股。','开户后'],['按需升级 Gold','需要更高闲置现金收益等权益时再开 Gold。','可选']],
      cta:'查看 Robinhood Offer',source:'https://www.uscreditcards101.com/zh/cn/article/robinhood-free-stock/',deadline:'当前文章：开户碎股 $5–$200；Gold 4.75% APY',
      eligibility:['开户需要提供 SSN。','开户碎股面向符合条件的新账户。','Gold APY 和会员价格可能调整，使用前以 Robinhood 当前页面为准。']
    }
  };

  const dealPosterMap={
    tcb:['TopCashback','最高 100% 返现','海量商家 · 新用户专享 · 限时优惠','🛒','海量商家','＄','平均返现 5%+','◇','免费注册'],
    fb:['AIR FRANCE / KLM','MR 转点 30% 加成','用更少的积分，飞更远的世界','✈','覆盖全球','🎁','商务舱','☆','SkyTeam 联盟'],
    amazon:['amazon','最高 $100 Amazon Gift Card','符合条件账户可见 · Targeted Offer','🎁','最高 $100','▣','账户可见','🛒','日常消费'],
    panda:['panda mobile','新用户首月低至 $10','全美覆盖 · 高性价比 · 中文支持','◉','全美覆盖','⌕','灵活套餐','♧','中文客服']
  };

  function dealPoster(type,offer){
    const x=dealPosterMap[type];
    const value=offer?.primaryValue||x[1];
    return `<div class="deal-poster deal-${type}"><div class="deal-poster-brand">${x[0]}</div><div class="deal-poster-kicker">CURRENT OFFER</div><div class="deal-poster-title">${value}</div><div class="deal-poster-copy">${x[2]}</div><div class="deal-poster-features"><div class="deal-poster-feature"><i>${x[3]}</i><b>${x[4]}</b></div><div class="deal-poster-feature"><i>${x[5]}</i><b>${x[6]}</b></div><div class="deal-poster-feature"><i>${x[7]}</i><b>${x[8]}</b></div></div></div>`;
  }

  function dealPanel(id,d,saved,offer){
    const value=offer?.primaryValue||d.value;
    const requirement=offer?.primaryRequirement||'';
    const terms=requirement&&!d.terms.includes(requirement)?[requirement,...d.terms]:d.terms;
    return `${panelHead('deal-head','deal-save',offer,saved)}<section class="deal-value-card ${d.tone}"><div class="deal-value-label">当前优惠</div><div class="deal-value">${value}</div></section><div class="deal-section-title">${d.title}</div><div class="deal-steps">${d.steps.map((step,i)=>`<div class="deal-step"><div class="deal-step-num ${d.tone}">${i+1}</div><div class="deal-step-copy"><b>${step}</b></div></div>`).join('')}</div><button class="deal-cta ${d.tone}" type="button">${d.cta}</button><details class="deal-terms"><summary>重要信息</summary><div class="deal-terms-copy">${terms.map(x=>`<div>• ${x}</div>`).join('')}</div></details>`;
  }

  function remainingPoster(d,offer){
    return `<div class="remaining-poster poster-${d.poster}"><div class="remaining-brand">${d.brand.toUpperCase()}</div><div class="remaining-title">${d.title}</div><div class="remaining-kicker">CURRENT OFFER</div><div class="remaining-value">${offer?.primaryValue||d.posterValue}</div><div class="remaining-copy">${d.copy}</div><div class="remaining-features">${d.features.map(x=>`<div class="remaining-feature"><b>${x[0]}</b><small>${x[1]}</small></div>`).join('')}</div></div>`;
  }

  function remainingPanel(id,d,saved,offer){
    const tiers=d.tiers?`<div class="remaining-tier-head"><span>任务金额</span><span>奖励金额</span></div>${d.tiers.map((x,i)=>`<div class="remaining-tier ${i===0?'best':''}"><span>${x[0]}</span><span><strong>${x[1]}</strong></span></div>`).join('')}`:'';
    return `${panelHead('remaining-head','remaining-save',offer,saved)}<section class="remaining-reward"><div class="remaining-reward-top ${d.green?'green':''}"><div class="remaining-reward-label">当前核心奖励</div><div class="remaining-reward-value">${offer?.primaryValue||d.reward}</div><div class="remaining-reward-sub">${d.rewardSub}</div></div>${tiers}</section><div class="remaining-section-title">如何完成</div><div class="remaining-timeline">${d.steps.map((step,i)=>`<div class="remaining-step"><div class="remaining-num ${d.green?'green':''}">${i+1}</div><div class="remaining-step-card"><div class="remaining-step-title"><span>${step[0]}</span><span class="remaining-time">${step[2]}</span></div><ul><li>${step[1]}</li></ul></div></div>`).join('')}</div><a class="remaining-cta ${d.green?'green':''}" href="${d.source}" target="_blank" rel="noopener noreferrer">${d.cta} ${icon('external-link','nb-inline-action-icon')}</a><div class="remaining-deadline">${d.deadline}</div><details class="remaining-eligibility"><summary>申请前请确认资格要求</summary><div class="remaining-eligibility-copy">${d.eligibility.map(x=>`<div>• ${x}</div>`).join('')}</div></details>`;
  }

  function usbankPanel(saved,offer){
    return `
      ${panelHead('nb-bank-head','nb-bank-save',offer,saved)}
      <section class="nb-bank-reward"><div class="nb-bank-reward-top"><div class="nb-bank-reward-label">开户奖励</div><div class="nb-bank-reward-value">最高 <b>$450</b></div></div><div class="nb-bank-tier-head"><span>90 天内 Direct Deposit 总额</span><span>奖励金额</span></div><div class="nb-bank-tier"><span>$2,000 – $4,999</span><span><strong>$250</strong></span></div><div class="nb-bank-tier"><span>$5,000 – $7,999</span><span><strong>$350</strong></span></div><div class="nb-bank-tier best"><span>$8,000+</span><span><strong>$450</strong><em class="nb-best-pill">最高</em></span></div></section>
      <section class="nb-bank-flow"><h2>如何拿到奖励</h2><div class="nb-bank-timeline">
      <div class="nb-bank-step"><div class="nb-bank-step-num">1</div><div class="nb-bank-step-card"><div class="nb-bank-step-title"><span>开户</span><span class="nb-bank-step-time">11 月 10 日前</span></div><ul><li>通过当前 Offer 入口开立 U.S. Bank Smartly Checking</li></ul></div></div>
      <div class="nb-bank-step"><div class="nb-bank-step-num">2</div><div class="nb-bank-step-card"><div class="nb-bank-step-title"><span>开户后 30 天内</span><span class="nb-bank-step-time">30 天内</span></div><ul><li>存入至少 $25，不要求 direct deposit</li></ul></div></div>
      <div class="nb-bank-step"><div class="nb-bank-step-num">3</div><div class="nb-bank-step-card"><div class="nb-bank-step-title"><span>开户后 90 天内</span><span class="nb-bank-step-time">90 天内</span></div><ul><li>设置并登录 U.S. Bank 网银 / App</li><li>完成至少 2 次 direct deposit</li><li>90 天内 DD 总额达到目标奖励档位</li></ul></div></div>
      <div class="nb-bank-step"><div class="nb-bank-step-num">4</div><div class="nb-bank-step-card"><div class="nb-bank-step-title"><span>完成任务后</span><span class="nb-bank-step-time">完成后</span></div><ul><li>可通过 My Progress 查看奖励进度</li><li>等待对应档位 Bonus 到账</li></ul></div></div>
      </div></section>
      <a class="nb-bank-cta" href="https://www.uscreditcards101.com/go/usbank-checking" target="_blank" rel="noopener noreferrer">立即开户 ${icon('external-link','nb-inline-action-icon')}</a><div class="nb-bank-deadline">当前活动截止：2026 年 11 月 10 日</div>
      <details class="nb-bank-eligibility"><summary>申请前请确认资格要求</summary><div class="nb-bank-eligibility-copy"><div>开户时不能已经持有 U.S. Bank consumer checking。</div><div>过去 12 个月不能持有过 U.S. Bank consumer checking。</div><div>过去 12 个月不能获得过其他 U.S. Bank consumer checking bonus。</div></div></details>`;
  }

  function moomooPoster(){
    return `<div class="mm-poster"><div class="mm-tabs"><span>核心奖励</span><span>为什么值得看</span><span>长期价值</span></div><div class="mm-brand"><div class="mm-logo-mark">M</div><b>moomoo</b></div><div class="mm-kicker">INVEST SMARTER</div><div class="mm-title">投资更简单<br>机会更近一步</div><div class="mm-copy">本站新用户专属奖励<br>最高 $1,000 NVDA + $250 额外奖励</div><div class="mm-phone" aria-hidden="true"><div class="mm-chart-grid"><div class="mm-chart">S&P 500<b>5,584.54</b><i></i></div><div class="mm-chart">NASDAQ<b>17,997.35</b><i></i></div><div class="mm-chart">Dow Jones<b>40,829.59</b><i></i></div></div><div class="mm-phone-list"><div class="mm-phone-row"><b>AAPL</b><span>227.19　+1.32%</span></div><div class="mm-phone-row"><b>NVDA</b><span>124.92　+2.18%</span></div><div class="mm-phone-row"><b>TSLA</b><span>248.50　+0.96%</span></div></div></div><div class="mm-feature-row"><div class="mm-feature"><b>美股交易</b><small>Stocks / ETF 0 commission</small></div><div class="mm-feature"><b>多重开户奖励</b><small>入金奖励可叠加</small></div><div class="mm-feature"><b>中文支持</b><small>中文界面与客服</small></div></div></div>`;
  }

  function moomooPanel(saved,offer){
    return `${panelHead('mm-head','mm-save',offer,saved)}
    <section class="mm-reward"><div class="mm-reward-top"><div class="mm-reward-label">开户奖励</div><div class="mm-reward-value">最高 <b>$1,000 NVDA</b></div></div><div class="mm-tier-head"><span>首次累计入金</span><span>NVDA 奖励</span></div><div class="mm-tier"><span>$500</span><span><strong>$30</strong></span></div><div class="mm-tier best"><span>$2,000</span><span><strong>$100</strong><em class="mm-pill">推荐</em></span></div><div class="mm-tier"><span>$10,000</span><span><strong>$200</strong></span></div><div class="mm-tier"><span>$50,000</span><span><strong>$400</strong></span></div><div class="mm-tier"><span>$100,000</span><span><strong>$1,000</strong></span></div></section>
    <div class="mm-stack"><div><b>+$150 股票卡</b><small>入金 $1,000，保持 60 天后解锁</small></div><div><b>+$100 交易券</b><small>新用户入金 $100 可获得</small></div><div><b>8.1% APY</b><small>前 $20,000，2 个月 Booster</small></div><div><b>Moomoo Engine</b><small>本站新用户免费一年</small></div></div>
    <section class="mm-flow"><h2>如何拿到奖励</h2><div class="mm-timeline"><div class="mm-step"><div class="mm-num">1</div><div class="mm-step-card"><div class="mm-step-title"><span>注册并开户</span><span class="mm-time">9 月 30 日前</span></div><ul><li>通过本站 Moomoo 专属入口注册</li><li>使用 SSN / ITIN 完成美国账户开户</li></ul></div></div><div class="mm-step"><div class="mm-num">2</div><div class="mm-step-card"><div class="mm-step-title"><span>完成首次累计入金</span><span class="mm-time">活动期内</span></div><ul><li>$1,000 可解锁本站专属 $150 股票卡资格</li><li>按 $500 / $2,000 / $10,000 / $50,000 / $100,000 档位获得对应 NVDA</li></ul></div></div><div class="mm-step"><div class="mm-num">3</div><div class="mm-step-card"><div class="mm-step-title"><span>保持资产</span><span class="mm-time">60–180 天</span></div><ul><li>$500–$10,000 档位通常保持 60 天</li><li>$50,000 档位分 60 / 120 天发放；$100,000 档位分 60 / 120 / 180 天发放</li></ul></div></div><div class="mm-step"><div class="mm-num">4</div><div class="mm-step-card"><div class="mm-step-title"><span>领取与使用奖励</span><span class="mm-time">满足条件后</span></div><ul><li>$150 股票卡分为 3 张 $50，保持 60 天后解锁</li><li>Cash Sweep Booster 需在 App 中激活</li></ul></div></div></div></section>
    <a class="mm-cta" href="https://www.uscreditcards101.com/go/moomoo" target="_blank" rel="noopener noreferrer">立即开户 ${icon('external-link','nb-inline-action-icon')}</a><div class="mm-deadline">本站专属 $150 活动：2026 年 9 月 30 日前完成累计入金</div><details class="mm-eligibility"><summary>申请前请确认资格要求</summary><div class="mm-eligibility-copy"><div>需要 SSN 或 ITIN，并使用美国地址申请。</div><div>本站专属 $150 股票卡仅适用于符合活动条件的新用户，并需通过本站专属链接注册。</div><div>入金后交易产生亏损可能导致资产低于奖励门槛，建议保留一定余量。</div></div></details>`;
  }

  function render(offer,saved){
    if(!offer?.id) return null;
    if(offer.id==='usbank-checking') return Object.freeze({className:'bank-bonus-usbank',poster:null,panel:usbankPanel(saved,offer)});
    if(offer.id==='moomoo') return Object.freeze({className:'bank-bonus-moomoo',poster:moomooPoster(),panel:moomooPanel(saved,offer)});
    if(DEALS[offer.id]) return Object.freeze({className:'deal-detail',poster:dealPoster(DEALS[offer.id].poster,offer),panel:dealPanel(offer.id,DEALS[offer.id],saved,offer)});
    if(REMAINING[offer.id]) return Object.freeze({className:'remaining-offer',poster:remainingPoster(REMAINING[offer.id],offer),panel:remainingPanel(offer.id,REMAINING[offer.id],saved,offer)});
    return null;
  }

  window.NextBonusOfferDetailSpecialized=Object.freeze({render});
})();