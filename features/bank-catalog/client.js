(() => {
  'use strict';

  const ENDPOINT='https://dd.nextbonus.app/api/public/bank-products';
  const CACHE_KEY='nextbonus-bank-products-v1';
  const CACHE_VERSION=1;
  const listeners=new Set();
  let fallbackProducts=Object.freeze([]);
  let products=Object.freeze([]);
  let request=null;
  let state=Object.freeze({
    status:'idle',
    source:'fallback',
    stale:false,
    error:null,
    updatedAt:null
  });

  const freezeProduct=product=>Object.freeze({...product});
  const freezeList=list=>Object.freeze((list||[]).map(freezeProduct));
  const nonEmpty=value=>typeof value==='string'&&value.trim()?value.trim():'';

  function normalizeRemoteProduct(input){
    if(!input||typeof input!=='object') return null;
    const id=nonEmpty(input.id);
    const bank=nonEmpty(input.bank);
    const name=nonEmpty(input.name);
    const bankSlug=nonEmpty(input.bankSlug);
    const productSlug=nonEmpty(input.productSlug);
    if(!id||!bank||!name||!bankSlug||!productSlug) return null;
    return Object.freeze({
      id,
      bank,
      name,
      bankSlug,
      productSlug,
      kind:nonEmpty(input.kind)||'checking',
      lifecycleStatus:nonEmpty(input.lifecycleStatus)||'active',
      profileUrl:nonEmpty(input.profileUrl)||null,
      ddReportsUrl:nonEmpty(input.ddReportsUrl)||null
    });
  }

  function activeRemoteProducts(payload){
    if(!payload||Number(payload.version)!==1||!Array.isArray(payload.products)){
      throw new Error('Invalid Bank Products response');
    }
    const seen=new Set();
    const active=[];
    for(const input of payload.products){
      const product=normalizeRemoteProduct(input);
      if(!product||product.lifecycleStatus!=='active'||seen.has(product.id)) continue;
      seen.add(product.id);
      active.push(product);
    }
    if(!active.length) throw new Error('Bank Products response has no active products');
    return active;
  }

  function mergeWithFallback(remoteProducts){
    const fallbackBySourceId=new Map(
      fallbackProducts
        .filter(product=>product.bankProductId)
        .map(product=>[product.bankProductId,product])
    );
    const remoteIds=new Set();
    const merged=[];
    for(const remote of remoteProducts||[]){
      if(remoteIds.has(remote.id)) continue;
      remoteIds.add(remote.id);
      const legacy=fallbackBySourceId.get(remote.id)||null;
      merged.push(freezeProduct({
        ...(legacy||{}),
        id:legacy?.id||`bank:${remote.id}`,
        offerId:legacy?.offerId||null,
        name:remote.name,
        institution:remote.bank,
        art:legacy?.art||'bank',
        bankProductId:remote.id,
        bankSlug:remote.bankSlug,
        productSlug:remote.productSlug,
        kind:remote.kind,
        lifecycleStatus:remote.lifecycleStatus,
        profileUrl:remote.profileUrl,
        ddReportsUrl:remote.ddReportsUrl,
        catalogSource:'dd-database'
      }));
    }
    for(const legacy of fallbackProducts){
      if(legacy.bankProductId&&remoteIds.has(legacy.bankProductId)) continue;
      merged.push(freezeProduct({...legacy,catalogSource:'legacy'}));
    }
    return Object.freeze(merged.sort((a,b)=>
      String(a.institution||'').localeCompare(String(b.institution||''),'en')||
      String(a.name||'').localeCompare(String(b.name||''),'en')
    ));
  }

  function publish(nextProducts,nextState){
    products=freezeList(nextProducts);
    state=Object.freeze({...state,...nextState});
    const snapshot=Object.freeze({products,state});
    for(const listener of listeners) listener(snapshot);
    return snapshot;
  }

  function storage(){
    try{return window.localStorage||null;}catch(_){return null;}
  }

  function readCache(){
    try{
      const raw=storage()?.getItem(CACHE_KEY);
      if(!raw) return null;
      const cached=JSON.parse(raw);
      if(cached?.cacheVersion!==CACHE_VERSION||!Array.isArray(cached.products)) return null;
      return {
        products:activeRemoteProducts({version:1,products:cached.products}),
        updatedAt:nonEmpty(cached.updatedAt)||null
      };
    }catch(_){
      return null;
    }
  }

  function writeCache(remoteProducts,updatedAt){
    try{
      storage()?.setItem(CACHE_KEY,JSON.stringify({
        cacheVersion:CACHE_VERSION,
        updatedAt,
        products:remoteProducts
      }));
    }catch(_){}
  }

  function prime(nextFallbackProducts){
    fallbackProducts=freezeList(nextFallbackProducts);
    if(state.source==='fallback'){
      publish(fallbackProducts,{status:'idle',source:'fallback',stale:false,error:null});
    }
    return products;
  }

  function subscribe(listener){
    if(typeof listener!=='function') return ()=>{};
    listeners.add(listener);
    return ()=>listeners.delete(listener);
  }

  function load(options={}){
    if(request) return request;
    const cached=readCache();
    if(cached){
      publish(mergeWithFallback(cached.products),{
        status:'refreshing',
        source:'cache',
        stale:true,
        error:null,
        updatedAt:cached.updatedAt
      });
    }else{
      publish(fallbackProducts,{
        status:'loading',
        source:'fallback',
        stale:false,
        error:null
      });
    }

    const fetcher=options.fetcher||window.fetch?.bind(window);
    request=(async()=>{
      try{
        if(typeof fetcher!=='function') throw new Error('Fetch unavailable');
        const response=await fetcher(ENDPOINT,{method:'GET',mode:'cors',credentials:'omit'});
        if(!response?.ok) throw new Error(`Bank Products request failed (${response?.status||0})`);
        const remoteProducts=activeRemoteProducts(await response.json());
        const updatedAt=new Date().toISOString();
        writeCache(remoteProducts,updatedAt);
        return publish(mergeWithFallback(remoteProducts),{
          status:'ready',
          source:'remote',
          stale:false,
          error:null,
          updatedAt
        });
      }catch(error){
        return publish(products.length?products:fallbackProducts,{
          status:'error',
          source:cached?'cache':'fallback',
          stale:!!cached,
          error:String(error?.message||error||'Bank Products request failed')
        });
      }finally{
        request=null;
      }
    })();
    return request;
  }

  window.NextBonusBankProductCatalog=Object.freeze({
    endpoint:ENDPOINT,
    cacheKey:CACHE_KEY,
    prime,
    load,
    retry(){return load({force:true});},
    subscribe,
    list(){return products;},
    getState(){return state;}
  });
})();

