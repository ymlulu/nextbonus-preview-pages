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
      {id:'b-usbank', bankProductId:'us-bank/smartly-checking', offerId:'usbank-checking', name:'U.S. Bank Smartly Checking', institution:'U.S. Bank', art:'bank'},
      {id:'b-hsbc', bankProductId:null, offerId:'hsbc-checking', name:'HSBC Premier Checking', institution:'HSBC', art:'bank'},
      {id:'b-truist', bankProductId:'truist/truist-one-checking', offerId:'truist-checking', name:'Truist One Checking', institution:'Truist', art:'bank'}
    ],
    '券商账户':[
      {id:'br-moomoo', offerId:'moomoo', name:'Moomoo Brokerage', institution:'Moomoo', art:'bank'},
      {id:'br-robinhood', offerId:'robinhood', name:'Robinhood Brokerage', institution:'Robinhood', art:'bank'},
      {id:'br-tradeup', name:'TradeUP Brokerage', institution:'TradeUP', art:'bank'}
    ],
    '会籍':[
      {id:'m-hilton-gold', name:'Hilton Honors Gold Status', institution:'Hilton', subtype:'等级', art:'bank'},
      {id:'m-hilton-diamond', name:'Hilton Honors Diamond Status', institution:'Hilton', subtype:'等级', art:'bank'},
      {id:'m-hyatt', name:'World of Hyatt Globalist', institution:'Hyatt', subtype:'等级', art:'bank'}
    ]
  };

  const typeForCategory = category => category === '信用卡' ? '信用卡' : category === '会籍' ? '会籍' : '银行和券商账户';

  function withCanonicalArt(category, product){
    const asset = window.NextBonusProductArtRegistry?.resolveProduct?.({...product, type:typeForCategory(category)});
    if(!asset) return {...product};
    return {...product, cardImageLocal:asset.web || asset.local || undefined, cardArtKey:asset.key || undefined};
  }

  const catalog = Object.fromEntries(
    Object.entries(categories).map(([category, products]) => [
      category,
      Object.freeze(products.map(product => Object.freeze(withCanonicalArt(category, product))))
    ])
  );

  let byId = Object.freeze({});
  function rebuildIndex(){
    byId=Object.freeze(Object.fromEntries(
      Object.values(catalog).flat().map(product=>[product.id,product])
    ));
  }
  const legacyCreditCards=catalog['信用卡'];
  function replaceCreditProducts(cards){
    catalog['信用卡']=Object.freeze([
      ...legacyCreditCards,
      ...(cards||[]).filter(card=>card?.status==='published').map(card=>Object.freeze(withCanonicalArt('信用卡',{
        id:'cc-wp:'+card.slug,name:card.name,institution:card.issuer||'信用卡',
        art:'bank',cardImageLocal:card.imageUrl||undefined
      })))
    ]);
    rebuildIndex();
  }
  function replaceBankProducts(products){
    catalog['银行账户']=Object.freeze(
      (products||[]).map(product=>Object.freeze(withCanonicalArt('银行账户',product)))
    );
    rebuildIndex();
  }
  rebuildIndex();

  window.NextBonusProductCatalog = catalog;
  window.NextBonusProductRegistry = Object.freeze({
    schemaVersion: '1.2',
    categories: catalog,
    get byId(){ return byId; },
    getById(id){ return byId[id] || null; },
    list(category){ return catalog[category] || Object.freeze([]); },
    bankCatalogState(){ return window.NextBonusBankProductCatalog?.getState?.()||null; },
    retryBankCatalog(){ return window.NextBonusBankProductCatalog?.retry?.(); }
  });

  const cardCatalog=window.NextBonusCreditCardsCatalog;
  if(cardCatalog){
    replaceCreditProducts(cardCatalog.products());
    cardCatalog.subscribe(({cards})=>{
      replaceCreditProducts(cards);
      window.dispatchEvent?.(new CustomEvent('nextbonus:product-catalog-updated'));
    });
    void cardCatalog.load();
  }
  const bankCatalog=window.NextBonusBankProductCatalog;
  if(bankCatalog){
    bankCatalog.prime(catalog['银行账户']);
    replaceBankProducts(bankCatalog.list());
    bankCatalog.subscribe(({products})=>{
      replaceBankProducts(products);
      window.dispatchEvent?.(new CustomEvent('nextbonus:product-catalog-updated'));
    });
    void bankCatalog.load();
  }
})();
