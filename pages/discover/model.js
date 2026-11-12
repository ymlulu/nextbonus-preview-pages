(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};
  const PAGE_SIZE=20,DAY=86400000;
  const WEIGHTS=Object.freeze({category:1.5,search:2.5,view:4,follow:6});
  function knownTime(offer){
    // Bank verifiedOn is a verification date; credit cards lack publish dates.
    const at=Date.parse(offer.publishedAt||offer.updatedAt||offer.verifiedOn||'');
    return Number.isFinite(at)&&at>0?at:0;
  }
  function latest(items){
    return items.map((offer,index)=>({offer,index,time:knownTime(offer)}))
      .sort((a,b)=>b.time-a.time||a.index-b.index).map(x=>x.offer);
  }
  function interestScores(offers,state){
    const now=Date.now(),cutoff=now-30*DAY;
    const category=new Map(),provider=new Map();
    let hasSignals=false;
    function add(c,p,weight){
      if(c)category.set(c,(category.get(c)||0)+weight);
      if(p)provider.set(p,(provider.get(p)||0)+weight);
      if(c||p)hasSignals=true;
    }
    for(const e of window.NextBonusDiscoverInterests?.snapshot?.()||[]){
      const at=Number(e.at);
      if(!WEIGHTS[e.action]||!Number.isFinite(at)||at<cutoff||at>now+60000)continue;
      add(e.category,e.provider,WEIGHTS[e.action]*Math.pow(0.5,Math.max(0,(now-at)/DAY)/14));
    }
    if(state.loggedIn){
      const live=new Map(offers.map(o=>[o.id,o])),seen=new Set();
      for(const item of window.NextBonusWatchlistState?.list?.()||[]){
        if(item.stage==='history'||seen.has(item.offerId))continue;
        const offer=live.get(item.offerId);
        if(!offer)continue;
        seen.add(item.offerId);
        add(offer.category,offer.provider,6);
      }
    }
    return {category,provider,hasSignals};
  }
  function recommended(items,state,mix=true){
    const {category,provider,hasSignals}=interestScores(items,state),now=Date.now();
    const ranked=items.map((offer,index)=>{
      const time=knownTime(offer);
      const freshness=time?3*Math.pow(0.5,Math.max(0,(now-time)/DAY)/14):0;
      const score=1.5*Math.min(category.get(offer.category)||0,24)+
        2*Math.min(provider.get(offer.provider)||0,24)+freshness+
        (offer.featured===true?1:0);
      return {offer,index,time,score};
    });
    if(hasSignals)ranked.sort((a,b)=>b.score-a.score||b.time-a.time||a.index-b.index);
    else ranked.sort((a,b)=>b.time-a.time||a.index-b.index);
    const pool=ranked.map(x=>x.offer);
    if(!mix||new Set(pool.map(x=>x.category)).size<2)return pool;
    const primary=pool[0].category,ordered=[];
    const alternatives=[...new Set(pool.map(x=>x.category))].filter(x=>x!==primary);
    let exploration=0;
    // Every fifth position rotates through other categories when available.
    while(pool.length){
      let i=0;
      if(ordered.length%5===4){
        for(let tries=0;tries<alternatives.length;tries++){
          const candidate=alternatives[exploration++%alternatives.length];
          const index=pool.findIndex(x=>x.category===candidate);
          if(index>=0){i=index;break;}
        }
      }
      ordered.push(pool.splice(i,1)[0]);
    }
    return ordered;
  }
  function build({state,offers}){
    const query=String(state.offerSearch||'').trim().toLowerCase();
    const categories=['全部',...new Set(offers.map(offer=>offer.category))];
    const category=categories.includes(state.offerCategory)?state.offerCategory:'全部';
    const matching=offers.filter(offer=>
      (category==='全部'||offer.category===category)&&
      (!query||String([offer.name,offer.provider,offer.value,offer.requirement,
        offer.status||'',...(offer.tags||[])].join(' ')).toLowerCase().includes(query))
    );
    const sort=state.offerSort==='latest'?'latest':'personal';
    const items=sort==='latest'?latest(matching):recommended(matching,state,category==='全部');
    const total=items.length,pageCount=Math.max(1,Math.ceil(total/PAGE_SIZE));
    const requested=Number(state.offerPage);
    const page=Number.isSafeInteger(requested)&&requested>0?Math.min(requested,pageCount):1;
    const pageItems=items.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
    return Object.freeze({query,items,pageItems,page,pageCount,pageSize:PAGE_SIZE,total,categories,category,sort});
  }
  root.discover=Object.freeze({build,latest,recommended,interestScores});
})();
