(() => {
  'use strict';

  function productFactFor(offerId){
    const map={
      'chase-sapphire':'chase-sapphire-preferred',
      'amex-gold':'amex-gold',
      'amex-platinum':'amex-platinum',
      'bilt-palladium':'bilt-palladium',
      'capitalone-venturex':'capitalone-venturex',
      'citi-strata':'citi-strata-elite'
    };
    return window.NextBonusCreditCardProductFacts?.cards?.[map[offerId]||offerId]||null;
  }

  function annualMoney(value,{signed=false}={}){
    const n=Math.round(Number(value)||0);
    const abs=Math.abs(n).toLocaleString('en-US');
    if(signed) return `${n>=0?'+':'-'}$${abs}`;
    return `${n<0?'-':''}$${abs}`;
  }

  function annualResultFor(state,offerId){
    const calculator=window.NextBonusAnnualValueCalculator;
    if(!calculator) return null;
    const saved=state.annualValueProfiles?.[offerId];
    return calculator.calculate(offerId,saved||calculator.defaultProfile(offerId));
  }

  function annualValueHtml(state,offerId){
    const result=annualResultFor(state,offerId);
    if(!result) return '';
    const expanded=!!state.offerAnnualValueExpanded;
    const customized=!!state.annualValueProfiles?.[offerId]?.customized;
    const resultLabel=annualMoney(result.total,{signed:true});

    return `<section class="nb-annual-value-card ${expanded?'is-expanded':''} ${customized?'is-customized':''}">
      <div class="nb-annual-value-head">
        <h2>每年持有价值</h2>
      </div>
      ${expanded?`
        <div class="nb-annual-value-breakdown">
          <div><span>固定福利</span><b>${annualMoney(result.fixedBenefits)}</b></div>
          <div><span>刷卡额外回报</span><b>${annualMoney(result.spendReturn,{signed:true})}</b></div>
          <div><span>年费</span><b>-${annualMoney(result.fee)}</b></div>
        </div>
        <div class="nb-annual-value-total">
          <span>净收益</span>
          <strong>${resultLabel} / 年</strong>
        </div>
        ${customized
          ?`<p>已按照你的情况计算。 <button type="button" data-action="annual-value-toggle">收起明细 <span>›</span></button></p>`
          :`<p>已扣除 ${annualMoney(result.fee)} 年费，按常见消费和福利使用情况估算。 <button type="button" data-action="annual-value-toggle">收起明细 <span>›</span></button></p>`}
        <button class="nb-annual-value-customize" type="button" data-action="annual-value-customize">${customized?'调整我的计算':'计算我的每年收益'} <span>›</span></button>
      `:`
        <div class="nb-annual-value-total">
          <span>净收益</span>
          <strong>${resultLabel} / 年</strong>
        </div>
        ${customized
          ?`<p>已按照你的情况计算。 <button type="button" data-action="annual-value-toggle">查看明细 <span>›</span></button></p>`
          :`<p>已扣除 ${annualMoney(result.fee)} 年费，按常见消费和福利使用情况估算。 <button type="button" data-action="annual-value-toggle">查看明细 <span>›</span></button></p>`}
      `}
    </section>`;
  }

  function annualCalculatorHtml({esc,o,state}){
    const calculator=window.NextBonusAnnualValueCalculator;
    const profile=calculator?.draftFor?.(state,o.id);
    const result=profile&&calculator.calculate(o.id,profile);
    if(!result) return '';

    const benefitRows=result.benefits.map(item=>`
      <div class="nb-annual-calc-row">
        <div class="nb-annual-calc-copy">
          <b>${esc(item.title)}</b>
          <small>${esc(item.short)}</small>
        </div>
        <div class="nb-annual-calc-segment" role="group" aria-label="${esc(item.title)}是否会用">
          <button type="button" class="${item.used?'active':''}" data-action="annual-benefit-toggle" data-benefit="${esc(item.id)}" data-value="1">会用</button>
          <button type="button" class="${!item.used?'active':''}" data-action="annual-benefit-toggle" data-benefit="${esc(item.id)}" data-value="0">不用</button>
        </div>
      </div>`).join('');

    const spendRows=result.spendRows.map(item=>`
      <label class="nb-annual-calc-spend-row" for="annual-spend-${esc(item.id)}">
        <span>
          <b>${esc(item.label)}</b>
          <small>${esc(item.note)}</small>
        </span>
        <span class="nb-annual-calc-input-wrap">
          <span>$</span>
          <input id="annual-spend-${esc(item.id)}" type="number" min="0" step="${item.step}" inputmode="decimal" value="${item.monthly}" data-action="annual-spend-input" data-category="${esc(item.id)}" />
          <small>/ 月</small>
        </span>
      </label>`).join('');

    const unquantified=result.unquantified.length
      ? `<p class="nb-annual-calc-unquantified">另外还有 ${result.unquantified.map(item=>esc(item.title)).join('、')} 等难以统一定价的福利，暂未计入。</p>`
      : '';

    return `<aside class="v4-decision-panel nb-credit-decision-panel nb-credit-v1-final nb-annual-calculator-panel">
      <header class="nb-annual-calc-head">
        <button type="button" data-action="annual-value-cancel"><span aria-hidden="true">‹</span> 返回</button>
        <h2>计算我的每年收益</h2>
      </header>

      <section class="nb-annual-calc-result">
        <span>你的每年收益</span>
        <strong>${annualMoney(result.total,{signed:true})} / 年</strong>
        <small>根据你的消费和福利使用情况估算</small>
      </section>

      <section class="nb-annual-calc-section">
        <div class="nb-annual-calc-section-title"><span>1</span><h3>选择你会用的福利</h3></div>
        ${benefitRows}
      </section>

      <section class="nb-annual-calc-section">
        <div class="nb-annual-calc-section-title"><span>2</span><h3>输入你的每月消费</h3></div>
        ${spendRows}
        <p class="nb-annual-calc-baseline">刷卡额外回报按相比 2% 无年费返现卡的增量计算。</p>
      </section>

      <section class="nb-annual-calc-section nb-annual-calc-summary">
        <div class="nb-annual-calc-section-title"><span>3</span><h3>计算结果</h3></div>
        <div><span>我能用到的福利</span><b>${annualMoney(result.fixedBenefits)}</b></div>
        <div><span>刷卡额外回报</span><b class="positive">${annualMoney(result.spendReturn,{signed:true})}</b></div>
        <div><span>年费</span><b class="negative">-${annualMoney(result.fee)}</b></div>
        <div class="total"><span>我的每年收益</span><strong>${annualMoney(result.total,{signed:true})} / 年</strong></div>
      </section>

      ${unquantified}
      <button class="btn primary nb-annual-calc-done" type="button" data-action="annual-value-done">完成</button>
    </aside>`;
  }

  function renderPanel({esc,o,timingCurrent,saved,supportsAssessment,isEnded,hasAssessmentResult,result,state,money,assessmentHtml}){
    if(state.offerDetailTask==='annual-value'){
      return annualCalculatorHtml({esc,o,state});
    }

    const estimated=timingCurrent?.comparisonUnit==='USD_NORM'
      ? money(timingCurrent.comparableValue)
      : null;
    const productFact=productFactFor(o.id);
    const fee=productFact?.fee||'—';
    const rewardLevel=timingCurrent ? (timingCurrent.rating||'暂无评级') : '正在读取…';

    const applyHtml=!isEnded&&o.applyUrl
      ? `<button class="btn primary nb-gold-direct-apply" data-action="direct-apply">直接申请 <span>→</span></button>`
      : '';
    const assessment=assessmentHtml({
      esc,supportsAssessment,isEnded,hasAssessmentResult,result,compact:true
    });

    return `
      <aside class="v4-decision-panel nb-credit-decision-panel nb-credit-v1-final">
        <header class="nb-credit-v1-head">
          <div class="nb-credit-offer-name">${esc(o.name)}</div>
          <button class="v4-detail-save nb-follow-control ${saved?'saved':''}" data-action="bookmark" data-id="${o.id}" aria-label="${saved?'已关注，点击取消':'关注'}" title="${saved?'已关注，点击取消':'关注'}">
            <span class="nb-follow-glyph" aria-hidden="true">${saved?'✓':'＋'}</span>
            <span>${saved?'已关注':'关注'}</span>
          </button>
        </header>

        <section class="nb-current-offer nb-current-offer-v1">
          <div class="nb-current-offer-label">当前奖励</div>
          <div class="nb-current-offer-value">${esc(o.value)}</div>
          <div class="nb-current-offer-requirement">${esc(o.requirement)}</div>
          <div class="nb-current-offer-metrics">
            <div>
              <span>奖励价值</span>
              <b>${estimated?`约 ${esc(estimated)}`:'正在读取…'}</b>
            </div>
            <div>
              <span>首年年费</span>
              <b>${esc(fee)}</b>
            </div>
            <div>
              <span>当前奖励水平</span>
              <b>${esc(rewardLevel)}</b>
            </div>
          </div>
        </section>

        ${annualValueHtml(state,o.id)}

        <div class="nb-credit-v1-actions">
          ${applyHtml}
          ${assessment}
        </div>
      </aside>`;
  }

  window.NextBonusOfferDetailCreditCard=Object.freeze({
    renderPanel,
    annualValueHtml,
    annualCalculatorHtml
  });
})();
