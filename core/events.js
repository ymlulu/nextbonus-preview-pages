(() => {
  'use strict';

  const supported=new Set(['click','input','change']);
  const handlers=new Map();
  let active=null;

  function register(route,owner){
    if(!route||!owner||typeof owner!=='object') throw new TypeError('A route and event handlers are required');
    const current=handlers.get(route)||{};
    const next={...current};
    for(const [type,handler] of Object.entries(owner)){
      if(!supported.has(type)) throw new Error(`Unsupported page event type: ${type}`);
      if(typeof handler!=='function') throw new TypeError(`Page event handler must be a function: ${route}/${type}`);
      if(next[type]) throw new Error(`Page event handler already registered: ${route}/${type}`);
      next[type]=handler;
    }
    handlers.set(route,Object.freeze(next));
  }

  function bind(route,context){
    if(!route||!context?.state) throw new TypeError('Page event binding requires route and page context');
    active={route,context};
  }

  function renderActive(route,context,focusId){
    const main=document.querySelector?.('.main');
    if(!main||!window.NextBonusPageRegistry) return;
    main.innerHTML=window.NextBonusPageRegistry.render(route,context);
    window.NextBonusUIFinalize?.run?.(main);
    window.NextBonusStorage?.save?.(context.state);
    if(focusId){
      requestAnimationFrame(()=>{
        const input=document.getElementById(focusId);
        if(!input) return;
        input.focus?.();
        const end=String(input.value||'').length;
        try{ input.setSelectionRange?.(end,end); }catch(_){ }
      });
    }
  }

  function dispatch(route,type,payload){
    const handler=handlers.get(route)?.[type];
    if(!handler) return false;
    return handler(payload);
  }

  function handle(type,event){
    if(!active) return;
    const result=dispatch(active.route,type,{event,ctx:active.context});
    if(!result) return;
    event.stopImmediatePropagation?.();
    if(result.preventDefault) event.preventDefault?.();
    if(result.render) renderActive(active.route,active.context,result.focusId||null);
  }

  for(const type of supported) document.addEventListener(type,event=>handle(type,event));

  window.NextBonusEvents=Object.freeze({
    register,
    bind,
    dispatch,
    has:(route,type)=>typeof handlers.get(route)?.[type]==='function',
    routes:()=>[...handlers.keys()]
  });
})();
