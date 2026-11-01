(() => {
  'use strict';
  // Use verified structured requirements only. Never infer deadlines from prose.
  const rules=window.NextBonusBonusTaskRules;
  const validDate=value=>!!rules?.dateParts?.(value);
  function deadline(rule,opened){
    if(!rule||rule.anchor!=='account_opened'||!validDate(opened)||
       !Number.isSafeInteger(rule.value)||rule.value<1)return null;
    if(rule.unit==='calendar_days')return rules.addDays(opened,rule.value);
    if(rule.unit==='calendar_months')return rules.addMonths(opened,rule.value);
    return null; // Business-day and statement-cycle calendars are not inferred.
  }
  function build(offer,opened){
    if(!offer?.checklistReady||offer.requirements?.version!==1||
       !Array.isArray(offer.requirements.requirements))return null;
    const rows=offer.requirements.requirements;
    if(!rows.length||rows.some(r=>!r?.id||!r?.description||
       typeof r.id!=='string'||typeof r.description!=='string'))return null;
    if(new Set(rows.map(r=>r.id)).size!==rows.length)return null;
    const tasks=rows.map(r=>({
      id:r.id,label:r.description,dueDate:deadline(r.deadline,opened),
      ...(r.deadline?{deadlineRule:{...r.deadline}}:{})
    }));
    const dates=tasks.map(t=>t.dueDate).filter(Boolean).sort();
    const unresolved=rows.some((r,i)=>r.deadline&&!tasks[i].dueDate);
    return {
      tasks,dueDate:dates[0]||null,
      hasUnresolvedDeadlines:unresolved,
      needsAnchorDate:!validDate(opened)&&rows.some(r=>r.deadline?.anchor==='account_opened'),
      distinctDueDates:new Set(dates).size
    };
  }
  window.NextBonusBankChecklist=Object.freeze({build,deadline});
})();
