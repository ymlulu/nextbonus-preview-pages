(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';
  const CYCLE_KEY = 'nextbonus-benefit-cycle-v1';
  const CYCLE_USED_LABELS = Object.freeze({
    month: '本月已使用', quarter: '本季度已使用', 'half-year': '本半年已使用',
    'calendar-year': '今年已使用', 'cardmember-year': '本持卡年已使用'
  });

  function esc(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
  function readJson(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { return {}; } }
  function writeCycles(value) { try { localStorage.setItem(CYCLE_KEY, JSON.stringify(value)); } catch (_) {} }
  function normalize(value) { return String(value || '').toLowerCase().replace(/[®™℠]/g,'').replace(/[^a-z0-9\u4e00-\u9fff]+/g,''); }

  function legacyAttentionMatches(item,title,productId) {
    if (item.productId !== productId || item.type !== 'benefit') return false;
    const needle=normalize(title), haystack=normalize(`${item.action||''} ${item.key||''} ${item.secondary||''}`);
    const aliases=['uber','clear','hilton','marriott','resy','walmart','lululemon','oura','equinox','globalentry','tsa','prioritypass','航空','酒店'];
    if (haystack.includes(needle) || needle.includes(haystack)) return true;
    return aliases.some(word=>needle.includes(normalize(word)) && haystack.includes(normalize(word)));
  }

  function productContext() {
    const state=readJson(STORAGE_KEY), productId=state.currentProductId;
    const product=(Array.isArray(state.products)?state.products:[]).find(item=>item.id===productId) || null;
    return {state,productId,product};
  }

  function cycleInfo(row) {
    const benefitId=row?.dataset?.benefitId, cycleType=row?.dataset?.cycleType;
    if (!benefitId || !cycleType) return null;
    const {productId}=productContext();
    const period=window.NextBonusBenefitCycle?.current(cycleType);
    if (!productId || !period) return null;
    const key=`${productId}|${benefitId}|${period.id}`, legacyKey=`${productId}|${benefitId}|${period.legacyId}`;
    const store=readJson(CYCLE_KEY), manualKey=`${productId}|${benefitId}|manual`;
    let record=store.records?.[key] || store.records?.[legacyKey] || null;
    const manualRecord=store.records?.[manualKey] || null;
    if (!record && cycleType==='cardmember-year' && manualRecord?.status==='used' && manualRecord.usedAt) {
      const marked=new Date(manualRecord.usedAt);
      if (!Number.isNaN(marked.getTime()) && marked >= period.start && marked <= new Date(period.end.getTime()+86400000)) record=manualRecord;
    }
    return {productId,benefitId,cycleType,key,legacyKey,manualKey,window:period,record,used:record?.status==='used'};
  }

  function manualInfo(row) {
    if (row?.dataset?.cycleType !== 'cardmember-year' || !row.dataset.benefitId) return null;
    const {productId,product}=productContext();
    if (!productId || product?.opened) return null;
    const key=`${productId}|${row.dataset.benefitId}|manual`, record=readJson(CYCLE_KEY).records?.[key] || null;
    return {productId,benefitId:row.dataset.benefitId,key,record,used:record?.status==='used'};
  }

  function matchingAttention(row,title) {
    const {state,productId}=productContext(), items=Array.isArray(state.activeAttention)?state.activeAttention:[];
    const cycle=cycleInfo(row);
    if (row?.dataset?.cycleType==='cardmember-year' && !cycle) return null;
    const identity=cycle?{productId,benefitId:cycle.benefitId,cycleId:cycle.window.id}:null;
    return window.NextBonusBenefitAttention?.matchingBenefitAttention(items,identity,item=>legacyAttentionMatches(item,title,productId)) || null;
  }

  function formatDate(date) { return `${date.getMonth()+1}月${date.getDate()}日`; }
  function attentionDueLabel(attention) {
    const due=String(attention?.dueDate||'').slice(0,10), match=due.match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (match) return `⚠ ${Number(match[1])}月${Number(match[2])}日到期`;
    const raw=String(attention?.time||'').replace(/^本期截止\s*/u,'').replace(/^截止\s*/u,'').trim();
    return raw?`⚠ ${raw}到期`:'⚠ 即将到期';
  }
  function cycleUsedLabel(type) { return CYCLE_USED_LABELS[type] || '本期已使用'; }

  function appAction(action,id) {
    if (!action || !id) return;
    const button=document.createElement('button'); button.type='button'; button.hidden=true; button.dataset.action=action; button.dataset.id=id;
    document.body.appendChild(button); button.click(); button.remove();
  }

  function matchingHistoryForCycle(info,attentionId) {
    const history=Array.isArray(readJson(STORAGE_KEY).attentionHistory)?readJson(STORAGE_KEY).attentionHistory:[];
    return history.find(item=>(item.type==='benefit'||item.benefitId) && item.productId===info.productId && item.benefitId===info.benefitId && item.cycleId===info.window.id && (!attentionId||item.source?.id===attentionId||item.id===attentionId)) || null;
  }

  function setCycleUsed(info,used,attention) {
    const store=readJson(CYCLE_KEY); store.records=store.records||{};
    if (used) store.records[info.key]={status:'used',usedAt:new Date().toISOString(),attentionId:attention?.id||null}; else delete store.records[info.key];
    delete store.records[info.legacyKey];
    if (info.manualKey) delete store.records[info.manualKey];
    writeCycles(store);
    window.dispatchEvent(new CustomEvent('nextbonus-benefit-cycle-changed',{detail:{productId:info.productId,benefitId:info.benefitId,cycleId:info.window.id,status:used?'used':'available'}}));
    if (used && attention?.id) appAction('complete-attention',attention.id);
    if (!used && info.record?.attentionId) { const history=matchingHistoryForCycle(info,info.record.attentionId); if (history?.id) appAction('history-correction',history.id); }
  }

  function setManualUsed(info,used) {
    const store=readJson(CYCLE_KEY); store.records=store.records||{};
    if (used) store.records[info.key]={status:'used',usedAt:new Date().toISOString(),trackingMode:'manual'}; else delete store.records[info.key];
    writeCycles(store);
    window.dispatchEvent(new CustomEvent('nextbonus-benefit-cycle-changed',{detail:{productId:info.productId,benefitId:info.benefitId,cycleId:null,status:used?'used':'available',trackingMode:'manual'}}));
  }

  function quickStatusMarkup(cycle) {
    const label=cycle.used?cycleUsedLabel(cycle.cycleType):'未使用';
    return `<button type="button" class="nb-benefit-cycle-quick${cycle.used?' used':''}" data-nb-cycle-toggle="1" data-nb-cycle-quick="1" aria-pressed="${cycle.used?'true':'false'}" aria-label="${esc(label)}"><span aria-hidden="true">${cycle.used?'✓':'○'}</span><span>${esc(label)}</span></button>`;
  }
  function manualStatusMarkup(info) {
    const label=info.used?'已完成':'未标记';
    return `<button type="button" class="nb-benefit-cycle-quick${info.used?' used':''}" data-nb-manual-benefit-toggle="1" aria-pressed="${info.used?'true':'false'}" aria-label="${label}"><span aria-hidden="true">${info.used?'✓':'○'}</span><span>${label}</span></button>`;
  }

  function renderAttentionBadge(row) {
    row?.querySelector(':scope > [data-nb-benefit-attention-badge="1"]')?.remove(); if (!row || manualInfo(row)) return;
    const cycle=cycleInfo(row); if (cycle?.used) return;
    const title=row.querySelector('strong')?.textContent?.trim()||'', attention=matchingAttention(row,title); if (!attention) return;
    const badge=document.createElement('span'); badge.className='nb-card-benefit-due tone-warning'; badge.dataset.nbBenefitAttentionBadge='1'; badge.textContent=attentionDueLabel(attention);
    const quick=row.querySelector(':scope > [data-nb-cycle-quick="1"]'), chev=row.querySelector(':scope > b,:scope > .chev'); row.insertBefore(badge,quick||chev||null);
  }

  function renderQuickStatus(row) {
    row?.querySelector(':scope > [data-nb-cycle-quick="1"]')?.remove(); row?.querySelector(':scope > [data-nb-manual-benefit-toggle="1"]')?.remove(); if (!row) return;
    const cycle=cycleInfo(row), manual=manualInfo(row), chev=row.querySelector(':scope > b,:scope > .chev');
    const markup=cycle?quickStatusMarkup(cycle):manual?manualStatusMarkup(manual):''; if (!markup) return;
    if (chev) chev.insertAdjacentHTML('beforebegin',markup); else row.insertAdjacentHTML('beforeend',markup);
  }

  function detailMarkup(row,title,short,attention) {
    const cycle=cycleInfo(row), manual=manualInfo(row), rows=[['福利说明',short||'以当前公开规则为准']];
    if (cycle) { rows.push(['本期可用至',formatDate(cycle.window.end)]); rows.push(['当前状态',cycle.used?'本期已使用':'本期可使用']); }
    else if (manual) rows.push(['当前状态',manual.used?'已手动标记完成':'未标记；补充开卡日期后可自动计算持卡年']);
    if (attention?.time) rows.push(['本期提醒',attention.time]); if (attention?.summary) rows.push(['使用提示',attention.summary]);
    const checklist=Array.isArray(attention?.checklist)?attention.checklist:[]; let actions='';
    if (cycle) actions=`<div class="nb-benefit-attention-actions">${attention?.instruction?`<div class="instruction-title">${esc(attention.instruction)}</div>`:''}${checklist.length?`<div class="checklist">${checklist.map(item=>`<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(attention.id)}" data-check="${esc(item.id)}" ${item.done?'checked':''}><span>${esc(item.label)}</span></label>`).join('')}</div>`:''}<div class="attention-actions"><button class="btn ${cycle.used?'secondary':'primary'} small" type="button" data-nb-cycle-toggle="1">${cycle.used?'撤销已使用':'已使用'}</button>${attention?.secondaryAction?`<button class="btn secondary small" data-action="skip-attention" data-id="${esc(attention.id)}">${esc(attention.secondaryAction)}</button>`:''}</div></div>`;
    else if (manual) actions=`<div class="nb-benefit-attention-actions"><div class="attention-actions"><button class="btn ${manual.used?'secondary':'primary'} small" type="button" data-nb-manual-benefit-toggle="1">${manual.used?'撤销完成':'标记完成'}</button></div></div>`;
    else if (attention) actions=`<div class="nb-benefit-attention-actions">${attention.instruction?`<div class="instruction-title">${esc(attention.instruction)}</div>`:''}${checklist.length?`<div class="checklist">${checklist.map(item=>`<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(attention.id)}" data-check="${esc(item.id)}" ${item.done?'checked':''}><span>${esc(item.label)}</span></label>`).join('')}</div>`:''}<div class="attention-actions"><button class="btn primary small" data-action="complete-attention" data-id="${esc(attention.id)}">${esc(attention.primary||'确认完成')}</button>${attention.secondaryAction?`<button class="btn secondary small" data-action="skip-attention" data-id="${esc(attention.id)}">${esc(attention.secondaryAction)}</button>`:''}</div></div>`;
    return `<div class="benefit-detail v4-benefit-expanded nb-source-benefit-expanded" data-nb-source-benefit-detail="1"><dl>${rows.map(([label,value])=>`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>${actions}</div>`;
  }

  function closeOthers(section,keepWrap) { section.querySelectorAll('[data-nb-source-benefit-detail="1"]').forEach(detail=>{const wrap=detail.closest('.v4-benefit-item-wrap'); if(wrap===keepWrap)return; detail.remove(); const row=wrap?.querySelector('.v4-benefit-row'),chev=row?.querySelector('b,.chev'); if(row)row.setAttribute('aria-expanded','false'); if(chev)chev.classList.remove('up');}); }
  function ensureAffordance(row) { if(!row||row.dataset.action==='toggle-benefit')return; row.classList.add('nb-source-benefit-row'); row.setAttribute('role','button'); row.setAttribute('tabindex','0'); if(!row.hasAttribute('aria-expanded'))row.setAttribute('aria-expanded','false'); if(!row.querySelector('b,.chev')){const chev=document.createElement('b');chev.className='chev';chev.setAttribute('aria-hidden','true');chev.textContent='›';row.appendChild(chev);} renderQuickStatus(row);renderAttentionBadge(row); }
  function openDetail(row) { const wrap=row.closest('.v4-benefit-item-wrap'); if(!wrap)return; const title=row.querySelector('strong')?.textContent?.trim()||'',short=row.querySelector('small')?.textContent?.trim()||''; wrap.insertAdjacentHTML('beforeend',detailMarkup(row,title,short,matchingAttention(row,title))); }
  function toggle(row) { const section=row.closest('.v4-pd-benefits'),wrap=row.closest('.v4-benefit-item-wrap');if(!section||!wrap)return;const existing=wrap.querySelector(':scope > [data-nb-source-benefit-detail="1"]');closeOthers(section,wrap);const chev=row.querySelector('b,.chev');if(existing){existing.remove();row.setAttribute('aria-expanded','false');if(chev)chev.classList.remove('up');return;}openDetail(row);row.setAttribute('aria-expanded','true');if(chev)chev.classList.add('up'); }
  function refreshRow(row) { renderQuickStatus(row);renderAttentionBadge(row);const wrap=row.closest('.v4-benefit-item-wrap'),detail=wrap?.querySelector(':scope > [data-nb-source-benefit-detail="1"]');if(!detail)return;detail.remove();openDetail(row); }
  function enhance() { document.querySelectorAll('.v4-pd-benefits .v4-benefit-row').forEach(ensureAffordance); }

  document.addEventListener('click',event=>{
    const manualButton=event.target.closest?.('[data-nb-manual-benefit-toggle="1"]');
    if(manualButton){event.preventDefault();event.stopPropagation();const row=manualButton.closest('.v4-benefit-item-wrap')?.querySelector('.v4-benefit-row'),manual=manualInfo(row);if(!row||!manual)return;setManualUsed(manual,!manual.used);refreshRow(row);return;}
    const cycleButton=event.target.closest?.('[data-nb-cycle-toggle="1"]');
    if(cycleButton){event.preventDefault();event.stopPropagation();const row=cycleButton.closest('.v4-benefit-item-wrap')?.querySelector('.v4-benefit-row'),title=row?.querySelector('strong')?.textContent?.trim()||'',cycle=cycleInfo(row);if(!row||!cycle)return;const attention=matchingAttention(row,title);setCycleUsed(cycle,!cycle.used,attention);refreshRow(row);return;}
    if(event.target.closest?.('[data-action]'))return;const row=event.target.closest?.('.v4-pd-benefits .v4-benefit-row');if(!row||row.dataset.action==='toggle-benefit')return;event.preventDefault();toggle(row);
  });
  document.addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;if(event.target.closest?.('[data-nb-cycle-toggle="1"],[data-nb-manual-benefit-toggle="1"],button'))return;const row=event.target.closest?.('.v4-pd-benefits .v4-benefit-row');if(!row||row.dataset.action==='toggle-benefit')return;event.preventDefault();toggle(row);});
  window.addEventListener('nextbonus-benefit-cycle-changed',event=>{const detail=event.detail||{};document.querySelectorAll('.v4-pd-benefits .v4-benefit-row').forEach(row=>{const cycle=cycleInfo(row),manual=manualInfo(row),info=cycle||manual;if(!info)return;if(detail.productId&&info.productId!==detail.productId)return;if(detail.benefitId&&info.benefitId!==detail.benefitId)return;if(detail.cycleId&&cycle?.window.id!==detail.cycleId)return;refreshRow(row);});});
  window.addEventListener('nextbonus-benefit-attention-updated',enhance);window.addEventListener('nextbonus-product-facts-rendered',enhance);window.addEventListener('DOMContentLoaded',enhance);enhance();
})();
