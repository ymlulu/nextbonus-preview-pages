(() => {
  'use strict';

  const icons = {
    discover: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M15.7 8.3l-2.1 5.3-5.3 2.1 2.1-5.3 5.3-2.1z"></path></svg>',
    saved: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-3.7-5.5 3.7v-17z"></path></svg>',
    products: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"></circle><path d="M5.5 20c.5-4 2.8-6 6.5-6s6 2 6.5 6"></path></svg>',
    attention: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10a5 5 0 0 1 10 0v3.2l1.7 2.8H5.3L7 13.2V10z"></path><path d="M10 19h4"></path></svg>',
    login: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10"></path><path d="M13 8l4 4-4 4M17 12H8"></path></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"></circle><path d="M5.5 20c.5-4 2.8-6 6.5-6s6 2 6.5 6"></path></svg>'
  };

  const categories = ['全部','信用卡','银行','券商','羊毛省钱','旅行','购物','生活'];

  function offerTagLabel(id){ return id ? (window.NextBonusOfferTags?.[id]?.label || '') : ''; }
  const OFFER_TONES=Object.freeze({
    'chase-sapphire':'blue','amex-gold':'gold','amex-platinum':'dark','bilt-palladium':'purple','capitalone-venturex':'blue','citi-strata':'dark',
    'hsbc-checking':'bank','chase-checking':'bank','usbank-checking':'bank','truist-checking':'bank','moomoo':'green','robinhood':'green',
    'cashback-deal':'blue','travel-transfer':'purple','amazon-gift':'bank','panda-mobile':'blue'
  });
  const offers=Object.entries(window.NextBonusOfferData||{}).map(([id,fact])=>{
    const product=window.NextBonusOfferProducts?.[fact.productId];
    if(!product) return null;
    return {id,provider:product.provider,name:product.name,category:product.category,value:fact.primaryValue,requirement:fact.primaryRequirement,status:offerTagLabel(fact.statusTag),tags:[offerTagLabel(fact.valueTag),offerTagLabel(fact.attributeTag)].filter(Boolean),art:OFFER_TONES[id]||'bank',applyUrl:fact.applyUrl||null,risk:false};
  }).filter(Boolean);

  const posterSets = {
    'amex-gold':[
      {tab:'开卡奖励', kicker:'LIMITED OFFER'},
      {tab:'餐饮回报', kicker:'DAILY VALUE', title:'餐饮与超市高回报', copy:'长期价值主要来自自然消费场景与可用报销。'},
      {tab:'长期持有', kicker:'KEEP OR CANCEL', title:'看你是否真的用得上福利', copy:'长期判断不只看年费，还要看你真实能使用的 Credits 与消费回报。'}
    ],
    'chase-sapphire':[
      {tab:'开卡奖励', kicker:'WELCOME BONUS'},
      {tab:'旅行转点', kicker:'TRANSFER', title:'灵活的旅行伙伴', copy:'UR 可在多个航空与酒店伙伴之间灵活转点。'},
      {tab:'日常使用', kicker:'EVERYDAY', title:'年费压力较低', copy:'适合作为长期保留的中端旅行卡。'}
    ]
  };



  const catalog = window.NextBonusProductCatalog || {};

  const stateCore=window.NextBonusState,storageCore=window.NextBonusStorage,routerCore=window.NextBonusRouter;
  if(!stateCore||!storageCore||!routerCore) throw new Error('Core runtime unavailable');
  let state = storageCore.load(()=>stateCore.createDefaultState());
  let suppressBrowserHistory=false;
  let lastHistoryKey=null;

  function syncBrowserHistory(){
    if(typeof history==='undefined'||!history.replaceState) return;
    const snap=routerCore.historySnapshot(state), key=routerCore.historyKey(snap);
    if(lastHistoryKey===null){ history.replaceState(snap,''); lastHistoryKey=key; return; }
    if(suppressBrowserHistory){ lastHistoryKey=key; return; }
    if(key!==lastHistoryKey){ history.pushState(snap,''); lastHistoryKey=key; }
  }

  function esc(v=''){
    return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function currentOffer(){ return offers.find(o=>o.id===state.currentOfferId) || offers[0]; }
  function currentProduct(){ return state.products.find(p=>p.id===state.currentProductId) || state.pastProducts.find(p=>p.id===state.currentProductId) || state.products[0]; }
  function isSaved(id){ return state.savedOfferIds.includes(id) || state.unavailableSavedIds.includes(id); }

  function localDateISO(date=new Date()){
    const pad=n=>String(n).padStart(2,'0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  }
  function historyDateLabel(date=new Date()){
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2,"0")} , ${date.getFullYear()}`.replace(' ,',',');
  }
  function daysUntil(dateString){
    if(!dateString) return null;
    const d=new Date(`${dateString}T12:00:00`);
    const today=new Date(`${localDateISO()}T12:00:00`);
    if(Number.isNaN(d.getTime())||Number.isNaN(today.getTime())) return null;
    return Math.ceil((d-today)/86400000);
  }
  function isAttentionActiveNow(a){
    const days=daysUntil(a.dueDate);
    if(a.type==='benefit') return days!==null && days>=0 && days<=7;
    if(a.type==='annual') return days!==null && days>=0 && days<=30;
    // Bonus / custom tracker starts immediately and remains actionable until resolved.
    // Verified rule / benefit changes remain actionable until the user acknowledges them.
    return true;
  }
  function currentActiveAttention(list=state.activeAttention){
    return list.filter(isAttentionActiveNow);
  }

  function navItem(route,label,icon,badge=''){
    const active = routerCore.activePrimaryRoute(state)===route ? 'active' : '';
    return `<button class="nav-item ${active}" data-action="nav" data-route="${route}">
      <span class="nav-icon">${icon}</span><span class="nav-label">${label}</span>${badge ? `<span class="nav-badge">${badge}</span>`:''}
    </button>`;
  }

  // Shared shell only. Route markup lives in pages/*/page.js.
  function renderShell(content){
    const activeCount=currentActiveAttention().length;
    const badge = activeCount ? String(activeCount) : '';
    const authItem = state.loggedIn
      ? `<div class="account-menu"><button class="nav-item" data-action="toggle-account"><span class="nav-icon">${icons.account}</span><span class="nav-label">账户</span></button>${state.accountMenu?`<div class="account-pop"><button data-action="logout">退出登录</button></div>`:''}</div>`
      : `<button class="nav-item login-item" data-action="nav" data-route="login"><span class="nav-icon">${icons.login}</span><span class="nav-label">登录</span></button>`;
    return `<div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark"><span class="nb-n">N</span><span class="nb-b">B</span></span><span class="brand-word">Next<span>Bonus</span></span></div>
        <nav class="nav">
          ${navItem('discover','发现',icons.discover)}
          ${navItem('wishlist','收藏',icons.saved)}
          <div class="nav-divider"></div>
          ${navItem('products','我的',icons.products)}
          ${navItem('attention','提醒',icons.attention,badge)}
          ${authItem}
        </nav>
      </aside>
      <main class="main">${content}</main>
    </div>`;
  }

  function pageContext(){
    const ctx={ state, categories, offers, catalog, esc, currentOffer, currentProduct, isSaved, removeSaved, categoryIcon, offerCard, offerResult, metric, genericPoster, activeAttentionSorted, productPageAttentionItem, productSection, currentActiveAttention, uniqueAttentionProducts, historyBucket, historyDateISO, historyDateLabel, attentionItem, attentionExpanded, attentionIdentity, openLogin, productCardDisplay, shortBrand, formatLongDate, formatAnniversary, shortDate, localDateISO, daysUntil, toast, renderApp:render };
    ctx.renderRoute=route=>window.NextBonusPageRegistry.render(route,ctx);
    return ctx;
  }

  function render(){
    if(!window.NextBonusPageRegistry) throw new Error('Page Registry unavailable');
    const content=window.NextBonusPageRegistry.render(state.route,pageContext());
    document.getElementById('app').innerHTML=renderShell(content)+renderModal();
    storageCore.save(state);
    syncBrowserHistory();
  }
  function captureScroll(route=state.route){
    const primary=routerCore.scrollBucket(route,state);
    if(['discover','wishlist','products','attention'].includes(primary)){
      state.pageScroll=state.pageScroll||{};
      state.pageScroll[primary]=window.scrollY||0;
    }
  }
  function restoreScroll(route){
    const y=state.pageScroll?.[route]||0;
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
  }
  function navigate(route, opts={}){
    if(routerCore.isProtected(route) && !state.loggedIn){
      openLogin(route, null, state.route);
      return;
    }
    if(state.route===route && !opts.force){
      captureScroll();
      state.accountMenu=false;
      render();
      restoreScroll(route);
      return;
    }
    captureScroll();
    state.accountMenu=false;
    state.expandedAttentionId=null;
    if(route==='attention' && opts.productId){ state.attentionProductFilter=opts.productId; state.attentionTab=opts.tab||'active'; state.historyVisibleCount=20; }
    else if(route==='attention' && !opts.keepFilter){ state.attentionProductFilter='all'; state.attentionTab=opts.tab||'active'; state.historyVisibleCount=20; }
    state.route=route;
    if(opts.source) state.routeSource=opts.source;
    render();
    if(opts.restore) restoreScroll(route); else window.scrollTo({top:0,behavior:'instant'});
  }

  function openLogin(target, intent=null, source=null){
    captureScroll();
    state.returnTarget=target || null;
    state.returnSource=source || state.route;
    state.pendingIntent=intent;
    state.route='login';
    render();
  }

  function loginSuccess(){
    state.loggedIn=true;
    const target=state.returnTarget;
    const intent=state.pendingIntent;
    const source=state.returnSource;
    state.returnTarget=null; state.pendingIntent=null; state.returnSource=null;
    if(intent?.type==='bookmark'){
      addSaved(intent.offerId);
      state.currentOfferId=intent.offerId;
      state.route=source || target || 'discover';
      toast('已收藏');
    }else if(intent?.type==='assessment'){
      state.currentOfferId=intent.offerId;
      state.route='offer-detail';
      state.assessmentDraft=null;
    }else{
      state.route=target || source || 'discover';
    }
    const finalRoute=state.route;
    render();
    if(intent?.type==='assessment'&&window.NBStaticAssessmentIntegration?.productMap?.[intent.offerId]) requestAnimationFrame(()=>window.NBStaticAssessmentIntegration.open(false));
    if(['discover','wishlist','products','attention'].includes(finalRoute) && (intent?.type==='bookmark'||(!target&&source))) restoreScroll(finalRoute);
  }

  function logout(){
    state.loggedIn=false; state.route='discover'; state.routeSource='discover'; state.accountMenu=false;
    render(); toast('已退出登录');
  }

  function addSaved(id){
    state.unavailableSavedIds=state.unavailableSavedIds.filter(x=>x!==id);
    if(!state.savedOfferIds.includes(id)) state.savedOfferIds.push(id);
  }
  function removeSaved(id){
    state.savedOfferIds=state.savedOfferIds.filter(x=>x!==id);
    state.unavailableSavedIds=state.unavailableSavedIds.filter(x=>x!==id);
  }
  function toggleSaved(id){
    if(!state.loggedIn){ openLogin(state.route,{type:'bookmark',offerId:id},state.route); return; }
    if(isSaved(id)){ removeSaved(id); toast('已取消收藏'); }
    else { addSaved(id); toast('已收藏'); }
    render();
  }

  function categoryIcon(category){
    const icons={
      '全部':'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></svg>',
      '信用卡':'<svg viewBox="0 0 24 24"><rect x="3.5" y="6" width="17" height="12" rx="2"></rect><path d="M4 10h16"></path><path d="M7 14h4"></path></svg>',
      '银行':'<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v8m4-8v8m6-8v8m4-8v8M3 18h18M12 4l9 4H3l9-4z"></path></svg>',
      '券商':'<svg viewBox="0 0 24 24"><path d="M4 17l5-5 3 3 7-8"></path><path d="M15 7h4v4"></path></svg>',
      '羊毛省钱':'<svg viewBox="0 0 24 24"><path d="M4 8.5L10.5 3H20v9.5L13.5 19 4 9.5z"></path><circle cx="15.5" cy="7.5" r="1.2"></circle></svg>',
      '旅行':'<svg viewBox="0 0 24 24"><path d="M21 16l-7-4V5.5a2 2 0 0 0-4 0V12l-7 4v2l7-2v3l-2 1.5V22l4-1 4 1v-1.5L14 19v-3l7 2v-2z"></path></svg>',
      '购物':'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg>',
      '生活':'<svg viewBox="0 0 24 24"><path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z"></path><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 4v2m4-2v2"></path></svg>'
    };
    return icons[category]||'';
  }

  function bookmarkIcon(saved){
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-3.7-5.5 3.7v-17z" ${saved?'fill="currentColor"':'fill="none"'}></path></svg>`;
  }


  function offerCard(o){
    const saved=isSaved(o.id);
    if(o.mockImage){
      return `<article class="offer-card mock-visual-card" data-action="open-offer" data-id="${o.id}" tabindex="0" role="button" aria-label="${esc(o.name)}">
        <img class="offer-card-mock" src="${esc(o.mockImage)}" alt="${esc(o.name)}" />
        <button class="bookmark mock-bookmark ${saved?'saved':''}" data-action="bookmark" data-id="${o.id}" aria-label="${saved?'取消收藏':'收藏'}">${bookmarkIcon(saved)}</button>
      </article>`;
    }
    return `<article class="offer-card fallback-offer-card" data-action="open-offer" data-id="${o.id}" tabindex="0" role="button">
      <div class="offer-top">
        <span class="provider">${esc(o.provider)}</span>
        <button class="bookmark ${saved?'saved':''}" data-action="bookmark" data-id="${o.id}" aria-label="${saved?'取消收藏':'收藏'}">${bookmarkIcon(saved)}</button>
        <div class="mock-card-art ${o.art}"></div>
        ${o.status?`<span class="status-tag">${esc(o.status)}</span>`:''}
      </div>
      <div class="offer-body">
        <div class="offer-name">${esc(o.name)}</div>
        <div class="primary-value">${esc(o.value)}</div>
        <div class="requirement">${esc(o.requirement||'')}</div>
        <div class="tag-row">${o.tags.slice(0,2).map(t=>`<span class="soft-tag">${esc(t)}</span>`).join('')}</div>
      </div>
    </article>`;
  }


  function posterData(offer){
    const custom=posterSets[offer.id];
    if(custom) return custom.map((item,index)=>index===0?{...item,title:offer.value,copy:offer.requirement}:item);
    return [
      {tab:'核心奖励',kicker:'CURRENT OFFER',title:offer.value,copy:offer.requirement},
      {tab:'为什么值得看',kicker:'VALUE',title:offer.tags[0]||'当前机会',copy:'这里集中展示最影响决策的产品卖点，不在列表页重复完整规则。'},
      {tab:'长期价值',kicker:'LONG TERM',title:offer.tags[1]||'长期使用',copy:'长期是否值得持有，需要结合年费、自然消费和你真正会使用的福利判断。'}
    ];
  }

  function offerResult(offer){
    return state.assessmentResults[offer.id] || {meta:'示例结果',recommendation:'现在申请',shortSummary:'完成申请评估后，这里会替换为你的实际结果。',bonus:'史高',approval:'较高',eligible:'可以',longTerm:'一般',note:'完成申请评估后，这里会替换为基于你已确认信息生成的个性化结果。',isSample:true};
  }

  function genericPoster(o){
    const posters=posterData(o);
    const idx=Math.max(0,Math.min(posters.length-1,Number(state.posterIndex||0)));
    const current=posters[idx]||posters[0];
    return `<div class="v4-generic-poster ${esc(o.art||'')}"><div class="v4-generic-poster-tabs">${posters.map((x,i)=>`<button class="${i===idx?'active':''}" data-action="poster" data-index="${i}">${esc(x.tab)}</button>`).join('')}</div><div class="v4-generic-brand">${esc(o.provider)}</div><div class="v4-generic-name">${esc(o.name)}</div><div class="v4-generic-kicker">${esc(current.kicker||'')}</div><div class="v4-generic-big">${esc(current.title||o.value)}</div><div class="v4-generic-copy">${esc(current.copy||o.requirement||'')}</div><div class="v4-generic-cards"><span><b>${esc(o.tags[0]||'当前机会')}</b><small>值得先看</small></span><span><b>${esc(o.tags[1]||'长期价值')}</b><small>使用场景</small></span><span><b>NextBonus</b><small>结构化判断</small></span></div></div>`;
  }

  function metricIcon(label){
    if(label==='能否拿奖励') return '<svg viewBox="0 0 24 24"><path d="M4 10h16v10H4zM12 10v10M3 7h18v3H3z"></path><path d="M12 7c-4 0-5-4-2-4 2 0 2 4 2 4zM12 7c4 0 5-4 2-4-2 0-2 4-2 4z"></path></svg>';
    if(label==='获批可能性') return '<svg viewBox="0 0 24 24"><rect x="4" y="13" width="3" height="7" rx="1"></rect><rect x="10.5" y="9" width="3" height="11" rx="1"></rect><rect x="17" y="4" width="3" height="16" rx="1"></rect></svg>';
    if(label==='开卡奖励评级') return '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3"></ellipse><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"></path></svg>';
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path></svg>';
  }

  function metric(label,value,isSample=false){
    const tone = label==='长期持有价值' ? 'orange' : (label==='能否拿奖励'||label==='开卡奖励评级' ? 'green' : 'blue');
    const sub=isSample ? (label==='能否拿奖励'?'根据历史数据分析':label==='获批可能性'?'基于你的信用画像':label==='开卡奖励评级'?'按当前最高档奖励比较':'结合年费与实际使用情况') : '';
    return `<div class="metric v4-metric"><span class="v4-metric-icon">${metricIcon(label)}</span><div><div class="metric-label">${label}</div><div class="metric-value tone-${tone}">${esc(value)}</div>${sub?`<div class="metric-sub">${sub}</div>`:''}</div></div>`;
  }



  function productPageAttentionItem(a){
    const expanded=state.expandedAttentionId===a.id;
    const tone=a.id==='a-bonus-plat'?'urgent':a.id==='a-hilton-credit'?'soon':'normal';
    return `<div class="v4-pp-attention-item"><button class="v4-pp-attention-row" data-action="toggle-attention" data-id="${a.id}" data-history="0"><span class="v4-pp-product">${esc(attentionDisplayLabel(a))}</span><span class="v4-pp-action">${esc(a.action)}</span><span class="v4-pp-time tone-${tone}">${esc(a.time)}</span><span class="v4-pp-chevron">›</span></button>${expanded?attentionExpanded(a,false):''}</div>`;
  }

  function attentionPriority(a){
    const days=daysUntil(a.dueDate);
    let bucket=4;
    if(days!==null && days<0) bucket=0;
    else if(days!==null && days<=7) bucket=1;
    else if(days!==null && days<=30) bucket=2;
    else if(a.type==='bonus') bucket=3;
    return [bucket,a.dueDate||'9999-12-31',a.id];
  }
  function activeAttentionSorted(list=currentActiveAttention()){
    return [...currentActiveAttention(list)].sort((a,b)=>{
      const aa=attentionPriority(a), bb=attentionPriority(b);
      return aa[0]-bb[0] || String(aa[1]).localeCompare(String(bb[1])) || String(aa[2]).localeCompare(String(bb[2]));
    });
  }

  function sortProducts(type,arr){
    const mode=state.productSorts?.[type]||'default';
    const copy=[...arr];
    const stable=(a,b)=>String(a.name).localeCompare(String(b.name),'zh-CN')||String(a.id).localeCompare(String(b.id));
    if(mode==='recent') return copy.sort((a,b)=>(Number(b.addedAt||0)-Number(a.addedAt||0))||stable(a,b));
    if(mode==='date-desc') return copy.sort((a,b)=>String(b.opened||'').localeCompare(String(a.opened||''))||stable(a,b));
    if(mode==='date-asc') return copy.sort((a,b)=>String(a.opened||'9999').localeCompare(String(b.opened||'9999'))||stable(a,b));
    if(type==='信用卡') return copy.sort((a,b)=>String(a.institution).localeCompare(String(b.institution),'zh-CN')||stable(a,b));
    if(type==='银行和券商账户') return copy.sort((a,b)=>String(a.institution).localeCompare(String(b.institution),'zh-CN')||stable(a,b));
    return copy.sort(stable);
  }
  function productSection(type,arr){
    const sorted=sortProducts(type,arr);
    const expanded=!!state.productSectionExpanded?.[type];
    const collapsible=arr.length>=8 && !state.productSearch;
    const shown=collapsible&&!expanded?sorted.slice(0,5):sorted;
    const hidden=Math.max(0,arr.length-shown.length);
    const cls=type==='信用卡'?'credit-products':type==='银行和券商账户'?'account-products':type==='会籍'?'membership-products':'other-products';
    const reliableDates=arr.filter(x=>x.opened).length===arr.length;
    const sortOpen=state.productSortPicker===type;
    return `<section class="v4-product-section-card v4-product-section ${cls}"><div class="v4-section-head"><h2>${type} <span class="section-count">${arr.length}</span></h2>${collapsible&&expanded?`<div class="product-sort-wrap"><button class="product-sort-button" data-action="toggle-product-sort" data-type="${type}">排序 ▾</button>${sortOpen?`<div class="product-sort-menu"><button data-action="product-sort" data-type="${type}" data-value="default">默认顺序</button><button data-action="product-sort" data-type="${type}" data-value="recent">最近添加</button>${reliableDates?`<button data-action="product-sort" data-type="${type}" data-value="date-desc">日期：最新优先</button><button data-action="product-sort" data-type="${type}" data-value="date-asc">日期：最早优先</button>`:''}</div>`:''}</div>`:''}</div><div class="v4-owned-product-grid">${shown.map(productTile).join('')}</div>${collapsible?`<button class="v4-show-more" data-action="toggle-product-section" data-type="${type}">${expanded?'收起':'再显示 '+hidden+' 个'} <span>${expanded?'⌃':'⌄'}</span></button>`:''}</section>`;
  }

  function productCardDisplay(p, detail=false){
    const asset=window.NextBonusProductArtRegistry?.resolveProduct?.(p);
    const primarySrc=asset?.web||asset?.local||'';
    const localSrc=asset?.local||primarySrc;
    const fallbackAttr=(localSrc&&primarySrc&&primarySrc!==localSrc)?` data-fallback="${esc(localSrc)}" onerror="if(this.dataset.fallback&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}"`:'';
    return {primarySrc,localSrc,fallbackAttr};
  }


  const productTileCopy={
    'p-chase-checking':['Chase','Total Checking'],
    'p-fidelity':['Fidelity','Cash Management Account'],
    'p-robinhood':['Robinhood','Brokerage Account'],
    'p-truist':['Truist','One Checking'],
    'p-usbank':['U.S. Bank','Smartly Checking'],
    'p-wf-checking':['Wells Fargo','Everyday Checking'],
    'p-delta-status':['Delta SkyMiles','Platinum'],
    'p-hilton':['Hilton Honors','Diamond'],
    'p-ihg':['IHG One Rewards','Platinum'],
    'p-marriott-status':['Marriott Bonvoy','Titanium'],
    'p-hyatt':['World of Hyatt','Globalist']
  };
  function productInfoTileCopy(p){
    if(productTileCopy[p.id]) return productTileCopy[p.id];
    if(p.type==='其他') return [p.name,p.instance||p.institution||''];
    return [p.institution||p.name,p.instance||p.name||''];
  }
  function productTile(p){
    const isCredit=p.type==='信用卡';
    if(isCredit){
      const art=productCardDisplay(p,false);
      const fallbackLabel=shortBrand(p.institution||p.name);
      return `<button class="v4-owned-product-card credit-tile" data-action="open-product" data-id="${p.id}" aria-label="${esc(p.name)}"><span class="v4-owned-product-art">${art.primarySrc?`<img src="${art.primarySrc}"${art.fallbackAttr} alt="${esc(p.name)}" />`:`<span class="fallback-brand">${esc(fallbackLabel)}</span>`}</span><span class="owned-product-meta"><strong>${esc(p.name)}</strong><small>${esc(p.instance||p.institution||'')}</small></span><span class="owned-product-chevron">›</span></button>`;
    }
    const [primary,secondary]=productInfoTileCopy(p);
    const logo=window.NextBonusProductLogoRegistry?.resolve?.(p.id,p.offerId,p.name)||'';
    return `<button class="v4-owned-product-card compact-tile v10-info-tile" data-action="open-product" data-id="${p.id}" aria-label="${esc(p.name)}"><span class="v10-info-logo">${logo?`<img src="${logo}" alt="" />`:`<span class="v10-logo-fallback">${esc(shortBrand(p.institution||p.name))}</span>`}</span><span class="v10-info-copy"><strong>${esc(primary)}</strong><small>${esc(secondary)}</small></span><span class="v10-info-chevron">›</span></button>`;
  }

  function shortBrand(v){ return String(v||'NB').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase().slice(0,3); }
  function attentionProduct(pId){ return state.products.find(p=>p.id===pId)||state.pastProducts.find(p=>p.id===pId)||null; }
  function stripAttentionSnapshotInstance(value=''){ return String(value||'').replace(/\s+[•·]{4}\s*\d{4}\s*$/,'').trim(); }
  function snapshotAttentionInstance(value=''){ const m=String(value||'').match(/([•·]{4}\s*\d{4})\s*$/); return m?m[1]:''; }
  function attentionIdentity(a){
    const p=attentionProduct(a?.productId);
    if(p) return {name:p.name||stripAttentionSnapshotInstance(a?.product),instance:p.instance||''};
    return {name:stripAttentionSnapshotInstance(a?.product),instance:a?.productInstance||snapshotAttentionInstance(a?.product)||''};
  }
  function attentionDisplayName(a){ return attentionIdentity(a).name; }
  function attentionDisplayInstance(a){ return attentionIdentity(a).instance; }
  function attentionDisplayLabel(a){ const x=attentionIdentity(a); return [x.name,x.instance].filter(Boolean).join(' '); }
  function attentionThumb(a){
    const p=attentionProduct(a.productId);
    const asset=window.NextBonusProductArtRegistry?.resolveProduct?.(p)||window.NextBonusProductArtRegistry?.resolveByName?.(attentionDisplayName(a));
    const src=asset?.web||asset?.local||'';
    return src?`<img src="${src}" alt="" />`:`<span>${esc(shortBrand(p?.institution||a.product))}</span>`;
  }

  function attentionItem(a, history=false){
    const expanded=state.expandedAttentionId===a.id;
    const tone=a.time.includes('截止')?'due':a.time.includes('生效')?'info':'soft';
    return `<div class="attention-item"><button class="attention-row ${history?'history-row':''}" data-action="toggle-attention" data-id="${a.id}" data-history="${history?'1':'0'}">
      <span class="att-product-cell"><span class="att-thumb">${attentionThumb(a)}</span><span class="att-product-copy"><strong>${esc(attentionDisplayName(a))}</strong><small>${esc(attentionDisplayInstance(a))}</small></span></span>
      <span class="att-action-cell"><strong>${esc(a.action)}</strong>${a.secondary?`<small>${esc(a.secondary)}</small>`:''}</span>
      <span class="att-time att-time-${tone}">${esc(a.time)}</span>${history?`<span class="history-status ${a.statusClass||''}">${esc(a.result)}</span>`:''}<span class="chev ${expanded?'up':''}">›</span>
    </button>${expanded?attentionExpanded(a,history):''}</div>`;
  }
  function attentionExpanded(a,history){
    if(history){
      return `<div class="attention-expanded"><div class="attention-expanded-inner"><div><p class="attention-summary">${esc(a.summary)}</p><div class="key-card"><strong>${esc(a.key)}</strong><span class="muted">${esc(a.keySub)}</span></div></div><div><div class="instruction-title">最终结果</div><p class="muted">${esc(a.result)} · ${esc(a.ended)}${a.resultReason?` · ${esc(a.resultReason)}`:''}</p>${a.correction?`<div class="attention-actions"><button class="btn secondary small" data-action="history-correction" data-id="${a.id}">${esc(a.correction)}</button></div>`:''}</div></div></div>`;
    }
    return `<div class="attention-expanded"><div class="attention-expanded-inner"><div><p class="attention-summary">${esc(a.summary)}</p><div class="key-card"><strong>${esc(a.key)}</strong><span class="muted">${esc(a.keySub)}</span></div></div><div><div class="instruction-title">${esc(a.instruction)}</div>${a.checklist?.length?`<div class="checklist">${a.checklist.map(c=>`<label class="check"><input type="checkbox" data-action="checklist" data-attention="${a.id}" data-check="${c.id}" ${c.done?'checked':''}/><span>${esc(c.label)}</span></label>`).join('')}</div>`:''}<div class="attention-actions"><button class="btn primary small" data-action="complete-attention" data-id="${a.id}">${esc(a.primary)}</button>${a.secondaryAction?`<button class="btn secondary small" data-action="skip-attention" data-id="${a.id}">${esc(a.secondaryAction)}</button>`:''}</div></div></div></div>`;
  }

  function fact(label,value){ return `<div><div class="fact-label">${esc(label)}</div><div class="fact-value">${esc(value)}</div></div>`; }
  function historyDateISO(v){
    if(!v) return '';
    const m=String(v).match(/([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})/);
    if(m){ const mon={Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'}[m[1]]; return `${m[3]}-${mon}-${String(m[2]).padStart(2,'0')}`; }
    return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:'';
  }
  function formatLongDate(date){
    if(!date) return '未填写';
    const m=String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m) return date;
    return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
  }
  function uniqueAttentionProducts(){
    const map=new Map(); [...currentActiveAttention(),...state.attentionHistory].forEach(a=>{ if(!map.has(a.productId)) map.set(a.productId,{id:a.productId,label:attentionDisplayLabel(a)}); }); return [...map.values()];
  }
  function historyBucket(h){
    if(h.statusClass==='skipped') return 'skipped'; if(h.statusClass==='expired') return 'expired'; if(h.statusClass==='stopped') return 'stopped'; return 'completed';
  }


  const bonusOfferChoice=window.NextBonusBonusOfferChoice;
  if(!bonusOfferChoice) throw new Error('Bonus offer choice feature unavailable');
  function offerChoicesFor(prod){ return bonusOfferChoice.offerChoicesFor(prod); }
  function resolveOfferChoice(prod,choiceId){ return bonusOfferChoice.resolveOfferChoice(prod,choiceId); }
  async function ensureReviewedOfferHistory(prod){ return bonusOfferChoice.ensureReviewedOfferHistory(prod); }

  async function enterAddOfferStep(flow){
    if(!flow||flow.offerLoading)return;
    flow.offerLoading=true;render();
    await ensureReviewedOfferHistory(flow.product);
    if(state.addFlow!==flow)return;
    flow.offerLoading=false;flow.step='offer';render();
  }

  function addProductContext(){
    return {flow:state.addFlow,catalog,esc,localDateISO,offerChoicesFor};
  }

  function renderModal(){
    if(!state.modal && !state.addFlow) return '';
    if(state.addFlow) return window.NextBonusAddProductPage.render(addProductContext());
    const m=state.modal;
    if(m.type==='apply-risk') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">确认继续申请</div><button class="close-btn" data-action="modal-close">×</button></div><div class="modal-body"><p class="confirm-copy">${esc(m.copy||'你可能无法获得当前开卡奖励。仍要继续申请吗？')}</p><p class="muted">这只是风险确认，不替你强制拦截申请。</p></div><div class="modal-foot"><button class="btn secondary" data-action="modal-close">返回</button><button class="btn primary" data-action="apply-confirm">继续申请</button></div></div></div>`;
    if(m.type==='simple') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">${esc(m.title)}</div><button class="close-btn" data-action="modal-close">×</button></div><div class="modal-body"><p class="confirm-copy">${esc(m.copy)}</p>${m.detail?`<p class="muted">${esc(m.detail)}</p>`:''}</div><div class="modal-foot"><span></span><button class="btn primary" data-action="modal-close">知道了</button></div></div></div>`;
    if(m.type==='remove-product-confirm') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">从 NextBonus 中移除？</div><button class="close-btn" data-action="modal-close">×</button></div><div class="modal-body"><p class="confirm-copy">这只会删除误添加的 NextBonus 产品记录，不代表关闭真实账户。</p></div><div class="modal-foot"><button class="btn secondary" data-action="modal-close">取消</button><button class="btn danger" data-action="remove-product-confirm" data-id="${esc(m.productId)}">确认移除</button></div></div></div>`;
    if(m.type==='discard-edit') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">放弃修改？</div></div><div class="modal-body"><p class="confirm-copy">尚未保存的修改会丢失。</p></div><div class="modal-foot"><button class="btn secondary" data-action="modal-close">继续编辑</button><button class="btn danger" data-action="edit-discard-confirm">放弃修改</button></div></div></div>`;
    return '';
  }

  function openAddProduct(){
    state.addFlow={step:'product',category:null,product:null,search:'',filter:'全部',last4:'',nickname:'',opened:'',track:null,offer:null,reward:'',tasks:[{id:'t1',desc:'',due:''}],savedProductId:null,submitting:false,committed:false,offerLoading:false};
    render();
  }
  function resetAddAfterCategory(f){
    f.product=null; f.last4=''; f.nickname=''; f.opened=''; f.track=null; f.offer=null; f.reward='';
    f.tasks=[{id:'t1',desc:'',due:''}]; f.savedProductId=null; f.submitting=false; f.committed=false;
  }
  function resetAddAfterProduct(f){
    f.last4=''; f.nickname=''; f.opened=''; f.track=null; f.offer=null; f.reward='';
    f.tasks=[{id:'t1',desc:'',due:''}]; f.savedProductId=null; f.submitting=false; f.committed=false;
  }





  function submitAddedProduct(){
    const f=state.addFlow; if(!f||f.submitting||f.committed) return;
    const lifecycle=window.NextBonusProductLifecycleCore;
    if(!lifecycle) throw new Error('Product Lifecycle Core unavailable');
    f.submitting=true;
    const type=f.category==='信用卡'?'信用卡':f.category==='其他'?'会籍':'银行和券商账户';
    const p=lifecycle.createUserProduct(state,{
      idPrefix:'p-local',offerId:f.product.offerId||null,type,name:f.product.name,institution:f.product.institution,
      instance:f.category==='信用卡'?(f.last4?`•••• ${f.last4}`:'账户 1'):(f.nickname||f.product.subtype||'主账户'),
      art:f.product.art||'bank',cardImageLocal:f.product.cardImageLocal||null,opened:f.opened||'',
      annualFee:f.category==='信用卡'?(f.product.annualFee||'以产品规则为准'):'—',earning:f.product.earning||'—'
    });
    f.savedProductId=p.id;
    state.productSearch='';
    state.productSectionExpanded=state.productSectionExpanded||{};
    if(state.products.filter(x=>x.type===type).length>=8) state.productSectionExpanded[type]=true;
    if(f.track){
      const chosen=f.offer==='manual'?null:resolveOfferChoice(f.product,f.offer);
      const manualEntries=f.offer==='manual'?(f.tasks||[]).filter(t=>String(t.desc||'').trim()||t.due):[];
      const reward=f.offer==='manual'?String(f.reward||'').trim():(chosen?.value||'开户 / 开卡奖励');
      const tasks=f.offer==='manual'?manualEntries.filter(t=>String(t.desc||'').trim()).map(t=>({id:t.id,label:String(t.desc||'').trim(),dueDate:t.due||null})):null;
      const manualDue=f.offer==='manual'?(manualEntries.find(t=>t.due)?.due||null):null;
      lifecycle.createBonusTracking(state,{
        identity:p.id,productId:p.id,productName:p.name,productLabel:p.name,offerId:chosen?.sourceOfferId||f.product.offerId||null,
        reward,requirement:chosen?.req||'完成对应奖励条件',tasks,anchorDate:f.opened||null,anchorKind:'user_product_opened_date',category:f.category,
        dueDate:f.offer==='manual'?manualDue:null,preserveEmptyReward:f.offer==='manual',
        action:f.category==='信用卡'?'完成开卡奖励':'完成开户奖励条件',
        summary:'这是你在添加产品时建立的奖励追踪。逐项完成条件即可。'
      });
      lifecycle.removeSavedOffer(state,chosen?.sourceOfferId||null);
    }
    f.committed=true; f.submitting=false; f.step='success';
  }

  function formatAnniversary(date){ try{ const d=new Date(date+'T00:00:00'); return `${d.getMonth()+1} 月 ${d.getDate()} 日`; }catch(e){return '—';} }
  function shortDate(date){ try{ const d=new Date(date+'T00:00:00'); return `${d.getMonth()+1}/${d.getDate()}`;}catch(e){return date;} }

  function goAddBack(){
    const f=state.addFlow;if(!f)return;
    const map={info:'product',track:'info',offer:'track',manual:'offer','membership-confirm':'product'};
    if(map[f.step])f.step=map[f.step];else if(f.step==='product'||f.step==='category')state.addFlow=null;
    render();
  }
  function closeAdd(){
    const f=state.addFlow;
    const progressed=!!f && !['category','product','success'].includes(f.step);
    if(progressed){
      f._confirmClose=true; render(); return;
    }
    state.addFlow=null; state.modal=null; render();
  }

  function completeAttention(id, mode='complete'){
    const idx=state.activeAttention.findIndex(a=>a.id===id); if(idx<0) return;
    const a=state.activeAttention[idx];
    let result='已完成', statusClass='used', correction='撤销完成';
    if(mode==='skip'){ result='本期已忽略'; statusClass='skipped'; correction='恢复本期提醒'; }
    else if(a.completionKind==='used'){ result='已使用'; correction='撤销已使用'; }
    else if(a.completionKind==='viewed'){ result='已查看'; correction='撤销已查看'; }
    else if(a.completionKind==='confirmed'){ result='已了解'; correction='撤销确认'; }
    const identity=attentionIdentity(a);
    const history={id:`h-${a.id}-${Date.now()}`,productId:a.productId,product:identity.name,productInstance:identity.instance,action:a.action,time:a.time,result,statusClass,ended:historyDateLabel(),correction,summary:a.summary,key:a.key,keySub:a.keySub,instruction:a.instruction,source:{...a,product:identity.name,productInstance:identity.instance}};
    state.activeAttention.splice(idx,1); state.attentionHistory.unshift(history); state.expandedAttentionId=null;
    render(); toast(`${result} · `,()=>undoHistory(history.id,a));
  }
  function undoHistory(historyId, original){
    state.attentionHistory=state.attentionHistory.filter(h=>h.id!==historyId);
    if(!state.activeAttention.find(a=>a.id===original.id)) state.activeAttention.push(original);
    render(); toast('已撤销');
  }

  function historyCorrection(id){
    const idx=state.attentionHistory.findIndex(h=>h.id===id); if(idx<0) return;
    const h=state.attentionHistory[idx];
    if(['expired','stopped'].includes(h.statusClass)) return;
    state.attentionHistory.splice(idx,1);
    const source=h.source || {id:`restored-${Date.now()}`,productId:h.productId,product:h.product,action:h.action,secondary:'',time:h.time,dueDate:h.dueDate||null,type:'restored',summary:h.summary,key:h.key,keySub:h.keySub,instruction:'重新处理这项提醒',checklist:[],primary:'我已完成',secondaryAction:null,completionKind:'completed'};
    const productStillCurrent=state.products.some(p=>p.id===h.productId);
    const today=localDateISO(), due=source.dueDate||h.dueDate||null;
    if(!productStillCurrent){
      state.attentionHistory.unshift({...h,id:`h-recalc-${Date.now()}`,result:'已结束',statusClass:'stopped',resultReason:'产品已不在当前生命周期',correction:null,ended:historyDateLabel()});
      render(); toast('已重新计算：该事项当前已结束'); return;
    }
    if(due && due<today){
      state.attentionHistory.unshift({...h,id:`h-recalc-${Date.now()}`,result:'已到期',statusClass:'expired',correction:null,ended:historyDateLabel()});
      render(); toast('已重新计算：该事项已经到期'); return;
    }
    if(!state.activeAttention.find(a=>a.id===source.id)) state.activeAttention.push(source);
    state.expandedAttentionId=null; render(); toast('已重新计算：该事项重新进入待处理');
  }

  function toast(message, undo){
    const root=document.getElementById('toast-root'); if(!root) return;
    root.innerHTML=`<div class="toast"><span>${esc(message)}</span>${undo?`<button id="toast-undo">撤销</button>`:''}</div>`;
    if(undo){ document.getElementById('toast-undo').onclick=()=>{ undo(); root.innerHTML=''; }; }
    clearTimeout(window.__nbToast); window.__nbToast=setTimeout(()=>{root.innerHTML='';},5000);
  }

  function showSimple(title,copy,detail=''){
    state.modal={type:'simple',title,copy,detail}; render();
  }

  document.addEventListener('click', e => {
    const el=e.target.closest('[data-action]'); if(!el) return;
    const action=el.dataset.action;
    if(action==='bookmark'){ e.stopPropagation(); toggleSaved(el.dataset.id); return; }
    if(action==='nav'){
      const r=el.dataset.route;
      if(r==='login'){ openLogin(null,null,state.route); }
      else navigate(r,{source:r});
      return;
    }
    if(action==='offer-category'){ state.offerCategory=el.dataset.category; render(); return; }
    if(action==='clear-offer-search'){ state.offerSearch=''; render(); return; }
    if(action==='open-offer'){ captureScroll(); state.currentOfferId=el.dataset.id; state.routeSource=state.route==='wishlist'?'wishlist':'discover'; state.posterIndex=0; state.route='offer-detail'; render(); window.scrollTo(0,0); return; }
    if(action==='toggle-unavailable'){ state.wishlistUnavailableOpen=!state.wishlistUnavailableOpen; render(); return; }
    if(action==='back-offer-list'){ const target=state.routeSource==='wishlist'?'wishlist':'discover'; state.route=target; render(); restoreScroll(target); return; }
    if(action==='assessment-start'){
      const supported=!!window.NBStaticAssessmentIntegration?.productMap?.[state.currentOfferId];
      if(!supported) return;
      if(!state.loggedIn) openLogin('offer-detail',{type:'assessment',offerId:state.currentOfferId},'offer-detail');
      else window.NBStaticAssessmentIntegration.open(false);
      return;
    }
    if(action==='assessment-restart'){
      if(window.NBStaticAssessmentIntegration?.productMap?.[state.currentOfferId]) window.NBStaticAssessmentIntegration.open(true);
      return;
    }
    if(action==='direct-apply'){ const o=currentOffer(), r=state.assessmentResults[o.id]; if(!o.applyUrl)return; const appRestriction=!!(r&&['BLOCK','WAIT'].includes(r.internal?.appHard)); const bonusRestriction=!!(r&&(r.eligible==='不可以'||['BLOCK','WAIT'].includes(r.internal?.bonusHard))); const risky=appRestriction||bonusRestriction||!!(r&&r.recommendation==='暂不建议申请'); if(risky){state.modal={type:'apply-risk',copy:appRestriction?'按当前已知规则，你现在申请可能不符合申请限制。仍要继续申请吗？':'你可能无法获得当前开卡奖励。仍要继续申请吗？'};render();}else{window.open(o.applyUrl,'_blank','noopener,noreferrer');} return; }
    if(action==='apply-confirm'){ const o=currentOffer(); state.modal=null; render(); if(o.applyUrl) window.open(o.applyUrl,'_blank','noopener,noreferrer'); return; }
    if(action==='modal-close'){ state.modal=null; render(); return; }
    if(action==='login-success'){ loginSuccess(); return; }
    if(action==='login-cancel'){ const source=state.returnSource||'discover'; state.route=source; state.returnTarget=null;state.pendingIntent=null;state.returnSource=null;render(); if(['discover','wishlist','products','attention'].includes(source)) restoreScroll(source); return; }
    if(action==='toggle-account'){ state.accountMenu=!state.accountMenu; render(); return; }
    if(action==='logout'){ logout(); return; }
    if(action==='open-add-product'){ openAddProduct(); return; }
    if(action==='clear-product-search'){ state.productSearch='';render();return; }
    if(action==='open-all-attention'){ navigate('attention',{tab:'active'}); return; }
    if(action==='toggle-past'){ state.pastOpen=!state.pastOpen;render();return; }
    if(action==='toggle-product-section'){ const t=el.dataset.type; state.productSectionExpanded=state.productSectionExpanded||{}; state.productSectionExpanded[t]=!state.productSectionExpanded[t]; state.productSortPicker=null; render(); return; }
    if(action==='toggle-product-sort'){ const t=el.dataset.type; state.productSortPicker=state.productSortPicker===t?null:t; render(); return; }
    if(action==='product-sort'){ const t=el.dataset.type; state.productSorts=state.productSorts||{}; state.productSorts[t]=el.dataset.value; state.productSortPicker=null; render(); return; }
    if(action==='open-product'){ captureScroll(); state.currentProductId=el.dataset.id; state.editFlow=null; state.route='product-detail'; state.productHistoryOpen=false;render();window.scrollTo(0,0);return; }
    if(action==='back-products'){ state.route='products';render();restoreScroll('products');return; }
    if(action==='toggle-attention'){ state.expandedAttentionId=state.expandedAttentionId===el.dataset.id?null:el.dataset.id;render();return; }
    if(action==='complete-attention'){ completeAttention(el.dataset.id,'complete');return; }
    if(action==='skip-attention'){ completeAttention(el.dataset.id,'skip');return; }
    if(action==='history-correction'){ historyCorrection(el.dataset.id);return; }
    if(action==='attention-for-product'){ state.attentionProductFilter=el.dataset.id;state.attentionTab='active';state.route='attention';render();window.scrollTo(0,0);return; }
    if(action==='attention-tab'){ state.attentionTab=el.dataset.tab;state.expandedAttentionId=null;state.historyVisibleCount=20;render();return; }
    if(action==='history-load-more'){ state.historyVisibleCount=(state.historyVisibleCount||20)+20;render();return; }
    if(action==='clear-attention-filter'){ state.attentionProductFilter='all';render();return; }
    if(action==='history-deeplink'){ state.attentionProductFilter=el.dataset.product;state.attentionTab='history';state.historyStatusFilter='all';state.historyVisibleCount=20;state.route='attention'; const candidate=state.attentionHistory.find(h=>h.id===el.dataset.historyId);state.expandedAttentionId=candidate?.id||null;render();window.scrollTo(0,0);return; }


    // Add Product actions
    if(action==='add-close'){ closeAdd();return; }
    if(action==='add-continue-editing'){ state.addFlow._confirmClose=false;render();return; }
    if(action==='add-discard'){ state.addFlow=null;state.modal=null;render();return; }
    if(action==='add-back'){ goAddBack();return; }
    if(action==='add-category'){ const f=state.addFlow; const next=el.dataset.category; if(f.category!==next) resetAddAfterCategory(f); f.category=next; f.step='product';f.search='';f.filter='全部';render();return; }
    if(action==='add-filter'){ state.addFlow.filter=el.dataset.value;render();return; }
    if(action==='add-clear-search'){ state.addFlow.search='';state.addFlow.reportStatus=null;render();return; }
    if(action==='add-report-missing'){ state.addFlow.reportStatus='loading';render();setTimeout(()=>{if(state.addFlow){state.addFlow.reportStatus='submitted';render();}},150);return; }
    if(action==='add-product-select'){ const f=state.addFlow; const category=el.dataset.category||f.category; const next=(catalog[category]||[]).find(x=>x.id===el.dataset.id); if(!next)return; if(f.product?.id!==next.id) resetAddAfterProduct(f); f.category=category;f.product=next;void ensureReviewedOfferHistory(next);if(category==='其他')f.step='membership-confirm';else f.step='info';render();return; }
    if(action==='add-clear-opened'){ state.addFlow.opened='';render();return; }
    if(action==='add-to-track'){ state.addFlow.step='track';render();return; }
    if(action==='add-track-choice'){ state.addFlow.track=el.dataset.value==='yes';render();return; }
    if(action==='add-track-next'){ const f=state.addFlow;if(f.track===true){enterAddOfferStep(f);return;}f.track=false;submitAddedProduct();render();return; }
    if(action==='add-offer-choice'){ state.addFlow.offer=el.dataset.id;render();return; }
    if(action==='add-offer-next'){ const f=state.addFlow;if(f.offer==='manual'){f.step='manual';render();return;}if(!f.offer){f.track=false;}else{f.track=true;}submitAddedProduct();render();return; }
    if(action==='add-task'){ state.addFlow.tasks.push({id:`t${Date.now()}`,desc:'',due:''});render();return; }
    if(action==='clear-task-due'){ const t=state.addFlow.tasks.find(x=>x.id===el.dataset.id);if(t)t.due='';render();return; }
    if(action==='delete-task'){ state.addFlow.tasks=state.addFlow.tasks.filter(t=>t.id!==el.dataset.id);render();return; }
    if(action==='add-manual-submit'){ const f=state.addFlow,has=!!String(f.reward||'').trim()||(f.tasks||[]).some(t=>String(t.desc||'').trim()||t.due);if(!has){f.track=false;f.offer=null;}else{f.track=true;f.offer='manual';}submitAddedProduct();render();return; }
    if(action==='add-membership-submit'){ submitAddedProduct();render();return; }
    if(action==='add-view-product'){ state.currentProductId=state.addFlow.savedProductId;state.addFlow=null;state.route='product-detail';render();return; }
    if(action==='add-another'){ openAddProduct();return; }
  });

  document.addEventListener('input', e => {
    if(e.target.id==='offer-search'){ state.offerSearch=e.target.value; render(); focusEnd('offer-search'); }
    if(e.target.id==='product-search'){ state.productSearch=e.target.value; render(); focusEnd('product-search'); }
    if(e.target.id==='nb-add-search' && state.addFlow){ state.addFlow.search=e.target.value; render(); focusEnd('nb-add-search'); }
    if(e.target.id==='add-last4' && state.addFlow){ state.addFlow.last4=e.target.value.replace(/\D/g,'').slice(0,4); }
    if(e.target.id==='add-nickname' && state.addFlow){ state.addFlow.nickname=e.target.value; }
    if(e.target.id==='add-opened' && state.addFlow){ state.addFlow.opened=e.target.value; const clear=e.target.closest('.date-field-row')?.querySelector('[data-action="add-clear-opened"]'); if(clear) clear.disabled=!e.target.value; }
    if(e.target.id==='add-reward' && state.addFlow){ state.addFlow.reward=e.target.value; updateManualSubmit(); }
    if(e.target.classList.contains('task-desc') && state.addFlow){ const t=state.addFlow.tasks.find(t=>t.id===e.target.dataset.id); if(t)t.desc=e.target.value; updateManualSubmit(); }
    if(e.target.classList.contains('task-due') && state.addFlow){ const t=state.addFlow.tasks.find(t=>t.id===e.target.dataset.id); if(t)t.due=e.target.value; updateManualSubmit(); }
  });

  document.addEventListener('change', e => {
    if(e.target.id==='attention-product-filter'){ state.attentionProductFilter=e.target.value;state.expandedAttentionId=null;state.historyVisibleCount=20;render(); }
    if(e.target.id==='history-status-filter'){ state.historyStatusFilter=e.target.value;state.expandedAttentionId=null;state.historyVisibleCount=20;render(); }
    if(e.target.matches('[data-action="checklist"]')){
      const a=state.activeAttention.find(x=>x.id===e.target.dataset.attention); const c=a?.checklist.find(x=>x.id===e.target.dataset.check); if(c)c.done=e.target.checked; render();
    }
  });

  function updateManualSubmit(){
    if(!state.addFlow) return;
    const valid=state.addFlow.reward.trim() && state.addFlow.tasks.length && state.addFlow.tasks.every(t=>t.desc.trim()&&t.due);
    const btn=document.querySelector('[data-action="add-manual-submit"]');
    if(btn) btn.disabled=!valid;
  }

  window.addEventListener?.('popstate', e=>{
    const snap=e.state; if(!snap?.nb) return;
    suppressBrowserHistory=true;
    state.route=snap.route||'discover';
    state.routeSource=snap.routeSource||'discover';
    state.currentOfferId=snap.currentOfferId||state.currentOfferId;
    state.currentProductId=snap.currentProductId||state.currentProductId;
    state.attentionTab=snap.attentionTab||'active';
    state.attentionProductFilter=snap.attentionProductFilter||'all';
    state.historyStatusFilter=snap.historyStatusFilter||'all';
    state.posterIndex=Number(snap.posterIndex||0);
    state.modal=null; state.addFlow=null; state.editFlow=null; state.accountMenu=false;
    render();
    suppressBrowserHistory=false;
    const primary=['discover','wishlist','products','attention'].includes(state.route)?state.route:null;
    if(primary) restoreScroll(primary); else window.scrollTo({top:0,behavior:'instant'});
  });

  function focusEnd(id){ requestAnimationFrame(()=>{const el=document.getElementById(id);if(el){el.focus();const n=el.value.length;try{el.setSelectionRange(n,n);}catch(e){}}}); }

  // Presentation boundary into the existing persisted Assessment state.
  window.NBAssessmentUI=Object.freeze({
    context(){ return {offerId:state.currentOfferId,route:state.route,result:state.assessmentResults[state.currentOfferId],draft:state.assessmentDraft}; },
    saveDraft(draft){ state.assessmentDraft=draft; persist(); },
    saveResult(offerId,result){
      state.assessmentResults[offerId]=result;
      state.assessmentDraft=null;
      render();
    }
  });
  render();
})();
