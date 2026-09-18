(() => {
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  function verifiedFollowup(attempt){
    const entry=window.NextBonusApplicationFollowupRegistry?.find?.({
      productId:attempt?.productId,
      issuer:attempt?.issuer
    })||null;
    return entry?.verificationStatus==='verified'?entry:null;
  }

  function banner(attempt){
    const copy={
      awaiting_result:['申请页面已打开','回来后告诉 NextBonus 申请结果，后续条件就可以接着追踪。'],
      deferred:['待确认申请结果','申请上下文已经保存，之后回来不需要重新选择产品或 Offer。'],
      pending:['申请还在审核中','NextBonus 已保留这次申请上下文，你可以随时回来更新结果。'],
      denied:['这次申请没有通过','如果后续结果变化，可以回来更新；已核验的后续处理入口也会显示在这里。'],
      approved_needs_login:['已通过 · 待保存','登录后即可把产品和本次奖励追踪一起加入“我的”。']
    }[attempt.status];
    if(!copy) return '';
    return `<div class="nb-ah-banner"><strong>${esc(copy[0])}</strong><p>${esc(attempt.productName)} · ${esc(copy[1])}</p><div class="nb-ah-row"><button class="nb-ah-btn secondary" data-handoff-action="open">${attempt.status==='denied'?'查看后续':'更新结果'}</button></div></div>`;
  }

  function choice(attempt){
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">申请结果怎么样？</div><div class="nb-ah-sub">${esc(attempt.productName)}</div></div><button class="nb-ah-close" data-handoff-action="defer" aria-label="稍后确认">×</button></div><div class="nb-ah-body"><div class="nb-ah-result-grid"><button class="nb-ah-result" data-handoff-action="result" data-result="approved">已通过</button><button class="nb-ah-result" data-handoff-action="result" data-result="pending">Pending</button><button class="nb-ah-result" data-handoff-action="result" data-result="denied">未通过</button></div><div class="nb-ah-note">点击“直接申请”只冻结本次 Product / Offer / Assessment 上下文，并不等于你已经提交申请。只有你确认结果后，NextBonus 才会创建实际产品或后续状态。</div></div><div class="nb-ah-foot"><button class="nb-ah-btn ghost" data-handoff-action="not-submitted">我没有提交申请</button><button class="nb-ah-btn secondary" data-handoff-action="defer">稍后确认</button></div></div></div>`;
  }

  function followup(attempt,kind){
    const entry=verifiedFollowup(attempt);
    const pending=kind==='pending';
    const title=pending?'申请还在审核中':'这次申请没有通过';
    const specific=entry
      ? `<div class="nb-ah-note">已读取 Application Follow-up Registry 中已核验的 ${esc(entry.issuer||attempt.issuer)} 后续信息。</div>`
      : '<div class="nb-ah-note">目前还没有已核验的状态查询 / 后续处理信息，因此 Preview 不展示未经核验的电话或建议。你仍可以保存当前状态，之后再更新结果。</div>';
    const external=[];
    if(pending&&entry?.applicationStatusUrl) external.push(`<button class="nb-ah-btn secondary" data-handoff-action="external" data-url="${esc(entry.applicationStatusUrl)}">查看申请状态</button>`);
    if(pending&&entry?.applicationStatusPhone) external.push(`<a class="nb-ah-btn secondary" href="tel:${esc(entry.applicationStatusPhone)}">拨打申请状态电话</a>`);
    if(!pending&&entry?.reconsiderationPhone) external.push(`<a class="nb-ah-btn secondary" href="tel:${esc(entry.reconsiderationPhone)}">拨打 Recon 电话</a>`);
    const guidance=entry?(pending?entry.pendingGuidance:entry.reconGuidance):null;
    const guidanceItems=Array.isArray(guidance)?guidance:(typeof guidance==='string'&&guidance.trim()?[guidance]:[]);
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">${title}</div><div class="nb-ah-sub">${esc(attempt.productName)}</div></div><button class="nb-ah-close" data-handoff-action="hide">×</button></div><div class="nb-ah-body">${specific}${external.length?`<div class="nb-ah-row nb-ah-row-start">${external.join('')}</div>`:''}${guidanceItems.length?`<ul>${guidanceItems.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</div><div class="nb-ah-foot"><button class="nb-ah-btn ghost" data-handoff-action="hide">稍后确认</button><div class="nb-ah-row"><button class="nb-ah-btn secondary" data-handoff-action="result" data-result="${pending?'denied':'pending'}">${pending?'改为未通过':'状态有变化'}</button><button class="nb-ah-btn primary" data-handoff-action="result" data-result="approved">已通过</button></div></div></div></div>`;
  }

  function login(attempt){
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">登录后保存到“我的”</div><div class="nb-ah-sub">${esc(attempt.productName)} 已确认通过</div></div><button class="nb-ah-close" data-handoff-action="hide">×</button></div><div class="nb-ah-body"><div class="nb-ah-note">“直接申请”本身不要求登录；但创建 UserProduct、奖励追踪和任务属于个人数据，需要登录后保存。</div></div><div class="nb-ah-foot"><button class="nb-ah-btn secondary" data-handoff-action="hide">稍后处理</button><button class="nb-ah-btn primary" data-handoff-action="login">登录并继续</button></div></div></div>`;
  }

  function denied(attempt){
    const entry=verifiedFollowup(attempt);
    const recon=entry?.reconsiderationPhone
      ? `<a class="nb-ah-btn secondary" href="tel:${esc(entry.reconsiderationPhone)}">拨打 Recon 电话</a>`
      : '';
    const note=entry
      ? '这次申请已记录为未通过。你可以选择尝试 Reconsideration；这里只显示已经核验的后续信息。'
      : '这次申请已记录为未通过。部分银行的拒绝结果可能可以尝试 Reconsideration；目前没有已核验的具体入口。';
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">这次申请没有通过</div><div class="nb-ah-sub">${esc(attempt?.productName||'')}</div></div><button class="nb-ah-close" data-denied-action="dismiss" aria-label="关闭">×</button></div><div class="nb-ah-body"><div class="nb-ah-note">${note}</div></div><div class="nb-ah-foot"><span></span><div class="nb-ah-row">${recon}<button class="nb-ah-btn primary" data-denied-action="dismiss">知道了</button></div></div></div></div>`;
  }

  function success(productName){
    return `<div class="nb-ah-success"><strong>已添加到“我的”</strong><p>${esc(productName)} 已保存；本次 Offer 的条件已经开始追踪。你现在看到的是新产品详情。</p></div>`;
  }

  function htmlForMode(attempt,mode){
    if(mode==='choice') return choice(attempt);
    if(mode==='pending') return followup(attempt,'pending');
    if(mode==='denied') return followup(attempt,'denied');
    if(mode==='login') return login(attempt);
    return banner(attempt);
  }

  window.NextBonusApplicationResultPage=Object.freeze({
    banner,choice,followup,login,denied,success,htmlForMode,verifiedFollowup
  });
})();
