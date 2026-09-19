(() => {
  'use strict';

  function progress(step){
    const stage = step === 'product' ? 1 : step === 'info' ? 2 : step === 'offer' ? 3 : 4;
    const labels=['选择产品','基本信息','奖励','完成'];
    return `<div class="add-progress">${labels.map((label,index)=>{
      const number=index+1;
      const done=stage>=number;
      const complete=stage>number;
      const current=stage===number;
      return `<div class="add-step ${done?'done':''} ${complete?'complete':''} ${current?'current':''}"${current?' aria-current="step"':''}><span class="add-step-number ${done?'done':''}">${number}</span><span class="add-step-label">${label}</span></div>`;
    }).join('')}</div>`;
  }

  const back = () => '<button class="btn secondary" data-action="add-back">上一步</button>';
  const next = (action, label, disabled=false) => `<button class="btn primary" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
  const footer = (left, right='') => `<div class="modal-foot"><div class="add-product-foot-inner">${left}${right || '<span></span>'}</div></div>`;

  function displayRewardValue(value){
    const raw=String(value||'').trim();
    const withoutHighest=raw.replace(/^最高\s*/,'').trim();
    const match=withoutHighest.match(/^AS\s+HIGH\s+AS\s+([\d,.]+(?:\.\d+)?)\s*([Kk])?\s*(MR|UR|TYP|MILES?|POINTS?)$/i);
    if(!match) return withoutHighest||raw;
    const numeric=Number(match[1].replace(/,/g,''));
    if(!Number.isFinite(numeric)) return withoutHighest||raw;
    const amount=match[2] ? numeric*1000 : numeric;
    return `${Math.round(amount).toLocaleString('en-US')} ${match[3].toUpperCase()}`;
  }

  function displayRewardRequirement(requirement){
    const raw=String(requirement||'').trim();
    let match=raw.match(/^\$([\d,.]+)\s*\/\s*(\d+)\s*months?$/i);
    if(match) return `${match[2]} 个月内消费 ${match[1]}`;
    match=raw.match(/^spend\s+\$([\d,.]+)\s+(?:in|within)\s+(\d+)\s*months?$/i);
    if(match) return `${match[2]} 个月内消费 ${match[1]}`;
    return raw;
  }

  function selectedProductHeader(product, esc){
    const art=product?.cardImageLocal
      ? `<div class="add-selected-product-art"><img src="${esc(product.cardImageLocal)}" alt="${esc(product?.name||'')}" /></div>`
      : `<div class="add-selected-product-art"><div class="mini-art ${esc(product?.art||'bank')}"></div></div>`;
    return `<div class="add-selected-product">${art}<div class="add-selected-product-copy"><span class="option-title">${esc(product?.name||'')}</span><span class="option-sub">${esc(product?.institution||'')}${product?.subtype?` · ${esc(product.subtype)}`:''}</span></div></div>`;
  }

  function selector(flow, catalog, esc, model){
    const items = model.visibleEntries(catalog, flow);
    const rows = items.map(({category, product}) => {
      const art=product.cardImageLocal
        ? `<div class="add-product-art"><img src="${esc(product.cardImageLocal)}" alt="${esc(product.name)}" /></div>`
        : `<div class="add-product-art"><div class="mini-art ${esc(product.art||'bank')}"></div></div>`;
      return `<button class="option-row add-product-selector-row" type="button" data-action="add-product-select" data-id="${esc(product.id)}" data-category="${esc(category)}" data-nb-add-product-id="${esc(product.id)}" data-nb-add-category="${esc(category)}">${art}<span class="option-main"><span class="option-title">${esc(product.name)}</span><span class="option-sub">${esc(product.institution)}${product.subtype?` · ${esc(product.subtype)}`:''}</span></span><span class="add-product-row-chevron" aria-hidden="true">›</span></button>`;
    }).join('');
    return {
      title: '添加产品',
      body: `<div class="search-wrap nb-add-search-wrap"><span class="search-icon">⌕</span><input id="nb-add-search" class="search" value="${esc(flow.search||'')}" placeholder="搜索信用卡、银行账户、券商或会籍" />${flow.search?'<button class="search-clear" type="button" data-action="add-clear-search" data-nb-clear-search>×</button>':''}</div><div class="filters nb-add-filter-row">${model.FILTERS.map(([label])=>`<button class="pill ${flow.filter===label?'active':''}" type="button" data-action="add-filter" data-value="${esc(label)}" data-nb-add-filter="${esc(label)}">${esc(label)}</button>`).join('')}</div>${rows?`<div class="option-list add-product-selector-list">${rows}</div>`:'<div class="empty"><h3>没有找到这个产品</h3><p>换个关键词试试。</p></div>'}`,
      foot: ''
    };
  }

  function render(ctx){
    const {state, catalog, esc, localDateISO} = ctx;
    const f=state.addFlow;
    if(!f) return '';
    window.NextBonusEvents?.bind('add-product',ctx);
    const model=window.NextBonusPageModels?.addProduct;
    const offerChoice=window.NextBonusBonusOfferChoice;
    if(!model) throw new Error('Add Product page model unavailable');
    if(!offerChoice) throw new Error('Bonus offer choice feature unavailable');

    if(f._confirmClose){
      return '<div class="modal-backdrop add-product-backdrop"><div class="modal add-product-modal add-product-confirm-modal"><div class="modal-head"><div class="modal-title">退出添加？</div></div><div class="modal-body"><p class="confirm-copy">已填写的内容不会保存。</p></div><div class="modal-foot"><button class="btn secondary" data-action="add-continue-editing" data-nb-exit-continue>继续添加</button><button class="btn danger" data-action="add-discard" data-nb-exit-confirm>退出</button></div></div></div>';
    }

    let view;
    if(f.step === 'category' || f.step === 'product'){
      view = selector(f, catalog, esc, model);
    }else if(f.step === 'info'){
      const isCard = f.category === '信用卡';
      view = {
        title: '补充信息',
        body: `<div class="add-info-flow">${selectedProductHeader(f.product,esc)}<div class="add-info-section"><div class="add-info-section-head"><span class="option-title">账户信息</span><span class="option-sub">以下信息都可以稍后修改。</span></div><div class="add-info-fields">${isCard?`<div class="form-group"><label class="label">卡号后四位（可选）</label><input id="add-last4" class="input" maxlength="4" inputmode="numeric" value="${esc(f.last4)}" placeholder="例如 1005" /></div>`:`<div class="form-group"><label class="label">账户昵称（可选）</label><input id="add-nickname" class="input" value="${esc(f.nickname)}" placeholder="例如 主账户" /></div>`}<div class="form-group"><label class="label">${isCard?'开卡日期':'开户日期'}（可选）</label><div class="date-field-row add-info-date-row"><input id="add-opened" type="date" max="${localDateISO()}" class="input" value="${esc(f.opened)}" /><button class="btn ghost small add-info-clear-date" type="button" data-action="add-clear-opened" ${f.opened?'':'hidden'}>清除</button></div></div></div></div></div>`,
        foot: footer(back(), next('add-to-track','继续'))
      };
    }else if(f.step === 'offer'){
      const isCard = f.category === '信用卡';
      const result = offerChoice.offerChoicesFor(f.product);
      const recentChoices=model.recentRewardChoices(result.choices);
      const seenOfferLabels=new Set();
      const visibleChoices=recentChoices.filter(choice=>{
        const value=displayRewardValue(choice.value);
        const requirement=displayRewardRequirement(choice.req);
        const label=requirement?`${value} · ${requirement}`:value;
        const key=label.toLowerCase();
        if(seenOfferLabels.has(key)) return false;
        seenOfferLabels.add(key);
        return true;
      });
      const offerRows = visibleChoices.map(choice => {
        const value=displayRewardValue(choice.value);
        const requirement=displayRewardRequirement(choice.req);
        const label=requirement?`${value} · ${requirement}`:value;
        return `<button class="option-row add-reward-row ${f.offer===choice.id?'selected':''}" type="button" data-action="add-offer-choice" data-id="${esc(choice.id)}"><span class="radio-dot"></span><span class="option-main"><span class="option-title">${esc(label)}</span></span></button>`;
      }).join('');
      const status = f.offerLoading || result.status === 'loading'
        ? '<div class="muted add-reward-status" data-nb-reviewed-message="loading">正在加载已审核的历史奖励…</div>'
        : result.status === 'error'
          ? '<div class="muted add-reward-status" data-nb-reviewed-message="error">历史奖励暂时无法加载；当前公开奖励仍可选择，也可以按实际奖励手动填写。</div>'
          : result.status === 'ready' && visibleChoices.length <= 1
            ? '<div class="muted add-reward-status" data-nb-reviewed-message="empty">暂无其他可直接选择的已审核历史奖励。</div>'
            : '';
      const manualCards = (f.tasks||[]).map((t,i)=>`<div class="task-card"><div class="task-head"><span>完成条件 ${i+1}</span><button class="icon-btn" type="button" data-action="delete-task" data-id="${esc(t.id)}" aria-label="删除条件">×</button></div><input class="input task-desc" data-id="${esc(t.id)}" value="${esc(t.desc)}" placeholder="例如 消费 $12,000" /><label class="label nb-due-label">截止日期</label><div class="date-field-row"><input type="date" class="input task-due" data-id="${esc(t.id)}" value="${esc(t.due)}" />${t.due?`<button class="btn ghost small" type="button" data-action="clear-task-due" data-id="${esc(t.id)}">清除</button>`:''}</div></div>`).join('');
      const manualPanel = f.offer==='manual'
        ? `<div class="add-manual-panel"><div class="form-group"><label class="label">奖励内容</label><input id="add-reward" class="input" value="${esc(f.reward)}" placeholder="例如 175,000 MR" /></div><div><label class="label">完成条件</label>${manualCards}<button class="btn secondary small" type="button" data-action="add-task">＋ 添加条件</button></div></div>`
        : '';
      const canSubmit=model.rewardChoiceReady(f);
      const actionLabel=f.offer?'添加并追踪奖励':'添加到钱包';
      view = {
        title: isCard ? '添加你的开卡奖励（可选）' : '添加你的开户奖励（可选）',
        body: `<div class="add-reward-flow">${selectedProductHeader(f.product,esc)}${status}<div class="option-list add-reward-list">${offerRows}<button class="option-row add-reward-row ${f.offer==='manual'?'selected':''}" type="button" data-action="add-offer-choice" data-id="manual"><span class="radio-dot"></span><span class="option-main"><span class="option-title">都不是，手动填写</span></span></button>${manualPanel}</div></div>`,
        foot: footer(back(), next('add-offer-next',actionLabel,!canSubmit))
      };
    }else if(f.step === 'membership-confirm'){
      view = {
        title: '确认添加',
        body: `<div class="report"><h3>${esc(f.product?.name||'')}</h3><p>${esc(f.product?.institution||'')} · ${esc(f.product?.subtype||'会籍')}</p></div>`,
        foot: footer(back(), next('add-membership-submit','添加到钱包'))
      };
    }else if(f.step === 'success'){
      view = {
        title: '已添加到钱包',
        body: `<div class="add-success-flow">${selectedProductHeader(f.product,esc)}<div class="success"><div class="success-icon">✓</div><h2>已添加到钱包</h2>${f.track?'<p>奖励也已经加入提醒。</p>':''}<div class="actions two"><button class="btn primary" data-action="add-view-product">查看详情</button><button class="btn secondary" data-action="add-another">继续添加</button></div></div></div>`,
        foot: ''
      };
    }else{
      view = selector(f, catalog, esc, model);
    }

    return `<div class="modal-backdrop add-product-backdrop"><div class="modal large add-product-modal" data-nb-stage="${esc(f.step)}"><div class="modal-head"><div class="add-product-head-inner"><div class="modal-title">${view.title}</div><button class="close-btn" type="button" data-action="add-close" aria-label="关闭添加产品">×</button></div></div><div class="add-progress-wrap"><div class="add-progress-inner">${progress(f.step)}</div></div><div class="modal-body"><div class="add-product-body-inner">${view.body}</div></div>${view.foot||''}</div></div>`;
  }

  window.NextBonusAddProductPage = Object.freeze({render});
})();
