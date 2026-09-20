(() => {
  'use strict';

  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('offer-detail',{
    click({event,ctx}){
      if(ctx.state.offerDetailTask==='assessment'){
        const handled=window.NextBonusAssessmentPage?.handleClick?.({event,ctx});
        if(handled) return handled;
      }

      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;

      if(action==='annual-value-toggle'){
        ctx.state.offerAnnualValueExpanded=!ctx.state.offerAnnualValueExpanded;
        return {render:true};
      }
      if(action==='annual-value-customize'){
        const calculator=window.NextBonusAnnualValueCalculator;
        const offerId=ctx.state.currentOfferId;
        const profile=calculator?.draftFor?.(ctx.state,offerId);
        if(!profile) return {handled:true};
        ctx.state.annualValueDraft={offerId,profile};
        ctx.state.offerDetailTask='annual-value';
        return {render:true};
      }
      if(action==='annual-value-cancel'){
        ctx.state.annualValueDraft=null;
        ctx.state.offerDetailTask=null;
        return {render:true};
      }
      if(action==='annual-benefit-toggle'){
        const draft=ctx.state.annualValueDraft;
        if(!draft?.profile) return {handled:true};
        draft.profile.benefitUsage={...draft.profile.benefitUsage,[el.dataset.benefit]:el.dataset.value==='1'};
        return {render:true};
      }
      if(action==='annual-value-done'){
        const draft=ctx.state.annualValueDraft;
        const calculator=window.NextBonusAnnualValueCalculator;
        if(!draft?.offerId||!draft?.profile||!calculator) return {handled:true};
        const normalized=calculator.normalizeProfile(draft.offerId,{...draft.profile,customized:true});
        ctx.state.annualValueProfiles={...(ctx.state.annualValueProfiles||{}),[draft.offerId]:normalized};
        ctx.state.annualValueDraft=null;
        ctx.state.offerDetailTask=null;
        ctx.state.offerAnnualValueExpanded=true;
        ctx.persist?.();
        return {render:true};
      }
      if(action==='assessment-start'||action==='assessment-report'){
        const supported=!!window.NextBonusAssessmentContract?.supported?.(ctx.state.currentOfferId);
        if(!supported) return {handled:true};
        if(!ctx.state.loggedIn){
          ctx.openLogin?.('offer-detail',{type:'assessment',offerId:ctx.state.currentOfferId,view:action==='assessment-report'?'report':null},'offer-detail');
          return {handled:true};
        }
        void window.NextBonusAssessmentPage?.start?.(ctx,{restart:false,view:action==='assessment-report'?'report':null});
        return {handled:true};
      }
      if(action==='assessment-restart'){
        if(window.NextBonusAssessmentContract?.supported?.(ctx.state.currentOfferId)){
          void window.NextBonusAssessmentPage?.start?.(ctx,{restart:true});
        }
        return {handled:true};
      }
      if(action==='poster'){
        ctx.state.posterIndex=Number(el.dataset.index);
        return {render:true};
      }
      return false;
    },
    input({event,ctx}){
      if(ctx.state.offerDetailTask==='assessment'){
        const handled=window.NextBonusAssessmentPage?.handleInput?.({event,ctx});
        if(handled) return handled;
      }
      return false;
    },
    change({event,ctx}){
      const el=event.target.closest?.('[data-action="annual-spend-input"]');
      if(!el) return false;
      const draft=ctx.state.annualValueDraft;
      if(!draft?.profile) return {handled:true};
      const value=Math.max(0,Math.round(Number(el.value)||0));
      draft.profile.monthlySpend={...draft.profile.monthlySpend,[el.dataset.category]:value};
      return {render:true,focusId:el.id};
    }
  });
})();
