(() => {
  'use strict';
  if(document.querySelector('link[data-moomoo-offer-style]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='moomoo-offer.css';
  link.dataset.moomooOfferStyle='1';
  document.head.appendChild(link);
})();
