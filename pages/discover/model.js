(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function build({state,offers}){
    const query=String(state.offerSearch||'').trim().toLowerCase();
    const categories=['全部',...new Set(offers.map(offer=>offer.category))];
    const category=categories.includes(state.offerCategory)?state.offerCategory:'全部';
    const items=offers.filter(offer=>
      (category==='全部'||offer.category===category) &&
      (!query||`${offer.name} ${offer.provider} ${offer.value} ${offer.requirement} ${offer.status||''} ${(offer.tags||[]).join(' ')}`.toLowerCase().includes(query))
    );
    return Object.freeze({query,items,categories,category});
  }

  root.discover=Object.freeze({build});
})();
