(() => {
  'use strict';

  const root=document.getElementById('app');
  if(!root) return;

  const OPTIONAL_ACTIONS=[
    'add-track-next',
    'add-offer-next'
  ];

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

  document.addEventListener('click',event=>{
    const infoContinue=event.target.closest?.('[data-action="add-to-track"]');
    if(infoContinue && root.contains(infoContinue) && infoContinue.closest('.add-product-modal')){
      if(infoContinue.disabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      triggerAppAction('add-to-track');
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

  refreshOptionalActions();
  new MutationObserver(refreshOptionalActions).observe(root,{childList:true,subtree:true});
})();
