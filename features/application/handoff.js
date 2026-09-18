(() => {
  'use strict';

  const APP_STATE_KEY = 'nextbonus-local-v8-state';
  const HANDOFF_KEY = 'nextbonus-application-handoff-v1';
  const SUCCESS_KEY = 'nextbonus-application-handoff-success-v1';
  const ROOT_ID = 'nb-application-handoff-root';
  const RETURN_SETTLE_MS = 90;
  const FOCUS_FALLBACK_MS = 140;
  const RETURN_DEDUPE_MS = 1200;
  const UNRESOLVED_STATUSES = new Set([
    'awaiting_result', 'deferred', 'pending', 'approved_needs_login'
  ]);

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const nowIso = () => new Date().toISOString();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const today = () => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  let viewState = { attemptId:null, mode:null };
  let returnTimer = null;
  let returnCycle = { attemptId:null, away:false, resumedAt:0 };
  let successTimer = null;

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
      : { schemaVersion:1, activeId:null, attempts:[] };
  }

  function saveStore(store) {
    writeJson(HANDOFF_KEY, store);
  }

  function activeAttempt() {
    const store = handoffStore();
    return store.attempts.find(x => x.id === store.activeId) || null;
  }

  function visibleOfferId(state) {
    if (!state) return null;
    return state.offerOverlay?.offerId || (state.route === 'offer-detail' ? state.currentOfferId : null);
  }

  function attemptForCurrentView() {
    const state = appState();
    const store = handoffStore();
    let active = store.attempts.find(attempt => attempt.id === store.activeId) || null;

    if (active && !UNRESOLVED_STATUSES.has(active.status)) {
      store.activeId = null;
      saveStore(store);
      active = null;
    }

    const offerId = visibleOfferId(state);
    if (offerId) {
      const matching = store.attempts.find(attempt =>
        attempt.offerId === offerId && UNRESOLVED_STATUSES.has(attempt.status)
      ) || null;
      if (matching && store.activeId !== matching.id) {
        store.activeId = matching.id;
        saveStore(store);
      }
      if (matching) return matching;
    }

    return active && UNRESOLVED_STATUSES.has(active.status) ? active : null;
  }

  function updateAttempt(id, patch) {
    const store = handoffStore();
    const index = store.attempts.findIndex(x => x.id === id);
    if (index < 0) return null;
    store.attempts[index] = { ...store.attempts[index], ...patch, updatedAt:nowIso() };
    saveStore(store);
    return store.attempts[index];
  }

  function resetView(attemptId = null, mode = null) {
    viewState = { attemptId, mode };
  }

  function finishAttempt(id, status) {
    const store = handoffStore();
    const index = store.attempts.findIndex(x => x.id === id);
    if (index >= 0) {
      store.attempts[index] = { ...store.attempts[index], status, updatedAt:nowIso() };
    }
    if (store.activeId === id) store.activeId = null;
    saveStore(store);
    resetView();
    render();
  }

  function currentContext() {
    const state = appState();
    const offerId = state?.offerOverlay?.offerId || state?.currentOfferId;
    const offer = offerId ? window.NextBonusOfferData?.[offerId] : null;
    const productId = offer?.productId || null;
    const product = productId ? window.NextBonusOfferProducts?.[productId] : null;
    if (!state || !offerId || !offer || !product || !offer.applyUrl) return null;
    const assessment = state.assessmentResults?.[offerId] || null;
    return {
      productId,
      offerId,
      offerVersionId:offer.offerVersionId || `preview-current:${offerId}`,
      productName:product.name,
      issuer:product.provider,
      category:product.category,
      applicationUrl:offer.applyUrl,
      reward:offer.primaryValue || '',
      requirement:offer.primaryRequirement || '',
      assessmentId:assessment?.id || assessment?.assessmentId || null,
      assessmentSnapshot:clone(assessment)
    };
  }

  function markOutboundAttempt(attempt) {
    if (!attempt) return;
    returnCycle = { attemptId:attempt.id, away:true, resumedAt:0 };
    resetView(attempt.id, null);
  }

  function startHandoff() {
    const context = currentContext();
    if (!context) return null;

    const store = handoffStore();
    const current = store.attempts.find(x => x.id === store.activeId) || null;
    const stamp = nowIso();

    if (current && current.offerId === context.offerId && current.status === 'awaiting_result') {
      const refreshed = updateAttempt(current.id, {
        applicationClickedAt:stamp,
        leftForApplicationAt:stamp,
        returnedAt:null
      }) || current;
      markOutboundAttempt(refreshed);
      return refreshed;
    }

    const idBase = `app-${Date.now()}`;
    let id = idBase;
    let suffix = 1;
    while (store.attempts.some(attempt => attempt.id === id)) id = `${idBase}-${suffix++}`;

    const attempt = {
      id,
      ...context,
      applicationClickedAt:stamp,
      status:'awaiting_result',
      leftForApplicationAt:stamp,
      returnedAt:null,
      resultConfirmedAt:null,
      anchorDate:null,
      createdUserProductId:null,
      createdAt:stamp,
      updatedAt:stamp
    };

    store.attempts.unshift(attempt);
    store.activeId = id;
    saveStore(store);
    markOutboundAttempt(attempt);
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

  function defaultModeFor(attempt) {
    return attempt?.status === 'awaiting_result' && attempt.returnedAt ? 'choice' : null;
  }

  function commitRoot(root, signature, html) {
    if (root.dataset.nbRenderSignature === signature) return;
    root.innerHTML = html;
    root.dataset.nbRenderSignature = signature;
  }

  function render(mode) {
    const page=window.NextBonusApplicationResultPage;
    if(!page) throw new Error('Application Result page unavailable');
    const root = ensureRoot();
    const success = readJson(SUCCESS_KEY, null);

    if (success) {
      localStorage.removeItem(SUCCESS_KEY);
      resetView();
      const signature = `success:${success.productId || success.productName || 'done'}`;
      commitRoot(root, signature, page.success(success.productName));
      clearTimeout(successTimer);
      successTimer = setTimeout(() => {
        if (root.dataset.nbRenderSignature === signature) {
          root.innerHTML = '';
          delete root.dataset.nbRenderSignature;
        }
      }, 6000);
      return;
    }

    const attempt = attemptForCurrentView();
    if (!attempt) {
      resetView();
      commitRoot(root, 'empty', '');
      return;
    }

    if (viewState.attemptId !== attempt.id) {
      viewState = { attemptId:attempt.id, mode:defaultModeFor(attempt) };
    }
    if (mode !== undefined) viewState.mode = mode;

    const effectiveMode = viewState.mode;
    const signature = `${attempt.id}|${attempt.status}|${effectiveMode || 'banner'}|${attempt.returnedAt || ''}|${attempt.resultConfirmedAt || ''}`;
    commitRoot(root, signature, page.htmlForMode(attempt, effectiveMode));
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

  function clearOverlayHistoryMarker() {
    window.NBOfferOverlayBridge?.clear?.();
    const current = history.state;
    if (!current?.nbOfferOverlay) return;
    const clean = { ...current };
    delete clean.nbOfferOverlay;
    history.replaceState(clean, '', location.href);
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
    const type = entity.category === '信用卡'
      ? '信用卡'
      : (entity.category === '银行' || entity.category === '券商') ? '银行和券商账户' : '其他';

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

    clearOverlayHistoryMarker();
    delete next.offerOverlay;
    next.currentProductId = result.product.id;
    next.route = 'product-detail';
    next.routeSource = 'products';
    next.productSearch = '';
    writeJson(APP_STATE_KEY, next);
    return result.product;
  }

  function completeApproved(attempt, anchorDate) {
    const product = commitApproved(attempt, anchorDate);
    updateAttempt(attempt.id, {
      status:'approved',
      anchorDate,
      createdUserProductId:product.id,
      resultConfirmedAt:attempt.resultConfirmedAt || nowIso()
    });
    const store = handoffStore();
    store.activeId = null;
    saveStore(store);
    resetView();
    writeJson(SUCCESS_KEY, {
      productId:product.id,
      productName:product.name,
      createdAt:nowIso()
    });
    location.reload();
  }

  function handleResult(attempt, result) {
    if (result === 'approved') {
      const loggedIn = !!appState()?.loggedIn;
      const anchorDate = attempt.anchorDate || today();
      const confirmedAt = nowIso();
      const confirmed = updateAttempt(attempt.id, {
        ...(loggedIn ? {} : { status:'approved_needs_login' }),
        anchorDate,
        resultConfirmedAt:confirmedAt
      }) || { ...attempt, anchorDate, resultConfirmedAt:confirmedAt };

      if (loggedIn) {
        try {
          completeApproved(confirmed, anchorDate);
        } catch (_) {
          updateAttempt(attempt.id, { status:'deferred' });
          render('choice');
        }
      } else {
        render('login');
      }
    } else if (result === 'pending') {
      updateAttempt(attempt.id, { status:'pending', resultConfirmedAt:nowIso() });
      render('pending');
    } else if (result === 'denied') {
      updateAttempt(attempt.id, { status:'denied', resultConfirmedAt:nowIso() });
      render('denied');
    }
  }

  function markAway() {
    const attempt = activeAttempt();
    if (!attempt || attempt.status !== 'awaiting_result') return;
    returnCycle.attemptId = attempt.id;
    returnCycle.away = true;
    if (!attempt.leftForApplicationAt) {
      updateAttempt(attempt.id, { leftForApplicationAt:nowIso() });
    }
  }

  function resumeFromApplication() {
    returnTimer = null;
    if (document.hidden) return;

    const attempt = activeAttempt();
    if (!attempt || attempt.status !== 'awaiting_result' || !attempt.leftForApplicationAt) return;

    const now = Date.now();
    if (returnCycle.attemptId === attempt.id && now - returnCycle.resumedAt < RETURN_DEDUPE_MS) {
      render('choice');
      return;
    }

    const updated = attempt.returnedAt
      ? attempt
      : updateAttempt(attempt.id, { returnedAt:nowIso() }) || attempt;

    returnCycle = { attemptId:attempt.id, away:false, resumedAt:now };
    resetView(updated.id, 'choice');
    requestAnimationFrame(() => {
      render('choice');
      window.dispatchEvent(new CustomEvent('nb:application-returned', {
        detail:{ attemptId:updated.id, offerId:updated.offerId }
      }));
    });
  }

  function scheduleReturn(source) {
    if (document.hidden) return;
    const attempt = activeAttempt();
    if (!attempt || attempt.status !== 'awaiting_result' || !attempt.leftForApplicationAt) return;

    if (attempt.returnedAt) {
      resetView(attempt.id, 'choice');
      render('choice');
      return;
    }

    if (returnTimer) return;
    const delay = source === 'focus' ? FOCUS_FALLBACK_MS : RETURN_SETTLE_MS;
    returnTimer = setTimeout(resumeFromApplication, delay);
  }

  document.addEventListener('click', event => {
    const appAction = event.target.closest('[data-action]')?.dataset.action;

    if (appAction === 'direct-apply') {
      if (!document.querySelector('[data-action="apply-confirm"]')) startHandoff();
    } else if (appAction === 'apply-confirm') {
      startHandoff();
    } else if (appAction === 'login-success') {
      setTimeout(() => {
        const attempt = activeAttempt();
        if (attempt?.status === 'approved_needs_login' && appState()?.loggedIn) {
          try {
            completeApproved(attempt, attempt.anchorDate || today());
          } catch (_) {
            render('login');
          }
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

    if (action === 'open') {
      showAttempt(attempt);
    } else if (action === 'hide') {
      resetView(attempt.id, null);
      render();
    } else if (action === 'defer') {
      if (['awaiting_result','deferred'].includes(attempt.status)) {
        updateAttempt(attempt.id, { status:'deferred' });
      }
      resetView(attempt.id, null);
      render();
    } else if (action === 'not-submitted') {
      finishAttempt(attempt.id, 'not_submitted');
    } else if (action === 'result') {
      handleResult(attempt, control.dataset.result);
    } else if (action === 'external' && control.dataset.url) {
      window.open(control.dataset.url, '_blank', 'noopener,noreferrer');
    } else if (action === 'login') {
      updateAttempt(attempt.id, { status:'approved_needs_login' });
      resetView(attempt.id, null);
      render();
      document.querySelector('[data-action="nav"][data-route="login"]')?.click();
    }
  });

  /* Application return lifecycle has one owner. blur/hidden only mark outbound state;
     visible/pageshow/focus all coalesce into one resumeFromApplication() call. */
  window.addEventListener('blur', markAway, { passive:true });
  window.addEventListener('pagehide', markAway, { passive:true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) markAway();
    else scheduleReturn('visibility');
  });

  window.addEventListener('pageshow', () => scheduleReturn('pageshow'), { passive:true });
  window.addEventListener('focus', () => scheduleReturn('focus'), { passive:true });

  /* popstate is intentionally not observed here. Navigation belongs to the app/overlay
     router; the application-result UI must not compete with Offer Detail history. */
  window.addEventListener('storage', event => {
    if ([APP_STATE_KEY, HANDOFF_KEY, SUCCESS_KEY].includes(event.key)) render();
  });

  window.NextBonusApplicationHandoff = Object.freeze({
    start:startHandoff,
    active:activeAttempt,
    open(){ showAttempt(attemptForCurrentView()); },
    markAway,
    resume:resumeFromApplication,
    reset(){
      clearTimeout(returnTimer);
      returnTimer = null;
      localStorage.removeItem(HANDOFF_KEY);
      localStorage.removeItem(SUCCESS_KEY);
      resetView();
      returnCycle = { attemptId:null, away:false, resumedAt:0 };
      render();
    }
  });

  render();
})();
