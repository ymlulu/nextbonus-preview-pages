(() => {
  'use strict';
  // Short-lived public catalog cache only. Never store user/account state.
  const PREFIX='nextbonus-discover-catalog-v1:';
  const TTL=5*60*1000;
  function read(key,validate){
    try{
      if(typeof localStorage==='undefined')return null;
      const raw=JSON.parse(localStorage.getItem(PREFIX+key)||'null');
      if(!raw||!Array.isArray(raw.items)||!Number.isFinite(raw.at)||
        raw.at>Date.now()+60000||Date.now()-raw.at>TTL)return null;
      const items=raw.items.filter(x=>x&&typeof x==='object'&&validate(x));
      return {items,updatedAt:new Date(raw.at).toISOString()};
    }catch(_){return null;}
  }
  function write(key,items){
    if(!Array.isArray(items))return false;
    try{
      if(typeof localStorage==='undefined')return false;
      localStorage.setItem(PREFIX+key,JSON.stringify({at:Date.now(),items}));
      return true;
    }catch(_){return false;}
  }
  function clear(key){try{localStorage?.removeItem(PREFIX+key);}catch(_){}}
  window.NextBonusDiscoverCache=Object.freeze({read,write,clear,ttl:TTL});
})();
