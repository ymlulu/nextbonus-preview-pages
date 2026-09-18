(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function productTimelineItems(ctx,product){
    const items=[];
    if(product.opened){
      items.push({
        id:`open-${product.id}`,
        date:product.opened,
        copy:product.type==='信用卡'?'开卡':'开户'
      });
    }
    ctx.state.attentionHistory
      .filter(item=>item.productId===product.id)
      .forEach(item=>items.push({
        id:`att-${item.id}`,
        date:ctx.historyDateISO(item.ended)||item.dueDate||'',
        copy:`${item.action} · ${item.result}${item.resultReason?` · ${item.resultReason}`:''}`,
        correctable:!!item.correction,
        historyId:item.id
      }));
    (product.history||[]).forEach(item=>items.push(item));
    return items.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
  }

  function benefitsFor(product){
    return Array.isArray(product.benefits)?product.benefits:[];
  }

  function build(ctx){
    const product=ctx.currentProduct();
    const related=ctx.activeAttentionSorted(
      ctx.currentActiveAttention().filter(item=>item.productId===product.id)
    );
    return Object.freeze({
      product,
      related,
      top:related.slice(0,3),
      isPast:ctx.state.pastProducts.some(item=>item.id===product.id),
      detailArt:ctx.productCardDisplay(product,true),
      timeline:productTimelineItems(ctx,product),
      benefits:benefitsFor(product)
    });
  }

  root.productDetail=Object.freeze({build,productTimelineItems,benefitsFor});
})();
