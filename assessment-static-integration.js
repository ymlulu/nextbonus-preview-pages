(function(root){
  'use strict';
  const PRODUCT_BY_OFFER={
    'chase-sapphire':'chase_sapphire_preferred'
  };
  let session=null;

  function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function localDate(){const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
  function selectedOfferId(){
    const saved=JSON.parse(localStorage.getItem('nextbonus-local-v8-state')||'{}');
    return saved.currentOfferId||null;
  }
  function productIdForCurrentOffer(){return PRODUCT_BY_OFFER[selectedOfferId()]||null}

  function addStyle(){
    if(document.getElementById('nb-assessment-integration-style'))return;
    const style=document.createElement('style');style.id='nb-assessment-integration-style';style.textContent=`
      .nb-ai-backdrop{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.48);display:flex;align-items:flex-start;justify-content:center;padding:34px 18px;overflow:auto}
      .nb-ai-panel{width:min(820px,100%);background:#fff;border-radius:24px;box-shadow:0 24px 80px rgba(15,23,42,.24);overflow:hidden;color:#172033}
      .nb-ai-head{display:flex;justify-content:space-between;gap:20px;padding:25px 28px 18px;border-bottom:1px solid #e8ebf0}.nb-ai-head h2{margin:4px 0 0;font-size:25px}.nb-ai-kicker{font-size:12px;font-weight:750;letter-spacing:.08em;color:#58708f}.nb-ai-close{border:0;background:#f4f6f8;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer}
      .nb-ai-body{padding:24px 28px 30px}.nb-ai-meta{font-size:13px;color:#6a7483;margin-bottom:20px}.nb-ai-question{padding:18px 0;border-top:1px solid #edf0f4}.nb-ai-question:first-of-type{border-top:0}.nb-ai-question h3{font-size:16px;margin:0 0 12px}.nb-ai-options{display:grid;gap:8px}.nb-ai-option{display:flex;gap:9px;align-items:flex-start;padding:10px 12px;border:1px solid #dce2e9;border-radius:12px}.nb-ai-option input{margin-top:3px}.nb-ai-sub{padding:12px 0}.nb-ai-sub h4{margin:0 0 10px;font-size:15px}.nb-ai-number{margin:10px 0 0 26px;width:120px;padding:8px;border:1px solid #dce2e9;border-radius:10px}.nb-ai-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px}.nb-ai-btn{border:0;border-radius:12px;padding:11px 17px;font-weight:700;cursor:pointer}.nb-ai-primary{background:#111827;color:white}.nb-ai-secondary{background:#eef2f6;color:#263142}.nb-ai-error{background:#fff3f2;color:#a33c34;border-radius:12px;padding:12px 14px;margin-bottom:16px}.nb-ai-loading{padding:50px 28px;text-align:center;color:#677284}
      .nb-ai-result-hero{padding:18px;border-radius:16px;background:#f6f8fa;margin-bottom:18px}.nb-ai-result-hero strong{display:block;font-size:28px;margin:4px 0}.nb-ai-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}.nb-ai-metric{border:1px solid #e3e7ec;border-radius:14px;padding:13px}.nb-ai-metric small{display:block;color:#76808d;margin-bottom:4px}.nb-ai-report h3{font-size:15px;margin:18px 0 5px}.nb-ai-report p{margin:0;line-height:1.7;color:#4a5565}.nb-ai-provenance{margin-top:20px;padding-top:14px;border-top:1px solid #edf0f4;font-size:12px;color:#7a8491}
      @media(max-width:600px){.nb-ai-backdrop{padding:0}.nb-ai-panel{min-height:100vh;border-radius:0}.nb-ai-grid{grid-template-columns:1fr}.nb-ai-head,.nb-ai-body{padding-left:18px;padding-right:18px}}
    `;document.head.appendChild(style);
  }

  function shell(inner,title='申请评估',subtitle='NextBonus Assessment'){
    addStyle();
    let node=document.getElementById('nb-assessment-integration');
    if(!node){node=document.createElement('div');node.id='nb-assessment-integration';document.body.appendChild(node)}
    node.innerHTML=`<div class="nb-ai-backdrop"><section class="nb-ai-panel" role="dialog" aria-modal="true"><header class="nb-ai-head"><div><div class="nb-ai-kicker">${esc(subtitle)}</div><h2>${esc(title)}</h2></div><button class="nb-ai-close" data-nb-ai="close" aria-label="关闭">×</button></header>${inner}</section></div>`;
    return node;
  }
  function close(){document.getElementById('nb-assessment-integration')?.remove();session=null}
  function loading(title='正在加载评估…'){shell(`<div class="nb-ai-loading">正在从独立 Assessment 模块加载正式问卷和规则…</div>`,title)}
  function errorView(message){shell(`<div class="nb-ai-body"><div class="nb-ai-error">${esc(message)}</div><div class="nb-ai-actions"><button class="nb-ai-btn nb-ai-secondary" data-nb-ai="close">关闭</button><button class="nb-ai-btn nb-ai-primary" data-nb-ai="retry">重试</button></div></div>`,session?.questionnaire?.product?.name||'申请评估')}

  function optionsHtml(id,options,type='radio',exclusive=[]){
    return `<div class="nb-ai-options">${(options||[]).map(o=>`<label class="nb-ai-option"><input type="${type}" name="${esc(id)}" value="${esc(o.value)}" ${type==='checkbox'&&exclusive.includes(o.value)?`data-exclusive="1"`:''}><span>${esc(o.label)}</span></label>`).join('')}</div>`;
  }
  function questionHtml(q){
    if(q.type==='single')return `<div class="nb-ai-question"><h3>${esc(q.number||'')} ${esc(q.title)}</h3>${optionsHtml(q.id,q.options)}</div>`;
    if(q.type==='multi')return `<div class="nb-ai-question"><h3>${esc(q.number||'')} ${esc(q.title)}</h3>${optionsHtml(q.id,q.options,'checkbox',q.exclusive||[])}</div>`;
    if(q.type==='group')return `<div class="nb-ai-question"><h3>${esc(q.number||'')} ${esc(q.title)}</h3>${(q.subs||[]).map(s=>`<div class="nb-ai-sub" data-show-id="${esc(s.show_when&&s.show_when.id||'')}" data-show-value="${esc(s.show_when&&s.show_when.value||'')}"><h4>${esc(s.title)}</h4>${optionsHtml(s.id,s.options)}${s.number_id?`<input class="nb-ai-number" type="number" min="0" name="${esc(s.number_id)}" data-number-parent="${esc(s.id)}" data-number-when="${esc(s.number_when||'')}" placeholder="${esc(s.number_label||'数量')}">`:''}</div>`).join('')}</div>`;
    return '';
  }
  function benefitHtml(q){return `<div class="nb-ai-question"><h3>${esc(q.number||'')} ${esc(q.title)}</h3>${optionsHtml(q.id,q.options,'checkbox')}</div>`}

  function renderForm(payload){
    const q=payload.questionnaire;
    session.questionnaire=payload;
    const questions=[...(q.common||[]),q.specific&&q.specific.q5,q.specific&&q.specific.q6].filter(Boolean);
    shell(`<div class="nb-ai-body"><div class="nb-ai-meta">Contract v${esc(payload.contract_version)} · Runtime ${esc(payload.release_id)} · 评估日期 ${esc(session.evaluationDate)}</div><form id="nb-ai-form">${questions.map(questionHtml).join('')}${benefitHtml(q.benefits.q7)}${benefitHtml(q.benefits.q8)}<div class="nb-ai-actions"><button type="button" class="nb-ai-btn nb-ai-secondary" data-nb-ai="close">取消</button><button class="nb-ai-btn nb-ai-primary" type="submit">生成完整分析</button></div></form></div>`,payload.product.name);
    updateVisibility();
  }

  function updateVisibility(){
    const form=document.getElementById('nb-ai-form');if(!form)return;
    form.querySelectorAll('[data-number-parent]').forEach(input=>{const parent=input.dataset.numberParent,when=input.dataset.numberWhen,checked=form.querySelector(`input[name="${CSS.escape(parent)}"]:checked`);input.style.display=checked&&checked.value===when?'block':'none'});
    form.querySelectorAll('.nb-ai-sub[data-show-id]').forEach(node=>{const id=node.dataset.showId;if(!id)return;const checked=form.querySelector(`input[name="${CSS.escape(id)}"]:checked`);node.style.display=checked&&checked.value===node.dataset.showValue?'block':'none'});
  }

  function formAnswers(form,payload){
    const out={};
    for(const q of payload.questionnaire.common||[]){const x=form.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`);if(x)out[q.id]=x.value}
    function read(node){
      if(!node)return;
      if(node.type==='single'){const x=form.querySelector(`input[name="${CSS.escape(node.id)}"]:checked`);if(x)out[node.id]=x.value;return}
      if(node.type==='multi'){const xs=[...form.querySelectorAll(`input[name="${CSS.escape(node.id)}"]:checked`)];if(xs.length)out[node.id]=xs.map(x=>x.value);return}
      for(const s of node.subs||[]){
        if(s.show_when&&out[s.show_when.id]!==s.show_when.value)continue;
        const x=form.querySelector(`input[name="${CSS.escape(s.id)}"]:checked`);if(x){out[s.id]=x.value;if(s.number_id&&x.value===s.number_when){const n=form.elements[s.number_id];if(n&&n.value!=='')out[s.number_id]=n.value}}
      }
    }
    read(payload.questionnaire.specific&&payload.questionnaire.specific.q5);read(payload.questionnaire.specific&&payload.questionnaire.specific.q6);
    for(const key of ['q7','q8']){const xs=[...form.querySelectorAll(`input[name="${key}"]:checked`)];out[key]=xs.map(x=>x.value)}
    return out;
  }

  function renderResult(result){
    session.result=result;
    const d=result.dimensions,r=result.report;
    shell(`<div class="nb-ai-body"><div class="nb-ai-result-hero"><small>${esc(result.evaluation_date)} · ${esc(result.release_id)}</small><strong>${esc(result.decision.recommended_action)}</strong><span>${esc(result.decision.summary||'')}</span></div><div class="nb-ai-grid"><div class="nb-ai-metric"><small>开卡奖励评级</small><b>${esc(d.offer.rating)}</b></div><div class="nb-ai-metric"><small>获批可能性</small><b>${esc(d.application.approval_label)}</b></div><div class="nb-ai-metric"><small>能否拿奖励</small><b>${esc(d.bonus.label)}</b></div><div class="nb-ai-metric"><small>长期持有价值</small><b>${esc(d.long_term.label)}</b></div></div><div class="nb-ai-report"><h3>申请规则</h3><p>${esc(r.application_text)}</p><h3>开卡奖励资格</h3><p>${esc(r.bonus_text)}</p><h3>当前开卡奖励</h3><p>${esc(r.offer_text)}</p><h3>获批可能性</h3><p>${esc(r.approval_text)}</p><h3>长期持有价值</h3><p>${esc(r.long_term_text)}</p></div><div class="nb-ai-provenance">Assessment Contract v${esc(result.contract_version)} · Source release ${esc(result.provenance&&result.provenance.release_id||result.release_id)}</div><div class="nb-ai-actions"><button class="nb-ai-btn nb-ai-secondary" data-nb-ai="restart">重新评估</button><button class="nb-ai-btn nb-ai-primary" data-nb-ai="close">完成</button></div></div>`,result.product_name,'独立 Assessment 结果');
  }

  async function start(){
    const productId=productIdForCurrentOffer();if(!productId)return false;
    session={productId,evaluationDate:localDate(),questionnaire:null,result:null};
    loading();
    try{renderForm(await root.AssessmentClient.getQuestionnaire(productId))}catch(error){errorView(error.message||'Assessment 加载失败')}
    return true;
  }

  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action="assessment-start"]');
    if(action&&PRODUCT_BY_OFFER[selectedOfferId()]){event.preventDefault();event.stopImmediatePropagation();start();return}
    const cmd=event.target.closest('[data-nb-ai]');if(!cmd)return;
    const name=cmd.dataset.nbAi;
    if(name==='close'){close();return}
    if(name==='retry'){start();return}
    if(name==='restart'&&session){loading(session.questionnaire?.product?.name||'申请评估');root.AssessmentClient.getQuestionnaire(session.productId).then(renderForm).catch(e=>errorView(e.message));return}
  },true);

  document.addEventListener('change',event=>{
    if(!event.target.closest('#nb-ai-form'))return;
    if(event.target.type==='checkbox'&&event.target.dataset.exclusive==='1'&&event.target.checked){const form=event.target.form;form.querySelectorAll(`input[name="${CSS.escape(event.target.name)}"]`).forEach(x=>{if(x!==event.target)x.checked=false})}
    else if(event.target.type==='checkbox'&&event.target.checked){const form=event.target.form;form.querySelectorAll(`input[name="${CSS.escape(event.target.name)}"][data-exclusive="1"]`).forEach(x=>x.checked=false)}
    updateVisibility();
  });

  document.addEventListener('submit',async event=>{
    if(event.target.id!=='nb-ai-form')return;
    event.preventDefault();
    const form=event.target,button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='正在生成…';
    const answers=formAnswers(form,session.questionnaire);
    try{
      const result=await root.AssessmentClient.evaluate({productId:session.productId,evaluationDate:session.evaluationDate,answers});
      renderResult(result);
    }catch(error){button.disabled=false;button.textContent='生成完整分析';const old=form.querySelector('.nb-ai-error');if(old)old.remove();form.insertAdjacentHTML('afterbegin',`<div class="nb-ai-error">${esc(error.message||'评估失败')}</div>`)}
  });

  root.NBStaticAssessmentIntegration={start,productMap:{...PRODUCT_BY_OFFER}};
})(window);
