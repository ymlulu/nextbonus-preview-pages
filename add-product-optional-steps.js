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

  function refreshOptionalActions(){
    OPTIONAL_ACTIONS.forEach(action=>{
      const button=root.querySelector(`[data-action="${action}"]`);
      if(!button || isSubmitting(button)) return;
      button.disabled=false;
      button.removeAttribute('disabled');
      button.setAttribute('aria-disabled','false');

      const selected=selectedChoice(action);
      if(action==='add-track-next'){
        if(!selected) button.textContent='跳过并添加到钱包';
        else if(selected.dataset.value==='no') button.textContent='添加到钱包';
        else button.textContent='继续';
      }
      if(action==='add-offer-next'){
        if(!selected) button.textContent='跳过并添加到钱包';
        else if(selected.dataset.id==='manual') button.textContent='继续';
        else button.textContent='添加到钱包';
      }
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
