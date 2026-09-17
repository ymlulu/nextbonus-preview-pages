(() => {
  'use strict';
  const renderers=new Map();
  function register(route,renderer){
    if(!route||typeof renderer!=='function') throw new TypeError('A route and renderer are required');
    if(renderers.has(route)) throw new Error(`Page renderer already registered: ${route}`);
    renderers.set(route,renderer);
  }
  function render(route,context){
    const renderer=renderers.get(route)||renderers.get('discover');
    if(!renderer) throw new Error(`No page renderer registered for ${route}`);
    return renderer(context);
  }
  window.NextBonusPageRegistry=Object.freeze({register,render,has:route=>renderers.has(route),routes:()=>[...renderers.keys()]});
})();
