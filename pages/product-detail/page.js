(() => {
  'use strict';

  function earningBlock(product,esc){
    const parts=String(product.earning||'—').split('·').map(item=>item.trim()).filter(Boolean).slice(0,3);
    if(!parts.length||parts[0]==='—'){
      return '<div class="v4-pd-earning single"><div><span class="earn-icon blue">•</span><span><b>—</b><small>消费回报</small></span></div></div>';
    }
    return `<div class="v4-pd-earning ${parts.length===1?'single':''}">${parts.map((item,index)=>`${index?'<i></i>':''}<div><span class="earn-icon ${index===0?'blue':index===1?'purple':'green'}">${index===0?'✦':index===1?'▥':'♧'}</span><span><b>${esc(item)}</b><small>消费回报</small></span></div>`).join('')}</div>`;
  }

  function nonCreditRows(title,rows,esc){
    if(!rows?.length) return '';
    return `<section class="v4-pd-section nb-account-section"><div class="v4-section-head"><h2>${esc(title)}</h2></div><div class="nb-account-grid">${rows.map(row=>`<div class="nb-account-row"><strong>${esc(row[0])}</strong><span>${esc(row[1])}</span></div>`).join('')}</div></section>`;
  }

  function nonCreditSections(nonCredit,esc){
    if(!nonCredit) return '';
    const metrics=nonCreditRows(nonCredit.metricsTitle,nonCredit.metrics,esc);
    const features=nonCreditRows(nonCredit.featuresTitle,nonCredit.features,esc);
    const notice=nonCredit.notice
      ? `<section class="v4-pd-section nb-account-notice ${nonCredit.resolved?'':'nb-no-verified-detail'}"><div class="v4-section-head"><h2>说明</h2></div><p>${esc(nonCredit.notice)}</p></section>`
      : '';
    const source=nonCredit.sourceUrl
      ? `<div class="nb-account-source">资料：<a href="${esc(nonCredit.sourceUrl)}" target="_blank" rel="noopener noreferrer">美卡101</a>${nonCredit.sourceDate?` · ${esc(nonCredit.sourceDate)}`:''}</div>`
      : '';
    return `${metrics}${features}${notice}${source}`;
  }

  function benefitCard(ctx,benefit){
    const {state,esc}=ctx;
    const expanded=state.expandedBenefitId===benefit.id;
    return `<div class="benefit-card ${benefit.detail?'clickable':''}" ${benefit.detail?`data-action="toggle-benefit" data-id="${benefit.id}" role="button" tabindex="0"`:''}><div class="benefit-head"><div><div class="benefit-title">${esc(benefit.title)}</div><div class="benefit-short">${esc(benefit.short)}</div></div>${benefit.detail?`<span class="chev ${expanded?'up':''}">›</span>`:''}</div>${expanded?`<div class="benefit-detail"><dl><dt>本期可用至</dt><dd>${esc(benefit.usable)}</dd><dt>下一期开始</dt><dd>${esc(benefit.next)}</dd><dt>适用条件</dt><dd>${esc(benefit.eligibility)}</dd><dt>需要提前登记</dt><dd>${esc(benefit.enroll)}</dd><dt>最后核验</dt><dd>2026.09.12</dd></dl>${benefit.officialUrl?`<button class="link-btn" data-action="official-rules" data-url="${esc(benefit.officialUrl)}" style="margin-top:10px">官方规则 ↗</button>`:''}</div>`:''}</div>`;
  }

  function timelineFor(ctx,product,items){
    const {esc}=ctx;
    if(!items.length) return '<div class="timeline-empty">还没有历史记录</div>';
    return `<div class="timeline">${items.map(item=>`<div class="timeline-item ${item.correctable||item.targetProductId?'clickable':''}" ${item.correctable?`data-action="history-deeplink" data-product="${product.id}" data-history-id="${item.historyId}"`:item.targetProductId?`data-action="open-product" data-id="${item.targetProductId}"`:''}><div class="timeline-date">${esc(item.date)}</div><div class="timeline-copy">${esc(item.copy)}${item.correctable||item.targetProductId?' ›':''}</div></div>`).join('')}</div>`;
  }

  function pdAttentionIcon(item){
    if(item.type==='bonus') return '🎁';
    if(item.type==='annual') return '▣';
    if(item.type==='change') return '$';
    return '•';
  }

  function pdAttentionItem(ctx,item){
    const {state,esc,daysUntil}=ctx;
    const expanded=state.expandedAttentionId===item.id;
    const days=daysUntil(item.dueDate);
    const time=days!==null&&days>=0&&item.type==='bonus'?`剩余 ${days} 天`:item.time;
    const details=window.NextBonusAttentionUI;
    if(!details) throw new Error('Attention UI unavailable');
    return `<div class="v4-pd-attention-item"><button class="v4-pd-attention-row" data-action="toggle-attention" data-id="${esc(item.id)}" data-history="0"><span class="v4-pd-att-icon">${pdAttentionIcon(item)}</span><span class="v4-pd-att-copy"><strong>${esc(item.action)}</strong><small>${esc(item.secondary||'')}</small></span><span class="v4-pd-att-time ${days!==null&&days<=7?'urgent':''}">${esc(time)}</span><span class="v4-pd-att-chevron">›</span></button>${expanded?details.expanded(ctx,item):''}</div>`;
  }

  function editProductPage(ctx,product){
    const {state,esc,catalog,localDateISO}=ctx;
    const flow=state.editFlow;
    const nonCredit=window.NextBonusNonCreditProductDetailModel?.build?.(product)||null;
    const offerChoice=window.NextBonusBonusOfferChoice;
    if(!offerChoice) throw new Error('Bonus offer choice feature unavailable');

    if(flow.step==='bonus-select'){
      const catalogProduct=(catalog['信用卡']||[]).find(item=>item.offerId===product.offerId)||
        {name:product.name,offerId:product.offerId};
      const choices=offerChoice.offerChoicesFor(catalogProduct).choices;
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回编辑产品</button><div class="page-head"><div><h1 class="page-title">选择你申请时的奖励</h1><p class="page-subtitle">选择与你当时实际申请最匹配的一项。</p></div></div><div class="option-list">${choices.map(choice=>`<button class="option-row ${flow.bonusChoice===choice.id?'selected':''}" data-action="edit-bonus-choice" data-id="${choice.id}"><span class="radio-dot"></span><span class="option-main"><span class="option-title">${esc(choice.value)}</span><span class="option-sub">${esc(choice.kind==='current'?`当前公开 · ${choice.req}`:`${choice.dateLabel||'历史奖励'} · ${choice.req}`)}</span></span></button>`).join('')}<button class="option-row ${flow.bonusChoice==='manual'?'selected':''}" data-action="edit-bonus-choice" data-id="manual"><span class="radio-dot"></span><span class="option-main"><span class="option-title">手动添加奖励条件</span><span class="option-sub">列表里没有你实际申请时的奖励</span></span></button></div><div class="edit-footer"><button class="btn primary" data-action="edit-bonus-use" ${flow.bonusChoice?'':'disabled'}>${flow.bonusChoice==='manual'?'继续':'使用这个奖励'}</button></div></div>`;
    }

    if(flow.step==='bonus-manual'){
      const valid=flow.bonusReward.trim()&&flow.bonusTasks.length&&flow.bonusTasks.every(task=>task.desc.trim()&&task.due);
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回奖励选择</button><div class="page-head"><div><h1 class="page-title">手动添加奖励条件</h1></div></div><div class="form-group"><label class="label">你会获得什么</label><textarea id="edit-bonus-reward" class="textarea">${esc(flow.bonusReward)}</textarea></div><div>${flow.bonusTasks.map((task,index)=>`<div class="task-card"><div class="task-head"><span>条件 ${index+1}</span><button class="icon-btn" data-action="edit-delete-task" data-id="${task.id}">×</button></div><input class="input edit-task-desc" data-id="${task.id}" value="${esc(task.desc)}" placeholder="需要完成什么"/><div style="height:8px"></div><div class="date-field-row"><input class="input edit-task-due" type="date" data-id="${task.id}" value="${esc(task.due)}"/>${task.due?`<button class="btn secondary small" data-action="edit-clear-task-due" data-id="${task.id}">清除日期</button>`:''}</div></div>`).join('')}<button class="btn secondary small" data-action="edit-add-task">+ 再添加一个条件</button></div><div class="edit-footer"><button class="btn primary" data-action="edit-bonus-manual-use" ${valid?'':'disabled'}>使用这些条件</button></div></div>`;
    }

    if(flow.step==='change-select'){
      const targets=(product.changeTargets||[]).map(id=>(catalog['信用卡']||[]).find(item=>item.id===id)).filter(Boolean);
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回编辑产品</button><div class="page-head"><div><h1 class="page-title">更换产品</h1><p class="page-subtitle">当前产品：${esc(product.name)}</p></div></div>${targets.length?`<div class="option-list">${targets.map(item=>`<button class="option-row" data-action="edit-change-target" data-id="${item.id}"><span class="option-main"><span class="option-title">${esc(item.name)}</span><span class="option-sub">${esc(item.institution)}</span></span><span>›</span></button>`).join('')}</div>`:'<div class="empty"><h3>暂时没有可选择的变更产品</h3><p>这里只有已经明确维护为可变更目标的产品；不会根据名称或同一发卡行猜测。</p></div>'}</div>`;
    }

    if(flow.step==='change-confirm'){
      const target=(catalog['信用卡']||[]).find(item=>item.id===flow.changeTargetId);
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回选择产品</button><div class="page-head"><div><h1 class="page-title">确认更换产品</h1></div></div><div class="report"><h3>${esc(product.name)} → ${esc(target?.name||'')}</h3><p>原产品历史会保留；原产品后续新的福利和年费提醒会停止；旧奖励追踪不会迁移到新产品。</p></div><div class="form-group"><label class="label">变更生效日期</label><input id="edit-change-date" class="input" type="date" max="${localDateISO()}" value="${esc(flow.changeDate)}"/></div><button class="btn primary" data-action="edit-change-confirm" ${flow.changeDate?'':'disabled'}>确认更换产品</button></div>`;
    }

    const tracked=state.activeAttention.some(item=>item.productId===product.id&&item.type==='bonus') ||
      state.attentionHistory.some(item=>item.productId===product.id&&/奖励/.test(item.action));
    return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-exit">‹ 返回产品详情</button><div class="page-head"><div><h1 class="page-title">编辑产品</h1><p class="page-subtitle">${esc(product.name)}</p></div></div><div class="edit-panel"><div class="form-group"><label class="label">卡号后四位 / 账户识别</label><input class="input" id="edit-instance" value="${esc(flow.instance)}" /></div><div class="form-group"><label class="label">账户状态</label><select class="select" id="edit-status"><option ${flow.status==='正常'?'selected':''}>正常</option><option ${flow.status==='已关闭'?'selected':''}>已关闭</option><option ${flow.status==='不确定'?'selected':''}>不确定</option></select></div><div class="form-group"><label class="label">${product.type==='信用卡'?'开卡日期':nonCredit?.dateLabel||'开户日期'}</label><input type="date" class="input" id="edit-opened" value="${esc(nonCredit&&window.NextBonusNonCreditProductDetailModel?.isPrototypeDate?.({...product,opened:flow.opened})?'':flow.opened)}" /></div>${product.type==='信用卡'?`<button class="option-row" data-action="edit-bonus-open"><span class="option-main"><span class="option-title">开卡奖励</span><span class="option-sub">${flow.pendingBonus?esc(flow.pendingBonus.reward):tracked?'正在追踪 / 已有记录':'未添加'}</span></span><span>›</span></button>`:''}<button class="option-row" style="margin-top:10px" data-action="edit-change-open"><span class="option-main"><span class="option-title">已变更为其他产品</span><span class="option-sub">只显示已确认可变更目标</span></span><span>›</span></button><div class="edit-footer split"><button class="btn danger" data-action="remove-product-request" data-id="${product.id}">从 NextBonus 中移除</button><button class="btn primary" data-action="save-edit-product" data-id="${product.id}">保存</button></div></div></div>`;
  }

  window.NextBonusPageRegistry.register('product-detail',function(ctx){
    window.NextBonusEvents?.bind('product-detail',ctx);
    const {state,openLogin,esc,shortBrand,formatLongDate}=ctx;
    if(!state.loggedIn){
      openLogin('product-detail',null,'products');
      return '';
    }

    const model=window.NextBonusPageModels?.productDetail;
    if(!model) throw new Error('Product Detail page model unavailable');
    const {product,related,top,isPast,detailArt,timeline,benefits,creditCard,nonCredit}=model.build(ctx);
    const creditCardView=window.NextBonusCreditCardProductDetailView;

    if(state.editFlow&&state.editFlow.productId===product.id) return editProductPage(ctx,product);

    const contactActions=creditCard&&creditCardView
      ? creditCardView.contactActions(creditCard,esc)
      : (product.phone||product.loginUrl)
        ? `<div class="v4-pd-actions">${product.phone?`<button data-action="product-call" data-phone="${esc(product.phone)}">☎ <span>致电</span></button>`:''}${product.phone&&product.loginUrl?'<i></i>':''}${product.loginUrl?`<button data-action="product-login-external" data-url="${esc(product.loginUrl)}">↗ <span>登录</span></button>`:''}</div>`
        : '';

    const productSections=creditCard&&creditCardView
      ? `${creditCardView.bonusSection(ctx,creditCard)}${creditCardView.benefitsSection(ctx,creditCard)}`
      : nonCredit
        ? `${related.length?`<section class="v4-pd-section v4-pd-attention"><div class="v4-section-head"><h2>待处理 <span class="attention-count-dot">${related.length}</span></h2>${related.length>3?`<button class="mock-link" data-action="attention-for-product" data-id="${product.id}">查看全部 ${related.length}</button>`:''}</div><div class="v4-pd-attention-list">${top.map(item=>pdAttentionItem(ctx,item)).join('')}</div></section>`:''}${nonCreditSections(nonCredit,esc)}`
        : `${related.length?`<section class="v4-pd-section v4-pd-attention"><div class="v4-section-head"><h2>待处理 <span class="attention-count-dot">${related.length}</span></h2>${related.length>3?`<button class="mock-link" data-action="attention-for-product" data-id="${product.id}">查看全部 ${related.length}</button>`:''}</div><div class="v4-pd-attention-list">${top.map(item=>pdAttentionItem(ctx,item)).join('')}</div></section>`:''}<section class="v4-pd-section v4-pd-benefits"><div class="v4-section-head"><h2>福利</h2></div>${benefits.length?`<div class="benefit-grid pd-benefit-grid">${benefits.map(item=>benefitCard(ctx,item)).join('')}</div>`:'<div class="timeline-empty">暂时没有可展示的福利信息</div>'}</section>`;
    return `<div class="content v4-product-detail-page ${creditCard?'nb-card-detail':nonCredit?'nb-account-detail':''}">\n      <div class="detail-back-nav"><button class="detail-back-button" type="button" data-action="back-products"><span aria-hidden="true">←</span><span>返回钱包</span></button></div>
      <section class="v4-pd-overview">
        <div class="v4-pd-left"><div class="v4-pd-card ${product.type==='信用卡'?'credit-card-art':nonCredit?.logo?'nb-account-logo-card':''}">${nonCredit?.logo?`<img src="${esc(nonCredit.logo)}" alt="${esc(product.institution||product.name)}" />`:detailArt.primarySrc?`<img src="${detailArt.primarySrc}"${detailArt.fallbackAttr} alt="${esc(product.name)}" />`:`<span class="fallback-brand large">${esc(shortBrand(product.institution))}</span>`}</div>${contactActions}</div>
        <div class="v4-pd-right"><div class="v4-pd-title-row"><div><h1>${esc(product.name)}</h1><div class="v4-pd-status"><span>${esc(product.instance||'')}</span>${product.instance?'<i></i>':''}<b class="${isPast?'past':''}"></b><strong>${isPast?'历史产品':esc(product.status||'不确定')}</strong></div></div>${isPast?'':`<button class="v4-pd-edit" data-action="edit-product">✎　编辑</button>`}</div>
          <div class="v4-pd-facts"><div><span class="fact-icon">▣</span><span><small>${product.type==='信用卡'?'开卡日期':nonCredit?.dateLabel||'开户日期'}</small><strong>${nonCredit?(nonCredit.opened?formatLongDate(nonCredit.opened):'未填写'):(product.opened?formatLongDate(product.opened):'未填写')}</strong></span></div>${product.type==='信用卡'?`<div><span class="fact-icon">♙</span><span><small>周年日</small><strong>${esc(product.anniversary||'—')}</strong></span></div><div><span class="fact-icon">$</span><span><small>年费</small><strong>${esc(product.annualFee||'—')}</strong></span></div>`:''}</div>
          ${nonCredit?'':earningBlock(product,esc)}
        </div>
      </section>
      ${productSections}
      <section class="v4-pd-section v4-pd-history"><button class="v4-past-head" data-action="toggle-product-history"><span>历史记录 <b>${timeline.length}</b></span><span class="chev ${state.productHistoryOpen?'up':''}">›</span></button>${state.productHistoryOpen?timelineFor(ctx,product,timeline):''}</section>
    </div>`;
  });
})();
