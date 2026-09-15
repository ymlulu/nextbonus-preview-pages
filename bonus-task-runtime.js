(() => {
  'use strict';

  const rules=window.NextBonusBonusTaskRules;
  const history=window.NextBonusReviewedOfferHistory;
  if(!rules)return;

  const APP_STATE_KEY='nextbonus-local-v8-state';
  const HANDOFF_KEY='nextbonus-application-handoff-v1';
  const memory={opened:'',automating:false,pendingHandoff:null};

  function readJson(key,fallback=null){
    try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(_){return fallback;}
  }
  function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function reset(){memory.opened='';}

  function trigger(action,dataset={}){
    const button=document.createElement('button');
    button.type='button';button.hidden=true;button.dataset.action=action;
    Object.entries(dataset).forEach(([key,value])=>button.dataset[key]=String(value));
    document.body.appendChild(button);button.click();button.remove();
  }

  function fireInput(input,value){
    input.value=value;
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function selectedOffer(modal){
    const reviewedOfferId=modal.dataset.nbReviewedOfferId||null;
    const reviewed=reviewedOfferId&&history?.current?history.current(reviewedOfferId):null;
    if(reviewed)return {offerId:reviewedOfferId,reward:reviewed.value||'',requirement:reviewed.requirement||'',dateLabel:reviewed.dateLabel||'',source:'reviewed-offer-history'};

    const selected=modal.querySelector('[data-action="add-offer-choice"].selected');
    const id=selected?.dataset.id||'';
    if(!id||id==='manual')return null;
    const offerId=id.startsWith('current-')?id.slice('current-'.length):null;
    const offer=offerId?window.NextBonusOfferData?.[offerId]:null;
    if(!offer)return null;
    return {offerId,reward:offer.primaryValue||'',requirement:offer.primaryRequirement||'',dateLabel:'',source:'current-offer'};
  }

  function categoryFromModal(modal){
    const title=(modal.querySelector('.modal-title')?.textContent||'').trim();
    return title.includes('开户时')?'银行和券商账户':'信用卡';
  }

  function trimManualTasks(){
    const cards=[...document.querySelectorAll('.add-product-modal .task-card')];
    cards.slice(1).reverse().forEach(card=>{
      const button=card.querySelector('[data-action="delete-task"]');
      if(button)trigger('delete-task',{id:button.dataset.id});
    });
  }

  function cleanTaskLabel(task){
    return String(task?.label||'').replace(/\s*·\s*截止\s*\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日\s*$/,'').trim();
  }

  function fillTask(index,task){
    const cards=[...document.querySelectorAll('.add-product-modal .task-card')];
    const card=cards[index];if(!card)return false;
    const desc=card.querySelector('.task-desc'),due=card.querySelector('.task-due');
    if(!desc||!due)return false;
    fireInput(desc,cleanTaskLabel(task));
    fireInput(due,task.dueDate||'');
    return true;
  }

  function automateSubmission(offer,plan){
    memory.automating=true;
    try{
      trigger('add-offer-choice',{id:'manual'});
      trigger('add-offer-next');
      const reward=document.querySelector('.add-product-modal #add-reward');
      if(!reward)return false;
      fireInput(reward,offer.reward);
      trimManualTasks();

      for(let index=0;index<plan.tasks.length;index++){
        if(index>0)trigger('add-task');
        if(!fillTask(index,plan.tasks[index]))return false;
      }
      trigger('add-manual-submit');
      return true;
    }finally{
      memory.automating=false;
    }
  }

  function handoffSnapshot(action){
    if(!['approved-submit','duplicate-override'].includes(action))return null;
    const store=readJson(HANDOFF_KEY,null);
    const attempt=store?.attempts?.find(item=>item.id===store.activeId)||null;
    if(!attempt)return null;
    const anchor=document.getElementById('nb-ah-anchor')?.value||attempt.anchorDate||'';
    if(!anchor)return null;
    return{
      action,
      anchorDate:anchor,
      attempt:{
        id:attempt.id,
        offerId:attempt.offerId,
        reward:attempt.reward||'',
        requirement:attempt.requirement||''
      }
    };
  }

  function shortDate(value){
    const parts=rules.dateParts(value);
    return parts?`${parts.month}月${parts.day}日`:String(value||'');
  }

  function patchApplicationProduct(snapshot){
    const state=readJson(APP_STATE_KEY,null);if(!state)return false;
    const attempt=snapshot.attempt;
    const product=(state.products||[]).find(item=>item.applicationHandoffId===attempt.id);
    const tracking=(state.offerTrackings||[]).find(item=>item.applicationHandoffId===attempt.id);
    const attention=(state.activeAttention||[]).find(item=>item.applicationHandoffId===attempt.id&&item.type==='bonus');
    if(!product||!tracking||!attention)return false;

    const currentOffer=window.NextBonusOfferData?.[attempt.offerId]||{};
    const requirement=attempt.requirement||currentOffer.primaryRequirement||'';
    const plan=rules.buildPlan(requirement,snapshot.anchorDate,{category:product.type});
    if(!plan.tasks.length||plan.tasks.some(task=>!task.dueDate))return false;

    const generated=plan.tasks.map((task,index)=>({
      id:`task-${attempt.id}-${index+1}`,
      trackingId:tracking.id,
      applicationHandoffId:attempt.id,
      description:cleanTaskLabel(task),
      dueDate:task.dueDate,
      status:'pending'
    }));

    state.trackingTasks=[
      ...(state.trackingTasks||[]).filter(task=>task.trackingId!==tracking.id),
      ...generated
    ];
    attention.dueDate=plan.dueDate;
    attention.time=`截止 ${shortDate(plan.dueDate)}`;
    attention.checklist=plan.tasks.map((task,index)=>({
      id:generated[index].id,
      label:task.label,
      dueDate:task.dueDate,
      done:false
    }));
    attention.keySub=plan.distinctDueDates>1
      ? `最早 ${shortDate(plan.dueDate)} 截止；各项日期见任务`
      : `最晚 ${shortDate(plan.dueDate)} 完成`;
    writeJson(APP_STATE_KEY,state);
    return true;
  }

  document.addEventListener('input',event=>{
    if(event.target.id==='add-opened')memory.opened=event.target.value||'';
  },true);

  // Capture the approved application context before application-handoff.js
  // clears activeId during its bubble-phase atomic commit.
  document.addEventListener('click',event=>{
    const handoff=event.target.closest?.('[data-handoff-action]');
    if(!handoff)return;
    const snapshot=handoffSnapshot(handoff.dataset.handoffAction);
    if(snapshot)memory.pendingHandoff=snapshot;
  },true);

  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-action]');
    if(!action)return;

    if(action.dataset.action==='open-add-product'||action.dataset.action==='add-another')reset();
    if(action.dataset.action==='add-to-track'){
      const modal=action.closest('.add-product-modal');
      const input=modal?.querySelector('#add-opened');
      if(input)memory.opened=input.value||memory.opened;
      return;
    }
    if(['add-close','add-discard'].includes(action.dataset.action)){reset();return;}
    if(memory.automating||action.dataset.action!=='add-offer-next')return;

    const modal=action.closest('.add-product-modal');
    if(!modal)return;
    const offer=selectedOffer(modal);if(!offer||!offer.requirement)return;
    const opened=memory.opened;
    const plan=rules.buildPlan(offer.requirement,opened,{category:categoryFromModal(modal)});
    if(!opened||!plan.tasks.length||plan.tasks.some(task=>!task.dueDate))return;

    event.preventDefault();
    event.stopImmediatePropagation();
    automateSubmission(offer,plan);
  },true);

  // application-handoff.js runs first in bubble phase and writes Product +
  // Tracking + Task + Attention. This listener then normalizes that task set
  // through the same deterministic deadline rules used by Add Product.
  document.addEventListener('click',event=>{
    const handoff=event.target.closest?.('[data-handoff-action]');
    if(!handoff||!memory.pendingHandoff)return;
    if(handoff.dataset.handoffAction!==memory.pendingHandoff.action)return;
    const snapshot=memory.pendingHandoff;
    memory.pendingHandoff=null;
    patchApplicationProduct(snapshot);
  });
})();
