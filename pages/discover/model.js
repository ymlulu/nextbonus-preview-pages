(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function build({state,offers}){
    const query=String(state.offerSearch||'').trim().toLowerCase();
    const items=offers.filter(offer=>
      (state.offerCategory==='全部'||offer.category===state.offerCategory) &&
      (!query||`${offer.name} ${offer.provider} ${offer.value} ${offer.requirement} ${offer.status||''} ${(offer.tags||[]).join(' ')}`.toLowerCase().includes(query))
    );
    return Object.freeze({query,items});
  }

  root.discover=Object.freeze({build});
})();
