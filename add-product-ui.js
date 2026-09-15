(() => {
  'use strict';

  const root=document.getElementById('app');
  if(!root) return;

  const FILTERS=Object.freeze([['全部',null],['信用卡','信用卡'],['银行','银行账户'],['券商','券商账户'],['会籍','其他']]);
  const FILTER_CATEGORY=Object.freeze(Object.fromEntries(FILTERS));
  const ui={query:'',filter:'全部',selectedProduct:null,tracking:false,offerChoice:null};
  let queued=false;

  const esc=(value='')=>String(value).replace(/[&<>'\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));
  const setText=(node,text)=>{if(node&&node.textContent!==text)node.textContent=text;};

  function ensureStyles(){
    if(document.getElementById('nextbonus-add-product-ui-style')) return;
    const style=document.createElement('style');
    style.id='nextbonus-add-product-ui-style';
    style.textContent=`
      .add-product-modal:not(.nb-add-product-ready){visibility:hidden}
      .add-product-modal.nb-unified-selector .modal-kicker{display:none}
      .nb-add-filter-row{margin-bottom:20px}
      .nb-selected-product{margin:0 0 20px}
      .nb-due-label{display:block;margin:8px 0 7px}
      .nb-add-exit-confirm{z-index:160}
    `;
    document.head.appendChild(style);
  }

  function resetUi(){ui.query='';ui.filter='全部';ui.selectedProduct=null;ui.tracking=false;ui.offerChoice=null;}
  function catalogEntries(){return Object.entries(window.NextBonusProductCatalog||{}).flatMap(([category,products])=>(products||[]).map(product=>({category,product})));}
  function visibleEntries(){const category=FILTER_CATEGORY[ui.filter]||null,query=ui.query.trim().toLowerCase();return catalogEntries().filter(({category:itemCategory,product})=>{if(category&&itemCategory!==category)return false;if(!query)return true;return `${product.name||''} ${product.institution||''} ${product.subtype||''}`.toLowerCase().includes(query);});}
  function selectorRenderKey(items){return JSON.stringify([ui.query,ui.filter,(items||[]).map(({category,product})=>`${category}:${product.id}`).join('|')]);}

  function setProgressLabels(modal){const labels=['选择产品','基本信息','奖励','完成'];modal.querySelectorAll('.add-progress-labels b').forEach((node,index)=>{if(labels[index])setText(node,labels[index]);});}
  function ensureSelectorFooter(modal){let footer=modal.querySelector('.modal-foot');if(!footer){footer=document.createElement('div');footer.className='modal-foot';modal.appendChild(footer);}if(!footer.querySelector('[data-action="add-back"]'))footer.innerHTML='<button class="btn secondary" data-action="add-back">返回</button><span></span>';footer.dataset.nbSelectorFooter='1';return footer;}

  function renderUnifiedSelector(modal){
    modal.dataset.nbStage='selector';modal.classList.add('nb-unified-selector');setText(modal.querySelector('.modal-title'),'添加产品');
    const body=modal.querySelector('.modal-body');if(!body)return;ensureSelectorFooter(modal);
    const items=visibleEntries(),renderKey=selectorRenderKey(items);
    if(modal.dataset.nbSelectorRenderKey===renderKey&&body.querySelector('#nb-add-search')&&body.querySelector('.nb-add-filter-row')){modal.classList.add('nb-add-product-ready');return;}
    const itemHtml=items.map(({category,product})=>`<button class="option-row" type="button" data-nb-add-product-id="${esc(product.id)}" data-nb-add-category="${esc(category)}">${product.cardImageLocal?`<span class="add-card-art"><img src="${esc(product.cardImageLocal)}" alt="${esc(product.name)}" /></span>`:`<div class="mini-art ${esc(product.art||'bank')}"></div>`}<span class="option-main"><span class="option-title">${esc(product.name)}</span><span class="option-sub">${esc(product.institution)}${product.subtype?` · ${esc(product.subtype)}`:''}</span></span><span>›</span></button>`).join('');
    body.innerHTML=`<div class="search-wrap"><span class="search-icon">⌕</span><input id="nb-add-search" class="search" value="${esc(ui.query)}" placeholder="搜索信用卡、银行账户、券商或会籍" />${ui.query?'<button class="search-clear" type="button" data-nb-clear-search>×</button>':''}</div><div class="filters nb-add-filter-row">${FILTERS.map(([label])=>`<button class="pill ${ui.filter===label?'active':''}" type="button" data-nb-add-filter="${esc(label)}">${esc(label)}</button>`).join('')}</div>${items.length?`<div class="option-list">${itemHtml}</div>`:'<div class="empty"><h3>没有找到这个产品</h3><p>换个关键词试试。</p></div>'}`;
    modal.dataset.nbSelectorRenderKey=renderKey;modal.classList.add('nb-add-product-ready');
  }

  function replaceLabelForInput(modal,inputId,text){const input=modal.querySelector(`#${inputId}`),label=input?.closest('.form-group')?.querySelector('.label');setText(label,text);}
  function enhanceInfo(modal){const body=modal.querySelector('.modal-body');setText(modal.querySelector('.modal-title'),'补充信息');if(body&&ui.selectedProduct&&!body.querySelector('.nb-selected-product'))body.insertAdjacentHTML('afterbegin',`<div class="report nb-selected-product"><h3>${esc(ui.selectedProduct.product.name)}</h3><p>${esc(ui.selectedProduct.product.institution)}</p></div>`);const isCard=ui.selectedProduct?.category==='信用卡'||!!modal.querySelector('#add-last4');replaceLabelForInput(modal,isCard?'add-last4':'add-nickname',isCard?'卡号后四位（可选）':'账户昵称（可选）');replaceLabelForInput(modal,'add-opened',`${isCard?'开卡日期':'开户日期'}（可选）`);setText(modal.querySelector('.hint'),'这些信息都可以稍后修改。');}
  function enhanceTrack(modal){const isCard=ui.selectedProduct?.category==='信用卡';setText(modal.querySelector('.modal-title'),isCard?'要一起追踪开卡奖励吗？':'要一起追踪开户奖励吗？');const yes=modal.querySelector('[data-action="add-track-choice"][data-value="yes"]'),no=modal.querySelector('[data-action="add-track-choice"][data-value="no"]');setText(yes?.querySelector('.option-title'),isCard?'追踪这次开卡奖励':'追踪这次开户奖励');setText(yes?.querySelector('.option-sub'),isCard?'选择你申请时看到的奖励，之后可以记录进度和截止日期。':'选择你开户时看到的奖励，之后可以记录进度和截止日期。');setText(no?.querySelector('.option-title'),'暂时不追踪');setText(no?.querySelector('.option-sub'),'以后也可以从产品详情里添加。');setText(modal.querySelector('[data-action="add-track-next"]'),no?.classList.contains('selected')?'添加到钱包':'继续');}
  function enhanceOffer(modal){const isCard=ui.selectedProduct?.category==='信用卡';setText(modal.querySelector('.modal-title'),isCard?'你申请时看到的是哪个奖励？':'你开户时看到的是哪个奖励？');modal.querySelectorAll('.option-tag').forEach(node=>node.remove());const manual=modal.querySelector('[data-action="add-offer-choice"][data-id="manual"]');setText(manual?.querySelector('.option-title'),'都不是，手动填写');setText(manual?.querySelector('.option-sub'),'按你实际申请或开户时看到的奖励填写。');const selected=modal.querySelector('[data-action="add-offer-choice"].selected');setText(modal.querySelector('[data-action="add-offer-next"]'),selected&&selected.dataset.id!=='manual'?'添加到钱包':'继续');}
  function enhanceManual(modal){setText(modal.querySelector('.modal-title'),'填写你的奖励');const reward=modal.querySelector('#add-reward');setText(reward?.closest('.form-group')?.querySelector('.label'),'奖励内容');if(reward&&reward.getAttribute('placeholder')!=='例如 175,000 MR')reward.setAttribute('placeholder','例如 175,000 MR');const cards=[...modal.querySelectorAll('.task-card')],container=cards[0]?.parentElement;setText(container?.querySelector(':scope > .label'),'完成条件');cards.forEach((card,index)=>{setText(card.querySelector('.task-head span'),`完成条件 ${index+1}`);const row=card.querySelector('.date-field-row');if(row&&!card.querySelector('.nb-due-label'))row.insertAdjacentHTML('beforebegin','<label class="label nb-due-label">截止日期</label>');});setText(modal.querySelector('[data-action="add-task"]'),'＋ 添加条件');setText(modal.querySelector('[data-action="add-manual-submit"]'),'添加到钱包');}
  function enhanceMembership(modal){setText(modal.querySelector('.modal-title'),'确认添加');modal.querySelectorAll('.modal-body p.muted').forEach(node=>{if((node.textContent||'').includes('这里只记录'))node.remove();});setText(modal.querySelector('[data-action="add-membership-submit"]'),'添加到钱包');}
  function enhanceSuccess(modal){setText(modal.querySelector('.modal-title'),'已添加到钱包');const success=modal.querySelector('.success'),heading=success?.querySelector('h2');setText(heading,'已添加到钱包');let note=success?.querySelector('p');if(ui.tracking){if(!note&&heading){note=document.createElement('p');heading.insertAdjacentElement('afterend',note);}setText(note,'奖励也已经加入提醒。');}else if(note)note.remove();setText(modal.querySelector('[data-action="add-view-product"]'),'查看详情');setText(modal.querySelector('[data-action="add-another"]'),'继续添加');}

  function detectStage(modal){if(modal.dataset.nbStage==='selector')return 'selector';if(modal.querySelector('.category-grid')||modal.querySelector('#add-search'))return 'selector';if(modal.querySelector('#add-last4')||modal.querySelector('#add-nickname'))return 'info';if(modal.querySelector('[data-action="add-track-choice"]'))return 'track';if(modal.querySelector('[data-action="add-offer-choice"]'))return 'offer';if(modal.querySelector('#add-reward'))return 'manual';if(modal.querySelector('[data-action="add-view-product"]'))return 'success';if((modal.querySelector('.modal-title')?.textContent||'').trim()==='确认添加'&&modal.querySelector('.report'))return 'membership';return 'other';}
  function enhanceModal(){const modal=root.querySelector('.add-product-modal');if(!modal)return;setProgressLabels(modal);const stage=detectStage(modal);modal.dataset.nbStage=stage;modal.classList.toggle('nb-unified-selector',stage==='selector');if(stage==='selector')renderUnifiedSelector(modal);else if(stage==='info')enhanceInfo(modal);else if(stage==='track')enhanceTrack(modal);else if(stage==='offer')enhanceOffer(modal);else if(stage==='manual')enhanceManual(modal);else if(stage==='membership')enhanceMembership(modal);else if(stage==='success')enhanceSuccess(modal);modal.classList.add('nb-add-product-ready');}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhanceModal();});}

  function triggerAppAction(action,dataset={}){const button=document.createElement('button');button.type='button';button.hidden=true;button.dataset.action=action;Object.entries(dataset).forEach(([key,value])=>button.dataset[key]=String(value));document.body.appendChild(button);button.click();button.remove();}
  function selectUnifiedProduct(category,id){const entry=catalogEntries().find(item=>item.category===category&&item.product.id===id);if(!entry)return;ui.selectedProduct=entry;ui.tracking=false;ui.offerChoice=null;triggerAppAction('add-category',{category});triggerAppAction('add-product-select',{id});schedule();}
  function showExitConfirm(){if(document.querySelector('.nb-add-exit-confirm'))return;const overlay=document.createElement('div');overlay.className='modal-backdrop nb-add-exit-confirm';overlay.innerHTML='<div class="modal"><div class="modal-head"><div class="modal-title">退出添加？</div></div><div class="modal-body"><p class="confirm-copy">已填写的内容不会保存。</p></div><div class="modal-foot"><button class="btn secondary" type="button" data-nb-exit-continue>继续添加</button><button class="btn danger" type="button" data-nb-exit-confirm>退出</button></div></div>';document.body.appendChild(overlay);}
  function closeWithoutPrompt(){document.querySelector('.nb-add-exit-confirm')?.remove();triggerAppAction('add-discard');}

  ensureStyles();

  document.addEventListener('click',event=>{
    const target=event.target,unifiedProduct=target.closest?.('[data-nb-add-product-id]');
    if(unifiedProduct){event.preventDefault();event.stopImmediatePropagation();selectUnifiedProduct(unifiedProduct.dataset.nbAddCategory,unifiedProduct.dataset.nbAddProductId);return;}
    const filter=target.closest?.('[data-nb-add-filter]');if(filter){event.preventDefault();event.stopImmediatePropagation();ui.filter=filter.dataset.nbAddFilter;const modal=root.querySelector('.add-product-modal');if(modal)renderUnifiedSelector(modal);return;}
    if(target.closest?.('[data-nb-clear-search]')){event.preventDefault();event.stopImmediatePropagation();ui.query='';const modal=root.querySelector('.add-product-modal');if(modal)renderUnifiedSelector(modal);return;}
    if(target.closest?.('[data-nb-exit-continue]')){event.preventDefault();event.stopImmediatePropagation();document.querySelector('.nb-add-exit-confirm')?.remove();return;}
    if(target.closest?.('[data-nb-exit-confirm]')){event.preventDefault();event.stopImmediatePropagation();closeWithoutPrompt();return;}
    const action=target.closest?.('[data-action]');if(!action)return;
    if(action.dataset.action==='open-add-product'||action.dataset.action==='add-another')resetUi();
    if(action.dataset.action==='add-track-choice')ui.tracking=action.dataset.value==='yes';
    if(action.dataset.action==='add-offer-choice')ui.offerChoice=action.dataset.id;
    const modal=action.closest('.add-product-modal');
    if(action.dataset.action==='add-close'&&modal){const stage=modal.dataset.nbStage||detectStage(modal),progressed=stage!=='selector'||!!ui.selectedProduct;if(progressed&&stage!=='success'){event.preventDefault();event.stopImmediatePropagation();showExitConfirm();return;}}
    if(action.dataset.action==='add-back'&&modal?.classList.contains('nb-unified-selector')){event.preventDefault();event.stopImmediatePropagation();closeWithoutPrompt();}
  },true);

  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-action]')?.dataset.action;
    if(!action)return;
    if(['open-add-product','add-category','add-product-select','add-back','add-to-track','add-track-choice','add-track-next','add-offer-choice','add-offer-next','add-task','clear-task-due','delete-task','add-manual-submit','add-membership-submit','add-another','add-continue-editing'].includes(action))schedule();
  });

  document.addEventListener('input',event=>{
    if(event.target.id!=='nb-add-search')return;
    ui.query=event.target.value;const modal=root.querySelector('.add-product-modal.nb-unified-selector');if(modal){renderUnifiedSelector(modal);const input=modal.querySelector('#nb-add-search');if(input){input.focus();const end=input.value.length;try{input.setSelectionRange(end,end);}catch(_){}}}
  },true);

  // Add Product presentation is event-driven. No MutationObserver owns this UI.
  schedule();
})();
