(() => {
  'use strict';

  const OFFER_ID = 'usbank-checking';

  function isTargetPage(page){
    if(!page) return false;
    const poster = page.querySelector('.v4-generic-poster');
    return !!poster && (poster.textContent || '').includes('U.S. Bank Smartly');
  }

  function renderBankPanel(panel){
    const save = panel.querySelector('.v4-detail-save');
    const saved = !!save && save.classList.contains('saved');

    panel.innerHTML = `
      <div class="nb-bank-head">
        <div class="nb-bank-brand">
          <div class="nb-bank-mark">US</div>
          <div><strong>US Bank</strong><small>Smartly Checking</small></div>
        </div>
        <button class="nb-bank-save ${saved ? 'saved' : ''}" data-action="bookmark" data-id="${OFFER_ID}">♡ ${saved ? '已收藏' : '收藏'}</button>
      </div>

      <section class="nb-bank-reward">
        <div class="nb-bank-reward-top">
          <div class="nb-bank-reward-label">开户奖励</div>
          <div class="nb-bank-reward-value">最高 <b>$450</b></div>
        </div>
        <div class="nb-bank-tier-head"><span>90 天内 Direct Deposit 总额</span><span>奖励金额</span></div>
        <div class="nb-bank-tier"><span>$2,000 – $4,999</span><span><strong>$250</strong></span></div>
        <div class="nb-bank-tier"><span>$5,000 – $7,999</span><span><strong>$350</strong></span></div>
        <div class="nb-bank-tier best"><span>$8,000+</span><span><strong>$450</strong><em class="nb-best-pill">最高</em></span></div>
      </section>

      <section class="nb-bank-flow">
        <h2>如何拿到奖励</h2>
        <div class="nb-bank-timeline">
          <div class="nb-bank-step">
            <div class="nb-bank-step-num">1</div>
            <div class="nb-bank-step-card">
              <div class="nb-bank-step-title"><span>开户</span><span class="nb-bank-step-time">11 月 10 日前</span></div>
              <ul><li>通过当前 Offer 入口开立 U.S. Bank Smartly Checking</li></ul>
            </div>
          </div>
          <div class="nb-bank-step">
            <div class="nb-bank-step-num">2</div>
            <div class="nb-bank-step-card">
              <div class="nb-bank-step-title"><span>开户后 30 天内</span><span class="nb-bank-step-time">30 天内</span></div>
              <ul><li>存入至少 $25，不要求 direct deposit</li></ul>
            </div>
          </div>
          <div class="nb-bank-step">
            <div class="nb-bank-step-num">3</div>
            <div class="nb-bank-step-card">
              <div class="nb-bank-step-title"><span>开户后 90 天内</span><span class="nb-bank-step-time">90 天内</span></div>
              <ul><li>设置并登录 U.S. Bank 网银 / App</li><li>完成至少 2 次 direct deposit</li><li>90 天内 DD 总额达到目标奖励档位</li></ul>
            </div>
          </div>
          <div class="nb-bank-step">
            <div class="nb-bank-step-num">4</div>
            <div class="nb-bank-step-card">
              <div class="nb-bank-step-title"><span>完成任务后</span><span class="nb-bank-step-time">完成后</span></div>
              <ul><li>可通过 My Progress 查看奖励进度</li><li>等待对应档位 Bonus 到账</li></ul>
            </div>
          </div>
        </div>
      </section>

      <a class="nb-bank-cta" href="https://www.uscreditcards101.com/go/usbank-checking" target="_blank" rel="noopener noreferrer">立即开户 <span>↗</span></a>
      <div class="nb-bank-deadline">当前活动截止：2026 年 11 月 10 日</div>

      <details class="nb-bank-eligibility">
        <summary>申请前请确认资格要求</summary>
        <div class="nb-bank-eligibility-copy">
          <div>开户时不能已经持有 U.S. Bank consumer checking。</div>
          <div>过去 12 个月不能持有过 U.S. Bank consumer checking。</div>
          <div>过去 12 个月不能获得过其他 U.S. Bank consumer checking bonus。</div>
        </div>
      </details>
    `;
  }

  function enhance(){
    const page = document.querySelector('.v4-offer-detail-page');
    if(!isTargetPage(page)) return;
    page.classList.add('bank-bonus-usbank');
    const panel = page.querySelector('.v4-decision-panel');
    if(!panel || panel.dataset.bankBonusReady === '1') return;
    panel.dataset.bankBonusReady = '1';
    renderBankPanel(panel);
  }

  window.setInterval(enhance, 120);
})();

(() => {
  if(document.getElementById('offer-detail-shell-contract')) return;
  const style = document.createElement('style');
  style.id = 'offer-detail-shell-contract';
  style.textContent = `
    @media (min-width:1181px){
      .v4-offer-detail-page{max-width:1210px;margin-left:auto;margin-right:auto}
      .v4-offer-detail-grid{height:760px;min-height:760px;grid-template-columns:minmax(0,58fr) minmax(390px,42fr);gap:8px;align-items:stretch}
      .v4-offer-poster-shell,.v4-decision-panel{box-sizing:border-box;width:100%;height:760px;min-height:760px;max-height:760px}
      .v4-offer-poster-shell{overflow:hidden}
      .v4-reference-poster,.v4-generic-poster,.mm-poster{width:100%;height:100%;min-height:0}
      .v4-reference-poster img{display:block;width:100%;height:100%;object-fit:cover}
      .v4-decision-panel{overflow-y:auto}
      .bank-bonus-usbank .v4-decision-panel,.bank-bonus-moomoo .v4-decision-panel{height:760px;min-height:760px;max-height:760px}
      .bank-bonus-usbank .v4-generic-poster,.bank-bonus-moomoo .mm-poster{height:100%;min-height:0}
    }
  `;
  document.head.appendChild(style);
})();

import('./moomoo-style.js');
import('./moomoo-offer.js');
(() => {
  if(document.getElementById('credit-card-product-detail-css')) return;
  const link = document.createElement('link');
  link.id = 'credit-card-product-detail-css';
  link.rel = 'stylesheet';
  link.href = './credit-card-product-detail.css';
  document.head.appendChild(link);
})();
import('./credit-card-product-detail.js');
import('./credit-card-art.js');
