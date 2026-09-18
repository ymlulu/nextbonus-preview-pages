(() => {
  'use strict';

  const STORAGE_KEY='nextbonus-benefit-cycle-v1';

  function read(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return value&&typeof value==='object'?value:{};
    }catch(_){ return {}; }
  }

  function write(store){
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(store||{})); }catch(_){}
  }

  function current(product,benefit,date=new Date()){
    if(!product?.id||!benefit?.benefitId||!benefit?.cycleType) return null;
    const cycle=window.NextBonusBenefitCycle;
    if(!cycle) return null;

    if(benefit.cycleType==='cardmember-year'&&!product.opened){
      const key=`${product.id}|${benefit.benefitId}|manual`;
      const record=read().records?.[key]||null;
      return Object.freeze({
        mode:'manual',
        productId:product.id,
        benefitId:benefit.benefitId,
        cycleType:benefit.cycleType,
        key,
        record,
        used:record?.status==='used',
        window:null
      });
    }

    const period=cycle.current(benefit.cycleType,date,product.opened||null);
    if(!period) return null;
    const key=`${product.id}|${benefit.benefitId}|${period.id}`;
    const legacyKey=`${product.id}|${benefit.benefitId}|${period.legacyId}`;
    const manualKey=`${product.id}|${benefit.benefitId}|manual`;
    const store=read();
    let record=store.records?.[key]||store.records?.[legacyKey]||null;
    const manualRecord=store.records?.[manualKey]||null;

    if(!record&&benefit.cycleType==='cardmember-year'&&manualRecord?.status==='used'&&manualRecord.usedAt){
      const marked=new Date(manualRecord.usedAt);
      if(!Number.isNaN(marked.getTime())&&marked>=period.start&&marked<=new Date(period.end.getTime()+86400000)){
        record=manualRecord;
      }
    }

    return Object.freeze({
      mode:'cycle',
      productId:product.id,
      benefitId:benefit.benefitId,
      cycleType:benefit.cycleType,
      key,
      legacyKey,
      manualKey,
      record,
      used:record?.status==='used',
      window:period
    });
  }

  function setUsed(info,used,{attentionId=null}={}){
    if(!info?.key) return null;
    const store=read();
    store.records=store.records||{};

    if(used){
      store.records[info.key]={
        status:'used',
        usedAt:new Date().toISOString(),
        ...(info.mode==='manual'?{trackingMode:'manual'}:{}),
        ...(attentionId?{attentionId}: {})
      };
    }else{
      delete store.records[info.key];
    }

    if(info.legacyKey) delete store.records[info.legacyKey];
    if(info.manualKey&&info.manualKey!==info.key) delete store.records[info.manualKey];
    write(store);
    return currentRecord(info);
  }

  function currentRecord(info){
    if(!info?.key) return null;
    return read().records?.[info.key]||null;
  }

  function matchingHistory(state,info,attentionId=null){
    if(!info?.window) return null;
    const history=Array.isArray(state?.attentionHistory)?state.attentionHistory:[];
    return history.find(item=>
      (item.type==='benefit'||item.benefitId) &&
      item.productId===info.productId &&
      item.benefitId===info.benefitId &&
      item.cycleId===info.window.id &&
      (!attentionId||item.source?.id===attentionId||item.id===attentionId)
    )||null;
  }

  function reanchorCardmemberYear(productId,oldOpened,newOpened,state){
    if(!productId||!oldOpened||!newOpened||oldOpened===newOpened||!window.NextBonusBenefitCycle?.current) return false;
    const store=read();
    if(!store?.records) return false;
    let changed=false;
    for(const [key,record] of Object.entries({...store.records})){
      const parts=key.split('|');
      if(parts.length<3||parts[0]!==productId||!String(parts[2]).includes('__')||record?.status!=='used'||!record?.usedAt) continue;
      const date=String(record.usedAt).slice(0,10);
      const period=window.NextBonusBenefitCycle.current('cardmember-year',date,newOpened);
      if(!period) continue;
      const nextKey=`${productId}|${parts[1]}|${period.id}`;
      if(nextKey===key) continue;
      const existing=store.records[nextKey];
      if(!existing||String(existing.usedAt||'')<String(record.usedAt||'')) store.records[nextKey]=record;
      delete store.records[key];
      changed=true;
    }
    for(const attention of state?.activeAttention||[]){
      if(attention.productId!==productId||attention.type!=='benefit'||attention.cycleType!=='cardmember-year') continue;
      const today=new Date().toISOString().slice(0,10);
      const period=window.NextBonusBenefitCycle.current('cardmember-year',today,newOpened);
      if(!period) continue;
      const pad=value=>String(value).padStart(2,'0');
      const due=`${period.end.getFullYear()}-${pad(period.end.getMonth()+1)}-${pad(period.end.getDate())}`;
      attention.cycleId=period.id;
      attention.dueDate=due;
      attention.time=`本期截止 ${period.end.getMonth()+1}月${period.end.getDate()}日`;
    }
    if(changed) write(store);
    return changed;
  }

  window.NextBonusBenefitCycleState=Object.freeze({read,current,setUsed,currentRecord,matchingHistory,reanchorCardmemberYear});
})();