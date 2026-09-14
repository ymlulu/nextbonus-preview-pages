'use strict';

(function () {
  const STORAGE_KEY = 'nextbonus-local-v8-state';
  let accountFactsCache = null;
  let membershipFactsCache = null;
  let selectedAddProductId = null;

  const ADD_PRODUCT_TO_OFFER = Object.freeze({
    'c-plat': 'amex-platinum',
    'c-gold': 'amex-gold',
    'c-csp': 'chase-sapphire',
    'c-bilt': 'bilt-palladium',
    'c-vx': 'capitalone-venturex',
    'c-citi-elite': 'citi-strata',
    'b-usbank': 'usbank-checking',
    'b-hsbc': 'hsbc-checking',
    'b-truist': 'truist-checking',
    'br-moomoo': 'moomoo',
    'br-robinhood': 'robinhood'
  });

  const PRODUCT_NAME_TO_OFFER = Object.freeze({
    'AMEX Platinum': 'amex-platinum',
    'AMEX Platinum Card': 'amex-platinum',
    'AMEX Gold': 'amex-gold',
    'AMEX Gold Card': 'amex-gold',
    'Chase Sapphire Preferred': 'chase-sapphire',
    'Bilt Palladium Card': 'bilt-palladium',
    'Capital One Venture X': 'capitalone-venturex',
    'Citi Strata Elite': 'citi-strata'
  });

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[®™℠]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function allProducts(state) {
    return [
      ...(Array.isArray(state.products) ? state.products : []),
      ...(Array.isArray(state.pastProducts) ? state.pastProducts : [])
    ];
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    return response.json();
  }

  async function loadAccountFacts() {
    if (!accountFactsCache) accountFactsCache = await loadJson('./account-product-facts.json');
    return accountFactsCache;
  }

  async function loadMembershipFacts() {
    if (!membershipFactsCache) membershipFactsCache = await loadJson('./membership-other-product-facts.json');
    return membershipFactsCache;
  }

  function resolveFact(data, product) {
    for (const [key, fact] of Object.entries(data.products || {})) {
      if ((fact.productIds || []).includes(product.id)) return [key, fact];
      if ((fact.names || []).map(normalize).includes(normalize(product.name))) return [key, fact];
    }
    return null;
  }

  function logoFor(product) {
    const registry = window.NextBonusProductLogoRegistry;
    const registryLogo = registry && registry.resolve
      ? registry.resolve(product.id || '', product.offerId || '', product.name || '')
      : '';
    if (registryLogo) return registryLogo;

    const byInstitution = {
      'U.S. Bank': 'assets/product-logos/usbank.png',
      'Truist': 'assets/product-logos/truist.png',
      'Chase': 'assets/product-logos/chase.png',
      'Wells Fargo': 'assets/product-logos/wells-fargo.png',
      'Fidelity': 'assets/product-logos/fidelity.png',
      'Robinhood': 'assets/product-logos/robinhood.png',
      'HSBC': 'assets/product-logos/hsbc.svg',
      'Moomoo': 'assets/product-logos/moomoo.svg',
      'Hilton': 'assets/product-logos/hilton.png',
      'IHG': 'assets/product-logos/ihg.png',
      'Marriott': 'assets/product-logos/marriott.png',
      'Hyatt': 'assets/product-logos/hyatt.png',
      'Delta': 'assets/product-logos/delta.png'
    };
    return byInstitution[product.institution] || '';
  }

  function makeHeading(title) {
    const head = document.createElement('div');
    head.className = 'v4-section-head';
    const h2 = document.createElement('h2');
    h2.textContent = title;
    head.appendChild(h2);
    return head;
  }

  function buildRows(title, rows) {
    if (!rows || !rows.length) return null;
    const section = document.createElement('section');
    section.className = 'v4-pd-section nb-account-section';
    section.appendChild(makeHeading(title));
    const grid = document.createElement('div');
    grid.className = 'nb-account-grid';
    rows.forEach(function (row) {
      const item = document.createElement('div');
      item.className = 'nb-account-row';
      const label = document.createElement('strong');
      label.textContent = row[0];
      const value = document.createElement('span');
      value.textContent = row[1];
      item.append(label, value);
      grid.appendChild(item);
    });
    section.appendChild(grid);
    return section;
  }

  function addNotice(page, anchor, text, extraClass) {
    if (!text) return;
    const notice = document.createElement('section');
    notice.className = 'v4-pd-section nb-account-notice' + (extraClass ? ' ' + extraClass : '');
    notice.appendChild(makeHeading('资料说明'));
    const p = document.createElement('p');
    p.textContent = text;
    notice.appendChild(p);
    page.insertBefore(notice, anchor);
  }

  function addSource(page, anchor, fact) {
    const source = document.createElement('div');
    source.className = 'nb-account-source';
    source.append('资料：');
    const link = document.createElement('a');
    link.href = fact.sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '美卡101';
    source.appendChild(link);
    if (fact.sourceDate) source.append(' · ' + fact.sourceDate);
    page.insertBefore(source, anchor);
  }

  function titlesFor(fact) {
    if (fact.kind === 'brokerage') return ['账户费用与收益', '账户功能'];
    if (fact.kind === 'membership') return ['会籍信息', '核心权益'];
    if (fact.kind === 'cashback') return ['平台信息', '核心功能'];
    if (fact.kind === 'tool') return ['版本与费用', '核心功能'];
    return ['账户信息', '账户功能与权益'];
  }

  function dateLabelFor(product) {
    if (product.type === '会籍') return '获得日期';
    if (product.type === '其他') return '开始使用日期';
    return '开户日期';
  }

  function isPrototypeDate(product) {
    if (!product || String(product.id || '').startsWith('p-local-')) return false;
    if (product.type === '会籍' && (product.opened === '2026-01-01' || product.opened === '2025-01-01')) return true;
    if (product.type === '其他' && product.opened === '2024-01-01') return true;
    return false;
  }

  function normalizeOverviewDate(page, product) {
    const labelText = dateLabelFor(product);
    page.querySelectorAll('.v4-pd-facts > div').forEach(function (item) {
      const label = item.querySelector('small');
      const value = item.querySelector('strong');
      if (!label || label.textContent.trim() !== '开户日期') return;
      label.textContent = labelText;
      if (value && isPrototypeDate(product)) value.textContent = '未填写';
    });
  }

  function cleanBaseNonCreditSections(page) {
    const earning = page.querySelector('.v4-pd-earning');
    if (earning) earning.remove();
    const oldBenefits = page.querySelector('.v4-pd-benefits');
    if (oldBenefits) oldBenefits.remove();
  }

  async function getResolved(product) {
    if (product.type === '银行和券商账户') {
      const data = await loadAccountFacts();
      const resolved = resolveFact(data, product);
      return resolved ? { data, resolved } : null;
    }
    if (product.type === '会籍' || product.type === '其他') {
      const data = await loadMembershipFacts();
      const resolved = resolveFact(data, product);
      return resolved ? { data, resolved } : null;
    }
    return null;
  }

  async function applyProductDetail() {
    const page = document.querySelector('.v4-product-detail-page');
    if (!page) return;
    const state = readState();
    const product = allProducts(state).find(function (item) { return item.id === state.currentProductId; });
    if (!product || product.type === '信用卡') return;

    normalizeOverviewDate(page, product);
    cleanBaseNonCreditSections(page);

    const result = await getResolved(product);
    const history = page.querySelector('.v4-pd-history');
    const anchor = history || null;

    if (!result) {
      const marker = 'unverified:' + normalize(product.name);
      if (page.dataset.nbNonCardFacts === marker) return;
      page.dataset.nbNonCardFacts = marker;
      page.classList.add('nb-account-detail');
      addNotice(
        page,
        anchor,
        '美卡101当前没有足够明确、可直接对应这个产品的长期资料，因此这里不展示推测性的消费回报或福利。',
        'nb-no-verified-detail'
      );
      return;
    }

    const data = result.data;
    const key = result.resolved[0];
    const fact = result.resolved[1];
    const marker = key + ':' + data.version;
    if (page.dataset.nbNonCardFacts === marker) return;
    page.dataset.nbNonCardFacts = marker;
    page.classList.add('nb-account-detail');

    const logo = logoFor(product);
    const card = page.querySelector('.v4-pd-card');
    if (card && logo) {
      card.classList.add('nb-account-logo-card');
      card.replaceChildren();
      const img = document.createElement('img');
      img.src = logo;
      img.alt = product.institution || product.name;
      card.appendChild(img);
    }

    const titles = titlesFor(fact);
    const metrics = buildRows(titles[0], fact.metrics);
    const features = buildRows(titles[1], fact.features);
    if (metrics) page.insertBefore(metrics, anchor);
    if (features) page.insertBefore(features, anchor);
    addNotice(page, anchor, fact.notice);
    addSource(page, anchor, fact);
  }

  function applyEditDateLabel() {
    const page = document.querySelector('.edit-product-page');
    if (!page) return;
    const state = readState();
    const product = allProducts(state).find(function (item) { return item.id === state.currentProductId; });
    if (!product || product.type === '信用卡') return;
    const input = page.querySelector('#edit-opened');
    const label = input && input.closest('.form-group') ? input.closest('.form-group').querySelector('.label') : null;
    if (label) label.textContent = dateLabelFor(product);
    if (input && isPrototypeDate(product)) input.value = '';
  }

  function findManualRow(list, actionName) {
    return Array.from(list.querySelectorAll('.option-row')).find(function (row) {
      return row.dataset.action === actionName && row.dataset.id === 'manual';
    }) || null;
  }

  function addCurrentOfferNote(list, offer) {
    if (list.parentElement && list.parentElement.querySelector('.nb-current-offer-note')) return;
    const note = document.createElement('div');
    note.className = 'report nb-current-offer-note';
    const title = document.createElement('h3');
    const copy = document.createElement('p');
    const detail = document.createElement('p');
    detail.className = 'muted';
    if (offer) {
      title.textContent = '当前公开奖励：' + offer.primaryValue;
      copy.textContent = offer.primaryRequirement || '';
      detail.textContent = '当前数据来自统一 Offer 数据层。因为这里没有可确认的完整追踪截止日期，NextBonus 不自动生成任务，请按你实际申请 / 开户时的条款手动添加。';
    } else {
      title.textContent = '没有可确认的当前奖励';
      copy.textContent = '';
      detail.textContent = 'NextBonus 不会根据历史奖励或常见奖励猜测。你可以按实际申请 / 开户条款手动添加。';
    }
    note.append(title, copy, detail);
    list.parentElement.insertBefore(note, list);
  }

  function patchChoiceList(list, actionName, offerId, safeChoiceId) {
    if (!list) return;
    const marker = (offerId || 'none') + ':' + (safeChoiceId || 'manual');
    if (list.dataset.nbSourceOffer === marker) return;
    const offer = offerId && window.NextBonusOfferData ? window.NextBonusOfferData[offerId] : null;
    const manual = findManualRow(list, actionName);
    const rows = Array.from(list.querySelectorAll('.option-row'));

    if (offer && safeChoiceId) {
      rows.forEach(function (row) {
        if (row === manual || row.dataset.id === safeChoiceId) return;
        row.remove();
      });
      const safe = list.querySelector('.option-row[data-id="' + safeChoiceId + '"]');
      if (safe) {
        const title = safe.querySelector('.option-title');
        const sub = safe.querySelector('.option-sub');
        const tag = safe.querySelector('.option-tag');
        if (title) title.textContent = offer.primaryValue;
        if (sub) sub.textContent = offer.primaryRequirement || '';
        if (tag) tag.textContent = '当前公开';
      }
    } else {
      rows.forEach(function (row) {
        if (row !== manual) row.remove();
      });
      addCurrentOfferNote(list, offer);
    }
    list.dataset.nbSourceOffer = marker;
  }

  function applyAddFlowCleanup() {
    const modal = document.querySelector('.add-product-modal');
    if (!modal) return;

    const opened = modal.querySelector('#add-opened');
    if (opened && selectedAddProductId && selectedAddProductId.startsWith('m-')) {
      const label = opened.closest('.form-group') ? opened.closest('.form-group').querySelector('.label') : null;
      if (label) label.textContent = '获得日期（可选）';
    }

    const title = modal.querySelector('.modal-title');
    if (!title || title.textContent.trim() !== '选择你申请时的奖励') return;
    const list = modal.querySelector('.option-list');
    const offerId = selectedAddProductId ? (ADD_PRODUCT_TO_OFFER[selectedAddProductId] || null) : null;
    const safeChoiceId = selectedAddProductId === 'c-plat' ? 'plat175' : null;
    patchChoiceList(list, 'add-offer-choice', offerId, safeChoiceId);
  }

  function applyEditRewardCleanup() {
    const page = document.querySelector('.edit-product-page');
    if (!page) return;
    const title = page.querySelector('.page-title');
    if (!title || title.textContent.trim() !== '选择你申请时的奖励') return;
    const state = readState();
    const product = allProducts(state).find(function (item) { return item.id === state.currentProductId; });
    const offerId = product ? (product.offerId || PRODUCT_NAME_TO_OFFER[product.name] || null) : null;
    const safeChoiceId = offerId === 'amex-platinum' ? 'plat175' : null;
    patchChoiceList(page.querySelector('.option-list'), 'edit-bonus-choice', offerId, safeChoiceId);
  }

  function schedule() {
    setTimeout(function () {
      applyProductDetail().catch(function () {});
      applyEditDateLabel();
      applyAddFlowCleanup();
      applyEditRewardCleanup();
    }, 0);
  }

  window.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('storage', schedule);
  document.addEventListener('click', function (event) {
    if (!event.target.closest) return;
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (actionTarget.dataset.action === 'add-product-select') selectedAddProductId = actionTarget.dataset.id || null;
    if (actionTarget.dataset.action === 'add-another' || actionTarget.dataset.action === 'add-close') selectedAddProductId = null;
    if ([
      'open-product','add-view-product','add-view-existing','edit-product','edit-bonus-open',
      'add-product-select','add-to-track','add-track-next','add-back','add-another'
    ].includes(actionTarget.dataset.action)) schedule();
  });
  schedule();
})();
