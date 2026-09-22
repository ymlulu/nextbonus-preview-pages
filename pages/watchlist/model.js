(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function offerInfo(offerId){
    const fact=window.NextBonusOfferData?.[offerId]||null;
    const product=fact?window.NextBonusOfferProducts?.[fact.productId]||null:null;
    if(!fact||!product)return null;
    const visual=window.NextBonusOfferVisuals?.[product.visualId||offerId]||null;
    return {offerId,fact,product,visual};
  }

  function historyTime(item){
    const value=item?.completedAt||item?.updatedAt||item?.createdAt||'';
    const parsed=Date.parse(value);
    return Number.isFinite(parsed)?parsed:0;
  }

  function formatDate(value){
    if(!value)return '';
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return '';
    return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
  }

  function statusView(item){
    const status=String(item?.status||'');
    const table={
      saved:['已关注','neutral'],
      in_progress:['进行中','active'],
      deal_active:['进行中','active'],
      awaiting_result:['待确认结果','pending'],
      deferred:['稍后确认','pending'],
      pending:['审核中','pending'],
      waiting_reward:['等待奖励','pending'],
      approved:['已通过','success'],
      denied:['未通过','danger'],
      not_submitted:['未提交','neutral'],
      completed:['已完成','success'],
      expired:['已结束','neutral'],
      failed:['未完成','danger']
    };
    return table[status]||[item?.stage==='history'?'已结束':item?.stage==='in_progress'?'进行中':'已关注',item?.stage==='in_progress'?'active':'neutral'];
  }

  function decorate(item){
    const info=offerInfo(item.offerId);
    if(!info)return null;
    const [statusLabel,statusTone]=statusView(item);
    const lifecycle=window.NextBonusDealWatchlistLifecycle?.lifecycleFor?.(item.offerId)||null;
    const dealCompletable=item.stage==='in_progress'&&item.status==='deal_active'&&!!lifecycle;
    const baseMeta=item.stage==='history'
      ? formatDate(item.completedAt||item.updatedAt)
      : info.fact.primaryRequirement||'';
    const meta=dealCompletable&&lifecycle?.endDate
      ? [baseMeta,`截止 ${lifecycle.endDate}`].filter(Boolean).join(' · ')
      : baseMeta;
    return Object.freeze({item,info,statusLabel,statusTone,meta,dealCompletable});
  }

  function build(){
    const api=window.NextBonusWatchlistState;
    if(!api)throw new Error('Watchlist state feature unavailable');
    const items=api.list();
    const inProgress=items.filter(item=>item.stage==='in_progress').map(decorate).filter(Boolean);
    const saved=items.filter(item=>item.stage==='saved').map(decorate).filter(Boolean);
    const history=items.filter(item=>item.stage==='history').sort((a,b)=>historyTime(b)-historyTime(a)).map(decorate).filter(Boolean);
    return Object.freeze({inProgress,saved,history,empty:!inProgress.length&&!saved.length&&!history.length});
  }

  root.watchlist=Object.freeze({build,offerInfo,historyTime,statusView});
})();