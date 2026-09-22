(() => {
  'use strict';

  const events=window.NextBonusEvents;
  const offerChoice=window.NextBonusBonusOfferChoice;
  const model=window.NextBonusPageModels?.addProduct;
  if(!events) throw new Error('Page event registry unavailable');
  if(!offerChoice) throw new Error('Bonus offer choice feature unavailable');
  if(!model) throw new Error('Add Product page model unavailable');

  function rerender(ctx,focusId=null){
    ctx.renderApp?.();
    if(focusId){
      requestAnimationFrame(()=>{
        const input=document.getElementById(focusId);
        if(!input) return;
        input.focus?.();
        const end=String(input.value||'').length;
        try{input.setSelectionRange?.(end,end);}catch(_){}
      });
    }
  }

  async function enterOfferStep(ctx,flow){
    if(!flow||flow.offerLoading) return;
    flow.step='offer';
    flow.offerLoading=true;
    rerender(ctx);
    try{
      await offerChoice.ensureReviewedOfferHistory(flow.product);
    }finally{
      if(ctx.state.addFlow!==flow) return;
      flow.offerLoading=false;
      rerender(ctx);
    }
  }

  function submit(ctx){
    const state=ctx.state;
    const flow=state.addFlow;
    if(!flow||flow.submitting||flow.committed) return null;
    const lifecycle=window.NextBonusProductLifecycleCore;
    if(!lifecycle) throw new Error('Product Lifecycle Core unavailable');

    flow.submitting=true;
    const type=flow.category==='信用卡'
      ? '信用卡'
      : flow.category==='会籍'
        ? '会籍'
        : '银行和券商账户';

    const product=lifecycle.createUserProduct(state,{
      idPrefix:'p-local',
      offerId:flow.product.offerId||null,
      type,
      name:flow.product.name,
      institution:flow.product.institution,
      instance:flow.category==='信用卡'
        ? (flow.last4?`•••• ${flow.last4}`:'账户 1')
        : (flow.nickname||flow.product.subtype||'主账户'),
      art:flow.product.art||'bank',
      cardImageLocal:flow.product.cardImageLocal||null,
      opened:flow.opened||'',
      annualFee:flow.category==='信用卡'?(flow.product.annualFee||'以产品规则为准'):'—',
      earning:flow.product.earning||'—'
    });

    flow.savedProductId=product.id;
    state.productSearch='';
    state.productSectionExpanded=state.productSectionExpanded||{};
    if(state.products.filter(item=>item.type===type).length>=8){
      state.productSectionExpanded[type]=true;
    }

    if(flow.track){
      const chosen=flow.offer==='manual'?null:offerChoice.resolveOfferChoice(flow.product,flow.offer);
      const manualEntries=flow.offer==='manual'
        ? (flow.tasks||[]).filter(task=>String(task.desc||'').trim()||task.due)
        : [];
      const reward=flow.offer==='manual'
        ? String(flow.reward||'').trim()
        : (chosen?.value||'开户 / 开卡奖励');
      const tasks=flow.offer==='manual'
        ? manualEntries
            .filter(task=>String(task.desc||'').trim())
            .map(task=>({id:task.id,label:String(task.desc||'').trim(),dueDate:task.due||null}))
        : null;
      const manualDue=flow.offer==='manual'
        ? (manualEntries.find(task=>task.due)?.due||null)
        : null;

      if(chosen){
        product.offerVersionId=chosen.offerVersionId||product.offerVersionId||null;
        product.sourceOfferChoiceId=chosen.sourceOfferChoiceId||chosen.id||null;
      }
      lifecycle.createBonusTracking(state,{
        identity:product.id,
        productId:product.id,
        productName:product.name,
        productLabel:product.name,
        offerId:chosen?.sourceOfferId||flow.product.offerId||null,
        offerVersionId:chosen?.offerVersionId||null,
        sourceOfferChoiceId:chosen?.sourceOfferChoiceId||chosen?.id||null,
        reward,
        requirement:chosen?.req||'完成对应奖励条件',
        tasks,
        anchorDate:flow.opened||null,
        anchorKind:'user_product_opened_date',
        category:flow.category,
        dueDate:flow.offer==='manual'?manualDue:null,
        preserveEmptyReward:flow.offer==='manual',
        action:flow.category==='信用卡'?'完成开卡奖励':'完成开户奖励条件',
        summary:'这是你在添加产品时建立的奖励追踪。逐项完成条件即可。'
      });
      lifecycle.removeSavedOffer(state,chosen?.sourceOfferId||null);
    }

    flow.committed=true;
    flow.submitting=false;
    flow.step='success';
    return product;
  }

  function updateRewardSubmit(state){
    const flow=state.addFlow;
    if(!flow) return;
    const button=document.querySelector('[data-action="add-offer-next"]');
    if(button) button.disabled=!model.rewardChoiceReady(flow);
  }

  events.register('add-product',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;
      const state=ctx.state;
      const flow=state.addFlow;
      if(!flow) return false;

      if(action==='add-close'){
        if(model.progressed(flow)) flow._confirmClose=true;
        else{
          state.addFlow=null;
          state.modal=null;
        }
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-continue-editing'){
        flow._confirmClose=false;
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-discard'){
        state.addFlow=null;
        state.modal=null;
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-back'){
        if(!model.back(flow)) state.addFlow=null;
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-filter'){
        flow.filter=el.dataset.value;
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-clear-search'){
        flow.search='';
        flow.reportStatus=null;
        rerender(ctx,'nb-add-search');
        return {handled:true};
      }
      if(action==='add-product-select'){
        const category=el.dataset.category||flow.category;
        const next=(ctx.catalog[category]||[]).find(item=>item.id===el.dataset.id);
        if(!next) return {handled:true};
        if(flow.product?.id!==next.id) model.resetAfterProduct(flow);
        flow.category=category;
        flow.product=next;
        void offerChoice.ensureReviewedOfferHistory(next);
        flow.step=category==='会籍'?'membership-confirm':'info';
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-clear-opened'){
        flow.opened='';
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-to-track'){
        void enterOfferStep(ctx,flow);
        return {handled:true};
      }
      if(action==='add-offer-choice'){
        const nextOffer=el.dataset.id;
        flow.offer=flow.offer===nextOffer?null:nextOffer;
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-offer-next'){
        if(!model.rewardChoiceReady(flow)) return {handled:true};
        flow.track=!!flow.offer;
        submit(ctx);
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-task'){
        flow.tasks.push({id:`t${Date.now()}`,desc:'',due:''});
        rerender(ctx);
        return {handled:true};
      }
      if(action==='clear-task-due'){
        const task=flow.tasks.find(item=>item.id===el.dataset.id);
        if(task) task.due='';
        rerender(ctx);
        return {handled:true};
      }
      if(action==='delete-task'){
        flow.tasks=flow.tasks.filter(task=>task.id!==el.dataset.id);
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-membership-submit'){
        submit(ctx);
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-view-product'){
        state.currentProductId=flow.savedProductId;
        state.addFlow=null;
        state.route='product-detail';
        rerender(ctx);
        return {handled:true};
      }
      if(action==='add-another'){
        state.addFlow=model.createFlow();
        rerender(ctx);
        return {handled:true};
      }
      return false;
    },

    input({event,ctx}){
      const target=event.target;
      const flow=ctx.state.addFlow;
      if(!flow) return false;
      if(target.id==='nb-add-search'){
        flow.search=target.value;
        rerender(ctx,'nb-add-search');
        return {handled:true};
      }
      if(target.id==='add-last4'){
        flow.last4=target.value.replace(/\D/g,'').slice(0,4);
        return {handled:true};
      }
      if(target.id==='add-nickname'){
        flow.nickname=target.value;
        return {handled:true};
      }
      if(target.id==='add-opened'){
        flow.opened=target.value;
        const clear=target.closest('.date-field-row')?.querySelector('[data-action="add-clear-opened"]');
        if(clear) clear.hidden=!target.value;
        return {handled:true};
      }
      if(target.id==='add-reward'){
        flow.reward=target.value;
        updateRewardSubmit(ctx.state);
        return {handled:true};
      }
      if(target.classList?.contains('task-desc')){
        const task=flow.tasks.find(item=>item.id===target.dataset.id);
        if(task) task.desc=target.value;
        updateRewardSubmit(ctx.state);
        return {handled:true};
      }
      if(target.classList?.contains('task-due')){
        const task=flow.tasks.find(item=>item.id===target.dataset.id);
        if(task) task.due=target.value;
        updateRewardSubmit(ctx.state);
        return {handled:true};
      }
      return false;
    }
  });

  window.NextBonusAddProductActions=Object.freeze({submit});
})();