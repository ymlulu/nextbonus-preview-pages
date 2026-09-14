(() => {
  'use strict';

  const categories = {
    '信用卡':[
      {id:'c-plat', offerId:'amex-platinum', name:'AMEX Platinum Card', institution:'American Express', art:'dark', cardImageLocal:'assets/product-art/amex-platinum.png'},
      {id:'c-gold', offerId:'amex-gold', name:'AMEX Gold Card', institution:'American Express', art:'gold', cardImageLocal:'assets/product-art/amex-gold.png'},
      {id:'c-csp', offerId:'chase-sapphire', name:'Chase Sapphire Preferred', institution:'Chase', art:'blue', cardImageLocal:'assets/product-art/chase-sapphire.png'},
      {id:'c-bilt', offerId:'bilt-palladium', name:'Bilt Palladium Card', institution:'Bilt', art:'purple', cardImageLocal:'assets/product-art/bilt-palladium.png'},
      {id:'c-vx', offerId:'capitalone-venturex', name:'Capital One Venture X', institution:'Capital One', art:'blue', cardImageLocal:'assets/product-art/capitalone-venturex.png'},
      {id:'c-citi-elite', offerId:'citi-strata', name:'Citi Strata Elite', institution:'Citi', art:'dark', cardImageLocal:'assets/product-art/citi-strata.png'}
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

  const frozenCategories = Object.freeze(Object.fromEntries(
    Object.entries(categories).map(([category, products]) => [
      category,
      Object.freeze(products.map(product => Object.freeze({...product})))
    ])
  ));

  const byId = Object.freeze(Object.fromEntries(
    Object.values(frozenCategories).flat().map(product => [product.id, product])
  ));

  window.NextBonusProductCatalog = frozenCategories;
  window.NextBonusProductRegistry = Object.freeze({
    schemaVersion: '1.0',
    categories: frozenCategories,
    byId,
    getById(id){ return byId[id] || null; },
    list(category){ return frozenCategories[category] || Object.freeze([]); }
  });
})();
