(() => {
  'use strict';

  const events=window.NextBonusEvents;
  const offerChoice=window.NextBonusBonusOfferChoice;
  if(!events) throw new Error('Page event registry unavailable');
  if(!offerChoice) throw new Error('Bonus offer choice feature unavailable');

  function renderApp(ctx){
    if(typeof ctx.renderApp==='function') ctx.renderApp();
  }

  function editFlowDirty(ctx,flow){
    if(!flow) return false;
    const product=ctx.state.products.find(item=>item.id===flow.productId);
    if(!product) return false;
    const originalInstance=(product.instance||'').replace('•••• ','');
    return flow.instance!==originalInstance ||
      flow.status!==(product.status||'不确定') ||
      flow.opened!==(product.opened||'') ||
      !!flow.pendingBonus;
  }

  function updateManualSubmit(state){
    if(!state.editFlow) return;
    const flow=state.editFlow;
    const valid=flow.bonusReward.trim() &&
      flow.bonusTasks.length &&
      flow.bonusTasks.every(task=>task.desc.trim()&&task.due);
    const button=document.querySelector('[data-action="edit-bonus-manual-use"]');
    if(button) button.disabled=!valid;
  }

  async function enterBonusSelect(ctx){
    const flow=ctx.state.editFlow;
    const product=flow&&ctx.state.products.find(item=>item.id===flow.productId);
    if(!flow||!product||flow.offerLoading) return;
    flow.offerLoading=true;
    renderApp(ctx);
    const catalogProduct=(ctx.catalog['信用卡']||[]).find(item=>item.offerId===product.offerId)||
      {name:product.name,offerId:product.offerId};
    try{
      await offerChoice.ensureReviewedOfferHistory(catalogProduct);
    }finally{
      if(ctx.state.editFlow!==flow) return;
      flow.offerLoading=false;
      flow.step='bonus-select';
      renderApp(ctx);
    }
  }

  function closeProduct(ctx,product,status){
    if(status!=='已关闭') return;
    const state=ctx.state;
    state.products=state.products.filter(item=>item.id!==product.id);
    product.statusText=`已于 ${ctx.formatLongDate(ctx.localDateISO())}关闭`;
    state.pastProducts.unshift(product);
    const stopped=state.activeAttention.filter(item=>item.productId===product.id);
    state.activeAttention=state.activeAttention.filter(item=>item.productId!==product.id);
    stopped.forEach(item=>{
      const identity=ctx.attentionIdentity(item);
      state.attentionHistory.unshift(window.NextBonusAttentionHistory.stamp({
        id:`h-stop-${item.id}-${Date.now()}`,
        productId:product.id,
        product:identity.name,
        productInstance:identity.instance,
        action:item.action,
        time:item.time,
        dueDate:item.dueDate,
        result:'已结束',
        resultReason:'产品已关闭',
        statusClass:'stopped',
        ended:ctx.historyDateLabel(),
        correction:null,
        summary:item.summary,
        key:item.key,
        keySub:item.keySub,
        instruction:item.instruction,
        source:item
      },'system'));
    });
    state.currentProductId=product.id;
  }

  function creditCardBenefit(ctx,benefitId){
    const product=ctx.currentProduct();
    const card=window.NextBonusCreditCardProductDetailModel?.build?.(ctx,product);
    return card?.benefits?.find(item=>item.id===benefitId)||null;
  }

  function toggleBenefitCycle(ctx,benefitId){
    const benefit=creditCardBenefit(ctx,benefitId);
    const info=benefit?.cycleInfo;
    const store=window.NextBonusBenefitCycleState;
    if(!benefit||!info||info.mode!=='cycle'||!store) return {handled:true};

    const wasUsed=!!info.used;
    const attentionId=benefit.attention?.id||info.record?.attentionId||null;
    const previousAttentionId=info.record?.attentionId||null;
    store.setUsed(info,!wasUsed,{attentionId});

    if(!wasUsed&&benefit.attention?.id&&typeof ctx.completeAttention==='function'){
      ctx.completeAttention(benefit.attention.id);
      return {handled:true};
    }

    if(wasUsed&&previousAttentionId&&typeof ctx.historyCorrection==='function'){
      const history=store.matchingHistory(ctx.state,info,previousAttentionId);
      if(history?.id){
        ctx.historyCorrection(history.id);
        return {handled:true};
      }
    }

    return {render:true};
  }

  function toggleBenefitManual(ctx,benefitId){
    const benefit=creditCardBenefit(ctx,benefitId);
    const info=benefit?.cycleInfo;
    const store=window.NextBonusBenefitCycleState;
    if(!benefit||!info||info.mode!=='manual'||!store) return {handled:true};
    store.setUsed(info,!info.used);
    return {render:true};
  }

  events.register('product-detail',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;
      const state=ctx.state;

      if(action==='toggle-benefit'||action==='toggle-card-benefit'){
        state.expandedBenefitId=state.expandedBenefitId===el.dataset.id?null:el.dataset.id;
        return {render:true};
      }
      if(action==='benefit-cycle-toggle') return toggleBenefitCycle(ctx,el.dataset.id);
      if(action==='benefit-manual-toggle') return toggleBenefitManual(ctx,el.dataset.id);
      if(action==='toggle-product-history'){
        state.productHistoryOpen=!state.productHistoryOpen;
        return {render:true};
      }
      if(action==='edit-product'){
        const product=ctx.currentProduct();
        state.editFlow={
          productId:product.id,
          step:'main',
          instance:(product.instance||'').replace('•••• ',''),
          status:product.status||'不确定',
          opened:product.opened||'',
          pendingBonus:null,
          bonusChoice:null,
          bonusReward:'',
          bonusTasks:[{id:'e1',desc:'',due:''}],
          changeTargetId:null,
          changeDate:''
        };
        return {render:true};
      }
      if(action==='edit-exit'){
        if(editFlowDirty(ctx,state.editFlow)){
          state.modal={type:'discard-edit'};
          renderApp(ctx);
          return {handled:true};
        }
        state.editFlow=null;
        return {render:true};
      }
      if(action==='edit-discard-confirm'){
        state.modal=null;
        state.editFlow=null;
        renderApp(ctx);
        return {handled:true};
      }
      if(action==='edit-back'){
        const flow=state.editFlow;
        if(!flow) return {handled:true};
        flow.step=flow.step==='bonus-manual'
          ? 'bonus-select'
          : flow.step==='change-confirm'
            ? 'change-select'
            : 'main';
        return {render:true};
      }
      if(action==='edit-bonus-open'){
        void enterBonusSelect(ctx);
        return {handled:true};
      }
      if(action==='edit-bonus-choice'){
        state.editFlow.bonusChoice=el.dataset.id;
        return {render:true};
      }
      if(action==='edit-bonus-use'){
        const flow=state.editFlow;
        if(flow.bonusChoice==='manual'){
          flow.step='bonus-manual';
          return {render:true};
        }
        const product=state.products.find(item=>item.id===flow.productId);
        const catalogProduct=(ctx.catalog['信用卡']||[]).find(item=>item.offerId===product?.offerId)||
          {name:product?.name,offerId:product?.offerId};
        const choice=offerChoice.resolveOfferChoice(catalogProduct,flow.bonusChoice);
        if(choice){
          flow.pendingBonus={
            kind:'public',
            reward:choice.value,
            req:choice.req,
            sourceOfferId:choice.sourceOfferId||null
          };
          flow.step='main';
        }
        return {render:true};
      }
      if(action==='edit-add-task'){
        state.editFlow.bonusTasks.push({id:`e${Date.now()}`,desc:'',due:''});
        return {render:true};
      }
      if(action==='edit-delete-task'){
        state.editFlow.bonusTasks=state.editFlow.bonusTasks.filter(task=>task.id!==el.dataset.id);
        return {render:true};
      }
      if(action==='edit-clear-task-due'){
        const task=state.editFlow?.bonusTasks.find(item=>item.id===el.dataset.id);
        if(task) task.due='';
        return {render:true};
      }
      if(action==='edit-bonus-manual-use'){
        const flow=state.editFlow;
        if(flow.bonusReward.trim()&&flow.bonusTasks.length&&flow.bonusTasks.every(task=>task.desc.trim()&&task.due)){
          flow.pendingBonus={
            kind:'manual',
            reward:flow.bonusReward,
            tasks:structuredClone(flow.bonusTasks),
            sourceOfferId:null
          };
          flow.step='main';
          return {render:true};
        }
        return {handled:true};
      }
      if(action==='edit-change-open'){
        state.editFlow.step='change-select';
        return {render:true};
      }
      if(action==='edit-change-target'){
        state.editFlow.changeTargetId=el.dataset.id;
        state.editFlow.step='change-confirm';
        return {render:true};
      }
      if(action==='edit-change-confirm'){
        const flow=state.editFlow;
        const product=state.products.find(item=>item.id===flow.productId);
        const target=(ctx.catalog['信用卡']||[]).find(item=>item.id===flow.changeTargetId);
        if(!product||!target||!flow.changeDate) return {handled:true};
        const lifecycle=window.NextBonusProductLifecycleCore;
        if(!lifecycle) throw new Error('Product Lifecycle Core unavailable');
        const result=lifecycle.convertProduct(state,{
          sourceProductId:product.id,
          target,
          effectiveDate:flow.changeDate,
          endedLabel:ctx.formatLongDate(flow.changeDate),
          statusText:`已于 ${ctx.formatLongDate(flow.changeDate)} 更换产品`
        });
        state.currentProductId=result.product.id;
        state.productSearch='';
        state.editFlow=null;
        renderApp(ctx);
        ctx.toast?.('产品已更换');
        return {handled:true};
      }
      if(action==='save-edit-product'){
        const flow=state.editFlow;
        const product=state.products.find(item=>item.id===el.dataset.id);
        if(!flow||!product) return {handled:true};

        const instance=document.getElementById('edit-instance')?.value??flow.instance;
        const status=document.getElementById('edit-status')?.value??flow.status;
        const opened=document.getElementById('edit-opened')?.value??flow.opened;
        product.instance=product.type==='信用卡'
          ? (instance?`•••• ${instance}`:product.instance)
          : (instance||product.instance);
        product.status=status;
        product.opened=opened;
        product.anniversary=opened?ctx.formatAnniversary(opened):'—';

        if(flow.pendingBonus&&!state.activeAttention.some(item=>item.productId===product.id&&item.type==='bonus')){
          const now=Date.now();
          const due=flow.pendingBonus.kind==='manual'?flow.pendingBonus.tasks[0]?.due:null;
          state.activeAttention.push({
            id:`a-edit-${now}`,
            productId:product.id,
            product:product.name,
            action:'完成开卡奖励',
            secondary:flow.pendingBonus.reward,
            time:due?`截止 ${ctx.shortDate(due)}`:'截止日期以所选奖励规则为准',
            dueDate:due,
            type:'bonus',
            summary:'这是你在编辑产品时补充建立的开卡奖励追踪。',
            key:flow.pendingBonus.reward,
            keySub:due?`最晚 ${ctx.shortDate(due)} 完成`:'按所选奖励规则',
            instruction:'完成以下条件',
            checklist:flow.pendingBonus.kind==='manual'
              ? flow.pendingBonus.tasks.map(task=>({id:task.id,label:task.desc,done:false,dueDate:task.due}))
              : [{id:'req1',label:flow.pendingBonus.req||'完成对应奖励条件',done:false}],
            primary:'我已完成',
            secondaryAction:null,
            completionKind:'completed'
          });
          if(flow.pendingBonus.sourceOfferId&&ctx.isSaved(flow.pendingBonus.sourceOfferId)){
            ctx.removeSaved(flow.pendingBonus.sourceOfferId);
          }
        }

        closeProduct(ctx,product,status);
        state.editFlow=null;
        renderApp(ctx);
        ctx.toast?.('已保存');
        return {handled:true};
      }
      if(action==='remove-product-request'){
        state.modal={type:'remove-product-confirm',productId:el.dataset.id};
        renderApp(ctx);
        return {handled:true};
      }
      if(action==='remove-product-confirm'){
        const id=el.dataset.id;
        state.products=state.products.filter(product=>product.id!==id);
        state.activeAttention=state.activeAttention.filter(item=>item.productId!==id);
        state.modal=null;
        state.editFlow=null;
        state.route='products';
        renderApp(ctx);
        ctx.toast?.('已从 NextBonus 中移除');
        return {handled:true};
      }
      if(action==='product-call'){
        const phone=el.dataset.phone;
        if(phone) navigator.clipboard?.writeText(phone);
        ctx.toast?.(phone?`客服电话 ${phone} 已复制`:'');
        return {handled:true};
      }
      if(action==='product-login-external'){
        if(el.dataset.url) window.open(el.dataset.url,'_blank','noopener,noreferrer');
        return {handled:true};
      }
      if(action==='official-rules'){
        event.stopPropagation?.();
        if(el.dataset.url) window.open(el.dataset.url,'_blank','noopener,noreferrer');
        return {handled:true};
      }
      return false;
    },

    input({event,ctx}){
      const target=event.target;
      const flow=ctx.state.editFlow;
      if(!flow) return false;
      if(target.id==='edit-instance'){
        flow.instance=target.value;
        return {handled:true};
      }
      if(target.id==='edit-opened'){
        flow.opened=target.value;
        return {handled:true};
      }
      if(target.id==='edit-bonus-reward'){
        flow.bonusReward=target.value;
        updateManualSubmit(ctx.state);
        return {handled:true};
      }
      if(target.classList?.contains('edit-task-desc')){
        const task=flow.bonusTasks.find(item=>item.id===target.dataset.id);
        if(task) task.desc=target.value;
        updateManualSubmit(ctx.state);
        return {handled:true};
      }
      if(target.classList?.contains('edit-task-due')){
        const task=flow.bonusTasks.find(item=>item.id===target.dataset.id);
        if(task) task.due=target.value;
        updateManualSubmit(ctx.state);
        return {handled:true};
      }
      if(target.id==='edit-change-date'){
        flow.changeDate=target.value;
        return {render:true};
      }
      return false;
    },

    change({event,ctx}){
      if(event.target?.id==='edit-status'&&ctx.state.editFlow){
        ctx.state.editFlow.status=event.target.value;
        return {handled:true};
      }
      return false;
    }
  });
})();
