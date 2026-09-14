(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';
  const PRODUCT_ID = 'p-amex-plat-1005';
  const AMEX_LOGIN_URL = 'https://www.americanexpress.com/en-US/account/login?COUNTRY_CODE=US';
  const AMEX_SUPPORT_PHONE = '1-800-525-3355';
  let pendingEditorBonus = null;

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function isPlatinumPage(page) {
    const title = page?.querySelector('.v4-pd-title-row h1')?.textContent || '';
    return title.includes('The Platinum Card') || title.includes('AMEX Platinum');
  }

  function iconSvg(kind) {
    const icons = {
      gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4z"></path><path d="M3 7h18v3H3z"></path><path d="M12 7v13"></path><path d="M12 7H8.8A2.3 2.3 0 1 1 12 4.9V7z"></path><path d="M12 7h3.2A2.3 2.3 0 1 0 12 4.9V7z"></path></svg>',
      crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8z"></path><path d="M7 21h10"></path></svg>',
      car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 11 2-4h10l2 4"></path><path d="M4 11h16v6H4z"></path><circle cx="7" cy="18" r="1.5"></circle><circle cx="17" cy="18" r="1.5"></circle></svg>',
      bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg>',
      clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke-dasharray="1.6 2.4"></circle></svg>',
      plane: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 13 7-2 3-7 2 1-1 6 6 2v2l-6 1 1 5-2 1-3-6-7-1v-2z"></path></svg>',
      bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6v13"></path><path d="M20 11v8"></path><path d="M4 15h16"></path><path d="M7 10h4a3 3 0 0 1 3 3v2H7v-5z"></path></svg>',
      building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h9v17"></path><path d="M15 9h4v12"></path><path d="M9 8h3M9 12h3M9 16h3"></path><path d="M4 21h16"></path></svg>',
      clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path></svg>',
      shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.8-2.7 8-7 10-4.3-2-7-5.2-7-10V6l7-3z"></path><path d="m9 12 2 2 4-4"></path></svg>'
    };
    return icons[kind] || icons.shield;
  }

  function benefitIconFor(title) {
    if (/Uber|租车/.test(title)) return 'car';
    if (/Saks|购物/.test(title)) return 'bag';
    if (/CLEAR/.test(title)) return 'clear';
    if (/Global Entry|TSA|行程/.test(title)) return /行程/.test(title) ? 'clock' : 'plane';
    if (/Hilton/.test(title)) return 'bed';
    if (/Marriott/.test(title)) return 'building';
    if (/退货/.test(title)) return 'shield';
    return 'shield';
  }

  function dateParts(value) {
    if (!value) return null;
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function shortDate(value) {
    const d = dateParts(value);
    return d ? `${d.getMonth() + 1}月${d.getDate()}日` : String(value || '');
  }

  function daysUntil(value) {
    const due = dateParts(value);
    if (!due) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.ceil((due.getTime() - today.getTime()) / 86400000);
  }

  function urgencyTone(days) {
    if (days === null) return 'calm';
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'warning';
    return 'calm';
  }

  function remainingLabel(attention) {
    const days = daysUntil(attention?.dueDate);
    if (days === null) return attention?.time || '';
    if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
    if (days === 0) return '今天截止';
    return `剩余 ${days} 天`;
  }

  function dueLabel(attention) {
    const due = dateParts(attention?.dueDate);
    if (due) return `Due ${due.getMonth() + 1}月${due.getDate()}日`;
    const raw = String(attention?.time || '')
      .replace(/^本期截止\s*/u, '')
      .replace(/^截止\s*/u, '')
      .trim();
    return raw ? `Due ${raw}` : 'Due';
  }

  function benefitAttentionFor(title, attentions) {
    const patterns = [
      [/Uber/i, /Uber/i],
      [/Saks/i, /Saks/i],
      [/CLEAR/i, /CLEAR/i],
      [/Global Entry|TSA/i, /Global Entry|TSA/i],
      [/Hilton/i, /Hilton/i],
      [/Marriott/i, /Marriott/i],
      [/高级租车保障|租车/i, /租车/i],
      [/行程延误险|行程延误/i, /行程延误/i],
      [/购物保障/i, /购物保障/i],
      [/退货保障/i, /退货保障/i]
    ];
    const match = patterns.find(([titlePattern]) => titlePattern.test(title));
    if (!match) return null;
    const attentionPattern = match[1];
    return attentions.find((item) => {
      if (item.productId !== PRODUCT_ID || item.type !== 'benefit') return false;
      const text = `${item.action || ''} ${item.key || ''} ${item.secondary || ''}`;
      return attentionPattern.test(text);
    }) || null;
  }

  function decorateBenefitRows(section, attentions) {
    section.querySelectorAll('.v4-benefit-row').forEach((row) => {
      const title = row.querySelector('strong')?.textContent?.trim() || '';
      const icon = row.querySelector('.v4-benefit-icon');
      if (icon) {
        icon.classList.add('nb-plat-benefit-icon');
        icon.innerHTML = iconSvg(benefitIconFor(title));
      }

      row.querySelector('.nb-plat-benefit-due')?.remove();
      const attention = benefitAttentionFor(title, attentions);
      if (!attention) return;

      const badge = document.createElement('span');
      const days = daysUntil(attention.dueDate);
      badge.className = `nb-plat-benefit-due tone-${urgencyTone(days)}`;
      badge.textContent = dueLabel(attention);
      const chevron = row.querySelector('b');
      row.insertBefore(badge, chevron || null);
    });
  }

  function singleRequirementMarkup(bonus, firstTask) {
    const condition = firstTask?.label || '完成符合条件的消费要求';
    return `<div class="nb-plat-single-task"><span>${esc(condition)}</span><button class="nb-plat-complete-btn" data-action="complete-attention" data-id="${esc(bonus.id)}" type="button">标记完成</button></div>`;
  }

  function multiRequirementMarkup(bonus, checklist) {
    return `<div class="nb-plat-multi-task">${checklist.map((task) => `<label class="nb-plat-bonus-check"><input type="checkbox" data-action="checklist" data-attention="${esc(bonus.id)}" data-check="${esc(task.id)}" ${task.done ? 'checked' : ''}/><span>${esc(task.label)}</span></label>`).join('')}<button class="nb-plat-complete-btn" data-action="complete-attention" data-id="${esc(bonus.id)}" type="button">我已全部完成</button></div>`;
  }

  function bonusCardMarkup(bonus) {
    const checklist = Array.isArray(bonus.checklist) ? bonus.checklist : [];
    const firstTask = checklist[0];
    const secondary = String(bonus.secondary || '');
    const spendCopy = /消费/.test(secondary)
      ? secondary.replace(/，?获得.*$/u, '').replace(/个月/u, ' 个月')
      : (firstTask?.label || secondary || '完成对应奖励条件');
    const days = daysUntil(bonus.dueDate);

    return `<div class="nb-plat-bonus-card"><div class="nb-plat-bonus-main"><strong>${esc(bonus.key || bonus.secondary || '开卡奖励')}</strong><span>${esc(spendCopy)}</span><i aria-hidden="true">${iconSvg('plane')}</i></div><div class="nb-plat-bonus-actions"><button class="nb-plat-bonus-due tone-${urgencyTone(days)}" data-action="attention-for-product" data-id="${PRODUCT_ID}" type="button"><span class="nb-plat-clock">${iconSvg('clock')}</span><strong>${esc(remainingLabel(bonus))}</strong><span class="nb-plat-chevron">›</span></button>${checklist.length <= 1 ? singleRequirementMarkup(bonus, firstTask) : multiRequirementMarkup(bonus, checklist)}</div></div>`;
  }

  function buildBonusSection(bonuses) {
    const section = document.createElement('section');
    section.className = 'v4-pd-section nb-plat-bonus-section';
    section.innerHTML = `<div class="nb-plat-section-title"><span class="nb-plat-section-icon">${iconSvg('gift')}</span><h2>开卡奖励</h2></div><div class="nb-plat-bonus-stack">${bonuses.map(bonusCardMarkup).join('')}</div>`;
    return section;
  }

  function ensureProductActions(page) {
    const left = page.querySelector('.v4-pd-left');
    const card = left?.querySelector('.v4-pd-card');
    if (!left || !card || left.querySelector('.v4-pd-actions')) return;
    const actions = document.createElement('div');
    actions.className = 'v4-pd-actions';
    actions.innerHTML = `<button data-action="product-call" data-phone="${AMEX_SUPPORT_PHONE}">☎ <span>致电</span></button><i></i><button data-action="product-login-external" data-url="${AMEX_LOGIN_URL}">↗ <span>登录</span></button>`;
    card.insertAdjacentElement('afterend', actions);
  }

  function platinumBonusCount(state) {
    const items = Array.isArray(state?.activeAttention) ? state.activeAttention : [];
    return items.filter((item) => item.productId === PRODUCT_ID && item.type === 'bonus').length;
  }

  function capturePublicEditorBonus() {
    const selected = document.querySelector('.option-row.selected[data-action="edit-bonus-choice"]');
    if (!selected || selected.dataset.id === 'manual') return;
    const reward = selected.querySelector('.option-title')?.textContent?.trim() || '';
    const req = selected.querySelector('.option-sub')?.textContent?.trim() || '';
    if (!reward) return;
    pendingEditorBonus = { kind: 'public', reward, req };
  }

  function captureManualEditorBonus() {
    const reward = document.getElementById('edit-bonus-reward')?.value?.trim() || '';
    const tasks = [...document.querySelectorAll('.task-card')].map((card) => ({
      id: card.querySelector('.edit-task-desc')?.dataset.id || `e${Date.now()}`,
      desc: card.querySelector('.edit-task-desc')?.value?.trim() || '',
      due: card.querySelector('.edit-task-due')?.value || ''
    })).filter((task) => task.desc && task.due);
    if (!reward || !tasks.length) return;
    pendingEditorBonus = { kind: 'manual', reward, tasks };
  }

  function persistEditorBonusIfCoreSkipped(draft, beforeCount) {
    window.setTimeout(() => {
      if (!draft) return;
      const state = readState();
      if (platinumBonusCount(state) > beforeCount) {
        pendingEditorBonus = null;
        return;
      }

      const product = (Array.isArray(state.products) ? state.products : []).find((item) => item.id === PRODUCT_ID);
      if (!product) {
        pendingEditorBonus = null;
        return;
      }

      const due = draft.kind === 'manual' ? draft.tasks?.[0]?.due || null : null;
      const now = Date.now();
      const attention = {
        id: `a-edit-${now}-${Math.random().toString(36).slice(2, 7)}`,
        productId: PRODUCT_ID,
        product: `${product.name} ${product.instance || ''}`.trim(),
        action: '完成开卡奖励',
        secondary: draft.reward,
        time: due ? `截止 ${shortDate(due)}` : '截止日期以所选奖励规则为准',
        dueDate: due,
        type: 'bonus',
        summary: '这是你在编辑产品时补充建立的开卡奖励追踪。',
        key: draft.reward,
        keySub: due ? `最晚 ${shortDate(due)} 完成` : '按所选奖励规则',
        instruction: '完成以下条件',
        checklist: draft.kind === 'manual'
          ? draft.tasks.map((task) => ({ id: task.id, label: task.desc, done: false, dueDate: task.due }))
          : [{ id: `req-${now}`, label: draft.req || '完成对应奖励条件', done: false }],
        primary: '我已完成',
        secondaryAction: null,
        completionKind: 'completed'
      };

      if (!Array.isArray(state.activeAttention)) state.activeAttention = [];
      state.activeAttention.push(attention);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      pendingEditorBonus = null;

      // Reload once so the main app state, Product Page, All Attention and Product Detail
      // all read the same newly persisted tracker instead of keeping two in-memory states.
      window.location.reload();
    }, 0);
  }

  function installMultipleBonusEditorBridge() {
    document.addEventListener('click', (event) => {
      const el = event.target.closest?.('[data-action]');
      if (!el) return;
      const action = el.dataset.action;

      if (action === 'edit-product') {
        pendingEditorBonus = null;
        return;
      }
      if (action === 'edit-bonus-use') {
        capturePublicEditorBonus();
        return;
      }
      if (action === 'edit-bonus-manual-use') {
        captureManualEditorBonus();
        return;
      }
      if (action === 'save-edit-product' && el.dataset.id === PRODUCT_ID && pendingEditorBonus) {
        const beforeCount = platinumBonusCount(readState());
        persistEditorBonusIfCoreSkipped(structuredClone(pendingEditorBonus), beforeCount);
      }
    }, true);
  }

  function applyPlatinumDetail() {
    const page = document.querySelector('.v4-product-detail-page');
    if (!page || !isPlatinumPage(page) || page.dataset.nbPlatBenefitV15 === '1') return;

    const benefits = page.querySelector('.v4-pd-benefits');
    if (!benefits) return;

    page.dataset.nbPlatBenefitV15 = '1';
    page.classList.add('nb-plat-v11', 'nb-plat-v12', 'nb-plat-v13', 'nb-plat-v14', 'nb-plat-v15');
    ensureProductActions(page);

    const state = readState();
    const activeAttention = Array.isArray(state.activeAttention) ? state.activeAttention : [];
    const bonuses = activeAttention.filter((item) => item.productId === PRODUCT_ID && item.type === 'bonus');
    const attentionSection = page.querySelector('.v4-pd-attention');

    if (attentionSection) attentionSection.remove();

    benefits.classList.add('nb-plat-benefits-section');
    const head = benefits.querySelector('.v4-section-head');
    if (head) {
      head.className = 'nb-plat-section-title nb-plat-benefits-title';
      head.innerHTML = `<span class="nb-plat-section-icon nb-plat-crown">${iconSvg('crown')}</span><div><h2>卡片福利</h2><p>享受全方位的旅行、生活与购物礼遇</p></div>`;
    }

    benefits.querySelector('.v4-featured-benefits')?.remove();
    decorateBenefitRows(benefits, activeAttention);

    const lists = benefits.querySelector('.v4-benefit-lists');
    if (lists) lists.classList.add('nb-plat-benefit-columns');

    if (bonuses.length) benefits.before(buildBonusSection(bonuses));
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      applyPlatinumDetail();
    });
  }

  installMultipleBonusEditorBridge();
  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', scheduleApply);
  scheduleApply();
})();
