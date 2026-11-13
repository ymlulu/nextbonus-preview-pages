(() => {
  'use strict';
  // One same-origin Pages request shared by both Discover catalogs.
  // The Worker is only a fallback until the first snapshot is published.
  const URL='data/discover/catalog.json';
  let pending=null;
  const valid=d=>d?.version===1&&Array.isArray(d.creditCards?.items)&&
    Array.isArray(d.bankOffers?.offers)&&d.creditCards.items.length>0&&
    d.bankOffers.offers.length>0;
  async function load({force=false,fetcher=window.fetch?.bind(window)}={}){
    if(pending)return pending;
    if(typeof fetcher!=='function')throw Error('Static catalog fetch unavailable');
    pending=(async()=>{
      const response=await fetcher(URL,{cache:force?'no-cache':'default'});
      if(!response?.ok)throw Error('Static catalog HTTP '+(response?.status||0));
      const payload=await response.json();
      if(!valid(payload))throw Error('Invalid static Discover catalog');
      return payload;
    })();
    try{return await pending;}finally{pending=null;}
  }
  window.NextBonusStaticCatalog=Object.freeze({url:URL,load});
})();
