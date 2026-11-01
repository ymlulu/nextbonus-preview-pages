(() => {
  'use strict';

  // One owner for user-entered bank bonus receipts. Existing bonus tracking.status
  // means requirements completed; receipt records never change that lifecycle state.
  const MAX_PAYMENT_CENTS=100000000; // $1,000,000 per recorded payment.
  const clone=value=>JSON.parse(JSON.stringify(value));

  function dateValid(value){
    return !!window.NextBonusBonusTaskRules?.dateParts?.(value);
  }

  function amountCents(input){
    const raw=String(input??'').trim();
    if(!/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/.test(raw))return null;
    const parts=raw.split('.');
    const cents=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
    return Number.isSafeInteger(cents)&&cents>0&&cents<=MAX_PAYMENT_CENTS?cents:null;
  }

  function amountInput(cents){
    return Number.isSafeInteger(cents)&&cents>=0?(cents/100).toFixed(2):'';
  }

  function money(cents){
    if(!Number.isSafeInteger(cents))return '—';
    return '$'+(cents/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  function isBankProduct(product){
    if(product?.type!=='银行和券商账户')return false;
    if(product.bankAccount===true||product.bankOfferSlug||product.catalogProductId)return true;
    const bankCatalog=window.NextBonusProductRegistry?.list?.('银行账户')||[];
    return bankCatalog.some(item=>
      (item.offerId&&product.offerId&&item.offerId===product.offerId)||
      (item.name===product.name&&item.institution===product.institution)
    );
  }

  function accountProduct(state,productId){
    return [...(state?.products||[]),...(state?.pastProducts||[])]
      .find(product=>product?.id===productId)||null;
  }

  function ownedTracking(state,productId,trackingId){
    const product=accountProduct(state,productId);
    if(!isBankProduct(product))return null;
    const tracking=(state?.offerTrackings||[]).find(item=>
      item?.id===trackingId&&item.userProductId===productId
    );
    return tracking?{product,tracking}:null;
  }

  function ddUrl(raw){
    const path=String(raw||'').trim().replace(/^https:\/\/dd\.nextbonus\.app/i,'');
    return /^\/accounts\/[a-z0-9-]+\/[a-z0-9-]+\/?(?:\?source=[a-z0-9-]+)?$/i.test(path)
      ? 'https://dd.nextbonus.app'+path : null;
  }

  function officialUrl(raw){
    const value=String(raw||'').trim();
    return /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(value)?value:null;
  }

  function productDdUrl(product){
    if(!isBankProduct(product))return null;
    const list=window.NextBonusBankProductCatalog?.list?.()||[];
    const matching=list.find(item=>
      product.catalogProductId&&item.bankProductId===product.catalogProductId
    );
    return ddUrl(product.bankDdReportsUrl)||ddUrl(matching?.ddReportsUrl);
  }

  function paymentsFor(tracking){
    return (Array.isArray(tracking?.bankBonusPayments)?tracking.bankBonusPayments:[])
      .filter(payment=>payment&&typeof payment.id==='string'&&dateValid(payment.receivedOn)&&
        Number.isSafeInteger(payment.amountCents)&&payment.amountCents>0)
      .slice().sort((a,b)=>b.receivedOn.localeCompare(a.receivedOn)||String(b.id).localeCompare(String(a.id)));
  }

  function projectTracking(state,tracking,product){
    const tasks=(state.trackingTasks||[]).filter(item=>item.trackingId===tracking.id);
    const attention=(state.activeAttention||[]).find(item=>item.trackingId===tracking.id);
    const fallback=attention?.checklist||[];
    const checks=tasks.length?tasks.map(task=>({
      id:task.id,label:task.description||'完成奖励条件',
      done:task.status==='completed',
      dueDate:task.dueDate||null
    })):fallback.map(task=>({
      id:task.id,label:task.label||'完成奖励条件',
      done:!!task.done,dueDate:task.dueDate||null
    }));
    const completedCount=checks.filter(item=>item.done).length;
    const conditionsCompleted=tracking.status==='completed';
    const payments=paymentsFor(tracking);
    const receivedCents=payments.reduce((total,item)=>total+item.amountCents,0);
    const snapshot=tracking.bankOfferSnapshot||null;
    const expectedCents=Number.isSafeInteger(snapshot?.bonusAmountCents)?snapshot.bonusAmountCents:null;
    const history=[];
    for(const item of state.attentionHistory||[]){
      if(item?.productId!==product.id||item?.source?.trackingId!==tracking.id||
         item.result!=='已完成')continue;
      history.push({id:'completed-'+item.id,date:String(item.occurredAt||item.dueDate||'').slice(0,10),
        label:'奖励条件已完成',kind:'conditions'});
    }
    for(const payment of payments){
      history.push({id:'payment-'+payment.id,date:payment.receivedOn,
        label:'实际到账 '+money(payment.amountCents),kind:'payment'});
    }
    history.sort((a,b)=>b.date.localeCompare(a.date));
    return {
      id:tracking.id,slug:snapshot?.slug||tracking.offerId||null,
      title:snapshot?.title||tracking.reward||'开户奖励',
      reward:tracking.reward||'开户奖励',
      version:snapshot?.version||null,
      expectedCents,conditionsCompleted,
      completedCount,totalCount:checks.length,checks,
      deadlineStatus:tracking.deadlineStatus||null,
      firstDueDate:checks.map(t=>t.dueDate).filter(Boolean).sort()[0]||null,
      activeAttentionId:attention?.id||null,
      payments:clone(payments),receivedCents,
      history,createdAt:tracking.createdAt||'',
      ddReportsUrl:ddUrl(snapshot?.ddReportsUrl)||productDdUrl(product),
      officialTermsUrl:officialUrl(snapshot?.officialTermsUrl)
    };
  }

  function summary(state,product){
    if(!isBankProduct(product))return null;
    const trackings=(state?.offerTrackings||[])
      .filter(item=>item.userProductId===product.id)
      .slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
    return {
      productId:product.id,
      ddReportsUrl:productDdUrl(product)||
        trackings.map(item=>ddUrl(item.bankOfferSnapshot?.ddReportsUrl)).find(Boolean)||null,
      offers:trackings.map(item=>projectTracking(state,item,product))
    };
  }

  function record(state,{productId,trackingId,paymentId=null,receivedOn,amount,today}={}){
    const owned=ownedTracking(state,productId,trackingId);
    if(!owned)return {ok:false,error:'找不到该账户的奖励记录。'};
    if(!dateValid(receivedOn))return {ok:false,error:'请选择有效的到账日期。'};
    if(dateValid(today)&&receivedOn>today)return {ok:false,error:'到账日期不能晚于今天。'};
    if(dateValid(owned.product.opened)&&receivedOn<owned.product.opened)
      return {ok:false,error:'到账日期不能早于开户日期。'};
    const cents=amountCents(amount);
    if(cents===null)return {ok:false,error:'请输入有效的实际到账金额（美元，最多两位小数）。'};
    const tracking=owned.tracking;
    const records=Array.isArray(tracking.bankBonusPayments)?tracking.bankBonusPayments:[];
    const previous=paymentId?records.find(item=>item.id===paymentId):null;
    if(paymentId&&!previous)return {ok:false,error:'原到账记录不存在，请重新打开。'};
    const now=new Date().toISOString();
    const id=previous?.id||('receipt-'+Date.now()+'-'+(records.length+1));
    const payment={
      id,receivedOn,amountCents:cents,
      recordedAt:previous?.recordedAt||now,
      ...(previous?{updatedAt:now}:{})
    };
    tracking.bankBonusPayments=previous
      ? records.map(item=>item.id===paymentId?payment:item)
      : [...records,payment];
    return {ok:true,payment:clone(payment)};
  }

  function remove(state,{productId,trackingId,paymentId}={}){
    const owned=ownedTracking(state,productId,trackingId);
    if(!owned)return false;
    const records=Array.isArray(owned.tracking.bankBonusPayments)?owned.tracking.bankBonusPayments:[];
    if(!records.some(item=>item.id===paymentId))return false;
    owned.tracking.bankBonusPayments=records.filter(item=>item.id!==paymentId);
    return true;
  }

  window.NextBonusBankBonusLedger=Object.freeze({
    MAX_PAYMENT_CENTS,amountCents,amountInput,money,ddUrl,
    isBankProduct,ownedTracking,summary,record,remove
  });
})();
