(() => {
  'use strict';

  const rules=window.NextBonusBonusTaskRules;
  const history=window.NextBonusReviewedOfferHistory;
  if(!rules)return;

  function clone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
  function nowIso(){return new Date().toISOString();}

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

  function planFor(offer,opened,category){
    if(!offer?.requirement)return null;
    return rules.buildPlan(offer.requirement,opened,{category});
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


  function checklistRequirement(attention){
    const labels=(Array.isArray(attention?.checklist)?attention.checklist:[]).map(item=>String(item?.label||'').trim()).filter(Boolean);
    if(labels.length!==1)return '';
    const label=labels[0];if(/截止|\bdue\b/i.test(label))return '';
    return rules.extractOffset(label)?label:'';
  }

  function sourceForAttention(state,product,attention,preferred=null){
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
    const result=history.cached?.(offerId)||null;
    const matches=(result?.choices||[]).filter(choice=>rewardKey(choice.value)===rewardKey(reward));
    const unique=[...new Map(matches.map(choice=>[String(choice.requirement||'').trim(),choice])).entries()].filter(([requirement])=>requirement);
    if(unique.length!==1)return null;
    const choice=unique[0][1];
    return {offerId,offerVersionId:reviewedOfferVersion(choice),sourceOfferChoiceId:choice.id,reward,requirement:unique[0][0],source:'reviewed-offer-history'};
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
    const historyItem=window.NextBonusAttentionHistory.stamp({id:`h-${attention.id}-${Date.now()}`,productId:attention.productId,product:attention.product,productInstance:attention.productInstance||'',action:attention.action,time:attention.time,dueDate:attention.dueDate||null,result:'已完成',statusClass:'used',ended:historyDateLabel(),correction:'撤销完成',summary:attention.summary,key:attention.key,keySub:attention.keySub,instruction:attention.instruction,source:clone(attention)},'user');
    state.activeAttention.splice(index,1);state.attentionHistory=[historyItem,...(state.attentionHistory||[])];
    return true;
  }

  function restoreHistoryDirect(state,historyId){
    if(!state)return false;
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
    window.NextBonusAttentionHistory.addReopenEvent(state,item);
    syncChecklistTaskState(state,source);
    const tracking=(state.offerTrackings||[]).find(track=>track.id===source.trackingId);if(tracking)tracking.status='in_progress';
    return true;
  }

  function setChecklistItem(state,attentionId,checkId,checked){
    const attention=(state?.activeAttention||[]).find(item=>item.id===attentionId);
    const check=attention?.checklist?.find(item=>item.id===checkId);
    if(!attention||!check)return {handled:false,completed:false};
    check.done=!!checked;
    syncChecklistTaskState(state,attention);
    if(checked&&attention.type==='bonus'&&attention.checklist.length>1&&attention.checklist.every(item=>item.done)){
      return {handled:true,completed:completeChecklistAttention(state,attention,check.id)};
    }
    return {handled:true,completed:false};
  }

  function reanchorProduct(state,product,oldOpened,newOpened,preferred=null){
    if(!state||!product||!newOpened||oldOpened===newOpened||!['信用卡','银行和券商账户'].includes(product.type))return false;
    let changed=false;
    const bonuses=(state.activeAttention||[]).filter(item=>item.productId===product.id&&item.type==='bonus');
    for(const attention of bonuses){
      const source=sourceForAttention(state,product,attention,preferred);
      if(!source?.requirement)continue;
      const plan=planFor(source,newOpened,product.type);
      if(!plan?.tasks?.length||plan.tasks.some(task=>!task.dueDate))continue;
      if(preferred&&rewardKey(preferred.reward)===rewardKey(attention.key||attention.secondary||'')){
        product.offerVersionId=preferred.offerVersionId||product.offerVersionId||null;
        product.sourceOfferChoiceId=preferred.sourceOfferChoiceId||product.sourceOfferChoiceId||null;
      }
      if(patchAttention(state,product,attention,source,plan,newOpened))changed=true;
    }
    return changed;
  }

  window.NextBonusBonusTrackingRuntime=Object.freeze({
    rewardKey,
    planFor,
    patchAttention,
    sourceForAttention,
    reanchorProduct,
    syncChecklistTaskState,
    setChecklistItem,
    restoreHistoryDirect
  });

})();
