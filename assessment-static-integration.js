(function(root){
'use strict';
const MAP={
  'chase-sapphire':'chase_sapphire_preferred',
  'amex-gold':'amex_gold',
  'amex-platinum':'amex_platinum',
  'bilt-palladium':'bilt_palladium',
  'capitalone-venturex':'capital_one_venture_x',
  'citi-strata':'citi_strata_elite'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function localDate(date=new Date()){
  const pad=value=>String(value).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
function visible(q,answers){return !q.show_when||answers[q.show_when.id]===q.show_when.value;}
function stepsFor(contract){const q=contract.questionnaire;return [...q.common,...Object.values(q.specific),...Object.values(q.benefits)];}
function leaves(q,answers){return !visible(q,answers)?[]:q.type==='group'?q.subs.flatMap(s=>leaves(s,answers)):[q];}
function prune(steps,answers){
  function visit(q){if(!visible(q,answers)){function clear(n){delete answers[n.id];if(n.number_id)delete answers[n.number_id];(n.subs||[]).forEach(clear);}clear(q);return;}
    if(q.number_id&&answers[q.id]!==q.number_when)delete answers[q.number_id];(q.subs||[]).forEach(visit);}
  steps.forEach(visit);return answers;
}
function valid(q,answers){return leaves(q,answers).every(p=>{
  const value=answers[p.id],options=p.options||[];
  if(p.type==='multi'){if(!Array.isArray(value)||(!value.length&&!p.none_option)||value.some(v=>!options.some(o=>o.value===v)))return false;
    if(value.some(v=>(p.exclusive||[]).includes(v))&&value.length!==1)return false;
  }else if(!options.some(o=>o.value===value))return false;
  if(p.number_id&&value===p.number_when){const n=answers[p.number_id];return Number.isInteger(n)&&n>=(p.min??1)&&n<=(p.max??Number.MAX_SAFE_INTEGER);}
  return true;
});}
function unknownOption(q){return (q.options||[]).find(o=>o.value==='UNKNOWN')||null;}
function hasChoice(q,answers){
  if(!Object.prototype.hasOwnProperty.call(answers,q.id))return false;
  const value=answers[q.id],options=q.options||[];
  return q.type==='multi'?Array.isArray(value):options.some(o=>o.value===value);
}
function uncertainMap(draft){
  if(!draft.uncertain||typeof draft.uncertain!=='object'||Array.isArray(draft.uncertain))draft.uncertain={};
  return draft.uncertain;
}
function resolved(q,draft){
  const uncertain=uncertainMap(draft);
  return leaves(q,draft.answers).every(p=>valid(p,draft.answers)||uncertain[p.id]===true);
}
function fillUnanswered(q,draft){
  const uncertain=uncertainMap(draft);
  for(const p of leaves(q,draft.answers)){
    if(valid(p,draft.answers)){delete uncertain[p.id];continue;}
    if(hasChoice(p,draft.answers))continue;
    const fallback=unknownOption(p);
    if(fallback){
      draft.answers[p.id]=p.type==='multi'?[fallback.value]:fallback.value;
      delete uncertain[p.id];
    }else{
      delete draft.answers[p.id];
      uncertain[p.id]=true;
    }
    if(p.number_id)delete draft.answers[p.number_id];
  }
  return draft;
}
function resultState(result){
  const d=result.dimensions,p=result.report,c=result.decision;
  return {canonicalResult:result,meta:result.evaluation_date,recommendation:c.recommended_action,shortSummary:c.summary,
    bonus:d.offer.rating,approval:d.application.approval_label,eligible:d.bonus.label,longTerm:d.long_term.label,isSample:false,
    internal:{appHard:d.application.hard_behavior,bonusHard:d.bonus.hard_behavior},
    report:{applicationCopy:p.application_text,bonusCopy:p.bonus_text,offerCopy:p.offer_text,approvalCopy:p.approval_text,longCopy:p.long_term_text,nextStep:p.cta.pre}};
}
function reportHtml(result){
  const d=result.dimensions,p=result.report,cta=p.cta||{};
  const dimensions=[['开卡奖励评级',d.offer.rating],['获批可能性',d.application.approval_label],['能否拿奖励',d.bonus.label],['长期持有价值',d.long_term.label]];
  const sections=[['申请规则',p.application_text],['开卡奖励资格',p.bonus_text],['当前开卡奖励',p.offer_text],['获批可能性',p.approval_text],['长期持有价值',p.long_term_text],['下一步',cta.pre]];
  const body=sections.map(([k,v])=>`<section><h3>${esc(k)}</h3><p>${esc(v)}</p>${k==='当前开卡奖励'?'<div class="nb-offer-history" data-assessment-offer-history hidden></div>':''}</section>`).join('');
  const ctaText=cta.text||'完成',ctaDest=cta.dest||'offer_detail_url';
  return `<h2 id="assessment-modal-title">${esc(result.decision.recommended_action)}</h2><p>${esc(result.decision.summary)}</p><dl class="canonical-dimensions">${dimensions.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${body}<small>${esc(result.provenance?.release_id||result.release_id||'')}</small><footer><button data-modal-action="restart" class="btn secondary">重新评估</button><button data-modal-action="report-cta" data-dest="${esc(ctaDest)}" class="btn primary">${esc(ctaText)}</button></footer>`;
}
let active=null;
async function open(restart=false){
  const ui=root.NBAssessmentUI,context=ui.context(),productId=MAP[context.offerId];
  if(!productId||context.route!=='offer-detail'||active)return;
  const dialog=document.createElement('dialog');dialog.className='canonical-assessment-modal';dialog.setAttribute('aria-labelledby','assessment-modal-title');
  const session={dialog,offerId:context.offerId,productId,contract:null,busy:false,token:0};active=session;
  const opener=document.activeElement,previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';document.body.append(dialog);
  function close(){session.token++;dialog.close();dialog.remove();active=null;document.body.style.overflow=previousOverflow;
    if(opener?.isConnected)opener.focus();else document.querySelector('[data-action="assessment-start"]')?.focus();}
  function runReportCta(dest){
    close();
    if(dest==='current_application_url')requestAnimationFrame(()=>document.querySelector('[data-action="direct-apply"]')?.click());
  }
  function paint(body){dialog.innerHTML=`<button class="canonical-close" data-modal-action="close" aria-label="关闭评估">×</button><div class="canonical-modal-body">${body}</div>`;dialog.scrollTop=0;}
  function paintReport(result){
    paint(reportHtml(result));
    const host=dialog.querySelector('[data-assessment-offer-history]');
    if(host&&root.NextBonusAssessmentOfferHistoryChart&&result.offer_history)root.NextBonusAssessmentOfferHistoryChart.render(host,result.offer_history,result.evaluation_date);
  }
  function draft(){return ui.context().draft;}
  function steps(){return stepsFor(session.contract).filter(q=>visible(q,draft().answers));}
  function questionHtml(q,a,uncertain){
    if(!visible(q,a))return '';
    if(q.type==='group')return `<div class="assessment-compound">${q.subs.map(p=>`<section>${questionHtml(p,a,uncertain)}</section>`).join('')}</div>`;
    const selected=a[q.id],multi=q.type==='multi',isUncertain=uncertain[q.id]===true,hasCanonicalUnknown=!!unknownOption(q);
    return `<h3>${esc(q.title)}</h3><div class="assessment-choices">${q.options.map(o=>{const on=multi?Array.isArray(selected)&&selected.includes(o.value):selected===o.value;return `<button class="assessment-choice ${on?'selected':''}" aria-pressed="${on}" data-answer="${esc(q.id)}" data-value="${esc(o.value)}">${esc(o.label)}</button>`;}).join('')}${multi&&q.none_option?`<button class="assessment-choice ${Array.isArray(selected)&&!selected.length?'selected':''}" data-answer="${esc(q.id)}" data-none="true" aria-pressed="${Array.isArray(selected)&&!selected.length}">${esc(q.none_option)}</button>`:''}${!hasCanonicalUnknown?`<button class="assessment-choice ${isUncertain?'selected':''}" data-uncertain="${esc(q.id)}" aria-pressed="${isUncertain}">不确定</button>`:''}</div>${q.number_id&&selected===q.number_when?`<label>${esc(q.number_label)}<input class="input" type="number" step="1" min="${q.min??1}" ${q.max!=null?`max="${q.max}"`:''} data-number="${esc(q.number_id)}" value="${esc(a[q.number_id])}" /></label>`:''}`;
  }
  function renderQuestion(){const d=draft(),list=steps();d.step=Math.min(d.step,list.length-1);const uncertain=uncertainMap(d);ui.saveDraft(d);const q=list[d.step];
    paint(`<h2 id="assessment-modal-title">${esc(session.contract.product.name)}</h2><p>${d.step+1} / ${list.length}</p><progress value="${d.step+1}" max="${list.length}" aria-label="评估进度"></progress>${q.type==='group'?`<h3>${esc(q.title)}</h3>`:''}${questionHtml(q,d.answers,uncertain)}<p role="alert" class="canonical-error"></p><footer><button class="btn secondary" data-modal-action="back" ${d.step===0?'disabled':''}>返回</button><button class="btn primary" data-modal-action="next">${d.step===list.length-1?'查看结果':'继续'}</button></footer>`);}
  async function load(fresh){const token=++session.token;session.busy=true;paint('<h2 id="assessment-modal-title">正在加载评估…</h2>');
    try{const contract=await root.AssessmentClient.getQuestionnaire(productId);if(active!==session||token!==session.token)return;
      session.contract=contract;const old=draft(),keep=!fresh&&old?.offerId===session.offerId&&old?.contractVersion===contract.contract_version&&old?.releaseId===contract.release_id;
      const next=keep?old:{offerId:session.offerId,contractVersion:contract.contract_version,releaseId:contract.release_id,step:0,answers:{},uncertain:{}};
      uncertainMap(next);ui.saveDraft(next);renderQuestion();
    }catch(e){if(active===session&&token===session.token)paint(`<h2 id="assessment-modal-title">暂时无法加载评估</h2><p role="alert">${esc(e.message)}</p><button class="btn primary" data-modal-action="retry">重试</button>`);}
    finally{if(active===session&&token===session.token)session.busy=false;}}
  async function submit(){const d=draft();prune(stepsFor(session.contract),d.answers);const all=stepsFor(session.contract).filter(q=>visible(q,d.answers)),missing=all.findIndex(q=>!resolved(q,d));if(missing>=0){d.step=missing;ui.saveDraft(d);renderQuestion();return;}
    session.busy=true;const token=++session.token;const button=dialog.querySelector('[data-modal-action="next"]');button.disabled=true;button.textContent='正在生成…';
    try{const result=await root.AssessmentClient.evaluate({productId,evaluationDate:localDate(),answers:d.answers});if(active!==session||token!==session.token)return;
      ui.saveResult(session.offerId,resultState(result));paintReport(result);
    }catch(e){if(active===session&&token===session.token){renderQuestion();dialog.querySelector('[role="alert"]').textContent=e.message;}}
    finally{if(active===session&&token===session.token)session.busy=false;}}
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;const action=button.dataset.modalAction;
    if(action==='close'){close();return;}if(session.busy)return;
    if(action==='report-cta'){runReportCta(button.dataset.dest);return;}
    if(action==='restart'||action==='retry'){load(action==='restart');return;}
    if(action==='back'){const d=draft();d.step--;ui.saveDraft(d);renderQuestion();return;}
    if(action==='next'){const d=draft(),list=steps(),q=list[d.step];fillUnanswered(q,d);prune(stepsFor(session.contract),d.answers);ui.saveDraft(d);
      if(!resolved(q,d)){renderQuestion();dialog.querySelector('[role="alert"]').textContent='请完成当前输入，或选择“不确定”。';return;}
      const updated=steps();if(d.step===updated.length-1)submit();else{d.step++;ui.saveDraft(d);renderQuestion();}return;}
    if(button.dataset.uncertain){const d=draft(),q=leaves(steps()[d.step],d.answers).find(p=>p.id===button.dataset.uncertain);if(!q)return;const uncertain=uncertainMap(d);uncertain[q.id]=true;delete d.answers[q.id];if(q.number_id)delete d.answers[q.number_id];prune(stepsFor(session.contract),d.answers);ui.saveDraft(d);renderQuestion();dialog.querySelector(`[data-uncertain="${q.id}"]`)?.focus();return;}
    if(button.dataset.answer){const d=draft(),q=leaves(steps()[d.step],d.answers).find(p=>p.id===button.dataset.answer),value=button.dataset.value;if(!q)return;const uncertain=uncertainMap(d);delete uncertain[q.id];
      if(q.type==='multi'){const values=Array.isArray(d.answers[q.id])?d.answers[q.id]:[];d.answers[q.id]=button.dataset.none?[]:(q.exclusive||[]).includes(value)?[value]:values.includes(value)?values.filter(v=>v!==value):[...values.filter(v=>!(q.exclusive||[]).includes(v)),value];}
      else d.answers[q.id]=value;prune(stepsFor(session.contract),d.answers);ui.saveDraft(d);renderQuestion();dialog.querySelector(`[data-answer="${q.id}"]`)?.focus();}
  });
  dialog.addEventListener('input',e=>{if(session.busy||!e.target.dataset.number)return;const d=draft(),input=e.target;d.answers[input.dataset.number]=input.value===''?null:Number(input.value);ui.saveDraft(d);});
  paint('<h2 id="assessment-modal-title">申请评估</h2>');dialog.showModal();
  if(!restart&&context.result?.canonicalResult)paintReport(context.result.canonicalResult);else await load(restart);
}
root.NBStaticAssessmentIntegration=Object.freeze({productMap:{...MAP},mode:'modal',open,stepsFor,visible,prune,valid,unknownOption,hasChoice,resolved,fillUnanswered,resultState,reportHtml,localDate});
})(window);
