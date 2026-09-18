(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('offer-detail',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;

      if(action==='assessment-start'){
        const supported=!!window.NextBonusAssessmentContract?.supported?.(ctx.state.currentOfferId);
        if(!supported) return {handled:true};
        if(!ctx.state.loggedIn){
          ctx.openLogin?.('offer-detail',{type:'assessment',offerId:ctx.state.currentOfferId},'offer-detail');
          return {handled:true};
        }
        void window.NextBonusAssessmentPage?.open?.(ctx,{restart:false});
        return {handled:true};
      }
      if(action==='assessment-restart'){
        if(window.NextBonusAssessmentContract?.supported?.(ctx.state.currentOfferId)){
          void window.NextBonusAssessmentPage?.open?.(ctx,{restart:true});
        }
        return {handled:true};
      }
      if(action==='poster'){
        ctx.state.posterIndex=Number(el.dataset.index);
        return {render:true};
      }
      if(action==='poster-step'){
        ctx.state.posterIndex=((ctx.state.posterIndex||0)+Number(el.dataset.dir)+2)%2;
        return {render:true};
      }
      return false;
    }
  });
})();
