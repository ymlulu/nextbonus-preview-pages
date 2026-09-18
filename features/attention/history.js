(() => {
  'use strict';

  const EXTRA_EVENTS_KEY='attentionActivityEvents';

  function nowIso(){ return new Date().toISOString(); }

  function parseLegacyDate(value){
    const text=String(value||'').trim();
    if(!text) return null;
    const english=Date.parse(text);
    if(Number.isFinite(english)) return new Date(english);
    const zh=text.match(/^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日$/);
    if(zh) return new Date(Number(zh[1]),Number(zh[2])-1,Number(zh[3]),12,0,0,0);
    return null;
  }

  function eventDate(item){
    if(item?.occurredAt){
      const date=new Date(item.occurredAt);
      if(!Number.isNaN(date.getTime())) return date;
    }
    return parseLegacyDate(item?.ended)||parseLegacyDate(item?.dueDate);
  }

  function eventSortValue(item){ return eventDate(item)?.getTime()||0; }

  function sortEvents(items){
    return [...(items||[])].sort((a,b)=>
      eventSortValue(b)-eventSortValue(a) ||
      String(b?.id||'').localeCompare(String(a?.id||''))
    );
  }

  function formatEventTime(item,now=new Date()){
    const date=eventDate(item);
    if(!date) return '时间未记录';
    const sameYear=date.getFullYear()===now.getFullYear();
    const datePart=`${sameYear?'':`${date.getFullYear()}年`}${date.getMonth()+1}月${date.getDate()}日`;
    if(!item?.occurredAt) return datePart;
    return `${datePart} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  }

  function formatLongDate(value){
    if(!value) return '';
    const date=new Date(`${value}T12:00:00`);
    if(Number.isNaN(date.getTime())) return String(value);
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
  }

  function periodLabel(item){
    const cycleId=item?.cycleId||item?.source?.cycleId||'';
    let match=String(cycleId).match(/^(\d{4})-(H[12]|Q[1-4])$/);
    if(match) return `${match[1]} ${match[2]}`;
    match=String(cycleId).match(/^(\d{4})-(\d{2})$/);
    if(match) return `${match[1]} 年 ${Number(match[2])} 月`;
    if(/^\d{4}$/.test(String(cycleId))) return String(cycleId);
    const keySub=String(item?.keySub||'');
    match=keySub.match(/(\d{4})\s*(H[12]|Q[1-4])/i);
    if(match) return `${match[1]} ${match[2].toUpperCase()}`;
    match=keySub.match(/(\d{1,2})\s*月(?:周期)?/);
    if(match){
      const date=eventDate(item);
      return date?`${date.getFullYear()} 年 ${Number(match[1])} 月`:`${Number(match[1])} 月`;
    }
    return '';
  }

  function actorLabel(item){
    if(item?.actor==='user') return '你';
    if(item?.actor==='system') return 'NextBonus 自动处理';
    return '来源未记录';
  }

  function statusBucket(item){
    if(item?.statusClass==='skipped') return 'skipped';
    if(item?.statusClass==='expired') return 'expired';
    if(item?.statusClass==='stopped') return 'stopped';
    return 'completed';
  }

  function stamp(item,actor='system',occurredAt=nowIso()){
    return {...item,occurredAt:item?.occurredAt||occurredAt,actor:item?.actor||actor};
  }

  function activityEvents(state){
    return Array.isArray(state?.[EXTRA_EVENTS_KEY])?state[EXTRA_EVENTS_KEY]:[];
  }

  function addReopenEvent(state,original,occurredAt=nowIso()){
    if(!state||!original) return null;
    const event={
      id:`evt-reopen-${Date.now()}`,
      sourceHistoryId:original.id,
      productId:original.productId,
      product:original.product,
      productInstance:original.productInstance,
      action:original.action,
      result:'重新进入待处理',
      statusClass:'reopened',
      occurredAt,
      actor:'user',
      dueDate:original.dueDate||original.source?.dueDate||null,
      cycleId:original.cycleId||original.source?.cycleId||null,
      summary:'你撤销了之前的处理结果，这项提醒已经重新进入待处理。',
      key:original.key||'',
      keySub:original.keySub||'',
      isActivityEvent:true
    };
    state[EXTRA_EVENTS_KEY]=[event,...activityEvents(state)];
    return event;
  }

  function allEvents(state){
    return sortEvents([...(Array.isArray(state?.attentionHistory)?state.attentionHistory:[]),...activityEvents(state)]);
  }

  window.NextBonusAttentionHistory=Object.freeze({
    EXTRA_EVENTS_KEY,
    nowIso,
    eventDate,
    eventSortValue,
    sortEvents,
    formatEventTime,
    formatLongDate,
    periodLabel,
    actorLabel,
    statusBucket,
    stamp,
    activityEvents,
    addReopenEvent,
    allEvents
  });
})();