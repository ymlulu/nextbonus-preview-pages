
(() => {
  'use strict';

  const icon=(name,className='')=>window.NextBonusIcons?.svg?.(name,className)||'';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  let active=null;

  function questionHtml(contractApi,question,answers,uncertain){
    if(!contractApi.visible(question,answers)) return '';
    if(question.type==='group'){
      const body=(question.subs||[]).map(item=>contractApi.visible(item,answers)
        ? `<section class="nb-assessment-question">${questionHtml(contractApi,item,answers,uncertain)}</section>`
        : '').join('');
      return `<div class="assessment-compound">${body}</div>`;
    }
    const selected=answers[question.id];
    const multi=question.type==='multi';
    const isUncertain=uncertain[question.id]===true;
    const hasCanonicalUnknown=!!contractApi.unknownOption(question);
    const choices=(question.options||[]).map(option=>{
      const on=multi
        ? Array.isArray(selected)&&selected.includes(option.value)
        : selected===option.value;
      return `<button type="button" class="assessment-choice ${on?'selected':''}" aria-pressed="${on}" data-action="assessment-ui-answer" data-answer="${esc(question.id)}" data-value="${esc(option.value)}">${esc(option.label)}</button>`;
    }).join('');
    const none=multi&&question.none_option
      ? `<button type="button" class="assessment-choice ${Array.isArray(selected)&&!selected.length?'selected':''}" data-action="assessment-ui-answer" data-answer="${esc(question.id)}" data-none="true" aria-pressed="${Array.isArray(selected)&&!selected.length}">${esc(question.none_option)}</button>`
      : '';
    const uncertainChoice=!hasCanonicalUnknown
      ? `<button type="button" class="assessment-choice ${isUncertain?'selected':''}" data-action="assessment-ui-uncertain" data-uncertain="${esc(question.id)}" aria-pressed="${isUncertain}">不确定</button>`
      : '';
    const numberInput=question.number_id&&selected===question.number_when
      ? `<label class="nb-assessment-number">${esc(question.number_label)}<input class="input" type="number" step="1" min="${question.min??1}" ${question.max!=null?`max="${question.max}"`:''} data-action="assessment-ui-number" data-number="${esc(question.number_id)}" value="${esc(answers[question.number_id]??'')}" /></label>`
      : '';
    return `<h3>${esc(question.title)}</h3><div class="assessment-choices">${choices}${none}${uncertainChoice}</div>${numberInput}`;
  }

  function sectionsFor(contract,answers,contractApi){
    const common=(contract.questionnaire.common||[]).filter(q=>contractApi.visible(q,answers));
    const specific=Object.values(contract.questionnaire.specific||{}).filter(q=>contractApi.visible(q,answers));
    return [
      {key:'common',title:'你的申请情况',intro:'先了解你的信用和近期申请情况。',questions:common},
      {key:'specific',title:'这张卡的申请资格',intro:'再确认与这张卡直接相关的申请和奖励资格。',questions:specific}
    ].filter(section=>section.questions.length);
  }

  function assessmentAnswersOnly(draft){
    const answers={...(draft?.answers||{})};
    delete answers.q7;
    delete answers.q8;
    return answers;
  }

  function reportHtml(result){
    const report=result.report||{},cta=report.cta||{};
    const sections=[
      ['申请规则',report.application_text],
      ['开卡奖励资格',report.bonus_text],
      ['获批可能性',report.approval_text],
      ['下一步',cta.pre]
    ].filter(([,copy])=>copy);
    return `<div class="nb-assessment-report">
      <div class="nb-assessment-result-kicker">完整报告</div>
      <h2>${esc(result.decision?.recommended_action||'评估结果')}</h2>
      <p class="nb-assessment-report-summary">${esc(result.decision?.summary||'')}</p>
      ${sections.map(([title,copy])=>`<section><h3>${esc(title)}</h3><p>${esc(copy)}</p></section>`).join('')}
      ${result.offer_history?'<section><h3>奖励历史</h3><div class="nb-offer-history" data-assessment-offer-history hidden></div></section>':''}
      <small>${esc(result.provenance?.release_id||result.release_id||'')}</small>
      <div class="nb-assessment-report-actions">
        ${cta.dest==='current_application_url'?`<button type="button" class="btn primary" data-action="assessment-ui-apply">${esc(cta.text||'直接申请')}</button>`:''}
        <button type="button" class="btn secondary" data-action="assessment-ui-done">完成</button>
        <button type="button" class="nb-assessment-text-action" data-action="assessment-ui-restart">重新评估</button>
      </div>
    </div>`;
  }

  function renderPanel(ctx){
    const offerId=ctx.state.currentOfferId;
    const result=ctx.state.assessmentResults?.[offerId]?.canonicalResult;
    const session=active&&active.offerId===offerId?active:null;
    const view=session?.view||'loading';

    if(view==='loading'){
      return `<aside class="v4-decision-panel nb-credit-decision-panel nb-assessment-rail">
        <header class="nb-assessment-rail-head">
          <button type="button" data-action="assessment-ui-exit">${icon('chevron-left','nb-inline-action-icon nb-inline-action-icon--leading')}返回</button>
          <h2>申请评估</h2>
        </header>
        <div class="nb-assessment-loading">正在加载评估…</div>
      </aside>`;
    }

    if(view==='error'){
      return `<aside class="v4-decision-panel nb-credit-decision-panel nb-assessment-rail">
        <header class="nb-assessment-rail-head">
          <button type="button" data-action="assessment-ui-exit">${icon('chevron-left','nb-inline-action-icon nb-inline-action-icon--leading')}返回</button>
          <h2>申请评估</h2>
        </header>
        <div class="nb-assessment-error"><h3>暂时无法加载评估</h3><p>${esc(session.error||'请稍后重试。')}</p><button type="button" class="btn primary" data-action="assessment-ui-retry">重试</button></div>
      </aside>`;
    }

    if(view==='report'){
      return `<aside class="v4-decision-panel nb-credit-decision-panel nb-assessment-rail">
        <header class="nb-assessment-rail-head">
          <button type="button" data-action="assessment-ui-exit">${icon('chevron-left','nb-inline-action-icon nb-inline-action-icon--leading')}返回</button>
          <h2>完整报告</h2>
        </header>
        <div class="nb-assessment-rail-scroll">${reportHtml(session.result||result)}</div>
      </aside>`;
    }

    const contract=session?.contract;
    const draft=ctx.state.assessmentDraft;
    if(!contract||!draft) return '';

    const contractApi=window.NextBonusAssessmentContract;
    const sections=sectionsFor(contract,draft.answers,contractApi);
    const sectionIndex=Math.max(0,Math.min(Number(draft.sectionIndex||0),sections.length-1));
    const section=sections[sectionIndex];
    const uncertain=contractApi.uncertainMap(draft);
    const questions=section.questions.map(question=>
      `<section class="nb-assessment-question">${question.type==='group'?`<div class="nb-assessment-group-title">${esc(question.title)}</div>`:''}${questionHtml(contractApi,question,draft.answers,uncertain)}</section>`
    ).join('');

    return `<aside class="v4-decision-panel nb-credit-decision-panel nb-assessment-rail">
      <header class="nb-assessment-rail-head">
        <button type="button" data-action="assessment-ui-exit">${icon('chevron-left','nb-inline-action-icon nb-inline-action-icon--leading')}返回</button>
        <h2>申请评估</h2>
      </header>
      <div class="nb-assessment-progress">
        <div><span>${sectionIndex+1} / ${sections.length}</span><b>${esc(section.title)}</b></div>
        <progress value="${sectionIndex+1}" max="${sections.length}" aria-label="评估进度"></progress>
        <p>${esc(section.intro)}</p>
      </div>
      <div class="nb-assessment-rail-scroll">
        <div class="nb-assessment-question-list">${questions}</div>
        <p role="alert" class="canonical-error">${esc(session.error||'')}</p>
      </div>
      <footer class="nb-assessment-rail-footer">
        <button type="button" class="btn secondary" data-action="assessment-ui-back" ${sectionIndex===0||session.busy?'disabled':''}>上一步</button>
        <button type="button" class="btn primary" data-action="assessment-ui-next" ${session.busy?'disabled':''}>${session.busy?'正在生成…':sectionIndex===sections.length-1?'查看结果':'继续'}</button>
      </footer>
    </aside>`;
  }

  function saveDraft(ctx,value){
    ctx.state.assessmentDraft=value;
    ctx.persist?.();
  }

  function exit(ctx,{render=true}={}){
    if(render&&ctx.closeOfferDetailTask){
      ctx.closeOfferDetailTask();
      return;
    }
    active=null;
    ctx.state.offerDetailTask=null;
    if(render) ctx.renderApp?.();
  }

  async function start(ctx,{restart=false,view=null}={}){
    const contractApi=window.NextBonusAssessmentContract;
    const client=window.AssessmentClient;
    if(!contractApi||!client) throw new Error('Assessment runtime unavailable');

    const offerId=ctx.state.currentOfferId;
    const productId=contractApi.productIdFor(offerId);
    if(!productId||ctx.state.route!=='offer-detail') return;

    ctx.state.annualValueDraft=null;
    ctx.state.offerDetailTask='assessment';

    const existing=ctx.state.assessmentResults?.[offerId]?.canonicalResult;
    if(!restart&&existing){
      active={offerId,productId,contract:null,busy:false,token:0,view:'report',result:existing,error:''};
      ctx.renderApp?.();
      return;
    }

    const session={offerId,productId,contract:null,busy:true,token:1,view:'loading',result:null,error:''};
    active=session;
    if(restart) ctx.state.assessmentDraft=null;
    ctx.renderApp?.();

    try{
      const loaded=await client.getQuestionnaire(productId);
      if(active!==session) return;
      session.contract=loaded;
      const old=ctx.state.assessmentDraft;
      const keep=!restart&&old?.offerId===offerId&&
        old?.contractVersion===loaded.contract_version&&
        old?.releaseId===loaded.release_id;
      const next=keep
        ? {...old,sectionIndex:Number(old.sectionIndex||0)}
        : {
            offerId,
            contractVersion:loaded.contract_version,
            releaseId:loaded.release_id,
            sectionIndex:0,
            answers:{},
            uncertain:{}
          };
      delete next.answers.q7;
      delete next.answers.q8;
      contractApi.uncertainMap(next);
      saveDraft(ctx,next);
      session.busy=false;
      session.view='question';
      ctx.renderApp?.();
    }catch(error){
      if(active!==session) return;
      session.busy=false;
      session.view='error';
      session.error=error.message;
      ctx.renderApp?.();
    }
  }

  function currentQuestions(ctx){
    if(!active?.contract||!ctx.state.assessmentDraft) return [];
    const contractApi=window.NextBonusAssessmentContract;
    const draft=ctx.state.assessmentDraft;
    const sections=sectionsFor(active.contract,draft.answers,contractApi);
    const index=Math.max(0,Math.min(Number(draft.sectionIndex||0),sections.length-1));
    return sections[index]?.questions||[];
  }

  async function submit(ctx){
    if(!active?.contract||active.busy) return;
    const contractApi=window.NextBonusAssessmentContract;
    const client=window.AssessmentClient;
    const draft=ctx.state.assessmentDraft;
    const answers=assessmentAnswersOnly(draft);
    draft.answers=answers;
    saveDraft(ctx,draft);

    active.busy=true;
    active.error='';
    ctx.renderApp?.();
    try{
      const result=await client.evaluate({
        productId:active.productId,
        evaluationDate:contractApi.localDate(),
        answers
      });
      if(!active) return;
      ctx.state.assessmentResults[active.offerId]=contractApi.resultState(result);
      ctx.state.assessmentDraft=null;
      ctx.persist?.();
      active.result=result;
      active.view='report';
      active.busy=false;
      ctx.renderApp?.();
    }catch(error){
      if(!active) return;
      active.busy=false;
      active.error=error.message;
      ctx.renderApp?.();
    }
  }

  function handleClick({event,ctx}){
    const button=event.target.closest?.('[data-action]');
    if(!button) return false;
    const action=button.dataset.action;
    if(!action.startsWith('assessment-ui-')) return false;
    if(action==='assessment-ui-apply') return false;

    if(action==='assessment-ui-exit'){
      exit(ctx);
      return {handled:true};
    }
    if(action==='assessment-ui-retry'){
      void start(ctx,{restart:false});
      return {handled:true};
    }
    if(action==='assessment-ui-done'){
      exit(ctx);
      return {handled:true};
    }
    if(action==='assessment-ui-report'){
      if(active){active.view='report';active.error='';}
      return {render:true};
    }
    if(action==='assessment-ui-restart'){
      void start(ctx,{restart:true});
      return {handled:true};
    }
    if(active?.busy) return {handled:true};

    const contractApi=window.NextBonusAssessmentContract;
    const draft=ctx.state.assessmentDraft;
    if(!active?.contract||!draft) return {handled:true};

    if(action==='assessment-ui-back'){
      draft.sectionIndex=Math.max(0,Number(draft.sectionIndex||0)-1);
      active.error='';
      saveDraft(ctx,draft);
      return {render:true};
    }

    if(action==='assessment-ui-next'){
      const questions=currentQuestions(ctx);
      for(const question of questions) contractApi.fillUnanswered(question,draft);
      const assessmentSteps=[
        ...(active.contract.questionnaire.common||[]),
        ...Object.values(active.contract.questionnaire.specific||{})
      ];
      contractApi.prune(assessmentSteps,draft.answers);
      delete draft.answers.q7;
      delete draft.answers.q8;
      saveDraft(ctx,draft);

      const unresolved=questions.find(question=>!contractApi.resolved(question,draft));
      if(unresolved){
        active.error='请完成当前输入，或选择“不确定”。';
        return {render:true};
      }

      const sections=sectionsFor(active.contract,draft.answers,contractApi);
      if(Number(draft.sectionIndex||0)>=sections.length-1){
        void submit(ctx);
        return {handled:true};
      }
      draft.sectionIndex=Number(draft.sectionIndex||0)+1;
      active.error='';
      saveDraft(ctx,draft);
      return {render:true};
    }

    const leaves=currentQuestions(ctx).flatMap(question=>contractApi.leaves(question,draft.answers));
    if(action==='assessment-ui-uncertain'){
      const question=leaves.find(item=>item.id===button.dataset.uncertain);
      if(!question) return {handled:true};
      const uncertain=contractApi.uncertainMap(draft);
      uncertain[question.id]=true;
      delete draft.answers[question.id];
      if(question.number_id) delete draft.answers[question.number_id];
      saveDraft(ctx,draft);
      active.error='';
      return {render:true};
    }

    if(action==='assessment-ui-answer'){
      const question=leaves.find(item=>item.id===button.dataset.answer);
      if(!question) return {handled:true};
      const value=button.dataset.value;
      const uncertain=contractApi.uncertainMap(draft);
      delete uncertain[question.id];
      if(question.type==='multi'){
        const values=Array.isArray(draft.answers[question.id])?draft.answers[question.id]:[];
        draft.answers[question.id]=button.dataset.none==='true'
          ? []
          : (question.exclusive||[]).includes(value)
            ? [value]
            : values.includes(value)
              ? values.filter(item=>item!==value)
              : [...values.filter(item=>!(question.exclusive||[]).includes(item)),value];
      }else{
        draft.answers[question.id]=value;
      }
      const assessmentSteps=[
        ...(active.contract.questionnaire.common||[]),
        ...Object.values(active.contract.questionnaire.specific||{})
      ];
      contractApi.prune(assessmentSteps,draft.answers);
      saveDraft(ctx,draft);
      active.error='';
      return {render:true};
    }
    return {handled:true};
  }

  function handleInput({event,ctx}){
    const input=event.target.closest?.('[data-action="assessment-ui-number"]');
    if(!input||!active?.contract||active.busy) return false;
    const draft=ctx.state.assessmentDraft;
    if(!draft) return {handled:true};
    draft.answers[input.dataset.number]=input.value===''?null:Number(input.value);
    saveDraft(ctx,draft);
    return {handled:true};
  }

  function afterRender(root,ctx){
    if(ctx.state.offerDetailTask!=='assessment'||active?.view!=='report') return;
    const result=active.result||ctx.state.assessmentResults?.[active.offerId]?.canonicalResult;
    const host=root?.querySelector?.('[data-assessment-offer-history]');
    if(host&&result?.offer_history&&window.NextBonusAssessmentOfferHistoryChart){
      window.NextBonusAssessmentOfferHistoryChart.render(host,result.offer_history,result.evaluation_date);
    }
  }

  window.NextBonusAssessmentPage=Object.freeze({
    start,
    exit,
    renderPanel,
    handleClick,
    handleInput,
    afterRender,
    reportHtml,
    questionHtml
  });
})();
