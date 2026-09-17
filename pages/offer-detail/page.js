(() => {
  'use strict';
  window.NextBonusPageRegistry.register('offer-detail',function(ctx){
  const { state, esc, currentOffer, offerResult, metric, isSaved, genericPoster }=ctx;

    const o=currentOffer();
    const supportsAssessment=!!window.NBStaticAssessmentIntegration?.productMap?.[o.id];
    const isEnded=state.unavailableSavedIds.includes(o.id);
    const r=supportsAssessment?offerResult(o):null;
    const isPlat=o.id==='amex-platinum';
    const posterIndex=((state.posterIndex||0)%2+2)%2;
    const posterSrc=posterIndex===0?'assets/offer-detail/amex-platinum-poster.png':'assets/offer-detail/amex-platinum-poster-2.png';
    const resultHtml=isEnded
      ? `<div class="v4-result-card is-ended"><div class="v4-result-meta">当前状态</div><div class="v4-recommendation ended">当前奖励已结束</div><div class="v4-result-note">这次收藏机会已经结束或当前不可用。旧信息只作为历史参考，不再作为当前申请建议。</div></div>`
      : supportsAssessment
        ? `<div class="v4-result-card ${r.isSample?'is-sample':'is-final'}"><div class="v4-result-meta">${esc(r.meta)}</div><div class="v4-recommendation">${esc(r.recommendation)}</div>${!r.isSample?`<div class="v5-short-summary">${esc(r.shortSummary)}</div>`:''}${r.primaryAlert?`<div class="v5-primary-alert">! ${esc(r.primaryAlert)}</div>`:''}<div class="v4-metric-grid">${metric('开卡奖励评级',r.bonus,r.isSample)}${metric('获批可能性',r.approval,r.isSample)}${metric('能否拿奖励',r.eligible,r.isSample)}${metric('长期持有价值',r.longTerm,r.isSample)}</div>${r.isSample?`<div class="v4-result-note">ⓘ 以上为示例结果，仅供参考。完成评估后将根据你的实际情况生成结果。</div>`:''}</div>`
        : `<div class="v4-result-card assessment-unavailable"><div class="v4-result-meta">当前状态</div><div class="v4-recommendation neutral">暂未提供申请评估</div><div class="v4-result-note">当前没有已冻结的个性化评估流程，因此不显示推测性的评分或结论。</div></div>`;
    const actions=[];
    if(!isEnded && supportsAssessment) actions.push(`<button class="btn primary" data-action="assessment-start">${state.assessmentResults[o.id]?'查看完整分析':'开始申请评估'} <span>→</span></button>`);
    if(!isEnded && o.applyUrl) actions.push(`<button class="btn secondary" data-action="direct-apply">直接申请</button>`);
    return `<div class="content v4-offer-detail-page">
      <div class="v4-offer-detail-grid">
        <section class="v4-offer-poster-shell">
          ${isPlat?`<div class="v4-reference-poster"><img src="${posterSrc}" alt="AMEX Platinum 海报" /><button class="poster-hotspot prev" data-action="poster-step" data-dir="-1" aria-label="上一张海报"></button><button class="poster-hotspot next" data-action="poster-step" data-dir="1" aria-label="下一张海报"></button></div>`:genericPoster(o)}
        </section>
        <aside class="v4-decision-panel">
          <button class="v4-detail-save ${isSaved(o.id)?'saved':''}" data-action="bookmark" data-id="${o.id}">♡ <span>${isSaved(o.id)?'已收藏':'收藏'}</span></button>
          <div class="v4-nb-logo"><img src="assets/offer-detail/nb-logo-ref.png" alt="NextBonus" /></div>
          <h1>NextBonus 申请建议</h1>
          <p class="v4-decision-copy">${supportsAssessment&&!isEnded?'基于你已确认的信息与当前规则，判断这张卡现在是否适合申请。':isEnded?'这次机会已不再作为当前申请建议。':'只有存在已冻结评估规则时，才显示个性化申请结论。'}</p>
          ${resultHtml}
          ${actions.length?`<div class="v4-detail-actions ${actions.length===1?'single':''}">${actions.join('')}</div>`:''}
          ${!isEnded&&supportsAssessment&&state.assessmentResults[o.id]?`<button class="v5-reassess" data-action="assessment-restart">重新评估</button>`:''}
          ${!isEnded&&!actions.length?`<div class="v4-no-action-note">当前暂未提供可执行的申请入口。</div>`:''}
          <div class="v4-security-line">♙ <span>安全、免费、不会影响你的信用评分</span></div>
          <div class="v4-trust-row"><span>▤<b>个性化分析</b><small>结合已确认信息</small></span><span>◉<b>规则拆分</b><small>申请与奖励分开判断</small></span><span>☼<b>固定输出</b><small>同样输入得到同样结果</small></span><span>♢<b>隐私安全</b><small>只保存评估所需的信息</small></span></div>
        </aside>
      </div>
    </div>`;
  
  });
})();
