(() => {
  'use strict';
  // Only structured, reviewed DD requirements can produce an automatic checklist.
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
    !Number.isNaN(Date.parse(value+'T00:00:00Z'));
  function deadline(rule, opened){
    if(!rule || rule.anchor!=='account_opened' || !validDate(opened)) return null;
    if(!Number.isSafeInteger(rule.value)||rule.value<1) return null;
    const date=new Date(opened+'T00:00:00Z');
    if(rule.unit==='calendar_days') date.setUTCDate(date.getUTCDate()+rule.value);
    else if(rule.unit==='calendar_months'){
      const day=date.getUTCDate();
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth()+rule.value);
      const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
      date.setUTCDate(Math.min(day,last));
    }else return null; // Business days, statement cycles, and unknown anchors are not guessed.
    return date.toISOString().slice(0,10);
  }
  function build(offer,opened){
    if(!offer?.checklistReady||offer.requirements?.version!==1||
       !Array.isArray(offer.requirements.requirements)) return null;
    const rows=offer.requirements.requirements;
    if(!rows.length||rows.some(r=>!r?.id||!r?.description)) return null;
    const tasks=rows.map(r=>({
      id:r.id,label:r.description,dueDate:deadline(r.deadline,opened),
      ...(r.deadline?{deadlineRule:r.deadline}:{})
    }));
    const dates=tasks.map(t=>t.dueDate).filter(Boolean).sort();
    return {tasks,dueDate:dates[0]||null,hasUnresolvedDeadlines:rows.some((r,i)=>r.deadline&&!tasks[i].dueDate)};
  }
  window.NextBonusBankChecklist=Object.freeze({build,deadline});
})();
