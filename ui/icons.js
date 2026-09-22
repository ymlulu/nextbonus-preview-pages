(() => {
  'use strict';

  const shapes=Object.freeze({
    plus:'<path d="M12 5v14M5 12h14"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>',
    'chevron-left':'<path d="M15 18l-6-6 6-6"/>',
    'chevron-right':'<path d="M9 6l6 6-6 6"/>',
    'chevron-down':'<path d="M6 9l6 6 6-6"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    more:'<path d="M5 12h.01M12 12h.01M19 12h.01"/>',
    trash:'<path d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12M10 10v6M14 10v6"/>',
    'external-link':'<path d="M14 5h5v5M10 14l9-9M19 13v6H5V5h6"/>',
    phone:'<path d="M7.2 4.5l2.1 4-2.4 1.8c1.3 2.7 3.1 4.5 5.8 5.8l1.8-2.4 4 2.1c.4.2.6.7.5 1.1l-.7 2.4c-.1.5-.6.8-1.1.8C10 20.1 3.9 14 3.9 6.8c0-.5.3-1 .8-1.1l2.4-.7c.4-.1.9.1 1.1.5z"/>'
  });

  function svg(name,className=''){
    const shape=shapes[name];
    if(!shape) throw new Error(`Unknown NextBonus icon: ${name}`);
    const classes=['nb-ui-icon',String(className||'').trim()].filter(Boolean).join(' ');
    return `<svg class="${classes}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shape}</svg>`;
  }

  window.NextBonusIcons=Object.freeze({
    svg,
    names:Object.freeze(Object.keys(shapes))
  });
})();
