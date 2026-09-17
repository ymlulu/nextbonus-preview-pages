(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};
  const TYPES=Object.freeze(['信用卡','银行和券商账户','会籍','其他']);

  function build({state,activeAttentionSorted}){
    const query=String(state.productSearch||'').trim().toLowerCase();
    const current=state.products.filter(product=>
      !query||`${product.name} ${product.institution} ${product.instance}`.toLowerCase().includes(query)
    );
    const grouped=TYPES
      .map(type=>[type,current.filter(product=>product.type===type)])
      .filter(([,items])=>items.length);
    const allActive=activeAttentionSorted();
    return Object.freeze({query,current,grouped,allActive,top3:allActive.slice(0,3)});
  }

  root.wallet=Object.freeze({build,TYPES});
})();
