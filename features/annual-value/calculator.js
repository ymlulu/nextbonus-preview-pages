(() => {
  'use strict';

  function benefit(id,title,short,annualValue,defaultUsed=true){
    return Object.freeze({id,title,short,annualValue,defaultUsed});
  }

  function unquantified(id,title,short){
    return Object.freeze({id,title,short,annualValue:0});
  }

  function spend(id,label,note,multiplier,monthlyDefault=0,step=50,cashRate=0){
    return Object.freeze({id,label,note,multiplier,monthlyDefault,step,cashRate});
  }

  // Explicit per-card annual-value configuration.
  // Annual benefits are structured values; runtime must never infer annual value from display copy.
  const CONFIGS=Object.freeze({
    'amex-gold':Object.freeze({
      factKey:'amex-gold',
      pointValue:0.015,
      baselineRate:0.02,
      defaultSummary:'按常见消费和福利使用情况估算。',
      benefits:Object.freeze([
        benefit('amex-gold-uber','$120 Uber Credit','每月 $10',120),
        benefit('amex-gold-dunkin','$84 Dunkin 报销','每月 $7',84),
        benefit('amex-gold-resy','$100 Resy 报销','每半年 $50',100),
        benefit('amex-gold-dining','$120 Dining Credit','每月 $10',120)
      ]),
      unquantified:Object.freeze([
        unquantified('GOLD_Q8_HERTZ','Hertz Five Star','持卡赠送'),
        unquantified('GOLD_Q8_THC','The Hotel Collection','符合条件的连续两晚住宿含 $100 酒店 Credit 等')
      ]),
      spendCategories:Object.freeze([
        spend('dining','餐饮','餐厅、外卖等',4,250),
        spend('supermarket','美国超市','符合条件的美国超市',4,125)
      ])
    }),

    'chase-sapphire':Object.freeze({
      factKey:'chase-sapphire-preferred',
      pointValue:0.016,
      baselineRate:0.02,
      defaultSummary:'按可量化福利全部使用估算，未计入消费回报。',
      benefits:Object.freeze([
        benefit('CSP_Q7_HOTEL','每年 $100 Chase Travel 酒店 Credit','Chase Travel 酒店 Credit',100),
        benefit('CSP_Q7_GE','Global Entry / TSA PreCheck / NEXUS 报销','GE / TSA / NEXUS 报销',30)
      ]),
      unquantified:Object.freeze([
        unquantified('CSP_Q8_REWARDS','消费高倍返点','Chase Travel 5x；餐饮、流媒体、加油 / EV、共享住宿等 3x；其他旅行 2x'),
        unquantified('CSP_Q8_UR','Ultimate Rewards 转点','航空 / 酒店伙伴及 Chase Travel / Pay Yourself Back'),
        unquantified('CSP_Q8_RENTAL','主要租车保险','符合条件的租车可用'),
        unquantified('CSP_Q8_TRAVEL_PROTECTION','旅行保障','行程取消 / 延误、紧急撤离等')
      ]),
      spendCategories:Object.freeze([
        spend('chase-travel','Chase Travel','符合条件的 Chase Travel 消费',5),
        spend('dining','餐饮','餐厅、外卖等',3),
        spend('streaming','流媒体','符合条件的流媒体',3),
        spend('gas-ev','加油 / EV','符合条件的加油与充电',3),
        spend('shared-rental','共享住宿','符合条件的共享住宿',3),
        spend('other-travel','其他旅行','非 Chase Travel 的其他旅行',2)
      ])
    }),

    'amex-platinum':Object.freeze({
      factKey:'amex-platinum',
      pointValue:0.015,
      baselineRate:0.02,
      defaultSummary:'按可量化福利全部使用估算，未计入消费回报。',
      benefits:Object.freeze([
        benefit('PLAT_Q7_FHR','$600 FHR 酒店 Credit','FHR 酒店 Credit',600),
        benefit('PLAT_Q7_ENTERTAINMENT','$300 娱乐订阅 Credit','娱乐订阅 Credit',300),
        benefit('PLAT_Q7_EQUINOX','$300 Equinox Credit','Equinox Credit',300),
        benefit('PLAT_Q7_CLEAR','$209 CLEAR Credit','CLEAR Credit',209),
        benefit('PLAT_Q7_OURA','$200 Oura Ring Credit','Oura Ring Credit',200),
        benefit('PLAT_Q7_LULULEMON','$300 Lululemon Credit','Lululemon Credit',300),
        benefit('PLAT_Q7_RESY','$400 Resy Credit','Resy Credit',400),
        benefit('PLAT_Q7_WALMART','Walmart+ 月度会员报销','Walmart+',155.4),
        benefit('PLAT_Q7_AIRLINE','$200 航空杂费 Credit','航空杂费 Credit',200),
        benefit('PLAT_Q7_UBER','$200 Uber Credit + $100 Uber One','Uber / Uber One',300),
        benefit('PLAT_Q7_GE','Global Entry / TSA PreCheck 报销','GE / TSA 报销',30)
      ]),
      unquantified:Object.freeze([
        unquantified('PLAT_Q8_REWARDS','5x 机票 / 酒店','机票及部分 AMEX Travel 酒店 5x MR'),
        unquantified('PLAT_Q8_MR','Membership Rewards 转点','航空或酒店伙伴'),
        unquantified('PLAT_Q8_LOUNGE','机场休息室','Centurion Lounge、Priority Pass、Delta Sky Club 等'),
        unquantified('PLAT_Q8_HOTEL_STATUS','酒店会籍','Hilton Gold、Marriott Gold、Leaders Club Sterling 等'),
        unquantified('PLAT_Q8_FHR','FHR / THC 酒店待遇','酒店附加待遇'),
        unquantified('PLAT_Q8_RENTAL_STATUS','租车会籍','Avis、Hertz、National 等'),
        unquantified('PLAT_Q8_OFFERS','AMEX Offers','持卡人优惠'),
        unquantified('PLAT_Q8_PROTECTION','购物保障','延长保修、购物保护等')
      ]),
      spendCategories:Object.freeze([
        spend('airfare','机票','符合条件的机票消费',5),
        spend('prepaid-hotel','AMEX Travel 预付酒店','符合条件的预付酒店',5)
      ])
    }),

    'bilt-palladium':Object.freeze({
      factKey:'bilt-palladium',
      pointValue:0.016,
      baselineRate:0.02,
      defaultSummary:'按可量化福利全部使用估算，未计入消费回报。',
      benefits:Object.freeze([
        benefit('BILT_Q7_HOTEL','每年 $400 Bilt Travel 酒店 Credit','Bilt Travel 酒店 Credit',400),
        benefit('BILT_Q7_CASH','每年 $200 Bilt Cash','Bilt Cash',200)
      ]),
      unquantified:Object.freeze([
        unquantified('BILT_Q8_REWARDS','房租 / 消费返点','房租 / 房贷与其他消费返点'),
        unquantified('BILT_Q8_TRANSFER','Bilt 转点','航空或酒店伙伴'),
        unquantified('BILT_Q8_PP','Priority Pass','机场休息室'),
        unquantified('BILT_Q8_PHONE','手机保险','手机保险'),
        unquantified('BILT_Q8_LHC','Luxury Hotel Collection','Bilt Luxury Hotel Collection'),
        unquantified('BILT_Q8_EXPERIENCES','Rent Day / Bilt Experiences','会员活动与体验')
      ]),
      spendCategories:Object.freeze([
        spend('other-spend','其他消费','2x Bilt Points + 4% Bilt Cash',2,0,50,0.04)
      ])
    }),

    'capitalone-venturex':Object.freeze({
      factKey:'capitalone-venturex',
      pointValue:0.013,
      baselineRate:0.02,
      defaultSummary:'按可量化福利全部使用估算，未计入消费回报。',
      benefits:Object.freeze([
        benefit('VX_Q7_TRAVEL','每年 $300 Capital One Travel Credit','Capital One Travel Credit',300),
        benefit('VX_Q7_ANNIV','每年 10,000 周年里程','10,000 周年里程',130),
        benefit('VX_Q7_GE','Global Entry / TSA PreCheck 报销','GE / TSA 报销',30)
      ]),
      unquantified:Object.freeze([
        unquantified('VX_Q8_REWARDS','2x / Travel 高倍返点','所有消费 2x；Capital One Travel 最高 10x / 5x'),
        unquantified('VX_Q8_TRANSFER','Capital One 转点','航空伙伴'),
        unquantified('VX_Q8_LOUNGE','机场休息室','Priority Pass 与 Capital One Lounge'),
        unquantified('VX_Q8_HERTZ','Hertz President’s Circle','租车会籍'),
        unquantified('VX_Q8_PROTECTION','旅行 / 租车保障','其他旅行与租车保障')
      ]),
      spendCategories:Object.freeze([
        spend('general','其他消费','所有消费基础 2x',2),
        spend('travel-hotel-rental','Capital One Travel 酒店 / 租车','符合条件的 Capital One Travel 消费',10),
        spend('travel-airfare','Capital One Travel 机票','符合条件的 Capital One Travel 机票',5)
      ])
    }),

    'citi-strata':Object.freeze({
      factKey:'citi-strata-elite',
      pointValue:0.015,
      baselineRate:0.02,
      defaultSummary:'按可量化福利估算，未默认计入关系优惠和消费回报。',
      benefits:Object.freeze([
        benefit('CITI_Q7_HOTEL','每年 $300 Citi Travel 酒店 Credit','Citi Travel 酒店 Credit',300),
        benefit('CITI_Q7_SPLURGE','每年 $200 Splurge Credit','Splurge Credit',200),
        benefit('CITI_Q7_BLACKLANE','每年 $200 Blacklane Credit','Blacklane Credit',200),
        benefit('CITI_Q7_GE','Global Entry / TSA PreCheck 报销','GE / TSA 报销',30),
        benefit('CITI_Q7_REL','$145 Citigold / Private Client 年度关系 Credit','Citigold / Private Client Credit',145,false)
      ]),
      unquantified:Object.freeze([
        unquantified('CITI_Q8_REWARDS','消费高倍返点','Citi Travel 12x / 6x、周末晚餐饮 6x、其他餐饮 3x、其他消费 1.5x'),
        unquantified('CITI_Q8_AA','AA 转点','ThankYou Points 转 American Airlines'),
        unquantified('CITI_Q8_OTHER_TRANSFER','其他转点伙伴','航空或酒店伙伴'),
        unquantified('CITI_Q8_PP','Priority Pass','主卡可带 2 位客人'),
        unquantified('CITI_Q8_AA_PASS','Admirals Club Pass','每年 4 张'),
        unquantified('CITI_Q8_RESERVE','Reserve 酒店权益','The Reserve by Citi Travel'),
        unquantified('CITI_Q8_TRAVEL_PROTECTION','旅行保障','旅行保险 / 旅行保障')
      ]),
      spendCategories:Object.freeze([
        spend('citi-travel','Citi Travel 酒店 / 租车 / 活动','符合条件的 Citi Travel 消费',12),
        spend('airfare','机票','符合条件的机票消费',6),
        spend('weekend-dining','周五 / 周六晚餐饮','符合条件的餐饮消费',6),
        spend('dining','其他餐饮','其他符合条件的餐饮消费',3),
        spend('general','其他消费','其他符合条件的消费',1.5)
      ])
    })
  });

  function moneyNumber(value){
    const match=String(value||'').replace(/,/g,'').match(/\$\s*([0-9]+(?:\.[0-9]+)?)/);
    return match?Number(match[1]):0;
  }

  function factsFor(offerId){
    const config=CONFIGS[offerId];
    const facts=config&&window.NextBonusCreditCardProductFacts?.cards?.[config.factKey];
    return facts?{config,facts}:null;
  }

  function benefitsFor(offerId){
    const source=factsFor(offerId);
    if(!source) return {quantified:[],unquantified:[]};
    return {
      quantified:[...(source.config.benefits||[])],
      unquantified:[...(source.config.unquantified||[])]
    };
  }

  function defaultProfile(offerId){
    const source=factsFor(offerId);
    if(!source) return null;
    const benefits=benefitsFor(offerId).quantified;
    return {
      benefitUsage:Object.fromEntries(benefits.map(item=>[item.id,item.defaultUsed!==false])),
      monthlySpend:Object.fromEntries(source.config.spendCategories.map(item=>[item.id,item.monthlyDefault])),
      customized:false
    };
  }

  function normalizeProfile(offerId,profile){
    const base=defaultProfile(offerId);
    if(!base) return null;
    const source=factsFor(offerId);
    const result={
      benefitUsage:{...base.benefitUsage},
      monthlySpend:{...base.monthlySpend},
      customized:!!profile?.customized
    };
    for(const key of Object.keys(result.benefitUsage)){
      if(typeof profile?.benefitUsage?.[key]==='boolean') result.benefitUsage[key]=profile.benefitUsage[key];
    }
    for(const category of source.config.spendCategories){
      const raw=Number(profile?.monthlySpend?.[category.id]);
      if(Number.isFinite(raw)) result.monthlySpend[category.id]=Math.max(0,Math.round(raw));
    }
    return result;
  }

  function calculate(offerId,profile){
    const source=factsFor(offerId);
    if(!source) return null;
    const normalized=normalizeProfile(offerId,profile);
    const benefits=benefitsFor(offerId);
    const benefitRows=benefits.quantified.map(item=>({
      ...item,
      used:normalized.benefitUsage[item.id]!==false
    }));
    const fixedBenefits=Math.round(benefitRows.reduce((sum,item)=>sum+(item.used?item.annualValue:0),0));
    const spendRows=source.config.spendCategories.map(category=>{
      const monthly=Number(normalized.monthlySpend[category.id]||0);
      const cardRate=category.multiplier*source.config.pointValue+(Number(category.cashRate)||0);
      const incrementalRate=Math.max(0,cardRate-source.config.baselineRate);
      const annualExtra=Math.round(monthly*12*incrementalRate);
      return {...category,monthly,cardRate,incrementalRate,annualExtra};
    });
    const spendReturn=Math.round(spendRows.reduce((sum,item)=>sum+item.annualExtra,0));
    const fee=Math.round(moneyNumber(source.facts.fee));
    const total=fixedBenefits+spendReturn-fee;
    return Object.freeze({
      offerId,
      profile:normalized,
      benefits:benefitRows,
      unquantified:benefits.unquantified,
      spendRows,
      fixedBenefits,
      spendReturn,
      fee,
      total,
      baselineRate:source.config.baselineRate,
      pointValue:source.config.pointValue,
      defaultSummary:source.config.defaultSummary
    });
  }

  function draftFor(state,offerId){
    const existing=state?.annualValueDraft;
    if(existing?.offerId===offerId) return normalizeProfile(offerId,existing.profile);
    const saved=state?.annualValueProfiles?.[offerId];
    return normalizeProfile(offerId,saved||defaultProfile(offerId));
  }

  window.NextBonusAnnualValueCalculator=Object.freeze({
    configs:CONFIGS,
    factsFor,
    benefitsFor,
    defaultProfile,
    normalizeProfile,
    calculate,
    draftFor
  });
})();
