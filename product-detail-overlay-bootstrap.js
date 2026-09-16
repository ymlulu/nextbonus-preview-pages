(() => {
  'use strict';

  const STATE_KEY = 'nextbonus-local-v8-state';
  const RESUME_KEY = 'nextbonus-product-detail-resume-v1';

  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);
    if (saved?.route !== 'product-detail' || !saved.currentProductId) return;

    sessionStorage.setItem(RESUME_KEY, JSON.stringify({
      productId: String(saved.currentProductId),
      scrollY: Number(saved.pageScroll?.products || 0)
    }));

    /* Product Detail is presentation above Wallet, not a reload destination.
       Normalize persisted route before app.js boots; the overlay runtime reopens
       the saved product after Wallet has rendered. */
    saved.route = 'products';
    saved.routeSource = 'products';
    saved.editFlow = null;
    localStorage.setItem(STATE_KEY, JSON.stringify(saved));
  } catch (_err) {
    /* Broken preview storage must never block boot. */
  }
})();
