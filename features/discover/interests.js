(() => {
  'use strict';
  const KEY='nextbonus-discover-interests-v1',WINDOW=30*86400000;
  const ACTIONS=new Set(['category','search','view','follow']);
  const SOURCES=new Set(['credit-cards-api','bank-offers-api','deals-api']);
  const clean=v=>typeof v==='string'?v.trim().slice(0,80):'';
  function normalize(e,now){
    if(!e||!ACTIONS.has(e.action))return null;
    const at=Number(e.at);
    if(!Number.isFinite(at)||at<now-WINDOW||at>now+60000)return null;
    const category=clean(e.category),provider=clean(e.provider);
    return category||provider?{action:e.action,category,provider,at}:null;
  }
  function read(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'[]');
      if(!Array.isArray(raw))return [];
      const now=Date.now();
      return raw.slice(-160).map(e=>normalize(e,now)).filter(Boolean);
    }catch(_){return [];}
  }
  let visible=read();
  function record(action,category,provider){
    const event=normalize({action,category,provider,at:Date.now()},Date.now());
    if(!event)return false;
    const rows=read(),last=rows[rows.length-1];
    if(last&&last.action===event.action&&last.category===event.category&&
      last.provider===event.provider&&event.at-last.at<120000)return false;
    try{localStorage.setItem(KEY,JSON.stringify([...rows,event].slice(-160)));return true;}catch(_){return false;}
  }
  function recordOffer(offer,action='view'){
    if(!offer||!SOURCES.has(offer.source)||!['view','follow'].includes(action))return false;
    return record(action,clean(offer.category),clean(offer.provider));
  }
  function recordCategory(category){
    const c=clean(category);
    return c&&c!=='全部'?record('category',c,''):false;
  }
  function dominant(offers,key,ratio){
    const counts=new Map();
    for(const item of offers){
      const value=clean(item?.[key]);
      if(value)counts.set(value,(counts.get(value)||0)+1);
    }
    let candidate='',highest=0;
    for(const [value,count] of counts)if(count>highest){candidate=value;highest=count;}
    return highest>=offers.length*ratio?candidate:'';
  }
  // Never persist raw queries or Offer IDs.
  function recordSearch(query,offers,selected='全部'){
    const q=String(query||'').trim().toLowerCase();
    if(Array.from(q).length<2||!Array.isArray(offers))return false;
    const matches=offers.filter(o=>String([o.name,o.provider,o.value,o.requirement,o.status,
      ...(o.tags||[])].join(' ')).toLowerCase().includes(q));
    if(!matches.length)return false;
    const category=selected!=='全部'?clean(selected):dominant(matches,'category',0.6);
    const provider=matches.length<=8?dominant(matches,'provider',0.7):'';
    return category||provider?record('search',category,provider):false;
  }
  function snapshot(){return visible.slice();}
  // A detail click must not reorder the preserved Discover page until a new visit.
  function refresh(){visible=read();return snapshot();}
  function clear(){try{localStorage.removeItem(KEY);}catch(_){}visible=[];}
  window.NextBonusDiscoverInterests=Object.freeze({
    key:KEY,recordOffer,recordCategory,recordSearch,snapshot,refresh,clear
  });
})();
