(() => {
  'use strict';

  const icon=(name,className='')=>window.NextBonusIcons?.svg?.(name,className)||'';

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

  function mobileOfferToolbar(esc,offer,saved){
    const hint=saved?'已关注，点击取消':'关注';
    return `<div class="nb-mobile-detail-toolbar nb-mobile-offer-toolbar">
      <button class="nb-mobile-detail-back" type="button" data-action="offer-detail-back" aria-label="返回">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="nb-mobile-detail-toolbar-spacer" aria-hidden="true"></div>
      <button class="v4-detail-save nb-follow-control nb-mobile-detail-action ${saved?'saved':''}" data-action="bookmark" data-id="${esc(offer.id)}" aria-label="${hint}" title="${hint}">
        <span class="nb-follow-label">${saved?'已关注':'关注'}</span>
      </button>
    </div>`;
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
        ? `<button class="btn secondary nb-assessment-compact" data-action="assessment-start">查看申请资格</button>`
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
      return `<div class="nb-credit-assessment-line">
        <span class="nb-credit-assessment-check" aria-hidden="true">✓</span>
        <span>${esc(compactRecommendation)}。</span>
        <button type="button" data-action="assessment-report">查看完整报告 ${icon('chevron-right','nb-inline-action-icon')}</button>
      </div>`;
    }

    const summary=`<section class="nb-assessment-inline-result">
      <div>
        <span>申请评估</span>
        <strong>${esc(result.recommendation)}</strong>
        ${result.shortSummary?`<small>${esc(result.shortSummary)}</small>`:''}
      </div>
      <button type="button" data-action="assessment-report">查看完整报告 ${icon('chevron-right','nb-inline-action-icon')}</button>
    </section>`;

    return `<section class="nb-assessment-section is-complete">
      <div class="nb-offer-section-label">申请评估</div>
      ${summary}
      <button class="v5-reassess" data-action="assessment-restart">重新评估</button>
    </section>`;
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
      usesCreditCardPanel,
      hasAssessmentResult
    }=model.build(ctx);

    const saved=isSaved(o.id);
    const mobileToolbar=mobileOfferToolbar(esc,o,saved);
    const special=window.NextBonusOfferDetailSpecialized?.render?.(o,saved);
    if(special){
      return `<div class="content v4-offer-detail-page ${special.className||''}">
        ${mobileToolbar}
        <div class="v4-offer-detail-grid">
          <section class="v4-offer-poster-shell">${special.poster||genericPoster(o)}</section>
          <aside class="v4-decision-panel">${special.panel}</aside>
        </div>
      </div>`;
    }

    if(usesCreditCardPanel){
      return `<div class="content v4-offer-detail-page nb-credit-v1-page">
        ${mobileToolbar}
        <div class="v4-offer-detail-grid">
          <section class="v4-offer-poster-shell nb-credit-story-shell">
            ${window.NextBonusCreditCardStory?.render?.({esc,offer:o,state:ctx.state})||''}
          </section>
          ${ctx.state.offerDetailTask==='assessment'&&supportsAssessment
            ?window.NextBonusAssessmentPage?.renderPanel?.(ctx)
            :window.NextBonusOfferDetailCreditCard?.renderPanel?.({
              esc,o,timingCurrent,saved,supportsAssessment,isEnded,
              hasAssessmentResult,result:r,state:ctx.state,money,assessmentHtml
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
          <button class="btn primary" data-action="direct-apply">直接申请</button>
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
      ${mobileToolbar}
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
            <span class="nb-follow-label">${saved?'已关注':'关注'}</span>
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