(function(root){
  'use strict';
  const app=document.getElementById('app'),history=root.NextBonusReviewedOfferHistory;if(!app||!history)return;
  const APP_STATE_KEY='nextbonus-local-v8-state';
  const supported=Object.keys(history.productMap||{});
  const canonical=new Map(supported.map(id=>[id,root.NextBonusOfferData?.[id]?{...root.NextBonusOfferData[id]}:null]));
  const normalize=value=>String(value||'').toLowerCase().replace(/\s+/g,' ').trim();
  function readState(){try{return JSON.parse(localStorage.getItem(APP_STATE_KEY)||'{}');}catch(_){return {};}}
  function trigger(action,dataset={}){const button=document.createElement('button');button.type='button';button.hidden=true;button.dataset.action=action;Object.entries(dataset).forEach(([key,value])=>button.dataset[key]=String(value));app.appendChild(button);button.click();button.remove();}
  function isAddOfferStage(container){return !!container?.querySelector('[data-action="add-offer-choice"]')&&!container.querySelector('#add-reward');}
  function isEditOfferStage(container){return !!container?.querySelector('[data-action="edit-bonus-choice"]');}
  function offerIdFromAdd(modal){const current=modal?.querySelector('[data-action="add-offer-choice"][data-id^="current-"]');return current?.dataset.id?.slice('current-'.length)||modal?.dataset.nbReviewedOfferId||null;}
  function offerIdFromEdit(page){const state=readState(),product=(state.products||[]).find(item=>item.id===state.currentProductId);return product?.offerId||page?.dataset.nbReviewedOfferId||null;}
  function actionFor(context){return context==='edit'?'edit-bonus-choice':'add-offer-choice';}
  function isDuplicateCurrent(choice,offerId){const fact=canonical.get(offerId);return !!fact&&normalize(choice.value)===normalize(fact.primaryValue)&&normalize(choice.requirement)===normalize(fact.primaryRequirement);}
  function currentAndManual(container,context,offerId){const action=actionFor(context);return {current:container.querySelector(`[data-action="${action}"][data-id="current-${CSS.escape(offerId)}"]`),manual:container.querySelector(`[data-action="${action}"][data-id="manual"]`)};}
  function setText(node,text){if(node&&node.textContent!==text)node.textContent=text;}
  function decorateBaseChoices(container,context,offerId){
    const nodes=currentAndManual(container,context,offerId);if(!nodes.current||!nodes.manual)return null;
    nodes.current.dataset.nbCurrentOffer=offerId;nodes.current.dataset.nbReviewedContext=context;
    const currentSub=nodes.current.querySelector('.option-sub');if(currentSub&&!currentSub.textContent.trim().startsWith('当前公开'))setText(currentSub,`当前公开 · ${canonical.get(offerId)?.primaryRequirement||currentSub.textContent.trim()}`);
    nodes.current.querySelector('.option-tag')?.remove();
    nodes.manual.dataset.nbReviewedManual='';nodes.manual.dataset.nbReviewedContext=context;
    setText(nodes.manual.querySelector('.option-title'),'都不是，手动填写');
    setText(nodes.manual.querySelector('.option-sub'),'按你实际申请或开户时看到的奖励填写。');
    container.dataset.nbReviewedOfferId=offerId;return nodes;
  }
  function removeInjected(list){list.querySelectorAll('[data-nb-reviewed-offer],[data-nb-reviewed-message]').forEach(node=>node.remove());}
  function messageNode(text,kind){const node=document.createElement('div');node.className='muted';node.dataset.nbReviewedMessage=kind;node.style.margin='0 0 12px';node.textContent=text;return node;}
  function reviewedNode(choice,context,offerId,selected){
    const node=document.createElement('button');node.className=`option-row ${selected?'selected':''}`.trim();node.type='button';node.dataset.action=actionFor(context);node.dataset.id=`current-${offerId}`;node.dataset.nbReviewedOffer=choice.id;node.dataset.nbReviewedSource=offerId;node.dataset.nbReviewedContext=context;
    const dot=document.createElement('span');dot.className='radio-dot';const main=document.createElement('span');main.className='option-main';const title=document.createElement('span');title.className='option-title';title.textContent=choice.value;const sub=document.createElement('span');sub.className='option-sub';sub.textContent=`${choice.dateLabel} · ${choice.requirement}`;main.append(title,sub);node.append(dot,main);return node;
  }
  function renderLoading(container,context,offerId){
    const list=container.querySelector('.option-list'),nodes=decorateBaseChoices(container,context,offerId);if(!list||!nodes)return;
    if(list.dataset.nbReviewedState===`loading:${offerId}`)return;
    removeInjected(list);nodes.manual.before(messageNode('正在加载已审核历史奖励…','loading'));list.dataset.nbReviewedState=`loading:${offerId}`;
  }
  function renderChoices(container,context,offerId,result){
    const list=container.querySelector('.option-list'),nodes=decorateBaseChoices(container,context,offerId);if(!list||!nodes)return;
    const active=history.current(offerId),key=`ready:${context}:${offerId}:${result.status}:${result.snapshot||''}:${active?.id||''}`;
    if(list.dataset.nbReviewedState===key)return;
    removeInjected(list);
    if(active){nodes.current.classList.remove('selected');nodes.manual.classList.remove('selected');}
    if(result.status==='ready'&&result.choices.length){result.choices.filter(choice=>!isDuplicateCurrent(choice,offerId)).forEach(choice=>nodes.manual.before(reviewedNode(choice,context,offerId,active?.id===choice.id)));}
    else if(result.status==='error')nodes.manual.before(messageNode('历史奖励暂时无法加载；当前公开奖励仍可选择，也可以按实际奖励手动填写。','error'));
    else if(result.status==='ready')nodes.manual.before(messageNode('暂无其他可直接选择的已审核历史奖励。','empty'));
    list.dataset.nbReviewedState=key;
  }
  function validContainer(container,context,offerId){if(!container?.isConnected||container.dataset.nbReviewedOfferId!==offerId||!container.querySelector('.option-list'))return false;if(context==='add')return container.classList.contains('add-product-modal')&&isAddOfferStage(container);return container.classList.contains('edit-product-page')&&isEditOfferStage(container);}
  async function enhanceContainer(container,context,offerId){
    if(!offerId||!history.isSupported(offerId))return;
    const cached=history.cached(offerId);if(cached){renderChoices(container,context,offerId,cached);return;}
    renderLoading(container,context,offerId);const token=`${context}:${offerId}:${Date.now()}:${Math.random()}`;container.dataset.nbReviewedLoadToken=token;
    const result=await history.load(offerId);const current=context==='add'?app.querySelector('.add-product-modal'):app.querySelector('.edit-product-page');
    if(validContainer(current,context,offerId)&&current.dataset.nbReviewedLoadToken===token)renderChoices(current,context,offerId,result);
  }
  function enhance(){const modal=app.querySelector('.add-product-modal');if(modal&&isAddOfferStage(modal)){const offerId=offerIdFromAdd(modal);if(offerId)enhanceContainer(modal,'add',offerId);}const edit=app.querySelector('.edit-product-page');if(edit&&isEditOfferStage(edit)){const offerId=offerIdFromEdit(edit);if(offerId)enhanceContainer(edit,'edit',offerId);}}
  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}
  function clearAfterSuccessfulAction(action,offerId){setTimeout(()=>{if(action==='add-offer-next'){const modal=app.querySelector('.add-product-modal');if(modal?.querySelector('[data-action="add-view-product"]'))history.clear(offerId);return;}if(action==='edit-bonus-use'){const page=app.querySelector('.edit-product-page');if(page&&!isEditOfferStage(page))history.clear(offerId);}},0);}

  // Selection interception is the only capture-phase DOM bridge left here.
  // It maps reviewed rows to the canonical app action, then schedules one
  // deterministic enhancement after app.js finishes its synchronous render.
  document.addEventListener('click',event=>{
    const current=event.target.closest?.('[data-nb-current-offer]');if(current){event.preventDefault();event.stopImmediatePropagation();const offerId=current.dataset.nbCurrentOffer,context=current.dataset.nbReviewedContext||'add';history.clear(offerId);trigger(actionFor(context),{id:`current-${offerId}`});schedule();return;}
    const reviewed=event.target.closest?.('[data-nb-reviewed-offer]');if(reviewed){event.preventDefault();event.stopImmediatePropagation();const offerId=reviewed.dataset.nbReviewedSource,context=reviewed.dataset.nbReviewedContext||'add';const choice=history.activate(offerId,reviewed.dataset.nbReviewedOffer);if(choice){trigger(actionFor(context),{id:`current-${offerId}`});schedule();}return;}
    const manual=event.target.closest?.('[data-nb-reviewed-manual]');if(manual){event.preventDefault();event.stopImmediatePropagation();const container=manual.closest('.add-product-modal,.edit-product-page'),offerId=container?.dataset.nbReviewedOfferId,context=manual.dataset.nbReviewedContext||'add';if(offerId)history.clear(offerId);trigger(actionFor(context),{id:'manual'});schedule();return;}
  },true);

  // No MutationObserver: only known state transitions can request an enhancement.
  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-action]');if(!action)return;
    const add=action.closest('.add-product-modal'),edit=action.closest('.edit-product-page'),offerId=add?.dataset.nbReviewedOfferId||edit?.dataset.nbReviewedOfferId;
    if(action.dataset.action==='add-back'&&offerId){history.clear(offerId);schedule();return;}
    if(action.dataset.action==='edit-back'&&offerId){history.clear(offerId);schedule();return;}
    if(['add-close','add-discard','add-another','open-add-product','edit-exit'].includes(action.dataset.action)){history.clear();return;}
    if(['add-offer-next','edit-bonus-use'].includes(action.dataset.action)&&offerId&&history.current(offerId))clearAfterSuccessfulAction(action.dataset.action,offerId);
    if(['add-track-next','add-offer-choice','edit-bonus-open','edit-bonus-choice','edit-back'].includes(action.dataset.action))schedule();
  });

  schedule();
})(window);
