(() => {
  'use strict';

  function money(value){
    return Number.isFinite(Number(value))
      ? '$'+Math.round(Number(value)).toLocaleString('en-US')
      : null;
  }

  function rewardValueHtml(esc,timingCurrent,isPlatinum){
    const estimated=timingCurrent?.comparisonUnit==='USD_NORM'
      ? money(timingCurrent.comparableValue)
      : null;
    const valuationValue=estimated
      ? `约 ${esc(estimated)}`
      : '正在读取估值…';

    const exchangeExamples=isPlatinum
      ? `
        <div class="nb-offer-value-card">
          <span>洲际商务舱 / 头等舱</span>
          <b>约 1–2 次</b>
          <small>长途高端舱位体验</small>
        </div>
        <div class="nb-offer-value-card">
          <span>奢华酒店住宿</span>
          <b>约 1–3 晚</b>
          <small>高端酒店兑换参考</small>
        </div>`
      : `
        <div class="nb-offer-value-card">
          <span>航空</span>
          <b>航空伙伴</b>
          <small>可用于航空伙伴转点；具体兑换示例后续由 Timing 数据补充。</small>
        </div>
        <div class="nb-offer-value-card">
          <span>酒店</span>
          <b>酒店伙伴</b>
          <small>可用于酒店伙伴转点；具体兑换示例后续由 Timing 数据补充。</small>
        </div>`;

    return `<section class="nb-offer-value-section">
      <div class="nb-offer-value-head">
        <h2>奖励能换什么</h2>
        <span class="nb-offer-value-rule" aria-hidden="true"></span>
        <small>MORE TRAVEL, A BRIGHTER YOU</small>
      </div>
      <div class="nb-offer-value-grid">
        <div class="nb-offer-value-card nb-offer-value-primary">
          <span>大概价值</span>
          <b>${valuationValue}</b>
          <small>按当前 Timing 估值</small>
        </div>
        ${exchangeExamples}
      </div>
    </section>`;
  }

  function assessmentHtml({esc,supportsAssessment,isEnded,hasAssessmentResult,result,compact=false}){
    if(isEnded) return '';

    if(!supportsAssessment){
      return compact
        ? ''
        : `<section class="nb-assessment-section is-unavailable">
            <div class="nb-offer-section-label">申请评估</div>
            <div class="nb-assessment-entry">
              <h2>暂未提供申请评估</h2>
              <p>当前没有已冻结的个性化评估流程，因此不显示推测性的判断。</p>
            </div>
          </section>`;
    }

    if(!hasAssessmentResult){
      return compact
        ? `<button class="btn secondary nb-assessment-compact" data-action="assessment-start">评估一下，让你的申请更有把握</button>`
        : `<section class="nb-assessment-section">
            <div class="nb-assessment-entry">
              <div class="nb-assessment-copy">
                <h2>评估一下，让你的申请更有把握</h2>
                <p>回答与你申请情况和这张卡资格有关的问题，看看现在是否适合申请。</p>
              </div>
              <button class="btn secondary nb-assessment-start" data-action="assessment-start">开始申请评估 <span>→</span></button>
            </div>
          </section>`;
    }

    const compactRecommendation=result.recommendation==='现在申请'?'建议现在申请':result.recommendation;
    if(compact){
      return `<div class="nb-gold-assessment-line">
        <span class="nb-gold-assessment-check" aria-hidden="true">✓</span>
        <span>${esc(compactRecommendation)}。</span>
        <button type="button" data-action="assessment-report">查看完整报告 <span>›</span></button>
      </div>`;
    }

    const summary=`<section class="nb-assessment-inline-result">
      <div>
        <span>申请评估</span>
        <strong>${esc(result.recommendation)}</strong>
        ${result.shortSummary?`<small>${esc(result.shortSummary)}</small>`:''}
      </div>
      <button type="button" data-action="assessment-report">查看完整报告 <span>›</span></button>
    </section>`;

    return `<section class="nb-assessment-section is-complete">
      <div class="nb-offer-section-label">申请评估</div>
      ${summary}
      <button class="v5-reassess" data-action="assessment-restart">重新评估</button>
    </section>`;
  }

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

  function goldAnnualValueHtml(state,offerId){
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

  function goldAnnualCalculatorHtml({esc,o,state}){
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

  function goldOfferPanel({esc,o,timingCurrent,saved,supportsAssessment,isEnded,hasAssessmentResult,result,state,metric}){
    if(state.offerDetailTask==='annual-value'){
      return goldAnnualCalculatorHtml({esc,o,state});
    }

    const estimated=timingCurrent?.comparisonUnit==='USD_NORM'
      ? money(timingCurrent.comparableValue)
      : null;
    const productFact=productFactFor(o.id);
    const fee=productFact?.fee||'—';
    const rewardLevel=o.valueTag==='high_bonus'?'较高':'常见水平';

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

        ${goldAnnualValueHtml(state,o.id)}

        <div class="nb-credit-v1-actions">
          ${applyHtml}
          ${assessment}
        </div>
      </aside>`;
  }

  window.NextBonusPageRegistry.register('offer-detail',function(ctx){
    window.NextBonusEvents?.bind('offer-detail',ctx);
    const { esc, metric, isSaved, genericPoster }=ctx;
    const model=window.NextBonusPageModels?.offerDetail;
    if(!model) throw new Error('Offer Detail page model unavailable');

    const {
      offer:o,
      supportsAssessment,
      isEnded,
      result:r,
      timingCurrent,
      isPlatinum:isPlat,
      isGold,
      posterSrc,
      staticPosterSrc,
      hasAssessmentResult
    }=model.build(ctx);

    const special=window.NextBonusOfferDetailSpecialized?.render?.(o,isSaved(o.id));
    if(special){
      return `<div class="content v4-offer-detail-page ${special.className||''}">
        <div class="v4-offer-detail-grid">
          <section class="v4-offer-poster-shell">${special.poster||genericPoster(o)}</section>
          <aside class="v4-decision-panel">${special.panel}</aside>
        </div>
      </div>`;
    }

    const saved=isSaved(o.id);

    if(isGold){
      return `<div class="content v4-offer-detail-page nb-credit-v1-page">
        <div class="v4-offer-detail-grid">
          <section class="v4-offer-poster-shell">
            ${staticPosterSrc
              ?`<div class="v4-reference-poster"><img src="${staticPosterSrc}" alt="AMEX Gold 海报" /></div>`
              :genericPoster(o)}
          </section>
          ${ctx.state.offerDetailTask==='assessment'&&supportsAssessment
            ?window.NextBonusAssessmentPage?.renderPanel?.(ctx)
            :goldOfferPanel({
              esc,o,timingCurrent,saved,supportsAssessment,isEnded,
              hasAssessmentResult,result:r,state:ctx.state,metric
            })}
        </div>
      </div>`;
    }

    const offerSummary=isEnded
      ? `<section class="nb-current-offer is-ended">
          <div class="nb-current-offer-label">当前状态</div>
          <div class="nb-current-offer-value">当前奖励已结束</div>
          <div class="nb-current-offer-requirement">旧信息只作为历史参考，不再作为当前申请机会展示。</div>
        </section>`
      : `<section class="nb-current-offer">
          <div class="nb-current-offer-label">当前奖励</div>
          <div class="nb-current-offer-value">${esc(o.value)}</div>
          <div class="nb-current-offer-requirement">${esc(o.requirement)}</div>
        </section>`;

    const applyHtml=!isEnded&&o.applyUrl
      ? `<div class="nb-offer-apply-primary">
          <button class="btn primary" data-action="direct-apply">直接申请 <span>→</span></button>
        </div>`
      : '';

    const assessment=assessmentHtml({
      esc,
      supportsAssessment,
      isEnded,
      hasAssessmentResult,
      result:r
    });

    return `<div class="content v4-offer-detail-page">
      <div class="v4-offer-detail-grid">
        <section class="v4-offer-poster-shell">
          ${isPlat
            ?`<div class="v4-reference-poster"><img src="${posterSrc}" alt="AMEX Platinum 海报" /><button class="poster-hotspot prev" data-action="poster-step" data-dir="-1" aria-label="上一张海报"></button><button class="poster-hotspot next" data-action="poster-step" data-dir="1" aria-label="下一张海报"></button></div>`
            :genericPoster(o)}
        </section>

        ${ctx.state.offerDetailTask==='assessment'&&supportsAssessment
          ?window.NextBonusAssessmentPage?.renderPanel?.(ctx)
          :`<aside class="v4-decision-panel nb-credit-decision-panel">
          <button class="v4-detail-save nb-follow-control ${saved?'saved':''}" data-action="bookmark" data-id="${o.id}" aria-label="${saved?'已关注，点击取消':'关注'}" title="${saved?'已关注，点击取消':'关注'}">
            <span class="nb-follow-glyph" aria-hidden="true">${saved?'✓':'＋'}</span>
            <span>${saved?'已关注':'关注'}</span>
          </button>

          <header class="nb-credit-offer-head">
            <div class="nb-credit-offer-meta">
              <span class="nb-credit-offer-name">${esc(o.name)}</span>
              <span aria-hidden="true">·</span>
              <span>新开户奖励</span>
            </div>
            <div class="nb-credit-offer-provider">${esc(o.provider)}</div>
          </header>

          ${offerSummary}
          ${!isEnded?rewardValueHtml(esc,timingCurrent,isPlat):''}
          ${applyHtml}
          ${assessment}
          ${!isEnded&&!applyHtml&&!assessment?`<div class="v4-no-action-note">当前暂未提供可执行的申请入口。</div>`:''}
        </aside>`}
      </div>
    </div>`;
  });
})();