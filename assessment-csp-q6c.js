(function(root){
  'use strict';
  let value='';
  function step(){const m=(document.querySelector('.assessment-kicker')?.textContent||'').match(/(\d+)\/(\d+)/);return m?Number(m[1]):0}
  function isCsp(){return (document.querySelector('.assessment-kicker')?.textContent||'').includes('Chase Sapphire Preferred')}
  function render(){
    if(!isCsp()||step()!==6)return;
    const box=document.querySelector('.assessment-compound');
    if(!box||box.querySelector('[data-csp-q6c]'))return;
    const opts=[['NO','不是'],['YES','是'],['UNKNOWN','不确定']];
    box.insertAdjacentHTML('beforeend',`<div class="assessment-subq" data-csp-q6c><div class="assessment-subq-title"><span>3</span>你目前是否持有一张还没有关闭的 Chase Sapphire Preferred？</div><div class="assessment-choices compact">${opts.map(([v,l])=>`<button class="assessment-choice ${value===v?'selected':''}" data-csp-q6c-choice="${v}"><span class="assessment-mark">${value===v?'✓':''}</span><span>${l}</span></button>`).join('')}</div></div>`);
  }
  document.addEventListener('click',event=>{
    const choice=event.target.closest('[data-csp-q6c-choice]');
    if(choice){event.preventDefault();event.stopImmediatePropagation();value=choice.dataset.cspQ6cChoice;document.querySelector('[data-csp-q6c]')?.remove();render();return}
    const next=event.target.closest('[data-action="assessment-next"]');
    if(next&&isCsp()&&step()===6&&!value){event.preventDefault();event.stopImmediatePropagation();render()}
    const restart=event.target.closest('[data-action="assessment-restart"]');if(restart)value='';
  },true);
  let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;render()})}).observe(document.documentElement,{childList:true,subtree:true});
  root.NBCSPQ6C={get value(){return value}};
})(window);
