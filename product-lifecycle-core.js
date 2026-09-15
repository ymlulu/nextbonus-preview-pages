(() => {
  'use strict';

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const nowIso = () => new Date().toISOString();

  function ensureCollections(state){
    state.products ||= [];
    state.pastProducts ||= [];
    state.activeAttention ||= [];
    state.attentionHistory ||= [];
    state.offerTrackings ||= [];
    state.trackingTasks ||= [];
    state.savedOfferIds ||= [];
    state.unavailableSavedIds ||= [];
    return state;
  }

  function anniversary(date){
    if(!date) return '—';
    const d = new Date(`${date}T00:00:00`);
    if(Number.isNaN(d.getTime())) return '—';
    return `${d.getMonth()+1} 月 ${d.getDate()} 日`;
  }

  function shortDate(date){
    if(!date) return '';
    const d = new Date(`${date}T00:00:00`);
    if(Number.isNaN(d.getTime())) return String(date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  }

  function uniqueId(prefix, state, collections=['products']){
    const occupied = new Set(collections.flatMap(key => (state[key] || []).map(item => item?.id).filter(Boolean)));
    const base = `${prefix}-${Date.now()}`;
    if(!occupied.has(base)) return base;
    let suffix = 1;
    while(occupied.has(`${base}-${suffix}`)) suffix += 1;
    return `${base}-${suffix}`;
  }

  function createUserProduct(state, spec={}){
    ensureCollections(state);
    const id = spec.id || uniqueId(spec.idPrefix || 'p-local', state, ['products','pastProducts']);
    const opened = spec.opened || '';
    const product = {
      id,
      offerId: spec.offerId || null,
      ...(spec.offerVersionId ? {offerVersionId: spec.offerVersionId} : {}),
      ...(spec.applicationHandoffId ? {applicationHandoffId: spec.applicationHandoffId} : {}),
      type: spec.type || '其他',
      name: spec.name || '',
      institution: spec.institution || '',
      instance: spec.instance || '',
      ...(spec.art ? {art: spec.art} : {}),
      cardImageLocal: spec.cardImageLocal || null,
      opened,
      anniversary: spec.anniversary ?? anniversary(opened),
      annualFee: spec.annualFee ?? '—',
      status: spec.status || '正常',
      earning: spec.earning ?? '—',
      addedAt: spec.addedAt || Date.now(),
      ...(Array.isArray(spec.history) ? {history: clone(spec.history)} : {})
    };
    state.products.push(product);
    return product;
  }

  function createBonusTracking(state, spec={}){
    ensureCollections(state);
    if(!spec.productId) throw new Error('productId is required');
    const token = spec.identity || `${spec.productId}-${Date.now()}`;
    const trackingId = spec.trackingId || `tracking-${token}`;
    const product = state.products.find(item => item.id === spec.productId) || null;
    const rules = window.NextBonusBonusTaskRules;
    const derivedPlan = (!Array.isArray(spec.tasks) && spec.requirement && spec.anchorDate && rules?.buildPlan)
      ? rules.buildPlan(spec.requirement, spec.anchorDate, {category: spec.category || product?.type || ''})
      : null;
    const rawTasks = Array.isArray(spec.tasks) && spec.tasks.length
      ? spec.tasks
      : derivedPlan?.tasks?.length
        ? derivedPlan.tasks
        : [{id: spec.taskId || `task-${token}-1`, label: spec.requirement || '完成对应奖励条件', dueDate: spec.dueDate || null}];
    const tasks = rawTasks.map((task,index) => ({
      id: task.id || `task-${token}-${index+1}`,
      trackingId,
      ...(spec.applicationHandoffId ? {applicationHandoffId: spec.applicationHandoffId} : {}),
      description: task.description || task.label || spec.requirement || '完成对应奖励条件',
      dueDate: task.dueDate || task.due || null,
      status: task.status || 'pending'
    }));
    const dueDate = spec.dueDate || derivedPlan?.dueDate || tasks.find(task => task.dueDate)?.dueDate || null;
    const reward = spec.reward || '开户 / 开卡奖励';

    if(spec.persistTracking !== false){
      const tracking = {
        id: trackingId,
        ...(spec.applicationHandoffId ? {applicationHandoffId: spec.applicationHandoffId} : {}),
        userProductId: spec.productId,
        offerId: spec.offerId || null,
        ...(spec.offerVersionId ? {offerVersionId: spec.offerVersionId} : {}),
        status: 'in_progress',
        anchorDate: spec.anchorDate || null,
        anchorKind: spec.anchorKind || null,
        reward,
        createdAt: spec.createdAt || nowIso()
      };
      state.offerTrackings.push(tracking);
      state.trackingTasks.push(...tasks);
    }

    const attention = {
      id: spec.attentionId || `a-${token}`,
      ...(spec.applicationHandoffId ? {applicationHandoffId: spec.applicationHandoffId} : {}),
      productId: spec.productId,
      product: spec.productLabel || spec.productName || '',
      action: spec.action || '完成开卡奖励',
      secondary: reward,
      time: dueDate ? `截止 ${shortDate(dueDate)}` : '截止日期以所选奖励规则为准',
      dueDate,
      type: 'bonus',
      summary: spec.summary || '奖励条件正在追踪中。',
      key: reward,
      keySub: spec.keySub || (derivedPlan?.distinctDueDates > 1 ? `最早 ${shortDate(dueDate)} 截止；各项日期见任务` : dueDate ? `最晚 ${shortDate(dueDate)} 完成` : '按所选奖励规则'),
      instruction: spec.instruction || '完成以下条件',
      checklist: tasks.map(task => ({id:task.id,label:task.description,done:false,...(task.dueDate?{dueDate:task.dueDate}:{})})),
      primary: '我已完成',
      secondaryAction: null,
      completionKind: 'completed'
    };
    state.activeAttention.push(attention);
    return {trackingId, tasks, attention};
  }

  function removeSavedOffer(state, offerId){
    if(!offerId) return;
    state.savedOfferIds = (state.savedOfferIds || []).filter(id => id !== offerId);
    state.unavailableSavedIds = (state.unavailableSavedIds || []).filter(id => id !== offerId);
  }

  function commitApplicationApproval(state, spec={}){
    ensureCollections(state);
    // Idempotency is scoped only to the same application attempt. It is not a
    // product-level duplicate check: separate approvals of the same product
    // always create separate UserProduct instances.
    if(spec.applicationHandoffId){
      const existing = state.products.find(product => product.applicationHandoffId === spec.applicationHandoffId);
      if(existing) return {product:existing, created:false};
    }
    const product = createUserProduct(state, {
      idPrefix:'p-app',
      offerId:spec.offerId,
      offerVersionId:spec.offerVersionId,
      applicationHandoffId:spec.applicationHandoffId,
      type:spec.type,
      name:spec.name,
      institution:spec.institution,
      instance:spec.instance,
      art:spec.art,
      cardImageLocal:spec.cardImageLocal,
      opened:spec.opened,
      annualFee:spec.annualFee,
      earning:spec.earning
    });
    createBonusTracking(state, {
      identity:spec.applicationHandoffId || product.id,
      applicationHandoffId:spec.applicationHandoffId,
      productId:product.id,
      productName:product.name,
      productLabel:`${product.name}${product.instance?` ${product.instance}`:''}`,
      offerId:spec.offerId,
      offerVersionId:spec.offerVersionId,
      anchorDate:spec.opened || null,
      anchorKind:'user_confirmed_approval_or_open_date',
      reward:spec.reward,
      requirement:spec.requirement,
      action:product.type==='信用卡'?'完成开卡奖励':'完成开户奖励条件',
      summary:'你已确认本次申请通过，NextBonus 已开始追踪这次奖励条件。'
    });
    removeSavedOffer(state, spec.offerId);
    return {product, created:true};
  }

  function convertProduct(state, spec={}){
    ensureCollections(state);
    const source = state.products.find(product => product.id === spec.sourceProductId);
    if(!source || !spec.target || !spec.effectiveDate) throw new Error('conversion input incomplete');
    const target = spec.target;
    const newId = uniqueId('p-change', state, ['products','pastProducts']);
    const ending = state.activeAttention.filter(item => item.productId === source.id);
    ending.forEach((item,index) => state.attentionHistory.unshift({
      id:`h-stopped-${item.id}-${Date.now()}-${index}`,
      productId:source.id,
      product:item.product || source.name,
      productInstance:source.instance || '',
      action:item.action,
      time:item.time,
      dueDate:item.dueDate || null,
      result:'已结束',
      resultReason:'已更换产品',
      statusClass:'stopped',
      ended:spec.endedLabel || spec.effectiveDate,
      correction:null,
      summary:item.summary,
      key:item.key,
      keySub:item.keySub,
      instruction:item.instruction,
      source:item
    }));
    state.activeAttention = state.activeAttention.filter(item => item.productId !== source.id);
    const old = {
      ...source,
      status:'已更换产品',
      statusText:spec.statusText || `已于 ${spec.effectiveDate} 更换产品`,
      history:[...(source.history||[]),{date:spec.effectiveDate,copy:`已更换为 ${target.name}`,targetProductId:newId}]
    };
    state.products = state.products.filter(product => product.id !== source.id);
    state.pastProducts.unshift(old);
    const product = createUserProduct(state, {
      id:newId,
      offerId:target.offerId || null,
      type:'信用卡',
      name:target.name,
      institution:target.institution,
      instance:source.instance,
      cardImageLocal:target.cardImageLocal || null,
      opened:spec.effectiveDate,
      annualFee:target.annualFee || '—',
      earning:target.earning || '—',
      history:[{date:spec.effectiveDate,copy:`由 ${source.name} 更换而来`,targetProductId:source.id}]
    });
    return {product, previous:old};
  }

  window.NextBonusProductLifecycleCore = Object.freeze({
    ensureCollections,
    anniversary,
    shortDate,
    createUserProduct,
    createBonusTracking,
    removeSavedOffer,
    commitApplicationApproval,
    convertProduct
  });
})();
