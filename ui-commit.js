(() => {
  'use strict';

  const handlers = new Map();
  let scheduled = false;
  let running = false;
  let rerunRequested = false;

  function invoke(name, fn, reason){
    try{
      fn(reason);
    }catch(error){
      console.error(`[NextBonus UICommit] ${name} failed`, error);
    }
  }

  function flush(reason='manual'){
    if(running){
      rerunRequested = true;
      return;
    }

    running = true;
    try{
      for(const [name, fn] of handlers) invoke(name, fn, reason);
    }finally{
      running = false;
    }

    if(rerunRequested){
      rerunRequested = false;
      schedule('rerun');
    }
  }

  function schedule(reason='mutation'){
    if(scheduled) return;
    scheduled = true;
    queueMicrotask(()=>{
      scheduled = false;
      flush(reason);
    });
  }

  function register(name, fn){
    if(!name || typeof fn !== 'function') return ()=>{};
    handlers.set(String(name), fn);
    invoke(String(name), fn, 'register');
    return ()=>handlers.delete(String(name));
  }

  const observer = new MutationObserver(()=>schedule('mutation'));
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});

  window.NextBonusUICommit = Object.freeze({
    register,
    schedule,
    flush,
    names(){ return [...handlers.keys()]; }
  });
})();
