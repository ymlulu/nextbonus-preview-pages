(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('products',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el){
        if(ctx.state.walletCardExpandedId && !event.target.closest?.('.credit-products .nb-wallet-card-stack')){
          ctx.state.walletCardExpandedId=null;
          return {render:true};
        }
        return false;
      }
      const action=el.dataset.action;
      if(action==='open-product'&&window.matchMedia?.('(max-width:780px)').matches){
        const creditCards=event.target.closest?.('.credit-products .nb-wallet-card-stack');
        if(creditCards){
          const id=el.dataset.id;
          if(ctx.state.walletCardExpandedId!==id){
            ctx.state.walletCardExpandedId=id;
            return {render:true,preventDefault:true};
          }
          ctx.state.walletCardExpandedId=null;
          return false;
        }
      }
      if(action==='open-add-product'){
        const model=window.NextBonusPageModels?.addProduct;
        if(!model) throw new Error('Add Product page model unavailable');
        ctx.state.addFlow=model.createFlow();
        ctx.renderApp?.();
        return {handled:true};
      }
      if(action==='wallet-toggle-past'){
        ctx.state.pastOpen=!ctx.state.pastOpen;
        return {render:true};
      }
      if(action==='toggle-product-section'){
        const type=el.dataset.type;
        ctx.state.productSectionExpanded=ctx.state.productSectionExpanded||{};
        ctx.state.productSectionExpanded[type]=!ctx.state.productSectionExpanded[type];
        ctx.state.productSortPicker=null;
        return {render:true};
      }
      if(action==='toggle-product-sort'){
        const type=el.dataset.type;
        ctx.state.productSortPicker=ctx.state.productSortPicker===type?null:type;
        return {render:true};
      }
      if(action==='product-sort'){
        const type=el.dataset.type;
        ctx.state.productSorts=ctx.state.productSorts||{};
        ctx.state.productSorts[type]=el.dataset.value;
        ctx.state.productSortPicker=null;
        return {render:true};
      }
      if(ctx.state.walletCardExpandedId && !event.target.closest?.('.credit-products .nb-wallet-card-stack')){
        ctx.state.walletCardExpandedId=null;
        return {render:true};
      }
      return false;
    }
  });
})();
