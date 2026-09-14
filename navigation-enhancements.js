(() => {
  'use strict';

  const STYLE_ID = 'nextbonus-navigation-enhancements-style';
  const MOBILE_QUERY='(max-width:780px)';
  const APP_STATE_KEY='nextbonus-local-v8-state';
  const HANDOFF_SUCCESS_KEY='nextbonus-application-handoff-success-v1';
  const DETAIL_INTENT_KEY='nextbonus-product-detail-intent-v1';
  const root=document.getElementById('app');
  let sourceSnapshot=null;
  let sourceScroll=0;
  let sourceKind=null;
  let applyingLayer=false;
  let consumingIntent=false;
  let pendingHandoffDetail=false;

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
      @media (min-width:781px){
        body.nb-detail-layer-open{overflow:hidden}
        .nb-detail-layer{position:fixed;inset:0;z-index:75;overflow:hidden;background:#f6f8fb}
        .nb-detail-layer-source{position:absolute;inset:0;overflow:hidden;pointer-events:none;filter:blur(2.4px) saturate(.92);transform:scale(1.004);transform-origin:center;background:#f6f8fb}
        .nb-detail-layer-source-scroll{min-height:100%;transform:translateY(calc(-1 * var(--nb-source-scroll,0px)))}
        .nb-detail-layer-source .sidebar{transform:translateY(var(--nb-source-scroll,0px))}
        .nb-detail-layer-dim{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgba(15,26,47,.24);backdrop-filter:blur(1.2px);z-index:1;cursor:default}
        .nb-detail-layer-stage{position:absolute;inset:0;z-index:2;display:grid;place-items:start center;padding:28px 42px;overflow:auto;pointer-events:none}
        .nb-detail-layer-panel{pointer-events:auto;width:min(1180px,calc(100vw - 104px));max-height:calc(100vh - 56px);overflow:auto;background:#fff;border:1px solid rgba(226,232,240,.96);border-radius:22px;box-shadow:0 28px 90px rgba(16,28,52,.26);overscroll-behavior:contain}
        .nb-detail-layer-offer .nb-detail-layer-panel{width:min(1240px,calc(100vw - 104px))}
        .nb-detail-layer-panel>.content{max-width:none!important;margin:0!important;padding:26px 28px 34px}
      }
      @media (min-width:781px) and (max-width:980px){
        .nb-detail-layer-stage{padding:22px 24px}
        .nb-detail-layer-panel,.nb-detail-layer-offer .nb-detail-layer-panel{width:calc(100vw - 48px);max-height:calc(100vh - 44px)}
        .nb-detail-layer-panel>.content{padding:22px 22px 30px}
      }
      @media (max-width:720px){.detail-back-nav{margin-bottom:14px}.detail-back-button{padding:8px 4px}}
    `;
    document.head.appendChild(style);
  }

  const isMobile=()=>window.matchMedia?.(MOBILE_QUERY).matches;
  const detailKind=()=>root?.querySelector('.v4-offer-detail-page')?'offer':root?.querySelector('.v4-product-detail-page')?'product':null;
  const canonicalBackAction=kind=>kind==='product'?'back-products':'back-offer-list';

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

  function rememberSource(trigger){
    if(!root || isMobile() || detailKind()) return;
    const shell=root.querySelector(':scope > .shell');
    if(!shell) return;
    sourceSnapshot=shell.outerHTML;
    sourceScroll=window.scrollY||0;
    const action=trigger?.dataset?.action||'';
    sourceKind=(action==='open-product'||action==='add-view-product')?'product':'offer';
  }

  function clearLayerMemory(){
    document.body.classList.remove('nb-detail-layer-open');
    sourceSnapshot=null;
    sourceScroll=0;
    sourceKind=null;
  }

  function buildDetailLayer(kind){
    if(!root || isMobile() || applyingLayer || root.querySelector(':scope > .nb-detail-layer')) return;
    const shell=root.querySelector(':scope > .shell');
    const detailContent=shell?.querySelector('.main')?.innerHTML;
    if(!detailContent || !sourceSnapshot || (sourceKind && sourceKind!==kind)) return;

    applyingLayer=true;
    const layer=document.createElement('div');
    layer.className=`nb-detail-layer nb-detail-layer-${kind}`;

    const source=document.createElement('div');
    source.className='nb-detail-layer-source';
    source.setAttribute('aria-hidden','true');
    source.style.setProperty('--nb-source-scroll',`${sourceScroll}px`);
    source.innerHTML=`<div class="nb-detail-layer-source-scroll">${sourceSnapshot}</div>`;

    const dim=document.createElement('button');
    dim.type='button';
    dim.className='nb-detail-layer-dim';
    dim.dataset.action=canonicalBackAction(kind);
    dim.setAttribute('aria-label','返回上一页');

    const stage=document.createElement('div');
    stage.className='nb-detail-layer-stage';
    const panel=document.createElement('section');
    panel.className='nb-detail-layer-panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label',kind==='product'?'产品详情':'Offer 详情');
    panel.innerHTML=detailContent;

    stage.appendChild(panel);
    layer.append(source,dim,stage);
    root.replaceChildren(layer);
    document.body.classList.add('nb-detail-layer-open');
    applyingLayer=false;
    enhanceDetailPages();
  }

  function syncDetailLayer(){
    if(!root || applyingLayer) return;
    const kind=detailKind();
    if(isMobile()){
      document.body.classList.remove('nb-detail-layer-open');
      return;
    }
    if(kind){
      buildDetailLayer(kind);
      return;
    }
    if(!root.querySelector('.nb-detail-layer')) clearLayerMemory();
  }

  function writeProductDetailIntent(productId){
    if(!productId) return;
    try{ localStorage.setItem(DETAIL_INTENT_KEY,JSON.stringify({productId:String(productId),createdAt:Date.now()})); }catch(_){}
  }

  function prepareHandoffProductDetail(){
    if(!pendingHandoffDetail && !localStorage.getItem(HANDOFF_SUCCESS_KEY)) return;
    try{
      const raw=localStorage.getItem(APP_STATE_KEY);
      if(!raw) return;
      const state=JSON.parse(raw);
      if(state?.route!=='product-detail'||!state.currentProductId) return;
      const productId=state.currentProductId;
      state.route='products';
      state.routeSource='products';
      state.productSearch='';
      localStorage.setItem(APP_STATE_KEY,JSON.stringify(state));
      writeProductDetailIntent(productId);
    }catch(_){}
  }

  function consumeProductDetailIntent(){
    if(!root || consumingIntent || detailKind() || !root.querySelector('.v4-products-page')) return;
    let intent=null;
    try{
      const raw=localStorage.getItem(DETAIL_INTENT_KEY);
      if(!raw) return;
      intent=JSON.parse(raw);
      if(!intent?.productId){ localStorage.removeItem(DETAIL_INTENT_KEY); return; }
      localStorage.removeItem(DETAIL_INTENT_KEY);
    }catch(_){
      try{ localStorage.removeItem(DETAIL_INTENT_KEY); }catch(__){}
      return;
    }
    consumingIntent=true;
    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.hidden=true;
    trigger.dataset.action='open-product';
    trigger.dataset.id=String(intent.productId);
    document.body.appendChild(trigger);
    trigger.click();
    trigger.remove();
    consumingIntent=false;
  }

  function enhance(){
    ensureStyles();
    enhanceLogo();
    enhanceDetailPages();
    consumeProductDetailIntent();
    syncDetailLayer();
  }

  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-action="open-offer"],[data-action="open-product"],[data-action="add-view-product"]');
    if(trigger) rememberSource(trigger);
    const handoff=event.target.closest('[data-handoff-action="approved-submit"],[data-handoff-action="duplicate-view"],[data-handoff-action="duplicate-override"]');
    if(handoff){
      pendingHandoffDetail=true;
      setTimeout(()=>{ pendingHandoffDetail=false; },0);
    }
  },true);

  window.addEventListener('beforeunload',prepareHandoffProductDetail);

  let queued=false;
  const queueEnhance=()=>{
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;enhance();});
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();

  if(root) new MutationObserver(queueEnhance).observe(root,{childList:true,subtree:true});
  window.addEventListener('popstate',queueEnhance);
  const media=window.matchMedia?.(MOBILE_QUERY);
  media?.addEventListener?.('change',()=>{
    if(media.matches && root?.querySelector('.nb-detail-layer')) location.reload();
    else queueEnhance();
  });
})();
