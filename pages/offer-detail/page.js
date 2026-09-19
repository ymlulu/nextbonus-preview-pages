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

  function assessmentHtml({esc,metric,supportsAssessment,isEnded,hasAssessmentResult,result}){
    if(isEnded) return '';

    if(!supportsAssessment){
      return `<section class="nb-assessment-section is-unavailable">
        <div class="nb-offer-section-label">申请评估</div>
        <div class="nb-assessment-entry">
          <h2>暂未提供申请评估</h2>
          <p>当前没有已冻结的个性化评估流程，因此不显示推测性的评分或结论。</p>
        </div>
      </section>`;
    }

    if(!hasAssessmentResult){
      return `<section class="nb-assessment-section">
        <div class="nb-assessment-entry">
          <div class="nb-assessment-copy">
            <h2>评估一下，让你的申请更有把握</h2>
            <p>回答几个与你申请情况有关的问题，看看申请限制、奖励资格、当前 Offer 水平和长期价值。</p>
          </div>
          <button class="btn secondary nb-assessment-start" data-action="assessment-start">开始申请评估 <span>→</span></button>
          <button class="nb-assessment-preview-link" data-action="assessment-preview">了解会看到什么结果</button>
        </div>
      </section>`;
    }

    return `<section class="nb-assessment-section is-complete">
      <div class="nb-offer-section-label">申请评估</div>
      <div class="v4-result-card is-final nb-assessment-result-card">
        <div class="v4-result-meta">${esc(result.meta)}</div>
        <div class="v4-recommendation">${esc(result.recommendation)}</div>
        ${result.shortSummary?`<div class="v5-short-summary">${esc(result.shortSummary)}</div>`:''}
        ${result.primaryAlert?`<div class="v5-primary-alert">! ${esc(result.primaryAlert)}</div>`:''}
        <div class="v4-metric-grid">
          ${metric('开卡奖励评级',result.bonus,false)}
          ${metric('获批可能性',result.approval,false)}
          ${metric('能否拿奖励',result.eligible,false)}
          ${metric('长期持有价值',result.longTerm,false)}
        </div>
        <div class="nb-assessment-result-actions">
          <button class="btn secondary" data-action="assessment-start">查看完整分析</button>
          <button class="btn primary" data-action="direct-apply">直接申请</button>
        </div>
        <button class="v5-reassess" data-action="assessment-restart">重新评估</button>
      </div>
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
      posterSrc,
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
      metric,
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

        <aside class="v4-decision-panel nb-credit-decision-panel">
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
        </aside>
      </div>
    </div>`;
  });
})();
