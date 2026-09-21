(() => {
  'use strict';

  function offerChoicesFor(prod){
    const source=prod?.offerId||null;
    const offer=source?window.NextBonusOfferData?.[source]:null;
    if(!source||!offer) return {status:'unsupported',choices:[]};

    const current={
      id:`current-${source}`,
      kind:'current',
      sourceOfferId:source,
      sourceOfferChoiceId:`current-${source}`,
      offerVersionId:offer.offerVersionId||`preview-current:${source}`,
      value:String(offer.primaryValue||''),
      req:String(offer.primaryRequirement||''),
      dateLabel:'当前公开'
    };
    const history=window.NextBonusReviewedOfferHistory;
    const result=history?.cached?.(source)||null;
    const duplicate=value=>String(value||'').toLowerCase().replace(/\s+/g,' ').trim();
    const reviewed=(result?.choices||[])
      .filter(choice=>!(
        duplicate(choice.value)===duplicate(current.value) &&
        duplicate(choice.requirement)===duplicate(current.req)
      ))
      .map(choice=>({
        id:choice.id,
        kind:'reviewed',
        sourceOfferId:source,
        sourceOfferChoiceId:choice.id,
        offerVersionId:`reviewed:${choice.id}`,
        value:choice.value,
        req:choice.requirement,
        dateLabel:choice.dateLabel
      }));

    return {
      status:result?.status||(history?.isSupported?.(source)?'loading':'unsupported'),
      choices:[current,...reviewed]
    };
  }

  const RECENT_REWARD_MONTHS=6;

  function monthIndex(value){
    const match=String(value||'').match(/^(\d{4})-(\d{2})/);
    if(!match) return null;
    const month=Number(match[2]);
    if(month<1||month>12) return null;
    return Number(match[1])*12+(month-1);
  }

  function recentChoices(choices,now=new Date()){
    const currentMonth=now.getFullYear()*12+now.getMonth();
    const firstMonth=currentMonth-(RECENT_REWARD_MONTHS-1);
    return (choices||[]).filter(choice=>{
      if(choice?.kind==='current') return true;
      const month=monthIndex(choice?.dateLabel);
      return month!==null&&month>=firstMonth&&month<=currentMonth;
    });
  }

  function displayRewardValue(value){
    const raw=String(value||'').trim();
    const withoutHighest=raw.replace(/^最高\s*/,'').trim();
    const match=withoutHighest.match(/^AS\s+HIGH\s+AS\s+([\d,.]+(?:\.\d+)?)\s*([Kk])?\s*(MR|UR|TYP|MILES?|POINTS?)$/i);
    if(!match) return withoutHighest||raw;
    const numeric=Number(match[1].replace(/,/g,''));
    if(!Number.isFinite(numeric)) return withoutHighest||raw;
    const amount=match[2] ? numeric*1000 : numeric;
    return `${Math.round(amount).toLocaleString('en-US')} ${match[3].toUpperCase()}`;
  }

  function displayRewardRequirement(requirement){
    const raw=String(requirement||'').trim();
    let match=raw.match(/^\$([\d,.]+)\s*\/\s*(\d+)\s*months?$/i);
    if(match) return `${match[2]} 个月内消费 ${match[1]}`;
    match=raw.match(/^spend\s+\$([\d,.]+)\s+(?:in|within)\s+(\d+)\s*months?$/i);
    if(match) return `${match[2]} 个月内消费 ${match[1]}`;
    return raw;
  }

  function displayRewardLabel(choice){
    const value=displayRewardValue(choice?.value);
    const requirement=displayRewardRequirement(choice?.req);
    return requirement?`${value} · ${requirement}`:value;
  }

  function visibleChoices(choices,now=new Date()){
    const seen=new Set();
    return recentChoices(choices,now).filter(choice=>{
      const key=displayRewardLabel(choice).toLowerCase();
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function resolveOfferChoice(prod,choiceId){
    if(!prod?.offerId||!choiceId||choiceId==='manual') return null;
    return offerChoicesFor(prod).choices.find(choice=>choice.id===choiceId)||null;
  }

  async function ensureReviewedOfferHistory(prod){
    const offerId=prod?.offerId;
    const history=window.NextBonusReviewedOfferHistory;
    if(!offerId||!history?.isSupported?.(offerId)||history.cached?.(offerId)) return;
    await history.load(offerId);
  }

  window.NextBonusBonusOfferChoice=Object.freeze({
    RECENT_REWARD_MONTHS,
    offerChoicesFor,
    recentChoices,
    visibleChoices,
    displayRewardValue,
    displayRewardRequirement,
    displayRewardLabel,
    resolveOfferChoice,
    ensureReviewedOfferHistory
  });
})();
