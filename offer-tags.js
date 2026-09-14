(() => {
  'use strict';

  // Registry controls display copy and semantic slot. Cards store tag IDs, never arbitrary UI text.
  const TAGS = Object.freeze({
    new_offer:{slot:'status',label:'新奖励'},
    limited_boost:{slot:'status',label:'限时加码'},
    ending_soon:{slot:'status',label:'即将结束'},
    ends_today:{slot:'status',label:'今日截止'},
    returning:{slot:'status',label:'活动回归'},
    extended:{slot:'status',label:'已延长'},

    high_bonus:{slot:'value',label:'高额奖励'},
    high_cashback:{slot:'value',label:'高额返现'},
    high_yield:{slot:'value',label:'高息账户'},
    transfer_bonus:{slot:'value',label:'转点'},
    shopping:{slot:'value',label:'购物'},
    telecom:{slot:'value',label:'通信'},

    travel_card:{slot:'attribute',label:'旅行神卡'},
    dining_card:{slot:'attribute',label:'餐饮神卡'},
    everyday:{slot:'attribute',label:'日常消费'},
    bank_account:{slot:'attribute',label:'银行账户'},
    brokerage:{slot:'attribute',label:'券商账户'},
    limited:{slot:'attribute',label:'限时'},
    travel:{slot:'attribute',label:'旅行'},
    gift_card:{slot:'attribute',label:'Gift Card'},
    new_user:{slot:'attribute',label:'新用户'}
  });

  window.NextBonusOfferTags = TAGS;
})();
