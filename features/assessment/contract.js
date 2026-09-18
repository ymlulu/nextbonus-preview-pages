(() => {
  'use strict';

  const PRODUCT_MAP=Object.freeze({
    'chase-sapphire':'chase_sapphire_preferred',
    'amex-gold':'amex_gold',
    'amex-platinum':'amex_platinum',
    'bilt-palladium':'bilt_palladium',
    'capitalone-venturex':'capital_one_venture_x',
    'citi-strata':'citi_strata_elite'
  });

  function localDate(date=new Date()){
    const pad=value=>String(value).padStart(2,'0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  }

  function supported(offerId){
    return !!PRODUCT_MAP[offerId];
  }

  function productIdFor(offerId){
    return PRODUCT_MAP[offerId]||null;
  }

  function visible(question,answers){
    return !question.show_when||answers[question.show_when.id]===question.show_when.value;
  }

  function stepsFor(contract){
    const questionnaire=contract.questionnaire;
    return [
      ...questionnaire.common,
      ...Object.values(questionnaire.specific),
      ...Object.values(questionnaire.benefits)
    ];
  }

  function leaves(question,answers){
    if(!visible(question,answers)) return [];
    return question.type==='group'
      ? question.subs.flatMap(sub=>leaves(sub,answers))
      : [question];
  }

  function prune(steps,answers){
    function clear(question){
      delete answers[question.id];
      if(question.number_id) delete answers[question.number_id];
      (question.subs||[]).forEach(clear);
    }
    function visit(question){
      if(!visible(question,answers)){
        clear(question);
        return;
      }
      if(question.number_id&&answers[question.id]!==question.number_when){
        delete answers[question.number_id];
      }
      (question.subs||[]).forEach(visit);
    }
    steps.forEach(visit);
    return answers;
  }

  function valid(question,answers){
    return leaves(question,answers).every(item=>{
      const value=answers[item.id],options=item.options||[];
      if(item.type==='multi'){
        if(!Array.isArray(value)||(!value.length&&!item.none_option)||value.some(v=>!options.some(option=>option.value===v))) return false;
        if(value.some(v=>(item.exclusive||[]).includes(v))&&value.length!==1) return false;
      }else if(!options.some(option=>option.value===value)){
        return false;
      }
      if(item.number_id&&value===item.number_when){
        const number=answers[item.number_id];
        return Number.isInteger(number)&&number>=(item.min??1)&&number<=(item.max??Number.MAX_SAFE_INTEGER);
      }
      return true;
    });
  }

  function unknownOption(question){
    return (question.options||[]).find(option=>option.value==='UNKNOWN')||null;
  }

  function hasChoice(question,answers){
    if(!Object.prototype.hasOwnProperty.call(answers,question.id)) return false;
    const value=answers[question.id],options=question.options||[];
    return question.type==='multi'
      ? Array.isArray(value)
      : options.some(option=>option.value===value);
  }

  function uncertainMap(draft){
    if(!draft.uncertain||typeof draft.uncertain!=='object'||Array.isArray(draft.uncertain)){
      draft.uncertain={};
    }
    return draft.uncertain;
  }

  function resolved(question,draft){
    const uncertain=uncertainMap(draft);
    return leaves(question,draft.answers).every(item=>
      valid(item,draft.answers)||uncertain[item.id]===true
    );
  }

  function fillUnanswered(question,draft){
    const uncertain=uncertainMap(draft);
    for(const item of leaves(question,draft.answers)){
      if(valid(item,draft.answers)){
        delete uncertain[item.id];
        continue;
      }
      if(hasChoice(item,draft.answers)) continue;
      const fallback=unknownOption(item);
      if(fallback){
        draft.answers[item.id]=item.type==='multi'?[fallback.value]:fallback.value;
        delete uncertain[item.id];
      }else{
        delete draft.answers[item.id];
        uncertain[item.id]=true;
      }
      if(item.number_id) delete draft.answers[item.number_id];
    }
    return draft;
  }

  function resultState(result){
    const dimensions=result.dimensions,report=result.report,decision=result.decision;
    return {
      canonicalResult:result,
      meta:result.evaluation_date,
      recommendation:decision.recommended_action,
      shortSummary:decision.summary,
      bonus:dimensions.offer.rating,
      approval:dimensions.application.approval_label,
      eligible:dimensions.bonus.label,
      longTerm:dimensions.long_term.label,
      isSample:false,
      internal:{
        appHard:dimensions.application.hard_behavior,
        bonusHard:dimensions.bonus.hard_behavior
      },
      report:{
        applicationCopy:report.application_text,
        bonusCopy:report.bonus_text,
        offerCopy:report.offer_text,
        approvalCopy:report.approval_text,
        longCopy:report.long_term_text,
        nextStep:report.cta.pre
      }
    };
  }

  window.NextBonusAssessmentContract=Object.freeze({
    productMap:PRODUCT_MAP,
    supported,
    productIdFor,
    localDate,
    visible,
    stepsFor,
    leaves,
    prune,
    valid,
    unknownOption,
    hasChoice,
    uncertainMap,
    resolved,
    fillUnanswered,
    resultState
  });
})();
