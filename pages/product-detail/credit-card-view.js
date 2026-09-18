(() => {
  'use strict';

  const CYCLE_USED_LABELS=Object.freeze({
    month:'本月已使用',
    quarter:'本季度已使用',
    'half-year':'本半年已使用',
    'calendar-year':'今年已使用',
    'cardmember-year':'本持卡年已使用'
  });

  function iconSvg(kind){
    const icons={
      gift:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4z"></path><path d="M3 7h18v3H3z"></path><path d="M12 7v13"></path><path d="M12 7H8.8A2.3 2.3 0 1 1 12 4.9V7z"></path><path d="M12 7h3.2A2.3 2.3 0 1 0 12 4.9V7z"></path></svg>',
      crown:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8z"></path><path d="M7 21h10"></path></svg>',
      car:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 11 2-4h10l2 4"></path><path d="M4 11h16v6H4z"></path><circle cx="7" cy="18" r="1.5"></circle><circle cx="17" cy="18" r="1.5"></circle></svg>',
      bag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg>',
      clear:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke-dasharray="1.6 2.4"></circle></svg>',
      plane:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 13 7-2 3-7 2 1-1 6 6 2v2l-6 1 1 5-2 1-3-6-7-1v-2z"></path></svg>',
      bed:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6v13"></path><path d="M20 11v8"></path><path d="M4 15h16"></path><path d="M7 10h4a3 3 0 0 1 3 3v2H7v-5z"></path></svg>',
      building:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h9v17"></path><path d="M15 9h4v12"></path><path d="M9 8h3M9 12h3M9 16h3"></path><path d="M4 21h16"></path></svg>',
      clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path></svg>',
      lounge:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13h14v6H5z"></path><path d="M7 13V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"></path><path d="M8 19v2M16 19v2"></path></svg>',
      shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.8-2.7 8-7 10-4.3-2-7-5.2-7-10V6l7-3z"></path><path d="m9 12 2 2 4-4"></path></svg>'
    };
    return icons[kind]||icons.shield;
  }

  function benefitIconFor(title){
    if(/Uber|租车/.test(title)) return 'car';
    if(/Saks|购物/.test(title)) return 'bag';
    if(/CLEAR/.test(title)) return 'clear';
    if(/Global Entry|TSA|航空|机票|行程/.test(title)) return /行程/.test(title)?'clock':'plane';
    if(/Hilton/.test(title)) return 'bed';
    if(/Marriott|酒店/.test(title)) return 'building';
    if(/Lounge|休息室|贵宾室|Priority Pass/i.test(title)) return 'lounge';
    return 'shield';
  }

  function formatDate(date){
    return date instanceof Date&&!Number.isNaN(date.getTime())?`${date.getMonth()+1}月${date.getDate()}日`:'';
  }

  function remainingLabel(model,attention){
    const days=model.daysUntil(attention?.dueDate);
    if(days===null) return attention?.time||'';
    if(days<0) return `已逾期 ${Math.abs(days)} 天`;
    if(days===0) return '今天截止';
    return `剩余 ${days} 天`;
  }

  function bonusTaskMarkup(ctx,bonus){
    const {esc}=ctx;
    const tasks=Array.isArray(bonus.checklist)?bonus.checklist:[];
    if(tasks.length<=1){
      const task=tasks[0];
      return `<div class="nb-card-single-task"><span>${esc(task?.label||'完成符合条件的消费要求')}</span><button class="nb-card-complete-btn" data-action="complete-attention" data-id="${esc(bonus.id)}" type="button">标记完成</button></div>`;
    }
    return `<div class="nb-card-multi-task">${tasks.map(task=>`<label class="nb-card-bonus-check"><input type="checkbox" data-action="checklist" data-attention="${esc(bonus.id)}" data-check="${esc(task.id)}" ${task.done?'checked':''}/><span>${esc(task.label)}</span></label>`).join('')}<button class="nb-card-complete-btn" data-action="complete-attention" data-id="${esc(bonus.id)}" type="button">我已全部完成</button></div>`;
  }

  function bonusSection(ctx,card){
    if(!card.bonuses.length) return '';
    const {esc}=ctx;
    const model=window.NextBonusCreditCardProductDetailModel;
    return `<section class="v4-pd-section nb-card-bonus-section"><div class="nb-card-section-title"><span class="nb-card-section-icon">${iconSvg('gift')}</span><h2>开卡奖励</h2></div><div class="nb-card-bonus-stack">${card.bonuses.map(bonus=>{
      const secondary=String(bonus.secondary||'');
      const first=(bonus.checklist||[])[0];
      const spend=/消费/.test(secondary)?secondary.replace(/，?获得.*$/u,'').replace(/个月/u,' 个月'):(first?.label||secondary||'完成对应奖励条件');
      const tone=model.urgency(model.daysUntil(bonus.dueDate));
      return `<div class="nb-card-bonus-card"><div class="nb-card-bonus-main"><strong>${esc(bonus.key||bonus.secondary||'开卡奖励')}</strong><span>${esc(spend)}</span><i aria-hidden="true">${iconSvg('plane')}</i></div><div class="nb-card-bonus-actions"><button class="nb-card-bonus-due tone-${tone}" data-action="attention-for-product" data-id="${esc(card.product.id)}" type="button"><span class="nb-card-clock">${iconSvg('clock')}</span><strong>${esc(remainingLabel(model,bonus))}</strong><span class="nb-card-chevron">›</span></button>${bonusTaskMarkup(ctx,bonus)}</div></div>`;
    }).join('')}</div></section>`;
  }

  function cycleStatusMarkup(ctx,benefit){
    const {esc}=ctx;
    const info=benefit.cycleInfo;
    if(!info) return '';
    if(info.mode==='manual'){
      const label=info.used?'已完成':'未标记';
      return `<button type="button" class="nb-benefit-cycle-quick ${info.used?'used':''}" data-action="benefit-manual-toggle" data-id="${esc(benefit.id)}" aria-pressed="${info.used?'true':'false'}"><span aria-hidden="true">${info.used?'✓':'○'}</span><span>${label}</span></button>`;
    }
    const label=info.used?(CYCLE_USED_LABELS[benefit.cycleType]||'本期已使用'):'未使用';
    return `<button type="button" class="nb-benefit-cycle-quick ${info.used?'used':''}" data-action="benefit-cycle-toggle" data-id="${esc(benefit.id)}" aria-pressed="${info.used?'true':'false'}"><span aria-hidden="true">${info.used?'✓':'○'}</span><span>${esc(label)}</span></button>`;
  }

  function benefitDetail(ctx,benefit){
    const {esc}=ctx;
    const rows=[['福利说明',benefit.short||'以当前公开规则为准']];
    const info=benefit.cycleInfo;
    if(info?.mode==='cycle'){
      rows.push(['本期可用至',formatDate(info.window.end)]);
      rows.push(['当前状态',info.used?'本期已使用':'本期可使用']);
    }else if(info?.mode==='manual'){
      rows.push(['当前状态',info.used?'已手动标记完成':'未标记；补充开卡日期后可自动计算持卡年']);
    }
    if(benefit.attention?.time) rows.push(['本期提醒',benefit.attention.time]);
    if(benefit.attention?.summary) rows.push(['使用提示',benefit.attention.summary]);

    const attention=benefit.attention;
    const checklist=Array.isArray(attention?.checklist)?attention.checklist:[];
    let actions='';
    if(info){
      actions=`<div class="nb-benefit-attention-actions">${attention?.instruction?`<div class="instruction-title">${esc(attention.instruction)}</div>`:''}${checklist.length?`<div class="checklist">${checklist.map(item=>`<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(attention.id)}" data-check="${esc(item.id)}" ${item.done?'checked':''}><span>${esc(item.label)}</span></label>`).join('')}</div>`:''}<div class="attention-actions">${info.mode==='manual'
        ? `<button class="btn ${info.used?'secondary':'primary'} small" type="button" data-action="benefit-manual-toggle" data-id="${esc(benefit.id)}">${info.used?'撤销完成':'标记完成'}</button>`
        : `<button class="btn ${info.used?'secondary':'primary'} small" type="button" data-action="benefit-cycle-toggle" data-id="${esc(benefit.id)}">${info.used?'撤销已使用':'已使用'}</button>`
      }${attention?.secondaryAction?`<button class="btn secondary small" data-action="skip-attention" data-id="${esc(attention.id)}">${esc(attention.secondaryAction)}</button>`:''}</div></div>`;
    }else if(attention){
      actions=`<div class="nb-benefit-attention-actions">${attention.instruction?`<div class="instruction-title">${esc(attention.instruction)}</div>`:''}${checklist.length?`<div class="checklist">${checklist.map(item=>`<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(attention.id)}" data-check="${esc(item.id)}" ${item.done?'checked':''}><span>${esc(item.label)}</span></label>`).join('')}</div>`:''}<div class="attention-actions"><button class="btn primary small" data-action="complete-attention" data-id="${esc(attention.id)}">${esc(attention.primary||'确认完成')}</button>${attention.secondaryAction?`<button class="btn secondary small" data-action="skip-attention" data-id="${esc(attention.id)}">${esc(attention.secondaryAction)}</button>`:''}</div></div>`;
    }
    return `<div class="benefit-detail v4-benefit-expanded nb-source-benefit-expanded"><dl>${rows.map(([label,value])=>`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>${actions}</div>`;
  }

  function benefitRow(ctx,benefit){
    const {state,esc}=ctx;
    const expanded=state.expandedBenefitId===benefit.id;
    const badge=benefit.attention&&!benefit.cycleInfo?.used&&benefit.cycleInfo?.mode!=='manual'
      ? `<span class="nb-card-benefit-due tone-${benefit.dueTone}">${esc(benefit.dueLabel)}</span>`
      : '';
    return `<div class="v4-benefit-item-wrap"><div class="v4-benefit-row nb-source-benefit-row" data-action="toggle-card-benefit" data-id="${esc(benefit.id)}" role="button" tabindex="0" aria-expanded="${expanded?'true':'false'}" ${benefit.benefitId?`data-benefit-id="${esc(benefit.benefitId)}"`:''} ${benefit.cycleType?`data-cycle-type="${esc(benefit.cycleType)}"`:''}><span class="v4-benefit-icon nb-card-benefit-icon">${iconSvg(benefitIconFor(benefit.title))}</span><strong>${esc(benefit.title)}</strong><small>${esc(benefit.short)}</small>${badge}${cycleStatusMarkup(ctx,benefit)}<b class="chev ${expanded?'up':''}" aria-hidden="true">›</b></div>${expanded?benefitDetail(ctx,benefit):''}</div>`;
  }

  function benefitsSection(ctx,card){
    const items=card.benefits;
    if(!items.length){
      return '<section class="v4-pd-section nb-card-benefits-section"><div class="nb-card-section-title nb-card-benefits-title"><span class="nb-card-section-icon nb-card-crown">'+iconSvg('crown')+'</span><div><h2>卡片福利</h2><p>查看这张卡的长期福利与当前使用状态</p></div></div><div class="timeline-empty">美卡101当前文章没有列出需要单独追踪的长期福利</div></section>';
    }
    const cut=Math.ceil(items.length/2);
    const left=items.slice(0,cut).map(item=>benefitRow(ctx,item)).join('');
    const right=items.slice(cut).map(item=>benefitRow(ctx,item)).join('');
    return `<section class="v4-pd-section nb-card-benefits-section"><div class="nb-card-section-title nb-card-benefits-title"><span class="nb-card-section-icon nb-card-crown">${iconSvg('crown')}</span><div><h2>卡片福利</h2><p>查看这张卡的长期福利与当前使用状态</p></div></div><div class="v4-benefit-lists nb-card-benefit-columns"><div>${left}</div>${right?`<div>${right}</div>`:''}</div></section>`;
  }

  function contactActions(card,esc){
    const {phone,loginUrl}=card.contact;
    if(!phone&&!loginUrl) return '';
    return `<div class="v4-pd-actions">${phone?`<button data-action="product-call" data-phone="${esc(phone)}">☎ <span>致电</span></button>`:''}${phone&&loginUrl?'<i></i>':''}${loginUrl?`<button data-action="product-login-external" data-url="${esc(loginUrl)}">↗ <span>登录</span></button>`:''}</div>`;
  }

  window.NextBonusCreditCardProductDetailView=Object.freeze({
    iconSvg,
    benefitIconFor,
    bonusSection,
    benefitsSection,
    contactActions
  });
})();