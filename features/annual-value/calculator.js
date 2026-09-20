(() => {
  'use strict';

  const CONFIGS=Object.freeze({
    'amex-gold':Object.freeze({
      factKey:'amex-gold',
      pointValue:0.015,
      baselineRate:0.02,
      spendCategories:Object.freeze([
        Object.freeze({id:'dining',label:'餐饮',note:'餐厅、外卖等',multiplier:4,monthlyDefault:250,step:50}),
        Object.freeze({id:'supermarket',label:'美国超市',note:'符合条件的美国超市',multiplier:4,monthlyDefault:125,step:50})
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
    const quantified=[];
    const unquantified=[];
    (source.facts.benefits||[]).forEach((item,index)=>{
      const value=moneyNumber(item[0]);
      const row=Object.freeze({
        id:item[2]||`benefit-${index+1}`,
        title:item[0],
        short:item[1]||'',
        annualValue:value
      });
      if(value>0) quantified.push(row);
      else unquantified.push(row);
    });
    return {quantified,unquantified};
  }

  function defaultProfile(offerId){
    const source=factsFor(offerId);
    if(!source) return null;
    const benefits=benefitsFor(offerId).quantified;
    return {
      benefitUsage:Object.fromEntries(benefits.map(item=>[item.id,true])),
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
      const cardRate=category.multiplier*source.config.pointValue;
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
      pointValue:source.config.pointValue
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