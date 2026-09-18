(() => {
  'use strict';

  const OFFER_KEYS=Object.freeze({
    'amex-platinum':'amex-platinum',
    'amex-gold':'amex-gold',
    'chase-sapphire':'chase-sapphire-preferred',
    'bilt-palladium':'bilt-palladium',
    'capitalone-venturex':'capitalone-venturex',
    'citi-strata':'citi-strata-elite'
  });
  const PRODUCT_KEYS=Object.freeze({
    'p-hilton-aspire-2308':'hilton-aspire',
    'p-csr-2948':'chase-sapphire-reserve',
    'p-marriott-brilliant-6503':'marriott-brilliant',
    'p-amex-biz-4321':'amex-blue-business-plus',
    'p-freedom-7182':'chase-freedom-unlimited',
    'p-citi-3490':'citi-double-cash'
  });
  const NAME_KEYS=Object.freeze({
    'amex platinum':'amex-platinum',
    'amex platinum card':'amex-platinum',
    'amex gold':'amex-gold',
    'amex gold card':'amex-gold',
    'chase sapphire preferred':'chase-sapphire-preferred',
    'bilt palladium card':'bilt-palladium',
    'capital one venture x':'capitalone-venturex',
    'citi strata elite':'citi-strata-elite',
    'hilton aspire':'hilton-aspire',
    'chase sapphire reserve':'chase-sapphire-reserve',
    'marriott bonvoy brilliant':'marriott-brilliant',
    'amex business plus':'amex-blue-business-plus',
    'blue business plus':'amex-blue-business-plus',
    'chase freedom unlimited':'chase-freedom-unlimited',
    'citi double cash':'citi-double-cash'
  });

  function normalize(value){
    return String(value||'')
      .toLowerCase()
      .replace(/[®™℠]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .trim()
      .replace(/\s+/g,' ');
  }

  function factKey(product){
    if(product?.type!=='信用卡') return null;
    return OFFER_KEYS[product.offerId]||PRODUCT_KEYS[product.id]||NAME_KEYS[normalize(product.name)]||null;
  }

  function factsFor(product){
    const key=factKey(product);
    const root=window.NextBonusCreditCardProductFacts;
    return key&&root?.cards?.[key]?{key,data:root.cards[key],version:root.version}:null;
  }

  function enrich(product){
    const facts=factsFor(product);
    if(!facts) return product;
    return Object.freeze({
      ...product,
      annualFee:facts.data.fee,
      earning:facts.data.earning,
      benefits:facts.data.benefits.map((item,index)=>Object.freeze({
        id:`nb-${facts.key}-${index+1}`,
        title:item[0],
        short:item[1],
        benefitId:item[2]||null,
        cycleType:item[3]||null
      })),
      productDetailDataVersion:facts.version
    });
  }

  function normalizeText(value){
    return String(value||'')
      .toLowerCase()
      .replace(/[®™℠]/g,'')
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g,'');
  }

  function legacyBenefitMatch(item,title,productId){
    if(item?.productId!==productId||item?.type!=='benefit') return false;
    const needle=normalizeText(title);
    const haystack=normalizeText(`${item.action||''} ${item.key||''} ${item.secondary||''}`);
    if(needle.length>=4&&(haystack.includes(needle)||needle.includes(haystack))) return true;
    const aliases=[
      [/Uber/i,/Uber/i],[/Saks/i,/Saks/i],[/CLEAR/i,/CLEAR/i],
      [/Global Entry|TSA/i,/Global Entry|TSA/i],[/Hilton/i,/Hilton/i],
      [/Marriott/i,/Marriott/i],[/高级租车保障|租车/i,/租车/i],
      [/行程延误险|行程延误/i,/行程延误/i],[/购物保障/i,/购物保障/i],
      [/退货保障/i,/退货保障/i]
    ];
    const pair=aliases.find(([pattern])=>pattern.test(title));
    return pair?pair[1].test(`${item.action||''} ${item.key||''} ${item.secondary||''}`):false;
  }

  function matchingAttention(state,product,benefit,cycleInfo){
    const items=Array.isArray(state?.activeAttention)?state.activeAttention:[];
    if(benefit.cycleType==='cardmember-year'&&!product.opened&&!cycleInfo) return null;
    const identity=cycleInfo?.window
      ? {productId:product.id,benefitId:benefit.benefitId,cycleId:cycleInfo.window.id}
      : null;
    return window.NextBonusBenefitAttention?.matchingBenefitAttention(
      items,
      identity,
      item=>legacyBenefitMatch(item,benefit.title,product.id)
    )||null;
  }

  function dateOnly(value){
    if(!value) return null;
    const date=new Date(`${String(value).slice(0,10)}T00:00:00`);
    return Number.isNaN(date.getTime())?null:date;
  }

  function daysUntil(value){
    const due=dateOnly(value);
    if(!due) return null;
    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    return Math.ceil((due.getTime()-today.getTime())/86400000);
  }

  function urgency(days){
    if(days===null) return 'calm';
    if(days<=7) return 'urgent';
    if(days<=30) return 'warning';
    return 'calm';
  }

  function dueLabel(attention){
    const due=dateOnly(attention?.dueDate);
    if(due) return `Due ${due.getMonth()+1}月${due.getDate()}日`;
    const raw=String(attention?.time||'').replace(/^本期截止\s*/u,'').replace(/^截止\s*/u,'').trim();
    return raw?`Due ${raw}`:'Due';
  }

  function benefitView(ctx,product,benefit){
    const cycleInfo=window.NextBonusBenefitCycleState?.current?.(product,benefit)||null;
    const attention=matchingAttention(ctx.state,product,benefit,cycleInfo);
    return Object.freeze({
      ...benefit,
      cycleInfo,
      attention,
      dueTone:urgency(daysUntil(attention?.dueDate)),
      dueLabel:attention?dueLabel(attention):''
    });
  }

  function bonuses(state,productId){
    return (Array.isArray(state?.activeAttention)?state.activeAttention:[])
      .filter(item=>item.productId===productId&&item.type==='bonus')
      .sort((a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')));
  }

  function build(ctx,product){
    if(product?.type!=='信用卡') return null;
    const viewProduct=enrich(product);
    const benefitViews=(viewProduct.benefits||[]).map(item=>benefitView(ctx,viewProduct,item));
    const bonusItems=bonuses(ctx.state,viewProduct.id);
    const contact=viewProduct.id==='p-amex-plat-1005'
      ? {
          phone:viewProduct.phone||'1-800-525-3355',
          loginUrl:viewProduct.loginUrl||'https://www.americanexpress.com/en-US/account/login?COUNTRY_CODE=US'
        }
      : {phone:viewProduct.phone||null,loginUrl:viewProduct.loginUrl||null};
    return Object.freeze({product:viewProduct,benefits:benefitViews,bonuses:bonusItems,contact});
  }

  window.NextBonusCreditCardProductDetailModel=Object.freeze({
    factKey,
    factsFor,
    enrich,
    legacyBenefitMatch,
    matchingAttention,
    benefitView,
    bonuses,
    build,
    daysUntil,
    urgency
  });
})();