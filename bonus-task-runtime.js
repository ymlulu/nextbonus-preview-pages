(() => {
  'use strict';

  const rules=window.NextBonusBonusTaskRules;
  const history=window.NextBonusReviewedOfferHistory;
  if(!rules)return;

  const APP_STATE_KEY='nextbonus-local-v8-state';
  const HANDOFF_KEY='nextbonus-application-handoff-v1';
  const BENEFIT_CYCLE_KEY='nextbonus-benefit-cycle-v1';
  const memory={opened:'',pendingHandoff:null,pendingAdd:null,pendingEdit:null,pendingEditOffer:null,pendingChecklist:null};

  function readJson(key,fallback=null){
    try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(_){return fallback;}
  }
  function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function reset(){memory.opened='';memory.pendingAdd=null;}
  function clone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
  function nowIso(){return new Date().toISOString();}

  function trigger(action,dataset={}){
    const button=document.createElement('button');
    button.type='button';button.hidden=true;button.dataset.action=action;
    Object.entries(dataset).forEach(([key,value])=>button.dataset[key]=String(value));
    document.body.appendChild(button);button.click();button.remove();
  }

  function rewardKey(value){
    return String(value||'')
      .toLowerCase()
      .replace(/[®™℠]/g,'')
      .replace(/[\s,，.。·•:：;；/\\()[\]{}_\-–—]+/g,'')
      .trim();
  }

  function cleanTaskLabel(task){
    return String(task?.label||task?.description||'')
      .replace(/\s*·\s*截止\s*\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日\s*$/,'')
      .trim();
  }

  function shortDate(value){
    const parts=rules.dateParts(value);
    return parts?`${parts.month}月${parts.day}日`:String(value||'');
  }

  function historyDateLabel(){
    const date=new Date();
    const month=date.toLocaleString('en-US',{month:'short'});
    return `${month} ${String(date.getDate()).padStart(2,'0')}, ${date.getFullYear()}`;
  }

  function currentOfferVersion(offerId){return offerId?`preview-current:${offerId}`:null;}
  function reviewedOfferVersion(choice){return choice?.id?`reviewed:${choice.id}`:null;}

  function selectedAddOffer(modal){
    const reviewedOfferId=modal?.dataset?.nbReviewedOfferId||null;
    const reviewed=reviewedOfferId&&history?.current?history.current(reviewedOfferId):null;
    if(reviewed)return {
      offerId:reviewedOfferId,
      offerVersionId:reviewedOfferVersion(reviewed),
      sourceOfferChoiceId:reviewed.id,
      reward:reviewed.value||'',requirement:reviewed.requirement||'',source:'reviewed-offer-history'
    };
    const selected=modal?.querySelector('[data-action="add-offer-choice"].selected');
    const id=selected?.dataset.id||'';
    if(!id||id==='manual')return null;
    const offerId=id.startsWith('current-')?id.slice('current-'.length):null;
    const offer=offerId?window.NextBonusOfferData?.[offerId]:null;
    if(!offer)return null;
    return {offerId,offerVersionId:offer.offerVersionId||currentOfferVersion(offerId),sourceOfferChoiceId:id,reward:offer.primaryValue||'',requirement:offer.primaryRequirement||'',source:'current-offer'};
  }

  function selectedEditOffer(action){
    const state=readJson(APP_STATE_KEY,null);
    const productId=state?.currentProductId||'';
    const product=(state?.products||[]).find(item=>item.id===productId)||null;
    const offerId=product?.offerId||'';
    if(!product||!offerId)return null;
    const reviewed=history?.current?.(offerId)||null;
    if(reviewed)return {
      productId,offerId,offerVersionId:reviewedOfferVersion(reviewed),sourceOfferChoiceId:reviewed.id,
      reward:reviewed.value||'',requirement:reviewed.requirement||'',source:'reviewed-offer-history'
    };
    const page=action?.closest?.('.edit-product-page')||document.querySelector('.edit-product-page');
    const selected=page?.querySelector('[data-action="edit-bonus-choice"].selected');
    const id=selected?.dataset.id||'';
    if(!id||id==='manual')return null;
    const fact=window.NextBonusOfferData?.[offerId]||null;
    if(!fact)return null;
    return {productId,offerId,offerVersionId:fact.offerVersionId||currentOfferVersion(offerId),sourceOfferChoiceId:id,reward:fact.primaryValue||'',requirement:fact.primaryRequirement||'',source:'current-offer'};
  }

  function categoryFromModal(modal){
    const title=(modal?.querySelector('.modal-title')?.textContent||'').trim();
    return title.includes('开户时')?'银行和券商账户':'信用卡';
  }

  function anchorValue(kind){
    if(kind==='edit')return document.getElementById('edit-opened')?.value||'';
    return document.getElementById('add-opened')?.value||memory.opened||'';
  }

  function ensureAnchorPrompt(container,kind){
    if(!container||container.querySelector(`[data-nb-anchor-prompt="${kind}"]`))return;
    const isEdit=kind==='edit';
    const block=document.createElement('div');
    block.dataset.nbAnchorPrompt=kind;
    block.className='report';
    block.style.marginTop='14px';
    block.innerHTML=`<h3>${isEdit?'补充开卡日期':'补充开卡 / 开户日期'}</h3><p>这个奖励的截止日期需要从${isEdit?'开卡':'开卡 / 开户'}日期计算。填写后才能继续。</p><div class="form-group" style="margin-top:10px"><label class="label">${isEdit?'开卡日期':'开卡 / 开户日期'}</label><input id="${isEdit?'edit-opened':'add-opened'}" class="input" type="date" max="${new Date().toISOString().slice(0,10)}" value="${anchorValue(kind)}"></div>`;
    const footer=container.querySelector('.edit-footer,.modal-foot');
    if(footer)footer.parentElement.insertBefore(block,footer);else container.appendChild(block);
    block.querySelector('input')?.focus();
  }

  function planFor(offer,opened,category){
    if(!offer?.requirement)return null;
    return rules.buildPlan(offer.requirement,opened,{category});
  }

  function handoffSnapshot(action){
    if(!['approved-submit','duplicate-override'].includes(action))return null;
    const store=readJson(HANDOFF_KEY,null);
    const attempt=store?.attempts?.find(item=>item.id===store.activeId)||null;
    if(!attempt)return null;
    const anchor=document.getElementById('nb-ah-anchor')?.value||attempt.anchorDate||'';
    if(!anchor)return null;
    return{
      action,anchorDate:anchor,
      attempt:{id:attempt.id,offerId:attempt.offerId,offerVersionId:attempt.offerVersionId||currentOfferVersion(attempt.offerId),reward:attempt.reward||'',requirement:attempt.requirement||''}
    };
  }

  function ensureTracking(state,product,attention,source,anchorDate){
    state.offerTrackings=Array.isArray(state.offerTrackings)?state.offerTrackings:[];
    let tracking=null;
    if(attention?.trackingId)tracking=state.offerTrackings.find(item=>item.id===attention.trackingId)||null;
    if(!tracking&&attention?.applicationHandoffId)tracking=state.offerTrackings.find(item=>item.applicationHandoffId===attention.applicationHandoffId)||null;
    if(!tracking&&source?.offerId)tracking=state.offerTrackings.find(item=>item.userProductId===product.id&&item.offerId===source.offerId&&item.status!=='stopped')||null;
    if(!tracking){
      const id=`tracking-${product.id}-${Date.now()}`;
      tracking={id,userProductId:product.id,offerId:source?.offerId||product.offerId||null,offerVersionId:source?.offerVersionId||null,sourceOfferChoiceId:source?.sourceOfferChoiceId||null,status:'in_progress',anchorDate:anchorDate||product.opened||null,anchorKind:'user_product_opened_date',reward:source?.reward||attention?.key||attention?.secondary||'',requirement:source?.requirement||attention?.requirement||'',createdAt:nowIso()};
      state.offerTrackings.push(tracking);
    }else{
      tracking.offerVersionId=source?.offerVersionId||tracking.offerVersionId||null;
      tracking.sourceOfferChoiceId=source?.sourceOfferChoiceId||tracking.sourceOfferChoiceId||null;
      tracking.anchorDate=anchorDate||tracking.anchorDate||product.opened||null;
      tracking.reward=source?.reward||tracking.reward||attention?.key||'';
      tracking.requirement=source?.requirement||tracking.requirement||attention?.requirement||'';
      if(tracking.status!=='completed')tracking.status='in_progress';
    }
    attention.trackingId=tracking.id;
    return tracking;
  }

  function syncTrackingTasks(state,tracking,attention,plan){
    state.trackingTasks=Array.isArray(state.trackingTasks)?state.trackingTasks:[];
    const existing=state.trackingTasks.filter(task=>task.trackingId===tracking.id);
    const previous=Array.isArray(attention?.checklist)?attention.checklist:[];
    const generated=plan.tasks.map((task,index)=>({
      id:existing[index]?.id||previous[index]?.id||`task-${tracking.id}-${index+1}`,
      trackingId:tracking.id,
      applicationHandoffId:tracking.applicationHandoffId||attention?.applicationHandoffId||null,
      description:cleanTaskLabel(task),dueDate:task.dueDate,
      status:(existing[index]?.status==='completed'||previous[index]?.done)?'completed':'pending'
    }));
    state.trackingTasks=[...state.trackingTasks.filter(task=>task.trackingId!==tracking.id),...generated];
    return generated;
  }

  function patchAttention(state,product,attention,source,plan,anchorDate){
    if(!attention||!plan?.tasks?.length||plan.tasks.some(task=>!task.dueDate))return false;
    const tracking=ensureTracking(state,product,attention,source,anchorDate);
    const previous=Array.isArray(attention.checklist)?attention.checklist:[];
    const generated=syncTrackingTasks(state,tracking,attention,plan);
    attention.sourceOfferId=source?.offerId||attention.sourceOfferId||product.offerId||null;
    attention.offerVersionId=source?.offerVersionId||attention.offerVersionId||tracking.offerVersionId||null;
    attention.sourceOfferChoiceId=source?.sourceOfferChoiceId||attention.sourceOfferChoiceId||tracking.sourceOfferChoiceId||null;
    attention.requirement=source?.requirement||attention.requirement||tracking.requirement||'';
    attention.dueDate=plan.dueDate;
    attention.time=`截止 ${shortDate(plan.dueDate)}`;
    attention.checklist=plan.tasks.map((task,index)=>({id:generated[index].id,label:cleanTaskLabel(task),dueDate:task.dueDate,done:generated[index].status==='completed'||!!previous[index]?.done}));
    attention.keySub=plan.distinctDueDates>1?`最早 ${shortDate(plan.dueDate)} 截止；各项日期见任务`:`最晚 ${shortDate(plan.dueDate)} 完成`;
    if(source?.reward){attention.key=source.reward;attention.secondary=source.reward;}
    return true;
  }

  function patchApplicationProduct(snapshot){
    const state=readJson(APP_STATE_KEY,null);if(!state)return false;
    const attempt=snapshot.attempt;
    const product=(state.products||[]).find(item=>item.applicationHandoffId===attempt.id);
    const attention=(state.activeAttention||[]).find(item=>item.applicationHandoffId===attempt.id&&item.type==='bonus');
    if(!product||!attention)return false;
    const current=window.NextBonusOfferData?.[attempt.offerId]||{};
    const source={offerId:attempt.offerId,offerVersionId:attempt.offerVersionId||current.offerVersionId||currentOfferVersion(attempt.offerId),sourceOfferChoiceId:null,reward:attempt.reward||current.primaryValue||'',requirement:attempt.requirement||current.primaryRequirement||'',source:'application-handoff'};
    const plan=planFor(source,snapshot.anchorDate,product.type);
    if(!patchAttention(state,product,attention,source,plan,snapshot.anchorDate))return false;
    writeJson(APP_STATE_KEY,state);return true;
  }

  function addSnapshot(action){
    if(action?.dataset?.action!=='add-offer-next')return null;
    const modal=action.closest('.add-product-modal');if(!modal)return null;
    const offer=selectedAddOffer(modal);if(!offer||!offer.requirement)return null;
    const opened=anchorValue('add'),category=categoryFromModal(modal),plan=planFor(offer,opened,category);
    if(plan?.needsAnchorDate||(!opened&&plan?.hasRelativeDeadline)){
      ensureAnchorPrompt(modal,'add');return {blocked:true};
    }
    if(!plan?.tasks?.length||plan.tasks.some(task=>!task.dueDate))return null;
    const state=readJson(APP_STATE_KEY,{products:[]});
    return {blocked:false,existingProductIds:(state.products||[]).map(item=>item.id),opened,category,offer,plan};
  }

  function patchAddedProduct(snapshot){
    const state=readJson(APP_STATE_KEY,null);if(!state)return false;
    const oldIds=new Set(snapshot.existingProductIds||[]);
    const product=[...(state.products||[])].reverse().find(item=>!oldIds.has(item.id)&&item.offerId===snapshot.offer.offerId)||null;
    if(!product)return false;
    const attention=(state.activeAttention||[]).find(item=>item.productId===product.id&&item.type==='bonus');
    if(!attention)return false;
    product.offerVersionId=snapshot.offer.offerVersionId||product.offerVersionId||null;
    product.sourceOfferChoiceId=snapshot.offer.sourceOfferChoiceId||null;
    if(!patchAttention(state,product,attention,snapshot.offer,snapshot.plan,snapshot.opened))return false;
    state.savedOfferIds=(state.savedOfferIds||[]).filter(id=>id!==snapshot.offer.offerId);
    state.unavailableSavedIds=(state.unavailableSavedIds||[]).filter(id=>id!==snapshot.offer.offerId);
    writeJson(APP_STATE_KEY,state);
    window.NextBonusWatchlistState?.unfollow?.(snapshot.offer.offerId);
    window.location.reload();
    return true;
  }

  function checklistRequirement(attention){
    const labels=(Array.isArray(attention?.checklist)?attention.checklist:[]).map(item=>String(item?.label||'').trim()).filter(Boolean);
    if(labels.length!==1)return '';
    const label=labels[0];if(/截止|\bdue\b/i.test(label))return '';
    return rules.extractOffset(label)?label:'';
  }

  async function sourceForAttention(state,product,attention,preferred=null){
    if(preferred&&rewardKey(preferred.reward)===rewardKey(attention?.key||attention?.secondary||''))return preferred;
    const tracking=(state.offerTrackings||[]).find(item=>item.id===attention?.trackingId)||((attention?.applicationHandoffId&&(state.offerTrackings||[]).find(item=>item.applicationHandoffId===attention.applicationHandoffId))||null);
    if(tracking?.requirement)return {offerId:tracking.offerId||product.offerId||null,offerVersionId:tracking.offerVersionId||attention.offerVersionId||null,sourceOfferChoiceId:tracking.sourceOfferChoiceId||attention.sourceOfferChoiceId||null,reward:tracking.reward||attention.key||'',requirement:tracking.requirement,source:'tracking'};
    if(attention?.requirement)return {offerId:attention.sourceOfferId||product.offerId||null,offerVersionId:attention.offerVersionId||null,sourceOfferChoiceId:attention.sourceOfferChoiceId||null,reward:attention.key||attention.secondary||'',requirement:attention.requirement,source:'attention'};
    const fromChecklist=checklistRequirement(attention);
    if(fromChecklist)return {offerId:product.offerId||null,offerVersionId:attention.offerVersionId||null,sourceOfferChoiceId:null,reward:attention.key||attention.secondary||'',requirement:fromChecklist,source:'checklist'};
    const offerId=attention?.sourceOfferId||product?.offerId||'';
    const reward=attention?.key||attention?.secondary||'';
    if(!offerId||!reward)return null;
    const current=window.NextBonusOfferData?.[offerId]||null;
    if(current?.primaryRequirement&&rewardKey(current.primaryValue)===rewardKey(reward))return {offerId,offerVersionId:current.offerVersionId||currentOfferVersion(offerId),sourceOfferChoiceId:`current-${offerId}`,reward,requirement:current.primaryRequirement,source:'current-offer'};
    if(!history?.isSupported?.(offerId))return null;
    const result=history.cached?.(offerId)||await history.load(offerId);
    const matches=(result?.choices||[]).filter(choice=>rewardKey(choice.value)===rewardKey(reward));
    const unique=[...new Map(matches.map(choice=>[String(choice.requirement||'').trim(),choice])).entries()].filter(([requirement])=>requirement);
    if(unique.length!==1)return null;
    const choice=unique[0][1];
    return {offerId,offerVersionId:reviewedOfferVersion(choice),sourceOfferChoiceId:choice.id,reward,requirement:unique[0][0],source:'reviewed-offer-history'};
  }

  function migrateCardmemberRecords(productId,oldOpened,newOpened,state){
    if(!productId||!oldOpened||!newOpened||oldOpened===newOpened||!window.NextBonusBenefitCycle?.current)return false;
    const store=readJson(BENEFIT_CYCLE_KEY,null);if(!store?.records)return false;
    let changed=false;
    for(const [key,record] of Object.entries({...store.records})){
      const parts=key.split('|');
      if(parts.length<3||parts[0]!==productId||!String(parts[2]).includes('__')||record?.status!=='used'||!record?.usedAt)continue;
      const date=String(record.usedAt).slice(0,10);
      const period=window.NextBonusBenefitCycle.current('cardmember-year',date,newOpened);if(!period)continue;
      const nextKey=`${productId}|${parts[1]}|${period.id}`;
      if(nextKey===key)continue;
      const existing=store.records[nextKey];
      if(!existing||String(existing.usedAt||'')<String(record.usedAt||''))store.records[nextKey]=record;
      delete store.records[key];changed=true;
    }
    for(const attention of state.activeAttention||[]){
      if(attention.productId!==productId||attention.type!=='benefit'||attention.cycleType!=='cardmember-year')continue;
      const today=new Date().toISOString().slice(0,10),period=window.NextBonusBenefitCycle.current('cardmember-year',today,newOpened);if(!period)continue;
      const pad=value=>String(value).padStart(2,'0');
      const due=`${period.end.getFullYear()}-${pad(period.end.getMonth()+1)}-${pad(period.end.getDate())}`;
      attention.cycleId=period.id;attention.dueDate=due;attention.time=`本期截止 ${shortDate(due)}`;
    }
    if(changed)writeJson(BENEFIT_CYCLE_KEY,store);
    return changed;
  }

  function editSnapshot(action){
    if(action?.dataset?.action!=='save-edit-product')return null;
    const productId=action.dataset.id||'',opened=document.getElementById('edit-opened')?.value||'',status=document.getElementById('edit-status')?.value||'';
    if(!productId||!opened||status==='已关闭')return null;
    const state=readJson(APP_STATE_KEY,null),product=(state?.products||[]).find(item=>item.id===productId);
    if(!product||!['信用卡','银行和券商账户'].includes(product.type))return null;
    const bonuses=(state.activeAttention||[]).filter(item=>item.productId===productId&&item.type==='bonus');
    const preferred=memory.pendingEditOffer?.productId===productId?clone(memory.pendingEditOffer):null;
    if(opened===product.opened&&bonuses.every(item=>!!item.dueDate)&&!preferred)return null;
    return {productId,opened,oldOpened:product.opened||'',bonusIds:bonuses.map(item=>item.id),preferred};
  }

  async function patchEditedProduct(snapshot){
    const state=readJson(APP_STATE_KEY,null);if(!state)return false;
    const product=(state.products||[]).find(item=>item.id===snapshot.productId);
    if(!product||!['信用卡','银行和券商账户'].includes(product.type)||product.opened!==snapshot.opened)return false;
    migrateCardmemberRecords(product.id,snapshot.oldOpened,snapshot.opened,state);
    let changed=false;
    const bonuses=(state.activeAttention||[]).filter(item=>item.productId===product.id&&item.type==='bonus');
    for(const attention of bonuses){
      const source=await sourceForAttention(state,product,attention,snapshot.preferred);
      if(!source?.requirement)continue;
      const plan=planFor(source,snapshot.opened,product.type);
      if(!plan?.tasks?.length||plan.tasks.some(task=>!task.dueDate))continue;
      if(snapshot.preferred&&rewardKey(snapshot.preferred.reward)===rewardKey(attention.key||attention.secondary||'')){
        product.offerVersionId=snapshot.preferred.offerVersionId||product.offerVersionId||null;
        product.sourceOfferChoiceId=snapshot.preferred.sourceOfferChoiceId||product.sourceOfferChoiceId||null;
      }
      if(patchAttention(state,product,attention,source,plan,snapshot.opened))changed=true;
    }
    if(!changed&&snapshot.oldOpened===snapshot.opened)return false;
    writeJson(APP_STATE_KEY,state);
    if(snapshot.preferred?.offerId)window.NextBonusWatchlistState?.unfollow?.(snapshot.preferred.offerId);
    window.location.reload();return true;
  }

  function syncChecklistTaskState(state,attention){
    const tracking=(state.offerTrackings||[]).find(item=>item.id===attention?.trackingId);if(!tracking)return;
    const checklist=attention.checklist||[];
    for(const task of state.trackingTasks||[]){
      if(task.trackingId!==tracking.id)continue;
      const item=checklist.find(check=>check.id===task.id);if(item)task.status=item.done?'completed':'pending';
    }
  }

  function completeChecklistAttention(state,attention,triggerId){
    const index=(state.activeAttention||[]).findIndex(item=>item.id===attention.id);if(index<0)return false;
    attention.completionTriggerCheckId=triggerId;
    syncChecklistTaskState(state,attention);
    const tracking=(state.offerTrackings||[]).find(item=>item.id===attention.trackingId);if(tracking)tracking.status='completed';
    const historyItem={id:`h-${attention.id}-${Date.now()}`,productId:attention.productId,product:attention.product,productInstance:attention.productInstance||'',action:attention.action,time:attention.time,dueDate:attention.dueDate||null,result:'已完成',statusClass:'used',ended:historyDateLabel(),correction:'撤销完成',summary:attention.summary,key:attention.key,keySub:attention.keySub,instruction:attention.instruction,source:clone(attention)};
    state.activeAttention.splice(index,1);state.attentionHistory=[historyItem,...(state.attentionHistory||[])];
    writeJson(APP_STATE_KEY,state);window.location.reload();return true;
  }

  function restoreHistoryDirect(historyId){
    const state=readJson(APP_STATE_KEY,null);if(!state)return false;
    const index=(state.attentionHistory||[]).findIndex(item=>item.id===historyId);if(index<0)return false;
    const item=state.attentionHistory[index],source=clone(item.source||null);if(!source)return false;
    const triggerId=source.completionTriggerCheckId||null;
    const overdueRestorable=['bonus','annual','change'].includes(source.type);
    if(!triggerId&&!overdueRestorable)return false;
    if(!(state.products||[]).some(product=>product.id===source.productId))return false;
    if(triggerId&&Array.isArray(source.checklist)){
      const trigger=source.checklist.find(check=>check.id===triggerId);if(trigger)trigger.done=false;
      delete source.completionTriggerCheckId;
    }
    state.attentionHistory.splice(index,1);
    if(!(state.activeAttention||[]).some(active=>active.id===source.id))state.activeAttention.push(source);
    syncChecklistTaskState(state,source);
    const tracking=(state.offerTrackings||[]).find(track=>track.id===source.trackingId);if(tracking)tracking.status='in_progress';
    writeJson(APP_STATE_KEY,state);window.location.reload();return true;
  }

  function hideMultiTaskPrimaryActions(){
    document.querySelectorAll('.attention-expanded').forEach(expanded=>{
      const checks=expanded.querySelectorAll('[data-action="checklist"]');
      if(checks.length<=1)return;
      expanded.querySelector('[data-action="complete-attention"]')?.remove();
    });
  }

  document.addEventListener('input',event=>{
    if(event.target.id==='add-opened')memory.opened=event.target.value||'';
  },true);

  document.addEventListener('click',event=>{
    const handoff=event.target.closest?.('[data-handoff-action]');
    if(handoff){const snapshot=handoffSnapshot(handoff.dataset.handoffAction);if(snapshot)memory.pendingHandoff=snapshot;}

    const action=event.target.closest?.('[data-action]');if(!action)return;
    if(action.dataset.action==='open-add-product'||action.dataset.action==='add-another')reset();
    if(['add-close','add-discard'].includes(action.dataset.action)){reset();return;}

    if(action.dataset.action==='add-offer-next'){
      const snapshot=addSnapshot(action);
      if(snapshot?.blocked){event.preventDefault();event.stopImmediatePropagation();return;}
      if(snapshot)memory.pendingAdd=snapshot;
      return;
    }

    if(action.dataset.action==='edit-bonus-use'){
      const offer=selectedEditOffer(action);if(!offer)return;
      const opened=anchorValue('edit'),state=readJson(APP_STATE_KEY,null),product=(state?.products||[]).find(item=>item.id===offer.productId);
      const plan=planFor(offer,opened,product?.type||'信用卡');
      if(plan?.needsAnchorDate||(!opened&&plan?.hasRelativeDeadline)){
        ensureAnchorPrompt(action.closest('.edit-product-page'),'edit');event.preventDefault();event.stopImmediatePropagation();return;
      }
      if(plan?.tasks?.length&&!plan.tasks.some(task=>!task.dueDate))memory.pendingEditOffer={...offer,opened};
      return;
    }

    if(action.dataset.action==='save-edit-product'){
      const snapshot=editSnapshot(action);if(snapshot)memory.pendingEdit=snapshot;
      return;
    }

    if(action.dataset.action==='history-correction'){
      const state=readJson(APP_STATE_KEY,null),item=(state?.attentionHistory||[]).find(historyItem=>historyItem.id===action.dataset.id);
      if(item?.source&&(item.source.completionTriggerCheckId||['bonus','annual','change'].includes(item.source.type))){
        event.preventDefault();event.stopImmediatePropagation();restoreHistoryDirect(action.dataset.id);return;
      }
    }
  },true);

  document.addEventListener('change',event=>{
    const checkbox=event.target.closest?.('[data-action="checklist"]');if(!checkbox)return;
    const state=readJson(APP_STATE_KEY,null),attention=(state?.activeAttention||[]).find(item=>item.id===checkbox.dataset.attention);
    const check=attention?.checklist?.find(item=>item.id===checkbox.dataset.check);if(!attention||!check)return;
    if(checkbox.checked&&attention.type==='bonus'&&attention.checklist.length>1){
      check.done=true;
      if(attention.checklist.every(item=>item.done)){
        event.preventDefault();event.stopImmediatePropagation();completeChecklistAttention(state,attention,check.id);return;
      }
    }
    memory.pendingChecklist={attentionId:attention.id,checkId:check.id,checked:checkbox.checked};
  },true);

  document.addEventListener('click',event=>{
    const handoff=event.target.closest?.('[data-handoff-action]');
    if(handoff&&memory.pendingHandoff&&handoff.dataset.handoffAction===memory.pendingHandoff.action){
      const snapshot=memory.pendingHandoff;memory.pendingHandoff=null;patchApplicationProduct(snapshot);
    }
    const action=event.target.closest?.('[data-action]');if(!action)return;
    if(action.dataset.action==='add-offer-next'&&memory.pendingAdd){
      const snapshot=memory.pendingAdd;memory.pendingAdd=null;window.setTimeout(()=>patchAddedProduct(snapshot),0);
    }
    if(action.dataset.action==='save-edit-product'&&memory.pendingEdit){
      const snapshot=memory.pendingEdit;memory.pendingEdit=null;memory.pendingEditOffer=null;window.setTimeout(()=>{patchEditedProduct(snapshot).catch(()=>{});},0);
    }
  });

  document.addEventListener('change',()=>{
    if(!memory.pendingChecklist)return;
    const pending=memory.pendingChecklist;memory.pendingChecklist=null;
    window.setTimeout(()=>{
      const state=readJson(APP_STATE_KEY,null),attention=(state?.activeAttention||[]).find(item=>item.id===pending.attentionId);if(!attention)return;
      syncChecklistTaskState(state,attention);writeJson(APP_STATE_KEY,state);
    },0);
  });

  const observer=new MutationObserver(()=>hideMultiTaskPrimaryActions());
  const root=document.getElementById('app');if(root)observer.observe(root,{childList:true,subtree:true});
  hideMultiTaskPrimaryActions();
})();
