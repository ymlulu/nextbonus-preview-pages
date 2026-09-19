(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  const FILTERS=Object.freeze([
    ['全部',null],
    ['信用卡','信用卡'],
    ['银行','银行账户'],
    ['券商','券商账户'],
    ['会籍','其他']
  ]);
  const RECENT_REWARD_MONTHS=6;

  function createFlow(){
    return {
      step:'product',
      category:null,
      product:null,
      search:'',
      filter:'全部',
      last4:'',
      nickname:'',
      opened:'',
      track:null,
      offer:null,
      reward:'',
      tasks:[{id:'t1',desc:'',due:''}],
      savedProductId:null,
      submitting:false,
      committed:false,
      offerLoading:false
    };
  }

  function catalogEntries(catalog){
    return Object.entries(catalog||{}).flatMap(([category,products])=>
      (products||[]).map(product=>({category,product}))
    );
  }

  function visibleEntries(catalog,flow){
    const category=Object.fromEntries(FILTERS)[flow.filter]||null;
    const query=String(flow.search||'').trim().toLowerCase();
    return catalogEntries(catalog).filter(({category:itemCategory,product})=>{
      if(category&&itemCategory!==category) return false;
      if(!query) return true;
      return `${product.name||''} ${product.institution||''} ${product.subtype||''}`.toLowerCase().includes(query);
    });
  }

  function resetAfterCategory(flow){
    flow.product=null;
    resetAfterProduct(flow);
  }

  function resetAfterProduct(flow){
    flow.last4='';
    flow.nickname='';
    flow.opened='';
    flow.track=null;
    flow.offer=null;
    flow.reward='';
    flow.tasks=[{id:'t1',desc:'',due:''}];
    flow.savedProductId=null;
    flow.submitting=false;
    flow.committed=false;
    flow.offerLoading=false;
  }

  function manualTrackingValid(flow){
    return !!flow &&
      String(flow.reward||'').trim() &&
      Array.isArray(flow.tasks) &&
      flow.tasks.length>0 &&
      flow.tasks.every(task=>String(task.desc||'').trim()&&task.due);
  }

  function rewardChoiceReady(flow){
    if(!flow) return false;
    if(flow.offer==='manual') return !!manualTrackingValid(flow);
    return true;
  }

  function monthIndex(value){
    const match=String(value||'').match(/^(\d{4})-(\d{2})/);
    if(!match) return null;
    const month=Number(match[2]);
    if(month<1||month>12) return null;
    return Number(match[1])*12+(month-1);
  }

  function recentRewardChoices(choices,now=new Date()){
    const currentMonth=now.getFullYear()*12+now.getMonth();
    const firstMonth=currentMonth-(RECENT_REWARD_MONTHS-1);
    return (choices||[]).filter(choice=>{
      if(choice?.kind==='current') return true;
      const month=monthIndex(choice?.dateLabel);
      return month!==null&&month>=firstMonth&&month<=currentMonth;
    });
  }

  function back(flow){
    const map={info:'product',offer:'info','membership-confirm':'product'};
    if(map[flow.step]){
      flow.step=map[flow.step];
      return true;
    }
    return false;
  }

  function progressed(flow){
    return !!flow&&!['category','product','success'].includes(flow.step);
  }

  root.addProduct=Object.freeze({
    FILTERS,
    RECENT_REWARD_MONTHS,
    createFlow,
    visibleEntries,
    resetAfterCategory,
    resetAfterProduct,
    manualTrackingValid,
    rewardChoiceReady,
    recentRewardChoices,
    back,
    progressed
  });
})();