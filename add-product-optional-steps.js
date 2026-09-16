(() => {
  'use strict';

  const root=document.getElementById('app');
  if(!root) return;

  const OPTIONAL_ACTIONS=[
    'add-track-next',
    'add-offer-next'
  ];
  let pendingManual=null;

  function isSubmitting(button){
    return /保存中|提交中/.test(button?.textContent||'');
  }

  function selectedChoice(action){
    if(action==='add-track-next') return root.querySelector('[data-action="add-track-choice"].selected');
    if(action==='add-offer-next') return root.querySelector('[data-action="add-offer-choice"].selected');
    return null;
  }

  function labelFor(action,selected){
    if(action==='add-track-next'){
      if(!selected) return '跳过并添加到钱包';
      if(selected.dataset.value==='no') return '添加到钱包';
      return '继续';
    }
    if(action==='add-offer-next'){
      if(!selected) return '跳过并添加到钱包';
      if(selected.dataset.id==='manual') return '继续';
      return '添加到钱包';
    }
    return '';
  }

  function refreshOptionalActions(){
    OPTIONAL_ACTIONS.forEach(action=>{
      const button=root.querySelector(`[data-action="${action}"]`);
      if(!button || isSubmitting(button)) return;
      if(button.disabled) button.disabled=false;
      if(button.hasAttribute('disabled')) button.removeAttribute('disabled');
      if(button.getAttribute('aria-disabled')!=='false') button.setAttribute('aria-disabled','false');

      const label=labelFor(action,selectedChoice(action));
      if(label && button.textContent!==label) button.textContent=label;
    });

    const manual=root.querySelector('[data-action="add-manual-submit"]');
    if(manual && !isSubmitting(manual)){
      if(manual.disabled) manual.disabled=false;
      if(manual.hasAttribute('disabled')) manual.removeAttribute('disabled');
      if(manual.getAttribute('aria-disabled')!=='false') manual.setAttribute('aria-disabled','false');
      if(manual.textContent!=='保存') manual.textContent='保存';
    }
  }

  function triggerAppAction(action,dataset={}){
    const button=document.createElement('button');
    button.type='button';
    button.hidden=true;
    button.dataset.action=action;
    Object.entries(dataset).forEach(([key,value])=>button.dataset[key]=String(value));
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function skipRewardTracking(){
    triggerAppAction('add-track-choice',{value:'no'});
    triggerAppAction('add-track-next');
  }

  function manualSnapshot(modal){
    const reward=modal?.querySelector('#add-reward')?.value||'';
    const tasks=[...(modal?.querySelectorAll('.task-card')||[])].map(card=>({
      id:card.querySelector('.task-desc')?.dataset.id||`t${Date.now()}`,
      desc:card.querySelector('.task-desc')?.value||'',
      due:card.querySelector('.task-due')?.value||''
    }));
    return {reward,tasks};
  }

  function hasManualInput(snapshot){
    return !!String(snapshot?.reward||'').trim() || (snapshot?.tasks||[]).some(task=>String(task.desc||'').trim()||task.due);
  }

  function shortDate(value){
    if(!value) return '';
    const date=new Date(`${value}T00:00:00`);
    if(Number.isNaN(date.getTime())) return String(value);
    return `${date.getMonth()+1}/${date.getDate()}`;
  }

  function createManualBonusTracking(core,state,spec,snapshot){
    core.ensureCollections?.(state);
    state.offerTrackings=Array.isArray(state.offerTrackings)?state.offerTrackings:[];
    state.trackingTasks=Array.isArray(state.trackingTasks)?state.trackingTasks:[];
    state.activeAttention=Array.isArray(state.activeAttention)?state.activeAttention:[];

    const token=spec.identity||`${spec.productId}-${Date.now()}`;
    const trackingId=spec.trackingId||`tracking-${token}`;
    const reward=String(snapshot.reward||'').trim();
    const enteredTasks=(snapshot.tasks||[]).filter(task=>String(task.desc||'').trim()||task.due);
    const describedTasks=enteredTasks.filter(task=>String(task.desc||'').trim());
    const dueDate=enteredTasks.find(task=>task.due)?.due||null;
    const tasks=describedTasks.map((task,index)=>({
      id:task.id||`task-${token}-${index+1}`,
      trackingId,
      description:String(task.desc||'').trim(),
      dueDate:task.due||null,
      status:'pending'
    }));

    const tracking={
      id:trackingId,
      userProductId:spec.productId,
      offerId:spec.offerId||null,
      status:'in_progress',
      anchorDate:spec.anchorDate||null,
      anchorKind:spec.anchorKind||null,
      reward,
      requirement:'',
      createdAt:new Date().toISOString()
    };
    state.offerTrackings.push(tracking);
    state.trackingTasks.push(...tasks);

    const attention={
      id:spec.attentionId||`a-${token}`,
      productId:spec.productId,
      product:spec.productLabel||spec.productName||'',
      action:spec.action||'完成开卡奖励',
      secondary:reward,
      time:dueDate?`截止 ${shortDate(dueDate)}`:'',
      dueDate,
      type:'bonus',
      summary:spec.summary||'这是你在添加产品时建立的奖励追踪。',
      key:reward,
      keySub:dueDate?`最晚 ${shortDate(dueDate)} 完成`:'',
      instruction:tasks.length?'完成以下条件':'',
      checklist:tasks.map(task=>({id:task.id,label:task.description,done:false,...(task.dueDate?{dueDate:task.dueDate}:{})})),
      primary:'我已完成',
      secondaryAction:null,
      completionKind:'completed',
      trackingId
    };
    state.activeAttention.push(attention);
    return {trackingId,tasks,attention};
  }

  function installManualLifecycleBridge(){
    const core=window.NextBonusProductLifecycleCore;
    if(!core || core.__manualOptionalSave) return;
    const original=core.createBonusTracking.bind(core);
    window.NextBonusProductLifecycleCore=Object.freeze({
      ...core,
      createBonusTracking(state,spec={}){
        if(!pendingManual) return original(state,spec);
        const snapshot=pendingManual;
        pendingManual=null;
        return createManualBonusTracking(core,state,spec,snapshot);
      },
      __manualOptionalSave:true
    });
  }

  document.addEventListener('click',event=>{
    const infoContinue=event.target.closest?.('[data-action="add-to-track"]');
    if(infoContinue && root.contains(infoContinue) && infoContinue.closest('.add-product-modal')){
      if(infoContinue.disabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      triggerAppAction('add-to-track');
      return;
    }

    const manual=event.target.closest?.('[data-action="add-manual-submit"]');
    if(manual && root.contains(manual) && !isSubmitting(manual)){
      const modal=manual.closest('.add-product-modal');
      const snapshot=manualSnapshot(modal);
      if(!hasManualInput(snapshot)){
        event.preventDefault();
        event.stopImmediatePropagation();
        pendingManual=null;
        skipRewardTracking();
        return;
      }
      pendingManual=snapshot;
      return;
    }

    const button=event.target.closest?.('[data-action="add-track-next"],[data-action="add-offer-next"]');
    if(!button || !root.contains(button) || isSubmitting(button)) return;

    const action=button.dataset.action;
    if(selectedChoice(action)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    skipRewardTracking();
  },true);

  installManualLifecycleBridge();
  refreshOptionalActions();
  new MutationObserver(()=>{
    installManualLifecycleBridge();
    refreshOptionalActions();
  }).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','aria-disabled']});
})();
