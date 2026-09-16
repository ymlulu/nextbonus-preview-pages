(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';
  const RESUME_KEY = 'nextbonus-offer-overlay-resume-v1';

  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;

    const saved = JSON.parse(raw);
    if(saved?.route !== 'offer-detail' || !saved.currentOfferId) return;

    const source = saved.routeSource === 'wishlist' ? 'wishlist' : 'discover';
    const scrollY = Number(saved.pageScroll?.[source] || 0);

    sessionStorage.setItem(RESUME_KEY, JSON.stringify({
      offerId: saved.currentOfferId,
      source,
      scrollY,
      posterIndex: Number(saved.posterIndex || 0)
    }));

    /* Offer Detail is a presentation overlay, not a standalone reload destination.
       Bootstrap the underlying source route first; the overlay runtime re-opens the
       same offer after app.js has rendered that source page. */
    saved.route = source;
    saved.routeSource = source;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }catch(_err){
    /* A malformed local preview state should never block the app from booting. */
  }
})();
