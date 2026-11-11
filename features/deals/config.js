(() => {
  'use strict';
  // Set this to the standalone Deals Worker URL after deployment. Never use the DD API.
  // Keep empty while the backend is not configured; Discover then retains Preview fixtures.
  window.NextBonusDealsConfig = Object.freeze({
    apiBase: '',
  });
})();
