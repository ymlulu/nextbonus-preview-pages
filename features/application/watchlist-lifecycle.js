(() => {
  'use strict';

  const HANDOFF_KEY = 'nextbonus-application-handoff-v1';
  const LINK_KEY = 'nextbonus-application-watchlist-link-v2';
  const ACTIVE = new Set(['awaiting_result','deferred','pending','approved_needs_login','approved_setup','approved_duplicate']);
  const TERMINAL = new Set(['approved','denied']);
  let queued = false;

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const links = () => {
    const value = read(LINK_KEY, {});
    return value && typeof value === 'object' ? value : {};
  };

  function isApplication(offerId) {
    const policy = window.NextBonusWatchlistPolicy;
    if (!policy?.isReady) return false;
    return policy.policyFor?.(offerId)?.followUpMode === 'application';
  }

  function ensureLink(attempt, api, registry) {
    if (registry[attempt.id]) return registry[attempt.id];
    const before = api.getActive(attempt.offerId);
    registry[attempt.id] = {
      offerId: attempt.offerId,
      priorStage: before?.stage || null,
      priorStatus: before?.status || null,
      terminalStatus: null
    };
    return registry[attempt.id];
  }

  function restoreNotSubmitted(attempt, api, link) {
    if (link?.priorStage === 'saved') {
      api.follow(attempt.offerId, {stage:'saved', status:link.priorStatus || 'saved', sourceType:'watchlist'});
    } else if (link?.priorStage === 'in_progress') {
      api.moveToInProgress(attempt.offerId, link.priorStatus || 'in_progress', {sourceType:'watchlist'});
    } else {
      api.unfollow(attempt.offerId);
    }
  }

  function syncAttempt(attempt, api, registry) {
    if (!attempt?.id || !attempt.offerId || !isApplication(attempt.offerId)) return false;
    const link = ensureLink(attempt, api, registry);

    if (ACTIVE.has(attempt.status)) {
      api.moveToInProgress(attempt.offerId, attempt.status, {
        offerVersionId: attempt.offerVersionId || null,
        sourceId: attempt.id,
        sourceType: 'application'
      });
      link.terminalStatus = null;
      return true;
    }

    if (TERMINAL.has(attempt.status)) {
      const active = api.getActive(attempt.offerId);
      if (link.terminalStatus === attempt.status && !active) return false;
      api.archive(attempt.offerId, attempt.status, {
        offerVersionId: attempt.offerVersionId || null,
        sourceId: attempt.id,
        sourceType: 'application',
        completedAt: attempt.updatedAt || attempt.resultConfirmedAt || null,
        meta: {applicationHandoffId:attempt.id, createdUserProductId:attempt.createdUserProductId || null}
      });
      link.terminalStatus = attempt.status;
      return true;
    }

    if (attempt.status === 'not_submitted') {
      if (link.terminalStatus === 'not_submitted' && !api.getActive(attempt.offerId)) return false;
      restoreNotSubmitted(attempt, api, link);
      link.terminalStatus = 'not_submitted';
      return true;
    }

    return false;
  }

  function sync() {
    const api = window.NextBonusWatchlistState;
    const policy = window.NextBonusWatchlistPolicy;
    if (!api || !policy?.isReady) return false;
    const handoff = read(HANDOFF_KEY, null);
    if (!handoff || !Array.isArray(handoff.attempts)) return false;
    const registry = links();
    let changed = false;
    handoff.attempts.forEach(attempt => { if (syncAttempt(attempt, api, registry)) changed = true; });
    if (changed) {
      write(LINK_KEY, registry);
    }
    return changed;
  }

  function queue() {
    if (queued) return;
    queued = true;
    setTimeout(() => { queued = false; sync(); }, 0);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-action="direct-apply"], [data-action="apply-confirm"], [data-handoff-action]')) queue();
  });
  ['focus','pageshow','popstate'].forEach(type => window.addEventListener(type, queue));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) queue(); });
  window.addEventListener('storage', event => { if (event.key === HANDOFF_KEY) queue(); });

  function boot() {
    if (window.NextBonusWatchlistPolicy?.isReady) sync();
    else setTimeout(boot, 25);
  }

  window.NextBonusApplicationWatchlistLifecycle = Object.freeze({HANDOFF_KEY, LINK_KEY, sync});
  boot();
})();
