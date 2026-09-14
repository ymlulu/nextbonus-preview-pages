(() => {
  'use strict';

  // Stable product/entity facts only. Do not put temporary bonus values or deadlines here.
  const PRODUCTS = Object.freeze({
    'chase-sapphire': {id:'chase-sapphire', provider:'CHASE', name:'Chase Sapphire Preferred®', category:'信用卡', type:'credit-card', visualId:'chase-sapphire', logo:'assets/product-logos/chase.png'},
    'amex-gold': {id:'amex-gold', provider:'AMEX', name:'AMEX Gold Card', category:'信用卡', type:'credit-card', visualId:'amex-gold'},
    'amex-platinum': {id:'amex-platinum', provider:'AMEX', name:'AMEX Platinum Card', category:'信用卡', type:'credit-card', visualId:'amex-platinum'},
    'bilt-palladium': {id:'bilt-palladium', provider:'BILT', name:'Bilt Palladium Card', category:'信用卡', type:'credit-card', visualId:'bilt-palladium', logo:'assets/product-logos/bilt.png'},
    'capitalone-venturex': {id:'capitalone-venturex', provider:'Capital One', name:'Capital One Venture X', category:'信用卡', type:'credit-card', visualId:'capitalone-venturex'},
    'citi-strata': {id:'citi-strata', provider:'Citi', name:'Citi Strata Elite℠', category:'信用卡', type:'credit-card', visualId:'citi-strata'},

    'hsbc-checking': {id:'hsbc-checking', provider:'HSBC', name:'HSBC Premier Checking', category:'银行', type:'bank-account', visualId:'hsbc-checking', logo:'assets/product-logos/hsbc.svg'},
    'chase-checking': {id:'chase-checking', provider:'CHASE', name:'Chase Total Checking', category:'银行', type:'bank-account', visualId:'chase-checking', logo:'assets/product-logo-marks/chase.svg'},
    'usbank-checking': {id:'usbank-checking', provider:'U.S. BANK', name:'U.S. Bank Smartly® Checking', category:'银行', type:'bank-account', visualId:'usbank-checking', logo:'assets/product-logos/usbank.png'},
    'truist-checking': {id:'truist-checking', provider:'TRUIST', name:'Truist Checking', category:'银行', type:'bank-account', visualId:'truist-checking', logo:'assets/product-logos/truist.png'},

    'moomoo': {id:'moomoo', provider:'MOOMOO', name:'Moomoo Brokerage', category:'券商', type:'brokerage', visualId:'moomoo', logo:'assets/product-logos/moomoo.svg'},
    'robinhood': {id:'robinhood', provider:'ROBINHOOD', name:'Robinhood Gold', category:'券商', type:'brokerage', visualId:'robinhood', logo:'assets/product-logo-marks/robinhood.svg'},

    'cashback-deal': {id:'cashback-deal', provider:'TCB', name:'TopCashback 限时返现', category:'羊毛省钱', type:'deal', visualId:'topcashback', logo:'assets/product-logos/topcashback.png'},
    'travel-transfer': {id:'travel-transfer', provider:'POINTS', name:'MR → Flying Blue 转点活动', category:'旅行', type:'deal', visualId:'flying-blue', logo:'assets/product-logos/flying-blue.svg'},
    'amazon-gift': {id:'amazon-gift', provider:'AMAZON', name:'Amazon Mastercard Gift Card', category:'购物', type:'deal', visualId:'amazon', logo:'assets/product-logos/amazon.svg'},
    'panda-mobile': {id:'panda-mobile', provider:'PANDA', name:'Panda Mobile 新用户优惠', category:'生活', type:'deal', visualId:'panda', logo:'assets/product-logos/panda-mobile.svg'}
  });

  window.NextBonusOfferProducts = PRODUCTS;
})();
