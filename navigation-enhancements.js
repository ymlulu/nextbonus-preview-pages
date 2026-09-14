(() => {
  'use strict';

  const STYLE_ID = 'nextbonus-navigation-enhancements-style';

  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .brand[data-action="nav"]{cursor:pointer;user-select:none}
      .brand[data-action="nav"]:focus-visible{outline:2px solid #3478f6;outline-offset:4px;border-radius:12px}
      .detail-back-nav{display:flex;align-items:center;margin:0 0 18px}
      .detail-back-button{appearance:none;border:0;background:transparent;padding:6px 4px;color:#3f6fd8;font:inherit;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:5px;border-radius:8px}
      .detail-back-button:hover{background:rgba(61,111,216,.07)}
      .detail-back-button:focus-visible{outline:2px solid #3478f6;outline-offset:2px}
      @media (max-width: 720px){.detail-back-nav{margin-bottom:14px}.detail-back-button{padding:8px 4px}}
    `;
    document.head.appendChild(style);
  }

  function enhanceLogo(){
    const brand=document.querySelector('.sidebar .brand');
    if(!brand || brand.dataset.nbHomeReady==='1') return;
    brand.dataset.nbHomeReady='1';
    brand.dataset.action='nav';
    brand.dataset.route='discover';
    brand.setAttribute('role','button');
    brand.setAttribute('tabindex','0');
    brand.setAttribute('aria-label','返回发现');
    brand.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        brand.click();
      }
    });
  }

  function prependBackButton(page, action, label){
    if(!page || page.querySelector(':scope > .detail-back-nav')) return;
    const nav=document.createElement('div');
    nav.className='detail-back-nav';
    nav.innerHTML=`<button class="detail-back-button" type="button" data-action="${action}"><span aria-hidden="true">←</span><span>${label}</span></button>`;
    page.prepend(nav);
  }

  function enhanceDetailPages(){
    const offerPage=document.querySelector('.v4-offer-detail-page');
    if(offerPage){
      const fromWishlist=document.querySelector('.nav-item.active[data-route="wishlist"]');
      prependBackButton(offerPage,'back-offer-list',fromWishlist?'返回收藏':'返回发现');
    }
    const productPage=document.querySelector('.v4-product-detail-page');
    if(productPage) prependBackButton(productPage,'back-products','返回我的产品');
  }

  function enhance(){
    ensureStyles();
    enhanceLogo();
    enhanceDetailPages();
  }

  let queued=false;
  const queueEnhance=()=>{
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;enhance();});
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();

  const root=document.getElementById('app');
  if(root) new MutationObserver(queueEnhance).observe(root,{childList:true,subtree:true});
})();
