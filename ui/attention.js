(() => {
  'use strict';

  function expanded(ctx,item){
    const esc=ctx.esc;
    return `<div class="attention-expanded"><div class="attention-expanded-inner"><div><p class="attention-summary">${esc(item.summary||'')}</p><div class="key-card"><strong>${esc(item.key||'')}</strong><span class="muted">${esc(item.keySub||'')}</span></div></div><div><div class="instruction-title">${esc(item.instruction||'')}</div>${item.checklist?.length?`<div class="checklist">${item.checklist.map(check=>`<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(item.id)}" data-check="${esc(check.id)}" ${check.done?'checked':''}/><span>${esc(check.label)}</span></label>`).join('')}</div>`:''}<div class="attention-actions">${(item.checklist?.length||0)<=1?`<button class="btn primary small" data-action="complete-attention" data-id="${esc(item.id)}">${esc(item.primary||'我已完成')}</button>`:''}${item.secondaryAction?`<button class="btn secondary small" data-action="skip-attention" data-id="${esc(item.id)}">${esc(item.secondaryAction)}</button>`:''}</div></div></div></div>`;
  }

  window.NextBonusAttentionUI=Object.freeze({expanded});
})();
