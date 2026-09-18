(() => {
  'use strict';

  const normalize=value=>String(value||'')
    .toLowerCase()
    .replace(/[®™℠]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim()
    .replace(/\s+/g,' ');

  function sourceFor(product){
    const root=window.NextBonusNonCreditProductFacts;
    if(!root||product?.type==='信用卡') return null;
    if(product.type==='银行和券商账户') return root.account;
    if(product.type==='会籍'||product.type==='其他') return root.membershipOther;
    return null;
  }

  function resolveFact(product){
    const data=sourceFor(product);
    if(!data) return null;
    for(const [key,fact] of Object.entries(data.products||{})){
      if((fact.productIds||[]).includes(product.id)) return {key,fact,version:data.version};
      if((fact.names||[]).map(normalize).includes(normalize(product.name))) return {key,fact,version:data.version};
    }
    return null;
  }

  function logoFor(product){
    const registry=window.NextBonusProductLogoRegistry;
    const registered=registry?.resolve?.(product.id||'',product.offerId||'',product.name||'')||'';
    if(registered) return registered;
    const byInstitution={
      'U.S. Bank':'assets/product-logos/usbank.png',
      'Truist':'assets/product-logos/truist.png',
      'Chase':'assets/product-logos/chase.png',
      'Wells Fargo':'assets/product-logos/wells-fargo.png',
      'Fidelity':'assets/product-logos/fidelity.png',
      'Robinhood':'assets/product-logos/robinhood.png',
      'HSBC':'assets/product-logos/hsbc.svg',
      'Moomoo':'assets/product-logos/moomoo.svg',
      'Hilton':'assets/product-logos/hilton.png',
      'IHG':'assets/product-logos/ihg.png',
      'Marriott':'assets/product-logos/marriott.png',
      'Hyatt':'assets/product-logos/hyatt.png',
      'Delta':'assets/product-logos/delta.png'
    };
    return byInstitution[product.institution]||'';
  }

  function titlesFor(fact){
    if(fact?.kind==='brokerage') return ['账户费用与收益','账户功能'];
    if(fact?.kind==='membership') return ['会籍信息','核心权益'];
    if(fact?.kind==='cashback') return ['平台信息','核心功能'];
    if(fact?.kind==='tool') return ['版本与费用','核心功能'];
    return ['账户信息','账户功能与权益'];
  }

  function dateLabelFor(product){
    if(product?.type==='会籍') return '获得日期';
    if(product?.type==='其他') return '开始使用日期';
    return '开户日期';
  }

  function isPrototypeDate(product){
    if(!product||String(product.id||'').startsWith('p-local-')) return false;
    if(product.type==='会籍'&&(product.opened==='2026-01-01'||product.opened==='2025-01-01')) return true;
    if(product.type==='其他'&&product.opened==='2024-01-01') return true;
    return false;
  }

  function build(product){
    if(!product||product.type==='信用卡') return null;
    const resolved=resolveFact(product);
    const fact=resolved?.fact||null;
    const titles=titlesFor(fact);
    return Object.freeze({
      product,
      resolved:!!resolved,
      factKey:resolved?.key||null,
      dataVersion:resolved?.version||null,
      kind:fact?.kind||null,
      logo:logoFor(product),
      dateLabel:dateLabelFor(product),
      opened:isPrototypeDate(product)?'':(product.opened||''),
      metricsTitle:titles[0],
      featuresTitle:titles[1],
      metrics:fact?.metrics||[],
      features:fact?.features||[],
      notice:resolved
        ? (fact.notice||'')
        : '美卡101当前没有足够明确、可直接对应这个产品的长期资料，因此这里不展示推测性的消费回报或福利。',
      sourceUrl:fact?.sourceUrl||null,
      sourceDate:fact?.sourceDate||null
    });
  }

  window.NextBonusNonCreditProductDetailModel=Object.freeze({
    normalize,
    resolveFact,
    logoFor,
    titlesFor,
    dateLabelFor,
    isPrototypeDate,
    build
  });
})();