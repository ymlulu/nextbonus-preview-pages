(() => {
  'use strict';

  const categories = {
    '信用卡':[
      {id:'c-plat', offerId:'amex-platinum', name:'AMEX Platinum Card', institution:'American Express', art:'dark'},
      {id:'c-gold', offerId:'amex-gold', name:'AMEX Gold Card', institution:'American Express', art:'gold'},
      {id:'c-csp', offerId:'chase-sapphire', name:'Chase Sapphire Preferred', institution:'Chase', art:'blue'},
      {id:'c-bilt', offerId:'bilt-palladium', name:'Bilt Palladium Card', institution:'Bilt', art:'purple'},
      {id:'c-vx', offerId:'capitalone-venturex', name:'Capital One Venture X', institution:'Capital One', art:'blue'},
      {id:'c-citi-elite', offerId:'citi-strata', name:'Citi Strata Elite', institution:'Citi', art:'dark'}
    ],
    '银行账户':[
      {id:'b-usbank', offerId:'usbank-checking', name:'U.S. Bank Smartly Checking', institution:'U.S. Bank', art:'bank'},
      {id:'b-hsbc', offerId:'hsbc-checking', name:'HSBC Premier Checking', institution:'HSBC', art:'bank'},
      {id:'b-truist', offerId:'truist-checking', name:'Truist One Checking', institution:'Truist', art:'bank'}
    ],
    '券商账户':[
      {id:'br-moomoo', offerId:'moomoo', name:'Moomoo Brokerage', institution:'Moomoo', art:'bank'},
      {id:'br-robinhood', offerId:'robinhood', name:'Robinhood Brokerage', institution:'Robinhood', art:'bank'},
      {id:'br-tradeup', name:'TradeUP Brokerage', institution:'TradeUP', art:'bank'}
    ],
    '其他':[
      {id:'m-hilton-gold', name:'Hilton Honors Gold Status', institution:'Hilton', subtype:'等级', art:'bank'},
      {id:'m-hilton-diamond', name:'Hilton Honors Diamond Status', institution:'Hilton', subtype:'等级', art:'bank'},
      {id:'m-hyatt', name:'World of Hyatt Globalist', institution:'Hyatt', subtype:'等级', art:'bank'}
    ]
  };

  const typeForCategory = category => category === '信用卡' ? '信用卡' : category === '其他' ? '会籍' : '银行和券商账户';

  function withCanonicalArt(category, product){
    const asset = window.NextBonusProductArtRegistry?.resolveProduct?.({...product, type:typeForCategory(category)});
    if(!asset) return {...product};
    return {...product, cardImageLocal:asset.web || asset.local || undefined, cardArtKey:asset.key || undefined};
  }

  const frozenCategories = Object.freeze(Object.fromEntries(
    Object.entries(categories).map(([category, products]) => [
      category,
      Object.freeze(products.map(product => Object.freeze(withCanonicalArt(category, product))))
    ])
  ));

  const byId = Object.freeze(Object.fromEntries(
    Object.values(frozenCategories).flat().map(product => [product.id, product])
  ));

  window.NextBonusProductCatalog = frozenCategories;
  window.NextBonusProductRegistry = Object.freeze({
    schemaVersion: '1.1',
    categories: frozenCategories,
    byId,
    getById(id){ return byId[id] || null; },
    list(category){ return frozenCategories[category] || Object.freeze([]); }
  });
})();
