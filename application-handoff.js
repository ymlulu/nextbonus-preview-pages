(() => {
  'use strict';

  const APP_STATE_KEY = 'nextbonus-local-v8-state';
  const HANDOFF_KEY = 'nextbonus-application-handoff-v1';
  const SUCCESS_KEY = 'nextbonus-application-handoff-success-v1';
  const ROOT_ID = 'nb-application-handoff-root';
  const STYLE_ID = 'nb-application-handoff-style';
  const UNRESOLVED_STATUSES = new Set([
    'awaiting_result', 'deferred', 'pending',
    'approved_needs_login'
  ]);

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const nowIso = () => new Date().toISOString();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function appState() {
    return readJson(APP_STATE_KEY, null);
  }

  function handoffStore() {
    const store = readJson(HANDOFF_KEY, null);
    return store && Array.isArray(store.attempts)
      ? store
      : { schemaVersion: 1, activeId: null, attempts: [] };
  }

  function saveStore(store) {
    writeJson(HANDOFF_KEY, store);
  }

  function activeAttempt() {
    const store = handoffStore();
    return store.attempts.find(x => x.id === store.activeId) || null;
  }

  function attemptForCurrentView() {
    const state = appState();
    const store = handoffStore();
    const active = store.attempts.find(attempt => attempt.id === store.activeId) || null;
    if (active && !UNRESOLVED_STATUSES.has(active.status)) {
      store.activeId = null;
      saveStore(store);
    }
    if (state?.route === 'offer-detail' && state.currentOfferId) {
      const matching = store.attempts.find(attempt =>
        attempt.offerId === state.currentOfferId && UNRESOLVED_STATUSES.has(attempt.status)
      ) || null;
      if (matching && store.activeId !== matching.id) {
        store.activeId = matching.id;
        saveStore(store);
      }
      return matching;
    }
    return active && UNRESOLVED_STATUSES.has(active.status) ? active : null;
  }

  function updateAttempt(id, patch) {
    const store = handoffStore();
    const index = store.attempts.findIndex(x => x.id === id);
    if (index < 0) return null;
    store.attempts[index] = { ...store.attempts[index], ...patch, updatedAt: nowIso() };
    saveStore(store);
    return store.attempts[index];
  }

  function finishAttempt(id, status) {
    const store = handoffStore();
    const index = store.attempts.findIndex(x => x.id === id);
    if (index >= 0) store.attempts[index] = { ...store.attempts[index], status, updatedAt: nowIso() };
    if (store.activeId === id) store.activeId = null;
    saveStore(store);
    render();
  }

  function currentContext() {
    const state = appState();
    const offerId = state?.currentOfferId;
    const offer = offerId ? window.NextBonusOfferData?.[offerId] : null;
    const productId = offer?.productId || null;
    const product = productId ? window.NextBonusOfferProducts?.[productId] : null;
    if (!state || !offerId || !offer || !product || !offer.applyUrl) return null;
    const assessment = state.assessmentResults?.[offerId] || null;
    return {
      productId,
      offerId,
      offerVersionId: offer.offerVersionId || `preview-current:${offerId}`,
      productName: product.name,
      issuer: product.provider,
      category: product.category,
      applicationUrl: offer.applyUrl,
      reward: offer.primaryValue || '',
      requirement: offer.primaryRequirement || '',
      assessmentId: assessment?.id || assessment?.assessmentId || null,
      assessmentSnapshot: clone(assessment)
    };
  }

  function startHandoff() {
    const context = currentContext();
    if (!context) return null;
    const store = handoffStore();
    const current = store.attempts.find(x => x.id === store.activeId);
    if (current && current.offerId === context.offerId && UNRESOLVED_STATUSES.has(current.status)) {
      render();
      return current;
    }
    const idBase = `app-${Date.now()}`;
    let id = idBase;
    let suffix = 1;
    while (store.attempts.some(attempt => attempt.id === id)) id = `${idBase}-${suffix++}`;
    const attempt = {
      id,
      ...context,
      applicationClickedAt: nowIso(),
      status: 'awaiting_result',
      // startHandoff runs only after app.js has opened (or confirmed opening)
      // the external application page. Persist this before relying on blur.
      leftForApplicationAt: nowIso(),
      returnedAt: null,
      resultConfirmedAt: null,
      anchorDate: null,
      createdUserProductId: null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    store.attempts.unshift(attempt);
    store.activeId = id;
    saveStore(store);
    render();
    return attempt;
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      document.body.appendChild(root);
    }
    return root;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .nb-ah-banner,.nb-ah-success{position:fixed;right:24px;bottom:24px;z-index:2200;width:min(380px,calc(100vw - 32px));background:rgba(255,255,255,.97);border:1px solid rgba(0,0,0,.08);box-shadow:0 18px 50px rgba(0,0,0,.15);border-radius:18px;padding:16px;backdrop-filter:blur(18px)}
      .nb-ah-banner strong,.nb-ah-success strong{display:block;font-size:15px;margin-bottom:5px}.nb-ah-banner p,.nb-ah-success p{margin:0 0 12px;color:#667085;font-size:13px;line-height:1.5}.nb-ah-success p{margin-bottom:0}
      .nb-ah-row{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}.nb-ah-btn{appearance:none;border:0;border-radius:11px;padding:10px 14px;font:inherit;font-size:14px;font-weight:650;cursor:pointer;text-decoration:none}.nb-ah-btn.primary{background:#111827;color:#fff}.nb-ah-btn.secondary{background:#f2f4f7;color:#1f2937}.nb-ah-btn.ghost{background:transparent;color:#667085}.nb-ah-btn:disabled{opacity:.45;cursor:not-allowed}
      .nb-ah-backdrop{position:fixed;inset:0;z-index:2300;background:rgba(17,24,39,.28);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px)}.nb-ah-modal{width:min(520px,100%);background:#fff;border-radius:24px;box-shadow:0 28px 80px rgba(0,0,0,.22);overflow:hidden}.nb-ah-head{padding:24px 26px 8px;display:flex;gap:16px;align-items:flex-start;justify-content:space-between}.nb-ah-title{font-size:22px;font-weight:760;letter-spacing:-.02em}.nb-ah-sub{margin-top:6px;color:#667085;font-size:14px}.nb-ah-close{border:0;background:#f2f4f7;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;color:#475467}.nb-ah-body{padding:16px 26px 24px}.nb-ah-foot{padding:0 26px 24px;display:flex;justify-content:space-between;gap:10px;align-items:center}.nb-ah-result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.nb-ah-result{border:1px solid #e5e7eb;background:#fff;border-radius:16px;padding:18px 10px;font:inherit;font-weight:700;cursor:pointer}.nb-ah-result:hover{border-color:#98a2b3;background:#fafafa}.nb-ah-note{background:#f8fafc;border-radius:14px;padding:13px 14px;color:#475467;font-size:13px;line-height:1.55;margin-top:14px}.nb-ah-field label{display:block;font-size:13px;font-weight:650;margin-bottom:7px}.nb-ah-field input{width:100%;box-sizing:border-box;border:1px solid #d0d5dd;border-radius:12px;padding:12px;font:inherit}
      @media(max-width:640px){.nb-ah-banner,.nb-ah-success{right:16px;bottom:16px}.nb-ah-result-grid{grid-template-columns:1fr}.nb-ah-modal{border-radius:20px}.nb-ah-head,.nb-ah-body,.nb-ah-foot{padding-left:20px;padding-right:20px}}
    `;
    document.head.appendChild(style);
  }

  function verifiedFollowup(attempt) {
    const entry = window.NextBonusApplicationFollowupRegistry?.find?.({ productId: attempt.productId, issuer: attempt.issuer }) || null;
    return entry?.verificationStatus === 'verified' ? entry : null;
  }

  function banner(attempt) {
    const copy = {
      awaiting_result: ['申请页面已打开','回来后告诉 NextBonus 申请结果，后续条件就可以接着追踪。'],
      deferred: ['待确认申请结果','申请上下文已经保存，之后回来不需要重新选择产品或 Offer。'],
      pending: ['申请还在审核中','NextBonus 已保留这次申请上下文，你可以随时回来更新结果。'],
      denied: ['这次申请没有通过','如果后续结果变化，可以回来更新；已核验的后续处理入口也会显示在这里。'],
      approved_needs_login: ['已通过 · 待保存','登录后即可把产品和本次奖励追踪一起加入“我的”。']
    }[attempt.status];
    if (!copy) return '';
    return `<div class="nb-ah-banner"><strong>${esc(copy[0])}</strong><p>${esc(attempt.productName)} · ${esc(copy[1])}</p><div class="nb-ah-row"><button class="nb-ah-btn secondary" data-handoff-action="open">${attempt.status === 'denied' ? '查看后续' : '更新结果'}</button></div></div>`;
  }

  function choiceModal(attempt) {
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">申请结果怎么样？</div><div class="nb-ah-sub">${esc(attempt.productName)}</div></div><button class="nb-ah-close" data-handoff-action="defer" aria-label="稍后确认">×</button></div><div class="nb-ah-body"><div class="nb-ah-result-grid"><button class="nb-ah-result" data-handoff-action="result" data-result="approved">已通过</button><button class="nb-ah-result" data-handoff-action="result" data-result="pending">Pending</button><button class="nb-ah-result" data-handoff-action="result" data-result="denied">未通过</button></div><div class="nb-ah-note">点击“直接申请”只冻结本次 Product / Offer / Assessment 上下文，并不等于你已经提交申请。只有你确认结果后，NextBonus 才会创建实际产品或后续状态。</div></div><div class="nb-ah-foot"><button class="nb-ah-btn ghost" data-handoff-action="not-submitted">我没有提交申请</button><button class="nb-ah-btn secondary" data-handoff-action="defer">稍后确认</button></div></div></div>`;
  }

  function followupModal(attempt, kind) {
    const entry = verifiedFollowup(attempt);
    const pending = kind === 'pending';
    const title = pending ? '申请还在审核中' : '这次申请没有通过';
    const specific = entry
      ? `<div class="nb-ah-note">已读取 Application Follow-up Registry 中已核验的 ${esc(entry.issuer || attempt.issuer)} 后续信息。</div>`
      : `<div class="nb-ah-note">目前还没有已核验的状态查询 / 后续处理信息，因此 Preview 不展示未经核验的电话或建议。你仍可以保存当前状态，之后再更新结果。</div>`;
    const external = [];
    if (pending && entry?.applicationStatusUrl) external.push(`<button class="nb-ah-btn secondary" data-handoff-action="external" data-url="${esc(entry.applicationStatusUrl)}">查看申请状态</button>`);
    if (pending && entry?.applicationStatusPhone) external.push(`<a class="nb-ah-btn secondary" href="tel:${esc(entry.applicationStatusPhone)}">拨打申请状态电话</a>`);
    if (!pending && entry?.reconsiderationPhone) external.push(`<a class="nb-ah-btn secondary" href="tel:${esc(entry.reconsiderationPhone)}">拨打 Recon 电话</a>`);
    const guidance = entry ? (pending ? entry.pendingGuidance : entry.reconGuidance) : null;
    const guidanceItems = Array.isArray(guidance) ? guidance : typeof guidance === 'string' && guidance.trim() ? [guidance] : [];
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">${title}</div><div class="nb-ah-sub">${esc(attempt.productName)}</div></div><button class="nb-ah-close" data-handoff-action="hide">×</button></div><div class="nb-ah-body">${specific}${external.length ? `<div class="nb-ah-row" style="justify-content:flex-start;margin-top:14px">${external.join('')}</div>` : ''}${guidanceItems.length ? `<ul>${guidanceItems.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div><div class="nb-ah-foot"><button class="nb-ah-btn ghost" data-handoff-action="hide">稍后确认</button><div class="nb-ah-row"><button class="nb-ah-btn secondary" data-handoff-action="result" data-result="${pending ? 'denied' : 'pending'}">${pending ? '改为未通过' : '状态有变化'}</button><button class="nb-ah-btn primary" data-handoff-action="result" data-result="approved">已通过</button></div></div></div></div>`;
  }

  function loginModal(attempt) {
    return `<div class="nb-ah-backdrop"><div class="nb-ah-modal" role="dialog" aria-modal="true"><div class="nb-ah-head"><div><div class="nb-ah-title">登录后保存到“我的”</div><div class="nb-ah-sub">${esc(attempt.productName)} 已确认通过</div></div><button class="nb-ah-close" data-handoff-action="hide">×</button></div><div class="nb-ah-body"><div class="nb-ah-note">“直接申请”本身不要求登录；但创建 UserProduct、奖励追踪和任务属于个人数据，需要登录后保存。</div></div><div class="nb-ah-foot"><button class="nb-ah-btn secondary" data-handoff-action="hide">稍后处理</button><button class="nb-ah-btn primary" data-handoff-action="login">登录并继续</button></div></div></div>`;
  }



  function render(mode = null) {
    ensureStyles();
    const root = ensureRoot();
    const success = readJson(SUCCESS_KEY, null);
    if (success) {
      localStorage.removeItem(SUCCESS_KEY);
      root.innerHTML = `<div class="nb-ah-success"><strong>已添加到“我的”</strong><p>${esc(success.productName)} 已保存；本次 Offer 的条件已经开始追踪。你现在看到的是新产品详情。</p></div>`;
      setTimeout(() => { root.innerHTML = ''; }, 6000);
      return;
    }
    const attempt = attemptForCurrentView();
    if (!attempt) { root.innerHTML = ''; return; }
    if (mode === 'choice') root.innerHTML = choiceModal(attempt);
    else if (mode === 'pending') root.innerHTML = followupModal(attempt, 'pending');
    else if (mode === 'denied') root.innerHTML = followupModal(attempt, 'denied');
    else if (mode === 'login') root.innerHTML = loginModal(attempt);
    else root.innerHTML = banner(attempt);
  }

  function showAttempt(attempt) {
    if (!attempt) return;
    if (attempt.status === 'pending') render('pending');
    else if (attempt.status === 'denied') render('denied');
    else if (attempt.status === 'approved_needs_login') render('login');
    else render('choice');
  }

  function catalogProduct(attempt) {
    return Object.values(window.NextBonusProductCatalog || {}).flat().find(x => x.offerId === attempt.offerId) || {};
  }


  function commitApproved(attempt, anchorDate) {
    const state = appState();
    if (!state) throw new Error('state unavailable');
    const lifecycle = window.NextBonusProductLifecycleCore;
    if (!lifecycle) throw new Error('Product Lifecycle Core unavailable');
    const next = clone(state);
    const fact = window.NextBonusOfferData?.[attempt.offerId] || {};
    const entity = window.NextBonusOfferProducts?.[attempt.productId] || {};
    const catalog = catalogProduct(attempt);
    const type = entity.category === '信用卡' ? '信用卡' : (entity.category === '银行' || entity.category === '券商') ? '银行和券商账户' : '其他';
    const result = lifecycle.commitApplicationApproval(next, {
      applicationHandoffId:attempt.id,
      offerId:attempt.offerId,
      offerVersionId:attempt.offerVersionId,
      type,
      name:attempt.productName || catalog.name || entity.name,
      institution:attempt.issuer || catalog.institution || entity.provider || '',
      instance:type === '信用卡' ? '账户 1' : '主账户',
      art:catalog.art || 'bank',
      cardImageLocal:catalog.cardImageLocal || null,
      opened:anchorDate,
      annualFee:type === '信用卡' ? '以产品规则为准' : '—',
      earning:'—',
      reward:attempt.reward || fact.primaryValue || '当前奖励',
      requirement:attempt.requirement || fact.primaryRequirement || '完成当前 Offer 对应的奖励条件'
    });
    next.currentProductId = result.product.id;
    next.route = 'product-detail';
    next.routeSource = 'products';
    next.productSearch = '';
    writeJson(APP_STATE_KEY, next);
    return result.product;
  }

  function completeApproved(attempt, anchorDate) {
    const product = commitApproved(attempt, anchorDate);
    updateAttempt(attempt.id, { status: 'approved', anchorDate, createdUserProductId: product.id, resultConfirmedAt: attempt.resultConfirmedAt || nowIso() });
    const store = handoffStore();
    store.activeId = null;
    saveStore(store);
    writeJson(SUCCESS_KEY, { productId: product.id, productName: product.name, createdAt: nowIso() });
    location.reload();
  }

  function handleResult(attempt, result) {
    if (result === 'approved') {
      const loggedIn = !!appState()?.loggedIn;
      const anchorDate = attempt.anchorDate || today();
      const confirmedAt = nowIso();
      const confirmed = updateAttempt(attempt.id, { ...(loggedIn ? {} : { status: 'approved_needs_login' }), anchorDate, resultConfirmedAt: confirmedAt }) || { ...attempt, anchorDate, resultConfirmedAt: confirmedAt };
      if (loggedIn) {
        try { completeApproved(confirmed, anchorDate); }
        catch (_) { updateAttempt(attempt.id, { status: 'deferred' }); render('choice'); }
      } else render('login');
    } else if (result === 'pending') {
      updateAttempt(attempt.id, { status: 'pending', resultConfirmedAt: nowIso() });
      render('pending');
    } else if (result === 'denied') {
      updateAttempt(attempt.id, { status: 'denied', resultConfirmedAt: nowIso() });
      render('denied');
    }
  }

  document.addEventListener('click', event => {
    const appAction = event.target.closest('[data-action]')?.dataset.action;
    if (appAction === 'direct-apply') {
      // app.js renders the risk confirmation synchronously. Create the handoff in
      // this same click task only when no confirmation remains, before blur/hidden.
      if (!document.querySelector('[data-action="apply-confirm"]')) startHandoff();
    } else if (appAction === 'apply-confirm') {
      startHandoff();
    } else if (appAction === 'login-success') {
      setTimeout(() => {
        const attempt = activeAttempt();
        if (attempt?.status === 'approved_needs_login' && appState()?.loggedIn) {
          try { completeApproved(attempt, attempt.anchorDate || today()); }
          catch (_) { render('login'); }
        }
      }, 0);
    }

    if (appAction && !['direct-apply','apply-confirm','login-success'].includes(appAction)) {
      setTimeout(() => render(), 0);
    }

    const control = event.target.closest('[data-handoff-action]');
    if (!control) return;
    const attempt = activeAttempt();
    if (!attempt) return;
    const action = control.dataset.handoffAction;
    if (action === 'open') showAttempt(attempt);
    else if (action === 'hide') render();
    else if (action === 'defer') { if (['awaiting_result','deferred'].includes(attempt.status)) updateAttempt(attempt.id, { status: 'deferred' }); render(); }
    else if (action === 'not-submitted') finishAttempt(attempt.id, 'not_submitted');
    else if (action === 'result') handleResult(attempt, control.dataset.result);
    else if (action === 'external' && control.dataset.url) window.open(control.dataset.url, '_blank', 'noopener,noreferrer');
    else if (action === 'login') {
      updateAttempt(attempt.id, { status: 'approved_needs_login' });
      render();
      document.querySelector('[data-action="nav"][data-route="login"]')?.click();
    }
  });

  window.addEventListener('blur', () => {
    const attempt = activeAttempt();
    if (attempt?.status === 'awaiting_result') updateAttempt(attempt.id, { leftForApplicationAt: attempt.leftForApplicationAt || nowIso() });
  });

  window.addEventListener('focus', () => {
    const attempt = activeAttempt();
    if (attempt?.status === 'awaiting_result' && attempt.leftForApplicationAt) {
      updateAttempt(attempt.id, { returnedAt: nowIso() });
      render('choice');
    }
  });

  document.addEventListener('visibilitychange', () => {
    const attempt = activeAttempt();
    if (!attempt) return;
    if (document.hidden && attempt.status === 'awaiting_result') {
      updateAttempt(attempt.id, { leftForApplicationAt: attempt.leftForApplicationAt || nowIso() });
    } else if (!document.hidden && attempt.status === 'awaiting_result' && attempt.leftForApplicationAt) {
      updateAttempt(attempt.id, { returnedAt: nowIso() });
      render('choice');
    }
  });

  window.addEventListener('pageshow', () => render());
  window.addEventListener('popstate', () => setTimeout(() => render(), 0));
  window.addEventListener('storage', event => {
    if ([APP_STATE_KEY, HANDOFF_KEY, SUCCESS_KEY].includes(event.key)) render();
  });

  window.NextBonusApplicationHandoff = Object.freeze({
    start: startHandoff,
    active: activeAttempt,
    open() { showAttempt(attemptForCurrentView()); },
    reset() {
      localStorage.removeItem(HANDOFF_KEY);
      localStorage.removeItem(SUCCESS_KEY);
      render();
    }
  });

  ensureStyles();
  render();
})();
