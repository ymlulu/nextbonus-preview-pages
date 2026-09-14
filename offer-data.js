(() => {
  'use strict';

  // Canonical current Offer facts for the Preview runtime.
  // This is the only Preview layer that owns changing value / requirement / status / tag selections.
  const OFFERS = Object.freeze({
    'chase-sapphire': {productId:'chase-sapphire', primaryValue:'75,000 UR', primaryRequirement:'3 个月内消费 $5,000', statusTag:null, valueTag:'high_bonus', attributeTag:'travel_card', applyUrl:'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred'},
    'amex-gold': {productId:'amex-gold', primaryValue:'最高 100,000 MR', primaryRequirement:'6 个月内消费 $4,000', statusTag:'new_offer', valueTag:'high_bonus', attributeTag:'dining_card', applyUrl:'https://www.americanexpress.com/us/credit-cards/card/gold-card/'},
    'amex-platinum': {productId:'amex-platinum', primaryValue:'最高 175,000 MR', primaryRequirement:'6 个月内消费 $12,000', statusTag:'new_offer', valueTag:'high_bonus', attributeTag:'travel_card', applyUrl:'https://www.americanexpress.com/us/credit-cards/card/platinum/'},
    'bilt-palladium': {productId:'bilt-palladium', primaryValue:'50,000 points + $300 Bilt Cash', primaryRequirement:'3 个月内消费 $4,000', statusTag:null, valueTag:'high_bonus', attributeTag:'everyday', applyUrl:'https://www.bilt.com/card/palladium'},
    'capitalone-venturex': {productId:'capitalone-venturex', primaryValue:'75,000 miles', primaryRequirement:'6 个月内消费 $4,000', statusTag:null, valueTag:'high_bonus', attributeTag:'travel_card', applyUrl:'https://www.capitalone.com/credit-cards/venture-x/'},
    'citi-strata': {productId:'citi-strata', primaryValue:'75,000 TYP', primaryRequirement:'3 个月内消费 $6,000', statusTag:null, valueTag:'high_bonus', attributeTag:'travel_card', applyUrl:'https://www.citi.com/credit-cards/citi-strata-elite-credit-card/apply'},

    'hsbc-checking': {productId:'hsbc-checking', primaryValue:'最高 $3,000', primaryRequirement:'$50,000+ 新资金 / 合格资产 · 保持 3 个完整自然月', statusTag:null, valueTag:'high_bonus', attributeTag:'bank_account'},
    'chase-checking': {productId:'chase-checking', primaryValue:'$400', primaryRequirement:'90 天内 Direct Deposit $1,000', statusTag:null, valueTag:'high_bonus', attributeTag:'bank_account'},
    'usbank-checking': {productId:'usbank-checking', primaryValue:'最高 $450', primaryRequirement:'90 天内至少 2 次 DD · 总额 $2,000+', statusTag:null, valueTag:'high_bonus', attributeTag:'bank_account'},
    'truist-checking': {productId:'truist-checking', primaryValue:'$500', primaryRequirement:'120 天内 DD $2,000 + 20 次 Debit Card 消费', statusTag:null, valueTag:'high_bonus', attributeTag:'bank_account'},

    'moomoo': {productId:'moomoo', primaryValue:'最高 $1,000 NVDA', primaryRequirement:'按入金档位保持资产 60–180 天', statusTag:'limited_boost', valueTag:'high_bonus', attributeTag:'brokerage'},
    'robinhood': {productId:'robinhood', primaryValue:'4.75% APY', primaryRequirement:'Gold 会员适用', statusTag:'extended', valueTag:'high_yield', attributeTag:'brokerage'},

    'cashback-deal': {productId:'cashback-deal', primaryValue:'最高 120% 返现', primaryRequirement:'仅限符合条件的新用户', statusTag:'limited_boost', valueTag:'high_cashback', attributeTag:'limited'},
    'travel-transfer': {productId:'travel-transfer', primaryValue:'30% 转点加成', primaryRequirement:'9 月 30 日前完成转点', statusTag:'ending_soon', valueTag:'transfer_bonus', attributeTag:'travel'},
    'amazon-gift': {productId:'amazon-gift', primaryValue:'最高 $100', primaryRequirement:'符合条件账户可见', statusTag:'returning', valueTag:'shopping', attributeTag:'gift_card'},
    'panda-mobile': {productId:'panda-mobile', primaryValue:'首月低至 $10', primaryRequirement:'仅限新客户', statusTag:'new_offer', valueTag:'telecom', attributeTag:'new_user'}
  });

  window.NextBonusOfferData = OFFERS;
})();
