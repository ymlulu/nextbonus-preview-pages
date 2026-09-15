(() => {
  'use strict';

  const STORAGE_KEY='nextbonus-local-v8-state';
  const EXTRA_EVENTS_KEY='attentionActivityEvents';
  const USER_ACTIONS=new Set(['complete-attention','skip-attention']);
  const SYSTEM_CONTEXT_ACTIONS=new Set(['edit-change-confirm','save-edit-product']);
  let pending=null;
  let scheduled=false;
  let knownHistoryIds=new Set();
  let expandedExtraId=null;
  let observer=null;
  const app=document.getElementById('app');

  function readState(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch(_){return null;}
  }
  function writeState(state){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(_){return false;}
  }
  function nowIso(){return new Date().toISOString();}
  function historyList(state){return Array.isArray(state?.attentionHistory)?state.attentionHistory:[];}
  function extraEvents(state){return Array.isArray(state?.[EXTRA_EVENTS_KEY])?state[EXTRA_EVENTS_KEY]:[];}

  function parseLegacyDate(value){
    const text=String(value||'').trim();
    if(!text)return null;
    const english=Date.parse(text);
    if(Number.isFinite(english))return new Date(english);
    const zh=text.match(/^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日$/);
    if(zh)return new Date(Number(zh[1]),Number(zh[2])-1,Number(zh[3]),12,0,0,0);
    return null;
  }
  function eventDate(item){
    if(item?.occurredAt){const date=new Date(item.occurredAt);if(!Number.isNaN(date.getTime()))return date;}
    return parseLegacyDate(item?.ended)||parseLegacyDate(item?.dueDate);
  }
  function eventSortValue(item){return eventDate(item)?.getTime()||0;}
  function sortEvents(items){
    return [...items].sort((a,b)=>eventSortValue(b)-eventSortValue(a)||String(b.id||'').localeCompare(String(a.id||'')));
  }
  function formatEventTime(item){
    const date=eventDate(item);if(!date)return '时间未记录';
    const today=new Date();
    const sameYear=date.getFullYear()===today.getFullYear();
    const datePart=`${sameYear?'':`${date.getFullYear()}年`}${date.getMonth()+1}月${date.getDate()}日`;
    if(!item?.occurredAt)return datePart;
    return `${datePart} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  }
  function formatLongDate(value){
    if(!value)return '';
    const date=new Date(`${value}T12:00:00`);
    if(Number.isNaN(date.getTime()))return String(value);
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
  }
  function periodLabel(item){
    const cycleId=item?.cycleId||item?.source?.cycleId||'';
    let match=String(cycleId).match(/^(\d{4})-(H[12]|Q[1-4])$/);
    if(match)return `${match[1]} ${match[2]}`;
    match=String(cycleId).match(/^(\d{4})-(\d{2})$/);
    if(match)return `${match[1]} 年 ${Number(match[2])} 月`;
    if(/^\d{4}$/.test(String(cycleId)))return String(cycleId);
    const keySub=String(item?.keySub||'');
    match=keySub.match(/(\d{4})\s*(H[12]|Q[1-4])/i);
    if(match)return `${match[1]} ${match[2].toUpperCase()}`;
    match=keySub.match(/(\d{1,2})\s*月(?:周期)?/);
    if(match){
      const date=eventDate(item);
      return date?`${date.getFullYear()} 年 ${Number(match[1])} 月`:`${Number(match[1])} 月`;
    }
    return '';
  }
  function actorLabel(item){
    if(item?.actor==='user')return '你';
    if(item?.actor==='system')return 'NextBonus 自动处理';
    return '来源未记录';
  }
  function statusBucket(item){
    if(item?.statusClass==='skipped')return 'skipped';
    if(item?.statusClass==='expired')return 'expired';
    if(item?.statusClass==='stopped')return 'stopped';
    return 'completed';
  }

  function inferActor(item,context){
    if(context?.action&&USER_ACTIONS.has(context.action))return 'user';
    if(item?.statusClass==='expired'||item?.statusClass==='stopped')return 'system';
    if(context?.action&&SYSTEM_CONTEXT_ACTIONS.has(context.action))return 'system';
    return 'system';
  }

  function reconcile(context=pending){
    const state=readState();if(!state)return false;
    const history=historyList(state);
    let changed=false;
    const previousIds=context?.beforeIds||knownHistoryIds;
    const stamp=context?.at||nowIso();
    for(const item of history){
      if(previousIds.has(item.id))continue;
      if(!item.occurredAt){item.occurredAt=stamp;changed=true;}
      if(!item.actor){item.actor=inferActor(item,context);changed=true;}
    }

    if(context?.action==='history-correction'&&context.original){
      const originalId=context.original.id;
      const originalStillPresent=history.some(item=>item.id===originalId);
      const generated=history.some(item=>!previousIds.has(item.id));
      if(!originalStillPresent&&!generated){
        const extras=extraEvents(state);
        const exists=extras.some(item=>item.sourceHistoryId===originalId&&item.result==='重新进入待处理'&&item.occurredAt===stamp);
        if(!exists){
          extras.unshift({
            id:`evt-reopen-${Date.now()}`,
            sourceHistoryId:originalId,
            productId:context.original.productId,
            product:context.original.product,
            productInstance:context.original.productInstance,
            action:context.original.action,
            result:'重新进入待处理',
            statusClass:'reopened',
            occurredAt:stamp,
            actor:'user',
            dueDate:context.original.dueDate||context.original.source?.dueDate||null,
            cycleId:context.original.cycleId||context.original.source?.cycleId||null,
            summary:'你撤销了之前的处理结果，这项提醒已经重新进入待处理。',
            key:context.original.key||'',
            keySub:context.original.keySub||''
          });
          state[EXTRA_EVENTS_KEY]=extras;
          changed=true;
        }
      }
    }

    if(changed)writeState(state);
    knownHistoryIds=new Set(history.map(item=>item.id));
    pending=null;
    decorate();
    return changed;
  }

  function currentFilters(state){
    return{
      product:state?.attentionProductFilter||'all',
      status:state?.historyStatusFilter||'all'
    };
  }
  function visibleExtraEvents(state){
    const filters=currentFilters(state);
    return extraEvents(state).filter(item=>
      (filters.product==='all'||item.productId===filters.product)&&
      (filters.status==='all'||statusBucket(item)===filters.status)
    );
  }
  function escapeHtml(value=''){
    return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function thumbText(item){
    return String(item?.product||'NB').replace(/[^A-Za-z0-9\u4e00-\u9fff]/g,'').slice(0,2)||'NB';
  }
  function extraRow(item){
    const period=periodLabel(item);
    const expanded=expandedExtraId===item.id;
    return `<div class="attention-item nb-history-extra" data-nb-history-extra="${escapeHtml(item.id)}"><button class="attention-row history-row" data-nb-history-event-toggle="${escapeHtml(item.id)}"><span class="att-product-cell"><span class="att-thumb"><span>${escapeHtml(thumbText(item))}</span></span><span class="att-product-copy"><strong>${escapeHtml(item.product||'')}</strong><small>${escapeHtml(item.productInstance||'')}</small></span></span><span class="att-action-cell"><strong>${escapeHtml(item.action||'')}</strong>${period?`<small>${escapeHtml(period)}</small>`:''}</span><span class="att-time att-time-soft">${escapeHtml(formatEventTime(item))}</span><span class="history-status ${escapeHtml(item.statusClass||'')}">${escapeHtml(item.result||'')}</span><span class="chev ${expanded?'up':''}">›</span></button>${expanded?extraExpanded(item):''}</div>`;
  }
  function detailRows(item){
    const period=periodLabel(item);
    const deadline=item?.dueDate||item?.source?.dueDate||'';
    const rows=[];
    if(period)rows.push(['所属周期',period]);
    if(deadline)rows.push(['原截止日期',formatLongDate(deadline)]);
    rows.push(['处理时间',formatEventTime(item)]);
    rows.push(['操作来源',actorLabel(item)]);
    return rows;
  }
  function detailBlock(item){
    return `<div class="nb-history-event-meta">${detailRows(item).map(([label,value])=>`<div><span data-nb-type="caption1" data-nb-tone="secondary">${escapeHtml(label)}</span><strong data-nb-type="body">${escapeHtml(value)}</strong></div>`).join('')}</div>`;
  }
  function extraExpanded(item){
    return `<div class="attention-expanded"><div class="attention-expanded-inner"><div><p class="attention-summary">${escapeHtml(item.summary||'')}</p>${item.key?`<div class="key-card"><strong>${escapeHtml(item.key)}</strong>${item.keySub?`<span class="muted">${escapeHtml(item.keySub)}</span>`:''}</div>`:''}</div><div><div class="instruction-title">最终结果</div><p class="muted">${escapeHtml(item.result||'')}</p>${detailBlock(item)}</div></div></div>`;
  }

  function decorateExistingRow(row,item){
    if(!row||!item)return;
    row.dataset.nbHistoryEvent='1';
    const time=row.querySelector('.att-time');
    if(time){time.textContent=formatEventTime(item);time.className='att-time att-time-soft';}
    const action=row.querySelector('.att-action-cell');
    const period=periodLabel(item);
    if(action&&period&&!action.querySelector('[data-nb-period]')){
      const small=document.createElement('small');small.dataset.nbPeriod='1';small.textContent=period;action.appendChild(small);
    }
    const expanded=row.closest('.attention-item')?.querySelector('.attention-expanded');
    if(expanded&&!expanded.querySelector('.nb-history-event-meta')){
      const target=expanded.querySelector('.attention-expanded-inner>div:last-child');
      if(target)target.insertAdjacentHTML('beforeend',detailBlock(item));
    }
  }

  function observeApp(){
    if(app&&observer)observer.observe(app,{childList:true,subtree:true});
  }
  function decorate(){
    const box=document.querySelector('.history-attention-box');
    if(!box)return;
    const state=readState();if(!state)return;
    observer?.disconnect();
    try{
      const history=historyList(state);
      const historyMap=new Map(history.map(item=>[item.id,item]));
      box.querySelectorAll('.attention-row.history-row[data-id]').forEach(row=>decorateExistingRow(row,historyMap.get(row.dataset.id)));

      box.querySelectorAll('.nb-history-extra').forEach(node=>node.remove());
      const extras=visibleExtraEvents(state);
      for(const item of extras)box.insertAdjacentHTML('beforeend',extraRow(item));

      const extrasMap=new Map(extraEvents(state).map(item=>[item.id,item]));
      const entries=[...box.querySelectorAll(':scope>.attention-item')];
      entries.sort((a,b)=>{
        const aItem=a.dataset.nbHistoryExtra?extrasMap.get(a.dataset.nbHistoryExtra):historyMap.get(a.querySelector('.history-row')?.dataset.id);
        const bItem=b.dataset.nbHistoryExtra?extrasMap.get(b.dataset.nbHistoryExtra):historyMap.get(b.querySelector('.history-row')?.dataset.id);
        return eventSortValue(bItem)-eventSortValue(aItem)||String(bItem?.id||'').localeCompare(String(aItem?.id||''));
      });
      entries.forEach(node=>box.appendChild(node));
      window.NextBonusTypography?.sync?.(box);
    }finally{
      observeApp();
    }
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;reconcile();});
  }

  document.addEventListener('click',event=>{
    const extra=event.target.closest?.('[data-nb-history-event-toggle]');
    if(extra){
      event.preventDefault();event.stopImmediatePropagation();
      expandedExtraId=expandedExtraId===extra.dataset.nbHistoryEventToggle?null:extra.dataset.nbHistoryEventToggle;
      decorate();
      return;
    }
    const control=event.target.closest?.('[data-action]');
    if(!control)return;
    const action=control.dataset.action;
    if(!USER_ACTIONS.has(action)&&!SYSTEM_CONTEXT_ACTIONS.has(action)&&action!=='history-correction')return;
    const state=readState();
    const before=historyList(state);
    pending={
      action,
      at:nowIso(),
      beforeIds:new Set(before.map(item=>item.id)),
      original:action==='history-correction'?before.find(item=>item.id===control.dataset.id)||null:null
    };
  },true);

  document.addEventListener('click',event=>{
    const action=event.target.closest?.('[data-action]')?.dataset.action;
    if(pending&&action===pending.action)queueMicrotask(()=>reconcile(pending));
  });
  document.addEventListener('change',()=>queueMicrotask(()=>reconcile()));

  observer=new MutationObserver(schedule);
  observeApp();

  const initial=readState();
  knownHistoryIds=new Set(historyList(initial).map(item=>item.id));
  requestAnimationFrame(decorate);

  window.NextBonusAttentionHistoryEvents=Object.freeze({
    reconcile,
    decorate,
    sortEvents,
    formatEventTime,
    periodLabel,
    actorLabel
  });
})();
