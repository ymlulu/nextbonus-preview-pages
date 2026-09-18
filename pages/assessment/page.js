(() => {
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  function questionHtml(contractApi,question,answers,uncertain){
    if(!contractApi.visible(question,answers)) return '';
    if(question.type==='group'){
      return `<div class="assessment-compound">${question.subs.map(item=>`<section>${questionHtml(contractApi,item,answers,uncertain)}</section>`).join('')}</div>`;
    }
    const selected=answers[question.id];
    const multi=question.type==='multi';
    const isUncertain=uncertain[question.id]===true;
    const hasCanonicalUnknown=!!contractApi.unknownOption(question);
    const choices=question.options.map(option=>{
      const on=multi
        ? Array.isArray(selected)&&selected.includes(option.value)
        : selected===option.value;
      return `<button class="assessment-choice ${on?'selected':''}" aria-pressed="${on}" data-answer="${esc(question.id)}" data-value="${esc(option.value)}">${esc(option.label)}</button>`;
    }).join('');
    const none=multi&&question.none_option
      ? `<button class="assessment-choice ${Array.isArray(selected)&&!selected.length?'selected':''}" data-answer="${esc(question.id)}" data-none="true" aria-pressed="${Array.isArray(selected)&&!selected.length}">${esc(question.none_option)}</button>`
      : '';
    const uncertainChoice=!hasCanonicalUnknown
      ? `<button class="assessment-choice ${isUncertain?'selected':''}" data-uncertain="${esc(question.id)}" aria-pressed="${isUncertain}">不确定</button>`
      : '';
    const numberInput=question.number_id&&selected===question.number_when
      ? `<label>${esc(question.number_label)}<input class="input" type="number" step="1" min="${question.min??1}" ${question.max!=null?`max="${question.max}"`:''} data-number="${esc(question.number_id)}" value="${esc(answers[question.number_id])}" /></label>`
      : '';
    return `<h3>${esc(question.title)}</h3><div class="assessment-choices">${choices}${none}${uncertainChoice}</div>${numberInput}`;
  }

  function reportHtml(result){
    const dimensions=result.dimensions,report=result.report,cta=report.cta||{};
    const dimensionRows=[
      ['开卡奖励评级',dimensions.offer.rating],
      ['获批可能性',dimensions.application.approval_label],
      ['能否拿奖励',dimensions.bonus.label],
      ['长期持有价值',dimensions.long_term.label]
    ];
    const sections=[
      ['申请规则',report.application_text],
      ['开卡奖励资格',report.bonus_text],
      ['当前开卡奖励',report.offer_text],
      ['获批可能性',report.approval_text],
      ['长期持有价值',report.long_term_text],
      ['下一步',cta.pre]
    ];
    const body=sections.map(([title,copy])=>
      `<section><h3>${esc(title)}</h3><p>${esc(copy)}</p>${title==='当前开卡奖励'?'<div class="nb-offer-history" data-assessment-offer-history hidden></div>':''}</section>`
    ).join('');
    return `<h2 id="assessment-modal-title">${esc(result.decision.recommended_action)}</h2><p>${esc(result.decision.summary)}</p><dl class="canonical-dimensions">${dimensionRows.map(([title,value])=>`<div><dt>${esc(title)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${body}<small>${esc(result.provenance?.release_id||result.release_id||'')}</small><footer><button data-modal-action="restart" class="btn secondary">重新评估</button><button data-modal-action="report-cta" data-dest="${esc(cta.dest||'offer_detail_url')}" class="btn primary">${esc(cta.text||'完成')}</button></footer>`;
  }

  let active=null;

  async function open(ctx,{restart=false}={}){
    const contractApi=window.NextBonusAssessmentContract;
    const client=window.AssessmentClient;
    if(!contractApi||!client) throw new Error('Assessment runtime unavailable');

    const offerId=ctx.state.currentOfferId;
    const productId=contractApi.productIdFor(offerId);
    if(!productId||ctx.state.route!=='offer-detail'||active) return;

    const dialog=document.createElement('dialog');
    dialog.className='canonical-assessment-modal';
    dialog.setAttribute('aria-labelledby','assessment-modal-title');
    const session={dialog,offerId,productId,contract:null,busy:false,token:0};
    active=session;

    const opener=document.activeElement;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    document.body.append(dialog);

    const persist=()=>ctx.persist?.();
    const draft=()=>ctx.state.assessmentDraft;
    const saveDraft=value=>{
      ctx.state.assessmentDraft=value;
      persist();
    };
    const saveResult=result=>{
      ctx.state.assessmentResults[session.offerId]=contractApi.resultState(result);
      ctx.state.assessmentDraft=null;
      ctx.renderApp?.();
    };

    function close(){
      session.token++;
      dialog.close();
      dialog.remove();
      active=null;
      document.body.style.overflow=previousOverflow;
      if(opener?.isConnected) opener.focus();
      else document.querySelector('[data-action="assessment-start"]')?.focus();
    }

    function runReportCta(dest){
      close();
      if(dest==='current_application_url'){
        requestAnimationFrame(()=>document.querySelector('[data-action="direct-apply"]')?.click());
      }
    }

    function paint(body){
      dialog.innerHTML=`<button class="canonical-close" data-modal-action="close" aria-label="关闭评估">×</button><div class="canonical-modal-body">${body}</div>`;
      dialog.scrollTop=0;
    }

    function paintReport(result){
      paint(reportHtml(result));
      const host=dialog.querySelector('[data-assessment-offer-history]');
      if(host&&window.NextBonusAssessmentOfferHistoryChart&&result.offer_history){
        window.NextBonusAssessmentOfferHistoryChart.render(host,result.offer_history,result.evaluation_date);
      }
    }

    function steps(){
      return contractApi.stepsFor(session.contract).filter(question=>
        contractApi.visible(question,draft().answers)
      );
    }

    function renderQuestion(){
      const current=draft();
      const list=steps();
      current.step=Math.min(current.step,list.length-1);
      const uncertain=contractApi.uncertainMap(current);
      saveDraft(current);
      const question=list[current.step];
      paint(`<h2 id="assessment-modal-title">${esc(session.contract.product.name)}</h2><p>${current.step+1} / ${list.length}</p><progress value="${current.step+1}" max="${list.length}" aria-label="评估进度"></progress>${question.type==='group'?`<h3>${esc(question.title)}</h3>`:''}${questionHtml(contractApi,question,current.answers,uncertain)}<p role="alert" class="canonical-error"></p><footer><button class="btn secondary" data-modal-action="back" ${current.step===0?'disabled':''}>返回</button><button class="btn primary" data-modal-action="next">${current.step===list.length-1?'查看结果':'继续'}</button></footer>`);
    }

    async function load(fresh){
      const token=++session.token;
      session.busy=true;
      paint('<h2 id="assessment-modal-title">正在加载评估…</h2>');
      try{
        const loaded=await client.getQuestionnaire(productId);
        if(active!==session||token!==session.token) return;
        session.contract=loaded;
        const old=draft();
        const keep=!fresh&&old?.offerId===session.offerId&&
          old?.contractVersion===loaded.contract_version&&
          old?.releaseId===loaded.release_id;
        const next=keep
          ? old
          : {
              offerId:session.offerId,
              contractVersion:loaded.contract_version,
              releaseId:loaded.release_id,
              step:0,
              answers:{},
              uncertain:{}
            };
        contractApi.uncertainMap(next);
        saveDraft(next);
        renderQuestion();
      }catch(error){
        if(active===session&&token===session.token){
          paint(`<h2 id="assessment-modal-title">暂时无法加载评估</h2><p role="alert">${esc(error.message)}</p><button class="btn primary" data-modal-action="retry">重试</button>`);
        }
      }finally{
        if(active===session&&token===session.token) session.busy=false;
      }
    }

    async function submit(){
      const current=draft();
      contractApi.prune(contractApi.stepsFor(session.contract),current.answers);
      const all=contractApi.stepsFor(session.contract).filter(question=>
        contractApi.visible(question,current.answers)
      );
      const missing=all.findIndex(question=>!contractApi.resolved(question,current));
      if(missing>=0){
        current.step=missing;
        saveDraft(current);
        renderQuestion();
        return;
      }

      session.busy=true;
      const token=++session.token;
      const button=dialog.querySelector('[data-modal-action="next"]');
      button.disabled=true;
      button.textContent='正在生成…';
      try{
        const result=await client.evaluate({
          productId,
          evaluationDate:contractApi.localDate(),
          answers:current.answers
        });
        if(active!==session||token!==session.token) return;
        saveResult(result);
        paintReport(result);
      }catch(error){
        if(active===session&&token===session.token){
          renderQuestion();
          dialog.querySelector('[role="alert"]').textContent=error.message;
        }
      }finally{
        if(active===session&&token===session.token) session.busy=false;
      }
    }

    dialog.addEventListener('cancel',event=>{
      event.preventDefault();
      close();
    });

    dialog.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button) return;
      const action=button.dataset.modalAction;
      if(action==='close'){
        close();
        return;
      }
      if(session.busy) return;
      if(action==='report-cta'){
        runReportCta(button.dataset.dest);
        return;
      }
      if(action==='restart'||action==='retry'){
        void load(action==='restart');
        return;
      }
      if(action==='back'){
        const current=draft();
        current.step--;
        saveDraft(current);
        renderQuestion();
        return;
      }
      if(action==='next'){
        const current=draft(),list=steps(),question=list[current.step];
        contractApi.fillUnanswered(question,current);
        contractApi.prune(contractApi.stepsFor(session.contract),current.answers);
        saveDraft(current);
        if(!contractApi.resolved(question,current)){
          renderQuestion();
          dialog.querySelector('[role="alert"]').textContent='请完成当前输入，或选择“不确定”。';
          return;
        }
        const updated=steps();
        if(current.step===updated.length-1){
          void submit();
        }else{
          current.step++;
          saveDraft(current);
          renderQuestion();
        }
        return;
      }
      if(button.dataset.uncertain){
        const current=draft();
        const question=contractApi.leaves(steps()[current.step],current.answers)
          .find(item=>item.id===button.dataset.uncertain);
        if(!question) return;
        const uncertain=contractApi.uncertainMap(current);
        uncertain[question.id]=true;
        delete current.answers[question.id];
        if(question.number_id) delete current.answers[question.number_id];
        contractApi.prune(contractApi.stepsFor(session.contract),current.answers);
        saveDraft(current);
        renderQuestion();
        dialog.querySelector(`[data-uncertain="${question.id}"]`)?.focus();
        return;
      }
      if(button.dataset.answer){
        const current=draft();
        const question=contractApi.leaves(steps()[current.step],current.answers)
          .find(item=>item.id===button.dataset.answer);
        if(!question) return;
        const value=button.dataset.value;
        const uncertain=contractApi.uncertainMap(current);
        delete uncertain[question.id];
        if(question.type==='multi'){
          const values=Array.isArray(current.answers[question.id])?current.answers[question.id]:[];
          current.answers[question.id]=button.dataset.none
            ? []
            : (question.exclusive||[]).includes(value)
              ? [value]
              : values.includes(value)
                ? values.filter(item=>item!==value)
                : [...values.filter(item=>!(question.exclusive||[]).includes(item)),value];
        }else{
          current.answers[question.id]=value;
        }
        contractApi.prune(contractApi.stepsFor(session.contract),current.answers);
        saveDraft(current);
        renderQuestion();
        dialog.querySelector(`[data-answer="${question.id}"]`)?.focus();
      }
    });

    dialog.addEventListener('input',event=>{
      if(session.busy||!event.target.dataset.number) return;
      const current=draft();
      const input=event.target;
      current.answers[input.dataset.number]=input.value===''?null:Number(input.value);
      saveDraft(current);
    });

    paint('<h2 id="assessment-modal-title">申请评估</h2>');
    dialog.showModal();
    const existing=ctx.state.assessmentResults[offerId]?.canonicalResult;
    if(!restart&&existing) paintReport(existing);
    else await load(restart);
  }

  window.NextBonusAssessmentPage=Object.freeze({
    open,
    reportHtml,
    questionHtml
  });
})();
