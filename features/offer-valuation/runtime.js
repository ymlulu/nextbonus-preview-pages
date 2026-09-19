(() => {
  'use strict';

  function money(value){
    if(!Number.isFinite(value)) return null;
    return '$'+Math.round(value).toLocaleString('en-US');
  }

  function componentValue(component){
    if(!component||typeof component!=='object') return null;
    if(component.kind==='points'){
      const amount=Number(component.amount);
      const cpp=Number(component.centsPerPoint);
      return Number.isFinite(amount)&&Number.isFinite(cpp) ? amount*cpp/100 : null;
    }
    if(component.kind==='cash'){
      const amount=Number(component.amountUsd);
      return Number.isFinite(amount) ? amount : null;
    }
    if(component.kind==='certificate'){
      const quantity=Number(component.quantity??1);
      const unit=Number(component.estimatedUnitValueUsd);
      return Number.isFinite(quantity)&&Number.isFinite(unit) ? quantity*unit : null;
    }
    return null;
  }

  function assumption(component){
    if(component.kind==='points'&&component.program&&Number.isFinite(Number(component.centsPerPoint))){
      return `${component.program} ${Number(component.centsPerPoint)}¢/点`;
    }
    if(component.kind==='cash'){
      return component.label ? `${component.label} 按面值` : '现金按面值';
    }
    if(component.kind==='certificate'&&component.label){
      return component.label;
    }
    return null;
  }

  function build(spec){
    if(!spec||!Array.isArray(spec.components)||!spec.components.length){
      return Object.freeze({supported:false,estimatedValueUsd:null,displayValue:null,assumptions:[],examples:[]});
    }

    const valued=spec.components.map(component=>({
      component,
      valueUsd:componentValue(component)
    }));
    const supported=valued.every(item=>Number.isFinite(item.valueUsd));
    const estimatedValueUsd=supported
      ? valued.reduce((sum,item)=>sum+item.valueUsd,0)
      : null;

    return Object.freeze({
      supported,
      schemaVersion:Number(spec.schemaVersion||1),
      estimatedValueUsd,
      displayValue:money(estimatedValueUsd),
      assumptions:valued.map(item=>assumption(item.component)).filter(Boolean),
      examples:Array.isArray(spec.redemptionExamples)
        ? spec.redemptionExamples.map(item=>Object.freeze({...item}))
        : []
    });
  }

  window.NextBonusOfferValuation=Object.freeze({build});
})();
