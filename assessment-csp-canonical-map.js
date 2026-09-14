(function(root){
  'use strict';
  const maps={
    a1:{none:'NO_US_CARD',lt6:'LT_6M','6to11':'M6_11','1to2':'Y1_2','2plus':'Y2_PLUS',unknown:'UNKNOWN'},
    a2:{'740':'SCORE_740_PLUS','700':'SCORE_700_739','670':'SCORE_670_699',lt670:'SCORE_LT_670',unknown:'UNKNOWN'},
    count:{'0':'N0','1':'N1','2to3':'N2_3','4to5':'N4_5','6plus':'N6_PLUS',unknown:'UNKNOWN'},
    q5a:{'0to3':'N0_3','4':'N4','5plus':'N5_PLUS',unknown:'UNKNOWN'},
    yesno:{no:'NO',yes:'YES',unknown:'UNKNOWN'},
    q6a:{'0':'N0','1':'N1','2plus':'N2_PLUS',unknown:'UNKNOWN'},
    q6b:{never:'NEVER',yes:'RECEIVED',unknown:'UNKNOWN'}
  };
  const q7={hotel:'CSP_Q7_HOTEL',ge:'CSP_Q7_GE'};
  const q8={rewards:'CSP_Q8_REWARDS',ur:'CSP_Q8_UR',rental:'CSP_Q8_RENTAL',protection:'CSP_Q8_TRAVEL_PROTECTION'};
  function fromLegacy(a,q6c){
    const out={a1:maps.a1[a.a1],a2:maps.a2[a.a2],a3:maps.count[a.a3],a4:maps.count[a.a4],Q5A:maps.q5a[a.q5a],Q5B:maps.yesno[a.q5b],Q6A:maps.q6a[a.q6a],Q6B:maps.q6b[a.q6b],Q6C:q6c||'UNKNOWN'};
    if(a.q5b==='yes'&&a.q5b_count!==undefined)out.Q5B_COUNT=Number(a.q5b_count);
    out.q7=(a.q7||[]).filter(x=>x!=='none').map(x=>q7[x]).filter(Boolean);
    out.q8=(a.q8||[]).filter(x=>x!=='none').map(x=>q8[x]).filter(Boolean);
    return out;
  }
  root.NBCSPCanonicalMap=Object.freeze({fromLegacy});
})(window);
