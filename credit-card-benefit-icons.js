(() => {
  'use strict';

  function iconSvg(kind) {
    const icons = {
      car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 11 2-4h10l2 4"></path><path d="M4 11h16v6H4z"></path><circle cx="7" cy="18" r="1.5"></circle><circle cx="17" cy="18" r="1.5"></circle></svg>',
      bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg>',
      clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke-dasharray="1.6 2.4"></circle></svg>',
      plane: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 13 7-2 3-7 2 1-1 6 6 2v2l-6 1 1 5-2 1-3-6-7-1v-2z"></path></svg>',
      bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6v13"></path><path d="M20 11v8"></path><path d="M4 15h16"></path><path d="M7 10h4a3 3 0 0 1 3 3v2H7v-5z"></path></svg>',
      building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h9v17"></path><path d="M15 9h4v12"></path><path d="M9 8h3M9 12h3M9 16h3"></path><path d="M4 21h16"></path></svg>',
      clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path></svg>',
      lounge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13h14v6H5z"></path><path d="M7 13V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"></path><path d="M8 19v2M16 19v2"></path></svg>',
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="3" width="8" height="18" rx="2"></rect><path d="M10 6h4M11 18h2"></path></svg>',
      shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.8-2.7 8-7 10-4.3-2-7-5.2-7-10V6l7-3z"></path><path d="m9 12 2 2 4-4"></path></svg>'
    };
    return icons[kind] || icons.shield;
  }

  function iconFor(title) {
    if (/Uber|Lyft|Blacklane|Hertz|National|租车/i.test(title)) return 'car';
    if (/Saks|购物|Dining|餐饮|Dunkin|Resy|DoorDash|Walmart|Lululemon|Oura|Equinox|StubHub|Splurge/i.test(title)) return 'bag';
    if (/CLEAR/i.test(title)) return 'clear';
    if (/Hilton/i.test(title)) return 'bed';
    if (/Marriott|酒店|Hotel|FHR|Ritz|St\. Regis/i.test(title)) return 'building';
    if (/Priority Pass|Lounge|休息室|贵宾室|Admirals/i.test(title)) return 'lounge';
    if (/手机保险/i.test(title)) return 'phone';
    if (/Global Entry|TSA|航空|机票|Travel|旅行/i.test(title)) return 'plane';
    if (/周年|年度免房券|Choice Benefit/i.test(title)) return 'clock';
    return 'shield';
  }

  function apply() {
    document.querySelectorAll('.v4-pd-benefits .v4-benefit-row').forEach((row) => {
      const title = row.querySelector('strong')?.textContent?.trim() || '';
      const icon = row.querySelector('.v4-benefit-icon');
      if (!icon || !title) return;
      const kind = iconFor(title);
      if (icon.dataset.nbBenefitIcon === kind) return;
      icon.classList.add('nb-card-benefit-icon');
      icon.dataset.nbBenefitIcon = kind;
      icon.innerHTML = iconSvg(kind);
    });
  }

  window.addEventListener('nextbonus-product-facts-rendered', apply);
  window.addEventListener('DOMContentLoaded', apply);
  apply();
})();

import('./product-detail-earning-layout.js');
