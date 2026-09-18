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
    const sourceProduct=ctx.currentProduct();
    const creditCard=window.NextBonusCreditCardProductDetailModel?.build?.(ctx,sourceProduct)||null;
    const nonCredit=creditCard?null:(window.NextBonusNonCreditProductDetailModel?.build?.(sourceProduct)||null);
    const product=creditCard?.product||sourceProduct;
    const related=ctx.activeAttentionSorted(
      ctx.currentActiveAttention().filter(item=>item.productId===sourceProduct.id)
    );
    return Object.freeze({
      product,
      sourceProduct,
      creditCard,
      nonCredit,
      related,
      top:related.slice(0,3),
      isPast:ctx.state.pastProducts.some(item=>item.id===sourceProduct.id),
      detailArt:ctx.productCardDisplay(sourceProduct,true),
      timeline:productTimelineItems(ctx,sourceProduct),
      benefits:creditCard?.benefits||benefitsFor(product)
    });
  }

  root.productDetail=Object.freeze({build,productTimelineItems,benefitsFor});
})();
