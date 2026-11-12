(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};
  const PAGE_SIZE=20;

  function build({state,offers}){
    const query=String(state.offerSearch||'').trim().toLowerCase();
    const categories=['全部',...new Set(offers.map(offer=>offer.category))];
    const category=categories.includes(state.offerCategory)?state.offerCategory:'全部';
    const items=offers.filter(offer=>
      (category==='全部'||offer.category===category) &&
      (!query||`${offer.name} ${offer.provider} ${offer.value} ${offer.requirement} ${offer.status||''} ${(offer.tags||[]).join(' ')}`.toLowerCase().includes(query))
    );
    const total=items.length;
    const pageCount=Math.max(1,Math.ceil(total/PAGE_SIZE));
    const requested=Number(state.offerPage);
    const page=Number.isSafeInteger(requested)&&requested>0?Math.min(requested,pageCount):1;
    const pageItems=items.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
    return Object.freeze({query,items,pageItems,page,pageCount,pageSize:PAGE_SIZE,total,categories,category});
  }

  root.discover=Object.freeze({build});
})();
