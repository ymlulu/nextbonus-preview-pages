(() => {
  'use strict';

  const root=document.getElementById('app');
  if(!root) return;

  let selectedProductId=null;
  let queued=false;

  function productById(id){
    return window.NextBonusProductRegistry?.getById?.(id) ||
      Object.values(window.NextBonusProductCatalog||{}).flat().find(item=>item.id===id) || null;
  }

  function triggerAppAction(action,dataset={}){
    const button=document.createElement('button');
    button.type='button';
    button.hidden=true;
    button.dataset.action=action;
    Object.entries(dataset).forEach(([key,value])=>button.dataset[key]=String(value));
    root.appendChild(button);
    button.click();
    button.remove();
  }

  function currentButton(offerId,offer){
    const button=document.createElement('button');
    button.type='button';
    button.className='option-row';
    button.dataset.action='add-offer-choice';
    button.dataset.id=`current-${offerId}`;
    button.dataset.nbCanonicalSourceOffer=offerId;
    const dot=document.createElement('span');
    dot.className='radio-dot';
    const main=document.createElement('span');
    main.className='option-main';
    const title=document.createElement('span');
    title.className='option-title';
    title.textContent=offer.primaryValue||'当前奖励';
    const sub=document.createElement('span');
    sub.className='option-sub';
    sub.textContent=offer.primaryRequirement||'';
    main.append(title,sub);
    const tag=document.createElement('span');
    tag.className='option-tag';
    tag.textContent='当前公开';
    button.append(dot,main,tag);
    return button;
  }

  function sync(){
    const modal=root.querySelector('.add-product-modal');
    const list=modal?.querySelector('.option-list');
    if(!modal||!list||!modal.querySelector('[data-action="add-offer-choice"]')) return;

    const product=productById(selectedProductId);
    const offerId=product?.offerId||'';
    const offer=offerId?window.NextBonusOfferData?.[offerId]:null;
    if(!offer) return;

    const choiceId=`current-${offerId}`;
    let current=list.querySelector(`[data-action="add-offer-choice"][data-id="${choiceId}"]`);
    const manual=list.querySelector('[data-action="add-offer-choice"][data-id="manual"]');
    if(!current){
      current=currentButton(offerId,offer);
      if(manual) list.insertBefore(current,manual); else list.prepend(current);
    }

    const title=current.querySelector('.option-title');
    const sub=current.querySelector('.option-sub');
    if(title&&title.textContent!==offer.primaryValue) title.textContent=offer.primaryValue||'当前奖励';
    if(sub&&sub.textContent!==offer.primaryRequirement&&!sub.textContent.startsWith('当前公开 · ')) sub.textContent=offer.primaryRequirement||'';

    modal.querySelector('.nb-current-offer-note')?.remove();
  }

  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;sync();});
  }

  document.addEventListener('click',event=>{
    const current=event.target.closest?.('[data-nb-current-offer]');
    if(current&&root.contains(current)){
      event.preventDefault();
      event.stopImmediatePropagation();
      const offerId=current.dataset.nbCurrentOffer;
      const context=current.dataset.nbReviewedContext||'add';
      window.NextBonusReviewedOfferHistory?.clear?.(offerId);
      triggerAppAction(context==='edit'?'edit-bonus-choice':'add-offer-choice',{id:`current-${offerId}`});
      schedule();
      return;
    }

    const reviewed=event.target.closest?.('[data-nb-reviewed-offer]');
    if(reviewed&&root.contains(reviewed)){
      event.preventDefault();
      event.stopImmediatePropagation();
      const offerId=reviewed.dataset.nbReviewedSource;
      const context=reviewed.dataset.nbReviewedContext||'add';
      const choice=window.NextBonusReviewedOfferHistory?.activate?.(offerId,reviewed.dataset.nbReviewedOffer);
      if(choice) triggerAppAction(context==='edit'?'edit-bonus-choice':'add-offer-choice',{id:`current-${offerId}`});
      schedule();
      return;
    }

    const manual=event.target.closest?.('[data-nb-reviewed-manual]');
    if(manual&&root.contains(manual)){
      event.preventDefault();
      event.stopImmediatePropagation();
      const container=manual.closest('.add-product-modal,.edit-product-page');
      const offerId=container?.dataset.nbReviewedOfferId||productById(selectedProductId)?.offerId||'';
      const context=manual.dataset.nbReviewedContext||'add';
      if(offerId) window.NextBonusReviewedOfferHistory?.clear?.(offerId);
      triggerAppAction(context==='edit'?'edit-bonus-choice':'add-offer-choice',{id:'manual'});
      schedule();
      return;
    }

    const unified=event.target.closest?.('[data-nb-add-product-id]');
    if(unified) selectedProductId=unified.dataset.nbAddProductId||null;
    const action=event.target.closest?.('[data-action]');
    if(action?.dataset.action==='add-product-select') selectedProductId=action.dataset.id||selectedProductId;
    if(['add-another','add-close','add-discard'].includes(action?.dataset.action)) selectedProductId=null;
    if(['add-product-select','add-track-next','add-offer-choice','add-back','open-add-product'].includes(action?.dataset.action)) schedule();
  },true);

  // Compatibility sync is event-driven. A continuous observer here used to
  // compete with reviewed Offer decoration and could make the Offer list churn.
  schedule();
})();
