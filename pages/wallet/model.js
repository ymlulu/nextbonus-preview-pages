(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};
  const TYPES=Object.freeze(['信用卡','银行和券商账户','会籍']);

  function sortProducts(state,type,items){
    const mode=state.productSorts?.[type]||'default';
    const copy=[...items];
    const stable=(a,b)=>String(a.name).localeCompare(String(b.name),'zh-CN')||String(a.id).localeCompare(String(b.id));
    if(mode==='recent') return copy.sort((a,b)=>(Number(b.addedAt||0)-Number(a.addedAt||0))||stable(a,b));
    if(mode==='date-desc') return copy.sort((a,b)=>String(b.opened||'').localeCompare(String(a.opened||''))||stable(a,b));
    if(mode==='date-asc') return copy.sort((a,b)=>String(a.opened||'9999').localeCompare(String(b.opened||'9999'))||stable(a,b));
    if(type==='信用卡'||type==='银行和券商账户'){
      return copy.sort((a,b)=>String(a.institution||'').localeCompare(String(b.institution||''),'zh-CN')||stable(a,b));
    }
    return copy.sort(stable);
  }

  function section(state,type,items){
    const sorted=sortProducts(state,type,items);
    const collapsible=items.length>=8;
    const explicitExpanded=state.productSectionExpanded?.[type];
    const expanded=collapsible ? explicitExpanded!==false : true;
    const shown=collapsible&&!expanded?[]:sorted;
    const sortMode=state.productSorts?.[type]||'default';
    const sortLabel={
      default:'默认顺序',
      recent:'最近添加',
      'date-desc':'最近开卡',
      'date-asc':'最早开卡'
    }[sortMode]||'默认顺序';
    return Object.freeze({
      type,
      items,
      sorted,
      shown,
      expanded,
      collapsible,
      hidden:Math.max(0,items.length-shown.length),
      reliableDates:items.every(item=>!!item.opened),
      sortMode,
      sortLabel,
      sortOpen:state.productSortPicker===type,
      className:type==='信用卡'?'credit-products':type==='银行和券商账户'?'account-products':'membership-products'
    });
  }

  function build({state,activeAttentionSorted}){
    const current=state.products;
    const grouped=TYPES
      .map(type=>[type,current.filter(product=>product.type===type)])
      .filter(([,items])=>items.length)
      .map(([type,items])=>[type,items,section(state,type,items)]);
    const allActive=activeAttentionSorted();
    return Object.freeze({current,grouped,allActive,top3:allActive.slice(0,3)});
  }

  root.wallet=Object.freeze({build,TYPES,sortProducts,section});
})();
