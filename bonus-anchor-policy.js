(() => {
  'use strict';

  const rules=window.NextBonusBonusTaskRules;
  if(rules?.buildPlan){
    const baseBuildPlan=rules.buildPlan.bind(rules);
    window.NextBonusBonusTaskRules=Object.freeze({
      ...rules,
      buildPlan(requirement,anchorDate,options){
        const plan=baseBuildPlan(requirement,anchorDate,options);
        if(anchorDate||!plan||(plan.needsAnchorDate!==true&&plan.hasRelativeDeadline!==true)) return plan;
        return {
          ...plan,
          needsAnchorDate:false,
          hasRelativeDeadline:false,
          unresolvedAnchorDate:true,
          dueDate:null,
          tasks:Array.isArray(plan.tasks)?plan.tasks.map(task=>({...task,dueDate:null})):[]
        };
      }
    });
  }

  const lifecycle=window.NextBonusProductLifecycleCore;
  if(!lifecycle?.createBonusTracking) return;
  const baseCreate=lifecycle.createBonusTracking.bind(lifecycle);
  function createBonusTracking(state,spec={}){
    const result=baseCreate(state,spec);
    if(spec.requirement&&!spec.anchorDate&&result?.attention&&!result.attention.dueDate){
      const isCard=(spec.category||state.products?.find(item=>item.id===spec.productId)?.type)==='信用卡';
      result.attention.time='截止日期暂时无法计算';
      result.attention.keySub=`补充${isCard?'开卡':'开户'}日期后自动计算`;
      result.attention.summary=`奖励条件已经保存。补充${isCard?'开卡':'开户'}日期后，NextBonus 会自动计算截止日期。`;
      const tracking=(state.offerTrackings||[]).find(item=>item.id===result.trackingId);
      if(tracking){
        tracking.requirement=spec.requirement;
        tracking.deadlineStatus='needs_anchor_date';
      }
    }
    return result;
  }
  window.NextBonusProductLifecycleCore=Object.freeze({...lifecycle,createBonusTracking});
})();
