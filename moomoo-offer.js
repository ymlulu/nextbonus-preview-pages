(() => {
  'use strict';

  const OFFER_ID='moomoo';

  function isTargetPage(page){
    if(!page) return false;
    const poster=page.querySelector('.v4-generic-poster');
    return !!poster && (poster.textContent||'').includes('Moomoo');
  }

  function renderPoster(shell){
    shell.innerHTML=`
      <div class="mm-poster">
        <div class="mm-tabs"><span>核心奖励</span><span>为什么值得看</span><span>长期价值</span></div>
        <div class="mm-brand"><div class="mm-logo-mark">M</div><b>moomoo</b></div>
        <div class="mm-kicker">INVEST SMARTER</div>
        <div class="mm-title">投资更简单<br>机会更近一步</div>
        <div class="mm-copy">本站新用户专属奖励<br>最高 $1,000 NVDA + $250 额外奖励</div>
        <div class="mm-phone" aria-hidden="true">
          <div class="mm-chart-grid">
            <div class="mm-chart">S&P 500<b>5,584.54</b><i></i></div>
            <div class="mm-chart">NASDAQ<b>17,997.35</b><i></i></div>
            <div class="mm-chart">Dow Jones<b>40,829.59</b><i></i></div>
          </div>
          <div class="mm-phone-list">
            <div class="mm-phone-row"><b>AAPL</b><span>227.19　+1.32%</span></div>
            <div class="mm-phone-row"><b>NVDA</b><span>124.92　+2.18%</span></div>
            <div class="mm-phone-row"><b>TSLA</b><span>248.50　+0.96%</span></div>
          </div>
        </div>
        <div class="mm-feature-row">
          <div class="mm-feature"><b>美股交易</b><small>Stocks / ETF 0 commission</small></div>
          <div class="mm-feature"><b>多重开户奖励</b><small>入金奖励可叠加</small></div>
          <div class="mm-feature"><b>中文支持</b><small>中文界面与客服</small></div>
        </div>
      </div>`;
  }

  function renderPanel(panel){
    const save=panel.querySelector('.v4-detail-save');
    const saved=!!save?.classList.contains('saved');
    panel.innerHTML=`
      <div class="mm-head">
        <div class="mm-head-brand"><div class="mark">M</div><div><strong>Moomoo</strong><small>Invest Smarter</small></div></div>
        <button class="mm-save ${saved?'saved':''}" data-action="bookmark" data-id="${OFFER_ID}">♡ ${saved?'已收藏':'收藏'}</button>
      </div>

      <section class="mm-reward">
        <div class="mm-reward-top">
          <div class="mm-reward-label">开户奖励</div>
          <div class="mm-reward-value">最高 <b>$1,000 NVDA</b></div>
        </div>
        <div class="mm-tier-head"><span>首次累计入金</span><span>NVDA 奖励</span></div>
        <div class="mm-tier"><span>$500</span><span><strong>$30</strong></span></div>
        <div class="mm-tier best"><span>$2,000</span><span><strong>$100</strong><em class="mm-pill">推荐</em></span></div>
        <div class="mm-tier"><span>$10,000</span><span><strong>$200</strong></span></div>
        <div class="mm-tier"><span>$50,000</span><span><strong>$400</strong></span></div>
        <div class="mm-tier"><span>$100,000</span><span><strong>$1,000</strong></span></div>
      </section>

      <div class="mm-stack">
        <div><b>+$150 股票卡</b><small>入金 $1,000，保持 60 天后解锁</small></div>
        <div><b>+$100 交易券</b><small>新用户入金 $100 可获得</small></div>
        <div><b>8.1% APY</b><small>前 $20,000，2 个月 Booster</small></div>
        <div><b>Moomoo Engine</b><small>本站新用户免费一年</small></div>
      </div>

      <section class="mm-flow">
        <h2>如何拿到奖励</h2>
        <div class="mm-timeline">
          <div class="mm-step"><div class="mm-num">1</div><div class="mm-step-card"><div class="mm-step-title"><span>注册并开户</span><span class="mm-time">9 月 30 日前</span></div><ul><li>通过本站 Moomoo 专属入口注册</li><li>使用 SSN / ITIN 完成美国账户开户</li></ul></div></div>
          <div class="mm-step"><div class="mm-num">2</div><div class="mm-step-card"><div class="mm-step-title"><span>完成首次累计入金</span><span class="mm-time">活动期内</span></div><ul><li>$1,000 可解锁本站专属 $150 股票卡资格</li><li>按 $500 / $2,000 / $10,000 / $50,000 / $100,000 档位获得对应 NVDA</li></ul></div></div>
          <div class="mm-step"><div class="mm-num">3</div><div class="mm-step-card"><div class="mm-step-title"><span>保持资产</span><span class="mm-time">60–180 天</span></div><ul><li>$500–$10,000 档位通常保持 60 天</li><li>$50,000 档位分 60 / 120 天发放；$100,000 档位分 60 / 120 / 180 天发放</li></ul></div></div>
          <div class="mm-step"><div class="mm-num">4</div><div class="mm-step-card"><div class="mm-step-title"><span>领取与使用奖励</span><span class="mm-time">满足条件后</span></div><ul><li>$150 股票卡分为 3 张 $50，保持 60 天后解锁</li><li>Cash Sweep Booster 需在 App 中激活</li></ul></div></div>
        </div>
      </section>

      <a class="mm-cta" href="https://www.uscreditcards101.com/go/moomoo" target="_blank" rel="noopener noreferrer">立即开户 <span>↗</span></a>
      <div class="mm-deadline">本站专属 $150 活动：2026 年 9 月 30 日前完成累计入金</div>

      <details class="mm-eligibility">
        <summary>申请前请确认资格要求</summary>
        <div class="mm-eligibility-copy">
          <div>需要 SSN 或 ITIN，并使用美国地址申请。</div>
          <div>本站专属 $150 股票卡仅适用于符合活动条件的新用户，并需通过本站专属链接注册。</div>
          <div>入金后交易产生亏损可能导致资产低于奖励门槛，建议保留一定余量。</div>
        </div>
      </details>`;
  }

  function enhance(){
    const page=document.querySelector('.v4-offer-detail-page');
    if(!isTargetPage(page)) return;
    page.classList.add('bank-bonus-moomoo');
    const shell=page.querySelector('.v4-offer-poster-shell');
    const panel=page.querySelector('.v4-decision-panel');
    if(shell && shell.dataset.moomooReady!=='1'){
      shell.dataset.moomooReady='1';
      renderPoster(shell);
    }
    if(panel && panel.dataset.moomooReady!=='1'){
      panel.dataset.moomooReady='1';
      renderPanel(panel);
    }
  }

  window.setInterval(enhance,120);
})();
