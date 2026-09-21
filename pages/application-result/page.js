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
      deferred:['待确认申请结果','这次申请信息已经保存，之后回来可以直接继续。'],
      pending:['申请还在审核中','这次申请已经帮你记下来了，你可以随时回来更新结果。'],
      denied:['这次申请没有通过','如果后续结果变化，可以回来更新；已经确认的后续处理入口也会显示在这里。'],
      approved_needs_login:['已通过 · 待保存','登录后即可把产品和本次奖励追踪一起加入钱包。']
    }[attempt.status];
    if(!copy) return '';
    return `<div class="nb-ah-banner"><strong>${esc(copy[0])}</strong><p>${esc(attempt.productName)} · ${esc(copy[1])}</p><div class="nb-ah-row"><button class="nb-ah-btn secondary" data-handoff-action="open">${attempt.status==='denied'?'查看后续':'更新结果'}</button></div></div>`;
  }

  function choice(){
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">申请结果怎么样？</div></div><button class="nb-ah-close" data-handoff-action="not-submitted" aria-label="没有提交申请">×</button></div><div class="nb-ah-body"><div class="nb-ah-result-grid"><button class="nb-ah-result" data-handoff-action="result" data-result="approved">已通过</button><button class="nb-ah-result" data-handoff-action="result" data-result="pending">审核中</button><button class="nb-ah-result" data-handoff-action="result" data-result="denied">未通过</button></div></div><div class="nb-ah-foot nb-ah-choice-foot"><button class="nb-ah-btn secondary" data-handoff-action="not-submitted">没有提交申请</button></div></div></div>`;
  }

  function followup(attempt,kind){
    const entry=verifiedFollowup(attempt);
    const pending=kind==='pending';
    const title=pending?'申请还在审核中':'这次申请没有通过';
    const external=[];
    if(pending&&entry?.applicationStatusUrl) external.push(`<button class="nb-ah-btn secondary" data-handoff-action="external" data-url="${esc(entry.applicationStatusUrl)}">查看申请状态</button>`);
    if(pending&&entry?.applicationStatusPhone) external.push(`<a class="nb-ah-btn secondary" href="tel:${esc(entry.applicationStatusPhone)}">拨打申请状态电话</a>`);
    if(!pending&&entry?.reconsiderationPhone) external.push(`<a class="nb-ah-btn secondary" href="tel:${esc(entry.reconsiderationPhone)}">联系人工重新审核</a>`);

    let note='';
    if(!entry){
      note=pending
        ? '目前还没有确认可靠的状态查询方式。你可以先保存，之后再回来更新结果。'
        : '部分银行可以在被拒后联系人工重新审核，目前还没有确认可靠的联系方式。';
    }else if(!external.length){
      note='下面是已经确认过的申请状态和后续处理方式。';
    }

    const guidance=entry?(pending?entry.pendingGuidance:entry.reconGuidance):null;
    const guidanceItems=Array.isArray(guidance)?guidance:(typeof guidance==='string'&&guidance.trim()?[guidance]:[]);
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">${title}</div><div class="nb-ah-sub">${esc(attempt.productName)}</div></div><button class="nb-ah-close" data-handoff-action="hide" aria-label="稍后再说">×</button></div><div class="nb-ah-body">${note?`<div class="nb-ah-note">${esc(note)}</div>`:''}${external.length?`<div class="nb-ah-row nb-ah-row-start">${external.join('')}</div>`:''}${guidanceItems.length?`<ul>${guidanceItems.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</div><div class="nb-ah-foot"><button class="nb-ah-btn ghost" data-handoff-action="hide">稍后再说</button><div class="nb-ah-row"><button class="nb-ah-btn secondary" data-handoff-action="result" data-result="${pending?'denied':'pending'}">${pending?'改为未通过':'状态有变化'}</button><button class="nb-ah-btn primary" data-handoff-action="result" data-result="approved">已通过</button></div></div></div></div>`;
  }

  function login(attempt){
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">登录后保存到钱包</div><div class="nb-ah-sub">${esc(attempt.productName)} 已确认通过</div></div><button class="nb-ah-close" data-handoff-action="hide" aria-label="稍后再说">×</button></div><div class="nb-ah-body"><div class="nb-ah-note">登录后即可把这个产品添加到钱包，并保存相关奖励进度和提醒。</div></div><div class="nb-ah-foot"><button class="nb-ah-btn secondary" data-handoff-action="hide">稍后再说</button><button class="nb-ah-btn primary" data-handoff-action="login">登录并继续</button></div></div></div>`;
  }

  function denied(attempt){
    const entry=verifiedFollowup(attempt);
    const recon=entry?.reconsiderationPhone
      ? `<a class="nb-ah-btn secondary" href="tel:${esc(entry.reconsiderationPhone)}">联系人工重新审核</a>`
      : '';
    const note=entry
      ? '这次申请已经记录为未通过。如果银行支持，你可以尝试联系人工重新审核。'
      : '部分银行可以在被拒后联系人工重新审核，目前还没有确认可靠的联系方式。';
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">这次申请没有通过</div><div class="nb-ah-sub">${esc(attempt?.productName||'')}</div></div><button class="nb-ah-close" data-denied-action="dismiss" aria-label="关闭">×</button></div><div class="nb-ah-body"><div class="nb-ah-note">${esc(note)}</div></div><div class="nb-ah-foot"><span></span><div class="nb-ah-row">${recon}<button class="nb-ah-btn primary" data-denied-action="dismiss">知道了</button></div></div></div></div>`;
  }

  function success(productName){
    return `<div class="nb-ah-success"><strong>已添加到钱包</strong><p>${esc(productName)} 已保存，相关奖励条件也已经加入提醒。</p></div>`;
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
