(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('offer-detail',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;

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
