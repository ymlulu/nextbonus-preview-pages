(() => {
  'use strict';
  // Bank-only presentation filter. The source requirements and frozen audit data
  // are retained; only post-opening actions appear in a customer's checklist.
  const prereqSubtypes=new Set(['promo_code','account_opening','membership']);
  function isApplicationRequirement(rule){
    if(rule?.subtype&&prereqSubtypes.has(rule.subtype))return true;
    const text=String(rule?.description||rule?.label||'').trim();
    if(!text)return false;
    if(/\b(?:direct deposits?|ach|deposit|balance|hold|spend|purchase|transaction|statement|bill pay|transfer)\b/i.test(text)
       && !/\b(?:promo(?:tion(?:al)?)?\s*code|coupon code)\b/i.test(text))return false;
    return /\b(?:apply for|apply to|application(?:s)?(?:\s+for)?|open(?:ing)? a new|open(?:ing)? (?:your|the) account|sign up|enroll for|use (?:the )?(?:promo|promotion|coupon) code|enter (?:the )?(?:promo|promotion|coupon) code|new (?:checking|bank) account using code)\b/i.test(text)
      ||/(?:开户时|申请时|申请资格|新客户资格|使用(?:优惠码|促销码)|输入(?:优惠码|促销码))/.test(text);
  }
  function ruleFor(task,snapshot){
    const list=snapshot?.requirements?.requirements;
    if(!Array.isArray(list))return null;
    const key=String(task?.id||'');
    return list.find(rule=>rule.id&&key.endsWith('-'+rule.id))||
      list.find(rule=>rule.description===task?.description||rule.description===task?.label)||null;
  }
  function visibleTask(task,snapshot){
    return !isApplicationRequirement(ruleFor(task,snapshot)||task);
  }
  function visibleTasks(tasks,snapshot){
    return (Array.isArray(tasks)?tasks:[]).filter(task=>visibleTask(task,snapshot));
  }
  function trackingForAttention(state,item){
    const tracking=(state?.offerTrackings||[]).find(t=>t.id===item?.trackingId);
    if(!tracking)return null;
    const product=[...(state.products||[]),...(state.pastProducts||[])].find(p=>p.id===item.productId);
    return window.NextBonusBankBonusLedger?.isBankProduct?.(product,state)?tracking:null;
  }
  window.NextBonusBankPostOpenTasks=Object.freeze({
    isApplicationRequirement,visibleTask,visibleTasks,trackingForAttention
  });
})();
