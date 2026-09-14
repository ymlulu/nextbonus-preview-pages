(() => {
  'use strict';
  const style=document.createElement('style');
  style.textContent=`
    .v10-info-logo{padding:0;background:#fff;overflow:hidden}
    .v10-info-logo img{width:84%;height:84%;padding:0;object-fit:contain;transform-origin:center;border-radius:12px}
    .v10-info-logo[data-product-id="p-chase-checking"] img,
    .v10-info-logo[data-product-id="p-fidelity"] img,
    .v10-info-logo[data-product-id="p-robinhood"] img,
    .v10-info-logo[data-product-id="p-truist"] img,
    .v10-info-logo[data-product-id="p-usbank"] img,
    .v10-info-logo[data-product-id="p-wf-checking"] img,
    .v10-info-logo[data-product-id="p-hilton"] img,
    .v10-info-logo[data-product-id="p-ihg"] img,
    .v10-info-logo[data-product-id="p-marriott-status"] img,
    .v10-info-logo[data-product-id="p-hyatt"] img,
    .v10-info-logo[data-product-id="p-awardwallet"] img,
    .v10-info-logo[data-product-id="p-pointsyeah"] img,
    .v10-info-logo[data-product-id="p-cardpointers"] img,
    .v10-info-logo[data-product-id="p-maxrewards"] img,
    .v10-info-logo[data-product-id="p-rakuten"] img,
    .v10-info-logo[data-product-id="p-google-one"] img{width:78%;height:78%;transform:none}
    .v10-info-logo[data-product-id="p-delta-status"] img{transform:scale(1.30)}
    .v10-info-logo[data-product-id="p-topcashback"] img{transform:scale(1.22)}
    .v10-info-logo[data-product-id="p-rebatesme"] img{transform:scale(1.22)}
    .v10-info-logo[data-product-id="p-gocashback"] img{transform:scale(1.20)}
    .v10-info-logo[data-product-id="p-bilt-rent"] img{transform:scale(1.12)}
  `;
  document.head.appendChild(style);
})();
