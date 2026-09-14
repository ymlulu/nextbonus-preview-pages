(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';

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



  const defaultProducts = [
    {id:'p-amex-plat-1005', offerId:'amex-platinum', type:'信用卡', name:'AMEX Platinum', institution:'American Express', instance:'•••• 1005', opened:'2026-04-15', anniversary:'4 月 15 日', annualFee:'$895', status:'正常', earning:'机票 5x · 预付酒店 5x · 其他 1x'},
    {id:'p-hilton-aspire-2308', type:'信用卡', name:'Hilton Aspire', institution:'American Express', instance:'•••• 2308', opened:'2025-10-02', anniversary:'10 月 2 日', annualFee:'$550', status:'正常', earning:'Hilton 14x · 其他 3x'},
    {id:'p-csr-2948', type:'信用卡', name:'Chase Sapphire Reserve', institution:'Chase', instance:'•••• 2948', opened:'2024-10-02', anniversary:'10 月 2 日', annualFee:'$795', status:'正常', earning:'旅行 / 餐饮高回报'},
    {id:'p-marriott-brilliant-6503', type:'信用卡', name:'Marriott Bonvoy Brilliant', institution:'American Express', instance:'•••• 6503', opened:'2024-08-03', anniversary:'8 月 3 日', annualFee:'$650', status:'正常', earning:'Marriott 6x'},
    {id:'p-amex-biz-4321', type:'信用卡', name:'AMEX Business Plus', institution:'American Express', instance:'•••• 4321', opened:'2025-03-12', anniversary:'3 月 12 日', annualFee:'$0', status:'正常', earning:'日常消费回报'},
    {id:'p-freedom-7182', type:'信用卡', name:'Chase Freedom Unlimited', institution:'Chase', instance:'•••• 7182', opened:'2023-06-18', anniversary:'6 月 18 日', annualFee:'$0', status:'正常', earning:'1.5x 起'},
    {id:'p-citi-3490', type:'信用卡', name:'Citi Double Cash', institution:'Citi', instance:'•••• 3490', opened:'2023-11-08', anniversary:'11 月 8 日', annualFee:'$0', status:'正常', earning:'2% 现金回报'},

    {id:'p-usbank', type:'银行和券商账户', name:'U.S. Bank Smartly Checking', institution:'U.S. Bank', instance:'主账户', opened:'2026-08-24', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-truist', type:'银行和券商账户', name:'Truist One Checking', institution:'Truist', instance:'Checking', opened:'2026-07-10', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-chase-checking', type:'银行和券商账户', name:'Chase Total Checking', institution:'Chase', instance:'Checking', opened:'2026-06-18', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-wf-checking', type:'银行和券商账户', name:'Wells Fargo Everyday Checking', institution:'Wells Fargo', instance:'Checking', opened:'2026-05-21', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-fidelity', type:'银行和券商账户', name:'Fidelity Cash Management Account', institution:'Fidelity', instance:'CMA', opened:'2026-02-05', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-robinhood', type:'银行和券商账户', name:'Robinhood Brokerage Account', institution:'Robinhood', instance:'Brokerage', opened:'2026-01-26', annualFee:'$0', status:'正常', earning:'—'},

    {id:'p-hilton', type:'会籍', name:'Hilton Honors Diamond', institution:'Hilton', instance:'Diamond', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-ihg', type:'会籍', name:'IHG One Rewards Platinum', institution:'IHG', instance:'Platinum', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-marriott-status', type:'会籍', name:'Marriott Bonvoy Titanium', institution:'Marriott', instance:'Titanium', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-hyatt', type:'会籍', name:'World of Hyatt Globalist', institution:'Hyatt', instance:'Globalist', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-delta-status', type:'会籍', name:'Delta SkyMiles Platinum', institution:'Delta', instance:'Platinum', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},

    {id:'p-rakuten', type:'其他', name:'Rakuten', institution:'Rakuten', instance:'返现平台', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-topcashback', type:'其他', name:'TopCashback', institution:'TopCashback', instance:'返现平台', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-rebatesme', type:'其他', name:'RebatesMe', institution:'RebatesMe', instance:'返现平台', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-gocashback', type:'其他', name:'GoCashBack', institution:'GoCashBack', instance:'返现平台', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-awardwallet', type:'其他', name:'AwardWallet', institution:'AwardWallet', instance:'积分工具', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-pointsyeah', type:'其他', name:'PointsYeah', institution:'PointsYeah', instance:'里程工具', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-cardpointers', type:'其他', name:'CardPointers', institution:'CardPointers', instance:'信用卡工具', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-maxrewards', type:'其他', name:'MaxRewards', institution:'MaxRewards', instance:'信用卡工具', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-bilt-rent', type:'其他', name:'Bilt Rewards', institution:'Bilt', instance:'积分工具', opened:'2024-01-01', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-google-one', type:'其他', name:'Google One', institution:'Google', instance:'订阅', opened:'2024-01-01', annualFee:'—', status:'正常', earning:'—'}
  ];

  const defaultPastProducts = [
    {id:'p-old-amex-gold', type:'信用卡', name:'AMEX Gold', institution:'American Express', instance:'•••• 5510', statusText:'已于 2026 年 9 月 12 日关闭', status:'已关闭', opened:'2023-02-12', annualFee:'$325', earning:'餐饮 / 超市 4x'},
    {id:'p-old-freedom-flex', type:'信用卡', name:'Chase Freedom Flex', institution:'Chase', instance:'•••• 1948', statusText:'已于 2026 年 1 月 5 日关闭', status:'已关闭', opened:'2022-07-09', annualFee:'$0', earning:'季度 5x'},
    {id:'p-old-hilton-gold', type:'会籍', name:'Hilton Gold Status', institution:'Hilton', instance:'Gold', statusText:'已于 2025 年 12 月 31 日关闭', status:'已结束', opened:'2025-01-01', annualFee:'—', earning:'—'}
  ];

  const defaultAttention = [
    {id:'a-bonus-plat', productId:'p-amex-plat-1005', product:'AMEX Platinum •••• 1005', action:'完成开卡奖励', secondary:'6个月消费 $12,000，获得 175,000 MR', time:'截止 9月18日', dueDate:'2026-09-18', type:'bonus', summary:'这笔开卡奖励仍在追踪中。完成全部消费条件后即可结束这条任务。', key:'175,000 MR', keySub:'最晚 9月18日完成', instruction:'完成以下条件', checklist:[{id:'c1',label:'完成 $12,000 合格消费',done:false}], primary:'我已完成', secondaryAction:null, completionKind:'completed'},
    {id:'a-hilton-credit', productId:'p-hilton-aspire-2308', product:'Hilton Aspire •••• 2308', action:'使用 $200 Hilton 酒店报销', secondary:'', time:'本期截止 9月18日', dueDate:'2026-09-18', type:'benefit', summary:'本期 Hilton 酒店报销仍可使用。', key:'$200 Hilton 酒店报销', keySub:'本期可用至 9月18日', instruction:'本期怎么处理', checklist:[], primary:'已使用', secondaryAction:'本期不再提醒', completionKind:'used'},
    {id:'a-csr-fee', productId:'p-csr-2948', product:'Chase Sapphire Reserve •••• 2948', action:'查看即将收取的 $795 年费', secondary:'', time:'年费日 10月2日', dueDate:'2026-10-02', type:'annual', summary:'下一次年费即将收取。现在适合重新确认这张卡是否仍值得长期保留。', key:'$795 年费', keySub:'年费日 10月2日', instruction:'确认你已经看过', checklist:[], primary:'我已查看', secondaryAction:null, completionKind:'viewed'},
    {id:'a-plat-fee', productId:'p-amex-plat-1005', product:'AMEX Platinum •••• 1005', action:'年费即将收取', secondary:'$895 年费', time:'年费日 2027年4月15日', dueDate:'2027-04-15', type:'annual', summary:'下一次年费将在 2027 年 4 月 15 日收取。', key:'$895 年费', keySub:'2027年4月15日', instruction:'确认你已经看过', checklist:[], primary:'我已查看', secondaryAction:null, completionKind:'viewed'},
    {id:'a-rule-change', productId:'p-amex-plat-1005', product:'AMEX Platinum •••• 1005', action:'年费与福利已更新', secondary:'生效日期 2025年9月18日', time:'生效 10月1日', dueDate:'2026-10-01', type:'change', summary:'这张卡的年费与部分福利已经更新。', key:'权益更新', keySub:'10月1日生效', instruction:'确认变化', checklist:[], primary:'知道了', secondaryAction:null, completionKind:'confirmed'},
    {id:'a-usbank', productId:'p-usbank', product:'U.S. Bank Smartly Checking', action:'完成开户奖励条件', secondary:'完成开户与 Direct Deposit 条件', time:'截止 10月12日', dueDate:'2026-10-12', type:'bonus', summary:'这个开户奖励包含多个完成条件。', key:'最高 $450', keySub:'截止 10月12日', instruction:'完成以下条件', checklist:[{id:'u1',label:'账户已成功开立',done:true},{id:'u2',label:'完成符合要求的 Direct Deposit',done:false}], primary:'我已完成', secondaryAction:null, completionKind:'completed'}
  ];

  const defaultHistory = [
    {id:'h-uber', productId:'p-amex-plat-1005', product:'AMEX Platinum •••• 1005', action:'使用本期 Uber Cash', time:'本期截止 Aug 31', dueDate:'2026-08-31', result:'已使用', statusClass:'used', ended:'Sep 01, 2026', correction:'撤销已使用', summary:'8 月 Uber Cash 福利已在当期确认使用。', key:'$15 Uber Cash', keySub:'8 月周期', instruction:'历史记录'},
    {id:'h-bonus-gold', productId:'p-amex-gold-7712', product:'AMEX Gold •••• 7712', action:'完成开卡奖励', time:'截止 Feb 03', dueDate:'2026-02-03', result:'已完成', statusClass:'used', ended:'Jan 21, 2026', correction:'撤销完成', summary:'开卡奖励要求已确认完成。', key:'90,000 MR', keySub:'完成于 Jan 21', instruction:'历史记录'},
    {id:'h-benefit-skip', productId:'p-hilton', product:'Hilton Honors Diamond', action:'使用季度酒店福利', time:'本期截止 Jun 30', dueDate:'2026-06-30', result:'本期已忽略', statusClass:'skipped', ended:'Jun 22, 2026', correction:'恢复本期提醒', summary:'你当时选择本期不再提醒。', key:'季度福利', keySub:'2026 Q2', instruction:'历史记录'},
    {id:'h-expired', productId:'p-csp-2948', product:'Chase Sapphire Preferred •••• 2948', action:'使用年度酒店福利', time:'本期截止 Aug 11', dueDate:'2026-08-11', result:'已到期', statusClass:'expired', ended:'Aug 11, 2026', correction:null, summary:'这项年度福利已经超过当期使用窗口。', key:'$50 酒店福利', keySub:'已到期', instruction:'历史记录'},
    {id:'h-stopped', productId:'p-old-card', product:'AMEX Green •••• 4481', action:'使用 CLEAR 报销', time:'本期截止 Mar 31', dueDate:'2026-03-31', result:'已结束', resultReason:'产品已关闭', statusClass:'stopped', ended:'Mar 01, 2026', correction:null, summary:'产品关闭后，未来周期福利提醒已经停止。', key:'CLEAR 报销', keySub:'产品生命周期结束', instruction:'历史记录'}
  ];

  const catalog = window.NextBonusProductCatalog || {};

  function defaultState(){
    return {
      loggedIn:false,
      route:'discover',
      routeSource:'discover',
      returnTarget:null,
      returnSource:null,
      pendingIntent:null,
      currentOfferId:null,
      currentProductId:null,
      savedOfferIds:['amex-platinum','hsbc-checking','moomoo'],
      unavailableSavedIds:['travel-transfer'],
      offerSearch:'',
      offerCategory:'全部',
      wishlistUnavailableOpen:false,
      productSearch:'',
      pastOpen:false,
      productSectionExpanded:{'其他':false},
      productSorts:{},
      productSortPicker:null,
      pageScroll:{discover:0,wishlist:0,products:0,attention:0},
      expandedAttentionId:null,
      expandedBenefitId:null,
      productHistoryOpen:false,
      attentionTab:'active',
      attentionProductFilter:'all',
      historyStatusFilter:'all',
      historyVisibleCount:20,
      products:structuredClone(defaultProducts),
      pastProducts:structuredClone(defaultPastProducts),
      activeAttention:structuredClone(defaultAttention),
      attentionHistory:structuredClone(defaultHistory),
      assessmentResults:{},
      posterIndex:0,
      modal:null,
      addFlow:null,
      editFlow:null,
      accountMenu:false
    };
  }

  let state = loadState();
  let suppressBrowserHistory=false;
  let lastHistoryKey=null;

  function historySnapshot(){
    return {
      nb:true, route:state.route, routeSource:state.routeSource, currentOfferId:state.currentOfferId, currentProductId:state.currentProductId,
      attentionTab:state.attentionTab, attentionProductFilter:state.attentionProductFilter, historyStatusFilter:state.historyStatusFilter,
      posterIndex:state.posterIndex
    };
  }
  function historyKey(snap){ return JSON.stringify([snap.route,snap.routeSource,snap.currentOfferId,snap.currentProductId]); }
  function syncBrowserHistory(){
    if(typeof history==='undefined'||!history.replaceState) return;
    const snap=historySnapshot(), key=historyKey(snap);
    if(lastHistoryKey===null){ history.replaceState(snap,''); lastHistoryKey=key; return; }
    if(suppressBrowserHistory){ lastHistoryKey=key; return; }
    if(key!==lastHistoryKey){ history.pushState(snap,''); lastHistoryKey=key; }
  }

  function loadState(){
    const base = defaultState();
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return base;
      const saved = JSON.parse(raw);
      return {...base,...saved, modal:null, addFlow:null, editFlow:null, accountMenu:false, expandedAttentionId:null, expandedBenefitId:null};
    }catch(e){ return base; }
  }

  function persist(){
    const copy = {...state, modal:null, addFlow:null, editFlow:null, accountMenu:false, returnTarget:null, returnSource:null, pendingIntent:null};
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(copy)); }catch(e){}
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

  function activePrimaryRoute(){
    if(['discover','offer-detail'].includes(state.route)) return state.routeSource==='wishlist' ? 'wishlist' : 'discover';
    if(state.route==='wishlist') return 'wishlist';
    if(['products','product-detail'].includes(state.route)) return 'products';
    if(state.route==='attention') return 'attention';
    return '';
  }

  function navItem(route,label,icon,badge=''){
    const active = activePrimaryRoute()===route ? 'active' : '';
    return `<button class="nav-item ${active}" data-action="nav" data-route="${route}">
      <span class="nav-icon">${icon}</span><span class="nav-label">${label}</span>${badge ? `<span class="nav-badge">${badge}</span>`:''}
    </button>`;
  }

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

  function render(){
    let content = '';
    switch(state.route){
      case 'discover': content=discoverPage(); break;
      case 'wishlist': content=wishlistPage(); break;
      case 'products': content=productsPage(); break;
      case 'attention': content=attentionPage(); break;
      case 'login': content=loginPage(); break;
      case 'offer-detail': content=offerDetailPage(); break;
      case 'product-detail': content=productDetailPage(); break;
      default: content=discoverPage();
    }
    document.getElementById('app').innerHTML = renderShell(content) + renderModal();
    persist();
    syncBrowserHistory();
  }

  function captureScroll(route=state.route){
    const primary=route==='offer-detail' ? state.routeSource : route==='product-detail' ? 'products' : route;
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
    const protectedRoutes = ['wishlist','products','attention'];
    if(protectedRoutes.includes(route) && !state.loggedIn){
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

  function discoverPage(){
    const q=state.offerSearch.trim().toLowerCase();
    const list=offers.filter(o=> (state.offerCategory==='全部'||o.category===state.offerCategory) && (!q || `${o.name} ${o.provider} ${o.value} ${o.requirement}`.toLowerCase().includes(q)));
    return `<div class="content discover-page">
      <div class="discover-search-row">
        <div class="search-wrap"><span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg></span><input id="offer-search" class="search" value="${esc(state.offerSearch)}" placeholder="搜索信用卡、银行、券商或优惠…" />${state.offerSearch?`<button class="search-clear" data-action="clear-offer-search" aria-label="清除搜索">×</button>`:''}</div>
      </div>
      <div class="filters">${categories.map(c=>`<button class="pill cat-${c} ${state.offerCategory===c?'active':''}" data-action="offer-category" data-category="${c}"><span class="pill-icon">${categoryIcon(c)}</span><span>${c}</span></button>`).join('')}</div>
      ${list.length?`<div class="offer-grid">${list.map(offerCard).join('')}</div>`:`<div class="empty compact-empty"><h3>没有匹配的内容</h3><p>换一个关键词或分类试试。</p></div>`}
    </div>`;
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

  function wishlistPage(){
    if(!state.loggedIn) return loginPage();
    const index=new Map(state.savedOfferIds.map((id,i)=>[id,i]));
    const priority=o=>{
      if(['新奖励'].includes(o.status)) return 1;
      if(['今日截止','即将结束'].includes(o.status)) return 2;
      if(o.status) return 3;
      return 4;
    };
    const active=state.savedOfferIds.map(id=>offers.find(o=>o.id===id)).filter(Boolean).sort((a,b)=>priority(a)-priority(b)||(index.get(b.id)??0)-(index.get(a.id)??0));
    const unavailable=state.unavailableSavedIds.map(id=>offers.find(o=>o.id===id)).filter(Boolean);
    const count=active.length+unavailable.length;
    const empty=count===0;
    return `<div class="content wishlist-page">
      <div class="mock-page-top wishlist-head"><div><h1 class="mock-page-title">收藏</h1><div class="mock-page-subtitle">你收藏、还没决定的 Offer。</div></div><div class="mock-page-count">共 ${count} 个收藏</div></div>
      ${empty?`<div class="empty mock-empty-state"><div class="empty-icon">♡</div><h3>还没有收藏的内容</h3><p>看到感兴趣的优惠时，点一下收藏，就可以稍后回来继续看。</p><button class="mock-add-btn" data-action="nav" data-route="discover">去发现</button></div>`:
      `<div class="offer-grid wishlist-grid">${active.map(offerCard).join('')}</div>
       ${unavailable.length?`<section class="wishlist-unavailable"><button class="past-products-head" data-action="toggle-unavailable"><span>已结束或不可用 <b>${unavailable.length}</b></span><span class="chev ${state.wishlistUnavailableOpen?'up':''}">›</span></button>${state.wishlistUnavailableOpen?`<div class="offer-grid wishlist-grid unavailable-grid">${unavailable.map(o=>offerCard({...o,status:'已结束或不可用'})).join('')}</div>`:''}</section>`:''}`}
    </div>`;
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


  function offerDetailPage(){
    const o=currentOffer();
    const supportsAssessment=!!window.NBStaticAssessmentIntegration?.productMap?.[o.id];
    const isEnded=state.unavailableSavedIds.includes(o.id);
    const r=supportsAssessment?offerResult(o):null;
    const isPlat=o.id==='amex-platinum';
    const posterIndex=((state.posterIndex||0)%2+2)%2;
    const posterSrc=posterIndex===0?'assets/offer-detail/amex-platinum-poster.png':'assets/offer-detail/amex-platinum-poster-2.png';
    const resultHtml=isEnded
      ? `<div class="v4-result-card is-ended"><div class="v4-result-meta">当前状态</div><div class="v4-recommendation ended">当前奖励已结束</div><div class="v4-result-note">这次收藏机会已经结束或当前不可用。旧信息只作为历史参考，不再作为当前申请建议。</div></div>`
      : supportsAssessment
        ? `<div class="v4-result-card ${r.isSample?'is-sample':'is-final'}"><div class="v4-result-meta">${esc(r.meta)}</div><div class="v4-recommendation">${esc(r.recommendation)}</div>${!r.isSample?`<div class="v5-short-summary">${esc(r.shortSummary)}</div>`:''}${r.primaryAlert?`<div class="v5-primary-alert">! ${esc(r.primaryAlert)}</div>`:''}<div class="v4-metric-grid">${metric('开卡奖励评级',r.bonus,r.isSample)}${metric('获批可能性',r.approval,r.isSample)}${metric('能否拿奖励',r.eligible,r.isSample)}${metric('长期持有价值',r.longTerm,r.isSample)}</div>${r.isSample?`<div class="v4-result-note">ⓘ 以上为示例结果，仅供参考。完成评估后将根据你的实际情况生成结果。</div>`:''}</div>`
        : `<div class="v4-result-card assessment-unavailable"><div class="v4-result-meta">当前状态</div><div class="v4-recommendation neutral">暂未提供申请评估</div><div class="v4-result-note">当前没有已冻结的个性化评估流程，因此不显示推测性的评分或结论。</div></div>`;
    const actions=[];
    if(!isEnded && supportsAssessment) actions.push(`<button class="btn primary" data-action="assessment-start">${state.assessmentResults[o.id]?'查看完整分析':'开始申请评估'} <span>→</span></button>`);
    if(!isEnded && o.applyUrl) actions.push(`<button class="btn secondary" data-action="direct-apply">直接申请</button>`);
    return `<div class="content v4-offer-detail-page">
      <div class="v4-offer-detail-grid">
        <section class="v4-offer-poster-shell">
          ${isPlat?`<div class="v4-reference-poster"><img src="${posterSrc}" alt="AMEX Platinum 海报" /><button class="poster-hotspot prev" data-action="poster-step" data-dir="-1" aria-label="上一张海报"></button><button class="poster-hotspot next" data-action="poster-step" data-dir="1" aria-label="下一张海报"></button></div>`:genericPoster(o)}
        </section>
        <aside class="v4-decision-panel">
          <button class="v4-detail-save ${isSaved(o.id)?'saved':''}" data-action="bookmark" data-id="${o.id}">♡ <span>${isSaved(o.id)?'已收藏':'收藏'}</span></button>
          <div class="v4-nb-logo"><img src="assets/offer-detail/nb-logo-ref.png" alt="NextBonus" /></div>
          <h1>NextBonus 申请建议</h1>
          <p class="v4-decision-copy">${supportsAssessment&&!isEnded?'基于你已确认的信息与当前规则，判断这张卡现在是否适合申请。':isEnded?'这次机会已不再作为当前申请建议。':'只有存在已冻结评估规则时，才显示个性化申请结论。'}</p>
          ${resultHtml}
          ${actions.length?`<div class="v4-detail-actions ${actions.length===1?'single':''}">${actions.join('')}</div>`:''}
          ${!isEnded&&supportsAssessment&&state.assessmentResults[o.id]?`<button class="v5-reassess" data-action="assessment-restart">重新评估</button>`:''}
          ${!isEnded&&!actions.length?`<div class="v4-no-action-note">当前暂未提供可执行的申请入口。</div>`:''}
          <div class="v4-security-line">♙ <span>安全、免费、不会影响你的信用评分</span></div>
          <div class="v4-trust-row"><span>▤<b>个性化分析</b><small>结合已确认信息</small></span><span>◉<b>规则拆分</b><small>申请与奖励分开判断</small></span><span>☼<b>固定输出</b><small>同样输入得到同样结果</small></span><span>♢<b>隐私安全</b><small>只保存评估所需的信息</small></span></div>
        </aside>
      </div>
    </div>`;
  }


  function productPageAttentionItem(a){
    const expanded=state.expandedAttentionId===a.id;
    const tone=a.id==='a-bonus-plat'?'urgent':a.id==='a-hilton-credit'?'soon':'normal';
    return `<div class="v4-pp-attention-item"><button class="v4-pp-attention-row" data-action="toggle-attention" data-id="${a.id}" data-history="0"><span class="v4-pp-product">${esc(a.product)}</span><span class="v4-pp-action">${esc(a.action)}</span><span class="v4-pp-time tone-${tone}">${esc(a.time)}</span><span class="v4-pp-chevron">›</span></button>${expanded?attentionExpanded(a,false):''}</div>`;
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
  function productsPage(){
    if(!state.loggedIn) return loginPage();
    const q=state.productSearch.trim().toLowerCase();
    const current=state.products.filter(p=>!q || `${p.name} ${p.institution} ${p.instance}`.toLowerCase().includes(q));
    const grouped=['信用卡','银行和券商账户','会籍','其他'].map(type=>[type,current.filter(p=>p.type===type)]).filter(([,arr])=>arr.length);
    const allActive=activeAttentionSorted();
    const top3=allActive.slice(0,3);
    return `<div class="content products-page v4-products-page">
      <div class="v4-products-head"><div><h1>我的产品</h1><div>${state.products.length} 个产品</div></div><button class="mock-add-btn v4-add-product" data-action="open-add-product">＋ <span>添加产品</span></button></div>
      <div class="product-tools v4-product-search"><div class="search-wrap"><span class="search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg></span><input id="product-search" class="search" value="${esc(state.productSearch)}" placeholder="搜索你的产品、银行、信用卡或账户…" />${state.productSearch?`<button class="search-clear" data-action="clear-product-search">×</button>`:''}</div></div>
      <section class="v4-product-section-card v4-needs-attention"><div class="v4-section-head"><h2>需要关注 <span class="attention-count-dot">${allActive.length}</span></h2><button class="mock-link" data-action="open-all-attention">全部提醒　&gt;</button></div>${top3.length?`<div class="v4-pp-attention-list">${top3.map(productPageAttentionItem).join('')}</div>`:`<div class="attention-zero-state">目前没有需要处理的事项</div>`}</section>
      ${grouped.length?grouped.map(([type,arr])=>productSection(type,arr)).join(''):(state.products.length===0&&!state.productSearch?`<div class="empty section"><h3>还没有添加产品</h3><p>把你正在持有的信用卡、银行账户、券商账户或会籍加入 NextBonus。</p><button class="btn primary" data-action="open-add-product">添加产品</button></div>`:`<div class="empty section"><h3>没有匹配的产品</h3><p>清除搜索词后可恢复全部当前产品。</p></div>`)}
      ${state.pastProducts.length?`<section class="v4-product-section-card v4-past-products"><button class="v4-past-head" data-action="toggle-past"><span>历史产品 <b>${state.pastProducts.length}</b></span><span class="chev ${state.pastOpen?'up':''}">›</span></button>${state.pastOpen?`<div class="v4-past-list">${state.pastProducts.map(p=>`<button class="v4-past-row" data-action="open-product" data-id="${p.id}"><span>${esc(p.name)} ${esc(p.instance||'')}</span><small>${esc(p.statusText||p.status)}</small><b>›</b></button>`).join('')}</div>`:''}</section>`:''}
    </div>`;
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
  function attentionThumb(a){
    const p=attentionProduct(a.productId);
    const asset=window.NextBonusProductArtRegistry?.resolveProduct?.(p)||window.NextBonusProductArtRegistry?.resolveByName?.(a.product);
    const src=asset?.web||asset?.local||'';
    return src?`<img src="${src}" alt="" />`:`<span>${esc(shortBrand(p?.institution||a.product))}</span>`;
  }

  function attentionItem(a, history=false){
    const expanded=state.expandedAttentionId===a.id;
    const tone=a.time.includes('截止')?'due':a.time.includes('生效')?'info':'soft';
    return `<div class="attention-item"><button class="attention-row ${history?'history-row':''}" data-action="toggle-attention" data-id="${a.id}" data-history="${history?'1':'0'}">
      <span class="att-product-cell"><span class="att-thumb">${attentionThumb(a)}</span><span class="att-product-copy"><strong>${esc(a.product)}</strong><small>${esc(attentionProduct(a.productId)?.instance||'')}</small></span></span>
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

  function pdAttentionIcon(a){
    if(a.type==='bonus') return '🎁';
    if(a.type==='annual') return '▣';
    if(a.type==='change') return '$';
    return '•';
  }

  function pdAttentionItem(a){
    const expanded=state.expandedAttentionId===a.id;
    const days=daysUntil(a.dueDate);
    const time=days!==null&&days>=0&&a.type==='bonus'?`剩余 ${days} 天`:a.time;
    return `<div class="v4-pd-attention-item"><button class="v4-pd-attention-row" data-action="toggle-attention" data-id="${a.id}" data-history="0"><span class="v4-pd-att-icon">${pdAttentionIcon(a)}</span><span class="v4-pd-att-copy"><strong>${esc(a.action)}</strong><small>${esc(a.secondary||"")}</small></span><span class="v4-pd-att-time ${days!==null&&days<=7?"urgent":""}">${esc(time)}</span><span class="v4-pd-att-chevron">›</span></button>${expanded?attentionExpanded(a,false):""}</div>`;
  }

  function earningBlock(p){
    const parts=String(p.earning||'—').split('·').map(x=>x.trim()).filter(Boolean).slice(0,3);
    if(!parts.length || parts[0]==='—') return `<div class="v4-pd-earning single"><div><span class="earn-icon blue">•</span><span><b>—</b><small>消费回报</small></span></div></div>`;
    return `<div class="v4-pd-earning ${parts.length===1?'single':''}">${parts.map((x,i)=>`${i?'<i></i>':''}<div><span class="earn-icon ${i===0?'blue':i===1?'purple':'green'}">${i===0?'✦':i===1?'▥':'♧'}</span><span><b>${esc(x)}</b><small>消费回报</small></span></div>`).join('')}</div>`;
  }
  function productTimelineItems(p){
    const items=[];
    if(p.opened) items.push({id:`open-${p.id}`,date:p.opened,copy:p.type==='信用卡'?'开卡':'开户'});
    const history=state.attentionHistory.filter(h=>h.productId===p.id);
    history.forEach(h=>items.push({id:`att-${h.id}`,date:historyDateISO(h.ended)||h.dueDate||'',copy:`${h.action} · ${h.result}${h.resultReason?` · ${h.resultReason}`:''}`,correctable:!!h.correction,historyId:h.id}));
    (p.history||[]).forEach(x=>items.push(x));
    return items.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
  }
  function productDetailPage(){
    if(!state.loggedIn){ openLogin('product-detail',null,'products'); return ''; }
    const p=currentProduct();
    if(state.editFlow && state.editFlow.productId===p.id) return editProductPage(p);
    const related=activeAttentionSorted(currentActiveAttention().filter(a=>a.productId===p.id));
    const top=related.slice(0,3);
    const isPast=state.pastProducts.some(x=>x.id===p.id);
    const detailArt=productCardDisplay(p,true);
    const timeline=productTimelineItems(p);
    return `<div class="content v4-product-detail-page">
      <section class="v4-pd-overview">
        <div class="v4-pd-left"><div class="v4-pd-card ${p.type==='信用卡'?'credit-card-art':''}">${detailArt.primarySrc?`<img src="${detailArt.primarySrc}"${detailArt.fallbackAttr} alt="${esc(p.name)}" />`:`<span class="fallback-brand large">${esc(shortBrand(p.institution))}</span>`}</div>${(p.phone||p.loginUrl)?`<div class="v4-pd-actions">${p.phone?`<button data-action="product-call" data-phone="${esc(p.phone)}">☎ <span>致电</span></button>`:''}${p.phone&&p.loginUrl?'<i></i>':''}${p.loginUrl?`<button data-action="product-login-external" data-url="${esc(p.loginUrl)}">↗ <span>登录</span></button>`:''}</div>`:''}</div>
        <div class="v4-pd-right"><div class="v4-pd-title-row"><div><h1>${esc(p.name)}</h1><div class="v4-pd-status"><span>${esc(p.instance||'')}</span>${p.instance?'<i></i>':''}<b class="${isPast?'past':''}"></b><strong>${isPast?'历史产品':esc(p.status||'不确定')}</strong></div></div>${isPast?'':`<button class="v4-pd-edit" data-action="edit-product">✎　编辑</button>`}</div>
          <div class="v4-pd-facts"><div><span class="fact-icon">▣</span><span><small>${p.type==='信用卡'?'开卡日期':'开户日期'}</small><strong>${p.opened?formatLongDate(p.opened):'未填写'}</strong></span></div>${p.type==='信用卡'?`<div><span class="fact-icon">♙</span><span><small>周年日</small><strong>${esc(p.anniversary||'—')}</strong></span></div><div><span class="fact-icon">$</span><span><small>年费</small><strong>${esc(p.annualFee||'—')}</strong></span></div>`:''}</div>
          ${earningBlock(p)}
        </div>
      </section>
      ${related.length?`<section class="v4-pd-section v4-pd-attention"><div class="v4-section-head"><h2>需要关注 <span class="attention-count-dot">${related.length}</span></h2>${related.length>3?`<button class="mock-link" data-action="attention-for-product" data-id="${p.id}">查看全部 ${related.length}</button>`:''}</div><div class="v4-pd-attention-list">${top.map(pdAttentionItem).join('')}</div></section>`:''}
      <section class="v4-pd-section v4-pd-benefits"><div class="v4-section-head"><h2>福利</h2></div>${benefitsFor(p).length?`<div class="benefit-grid pd-benefit-grid">${benefitsFor(p).map(benefitCard).join('')}</div>`:`<div class="timeline-empty">暂时没有可展示的结构化福利信息</div>`}</section>
      <section class="v4-pd-section v4-pd-history"><button class="v4-past-head" data-action="toggle-product-history"><span>历史记录 <b>${timeline.length}</b></span><span class="chev ${state.productHistoryOpen?'up':''}">›</span></button>${state.productHistoryOpen?timelineFor(p,timeline):''}</section>
    </div>`;
  }

  function fact(label,value){ return `<div><div class="fact-label">${esc(label)}</div><div class="fact-value">${esc(value)}</div></div>`; }
  function benefitsFor(p){
    // Product Detail may only show structured, source-backed benefit facts.
    // When this local data set does not contain those facts, leave the section empty instead of guessing.
    return Array.isArray(p.benefits) ? p.benefits : [];
  }
  function benefitCard(b){
    const expanded=state.expandedBenefitId===b.id;
    return `<div class="benefit-card ${b.detail?'clickable':''}" ${b.detail?`data-action="toggle-benefit" data-id="${b.id}" role="button" tabindex="0"`:''}><div class="benefit-head"><div><div class="benefit-title">${esc(b.title)}</div><div class="benefit-short">${esc(b.short)}</div></div>${b.detail?`<span class="chev ${expanded?'up':''}">›</span>`:''}</div>${expanded?`<div class="benefit-detail"><dl><dt>本期可用至</dt><dd>${esc(b.usable)}</dd><dt>下一期开始</dt><dd>${esc(b.next)}</dd><dt>适用条件</dt><dd>${esc(b.eligibility)}</dd><dt>需要提前登记</dt><dd>${esc(b.enroll)}</dd><dt>最后核验</dt><dd>2026.09.12</dd></dl>${b.officialUrl?`<button class="link-btn" data-action="official-rules" data-url="${esc(b.officialUrl)}" style="margin-top:10px">官方规则 ↗</button>`:''}</div>`:''}</div>`;
  }

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
  function timelineFor(p,items=productTimelineItems(p)){
    if(!items.length) return `<div class="timeline-empty">还没有历史记录</div>`;
    return `<div class="timeline">${items.map(x=>`<div class="timeline-item ${x.correctable||x.targetProductId?'clickable':''}" ${x.correctable?`data-action="history-deeplink" data-product="${p.id}" data-history-id="${x.historyId}"`:x.targetProductId?`data-action="open-product" data-id="${x.targetProductId}"`:''}><div class="timeline-date">${esc(x.date)}</div><div class="timeline-copy">${esc(x.copy)}${x.correctable||x.targetProductId?' ›':''}</div></div>`).join('')}</div>`;
  }

  function attentionPage(){
    if(!state.loggedIn) return loginPage();
    const productOptions=uniqueAttentionProducts();
    const af=state.attentionProductFilter;
    const active=activeAttentionSorted(currentActiveAttention().filter(a=>af==='all'||a.productId===af));
    let hist=state.attentionHistory.filter(a=>af==='all'||a.productId===af);
    if(state.historyStatusFilter!=='all') hist=hist.filter(h=>historyBucket(h)===state.historyStatusFilter);
    hist=hist.sort((a,b)=>String(historyDateISO(b.ended)||b.dueDate||'').localeCompare(String(historyDateISO(a.ended)||a.dueDate||''))||String(b.id).localeCompare(String(a.id)));
    const visible=Math.max(20,state.historyVisibleCount||20), shownHist=hist.slice(0,visible), hasMore=hist.length>shownHist.length;
    return `<div class="content narrow attention-page"><div class="mock-page-top attention-top"><div><h1 class="mock-page-title">全部提醒</h1></div><select class="select mock-filter-select" id="attention-product-filter"><option value="all">全部产品</option>${productOptions.map(p=>`<option value="${p.id}" ${af===p.id?'selected':''}>${esc(p.label)}</option>`).join('')}</select></div>
      <div class="attention-toolbar"><div class="tabs mock-tabs"><button class="tab ${state.attentionTab==='active'?'active':''}" data-action="attention-tab" data-tab="active">待处理 (${active.length})</button><button class="tab ${state.attentionTab==='history'?'active':''}" data-action="attention-tab" data-tab="history">历史记录</button></div>${state.attentionTab==='history'?`<select class="select mock-status-select" id="history-status-filter"><option value="all">全部状态</option><option value="completed" ${state.historyStatusFilter==='completed'?'selected':''}>已完成</option><option value="skipped" ${state.historyStatusFilter==='skipped'?'selected':''}>本期已忽略</option><option value="expired" ${state.historyStatusFilter==='expired'?'selected':''}>已到期</option><option value="stopped" ${state.historyStatusFilter==='stopped'?'selected':''}>已结束</option></select>`:''}</div>
      ${af!=='all'?`<div class="active-filter-chip">已筛选当前产品 <button data-action="clear-attention-filter">清除筛选</button></div>`:''}
      ${state.attentionTab==='active'?`<div class="attention-box all-attention-box">${active.length?active.map(a=>attentionItem(a,false)).join(''):`<div class="attention-compact-empty success-empty"><span class="success-dot">✓</span><div><strong>目前没有需要处理的事项</strong></div></div>`}</div>`:
      `<div class="attention-box all-attention-box history-attention-box">${shownHist.length?shownHist.map(h=>attentionItem(h,true)).join(''):`<div class="attention-compact-empty">还没有历史记录</div>`}</div>${hasMore?`<div class="load-more-wrap"><button class="btn secondary" data-action="history-load-more">加载更多</button></div>`:''}`}
    </div>`;
  }

  function uniqueAttentionProducts(){
    const map=new Map(); [...currentActiveAttention(),...state.attentionHistory].forEach(a=>{ if(!map.has(a.productId)) map.set(a.productId,{id:a.productId,label:a.product}); }); return [...map.values()];
  }
  function historyBucket(h){
    if(h.statusClass==='skipped') return 'skipped'; if(h.statusClass==='expired') return 'expired'; if(h.statusClass==='stopped') return 'stopped'; return 'completed';
  }

  function loginPage(){
    if(state.loggedIn){ state.route=state.returnSource||'discover'; return discoverPage(); }
    return `<div class="content narrow login-page"><div class="login-wrap"><div class="login-card mock-login-card"><div class="login-logo"><span class="nb-mini">NB</span></div><h1>登录 NextBonus</h1><p>继续查看你的收藏、产品和提醒。</p><div class="login-actions"><button class="btn primary login-primary" data-action="login-success">继续登录</button><button class="btn secondary" data-action="login-cancel">返回</button></div><div class="legal">登录后将回到你刚才想去的位置。</div></div></div></div>`;
  }
  function editFlowDirty(f){
    if(!f) return false;
    const p=state.products.find(x=>x.id===f.productId); if(!p) return false;
    const originalInstance=(p.instance||'').replace('•••• ','');
    return f.instance!==originalInstance || f.status!==(p.status||'不确定') || f.opened!==(p.opened||'') || !!f.pendingBonus;
  }
  function editProductPage(p){
    const f=state.editFlow;
    if(f.step==='bonus-select'){
      const prod=(catalog['信用卡']||[]).find(x=>x.offerId===p.offerId) || {name:p.name,offerId:p.offerId};
      const choices=publicOfferChoices(prod);
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回编辑产品</button><div class="page-head"><div><h1 class="page-title">选择你申请时的奖励</h1><p class="page-subtitle">选择与你当时实际申请最匹配的一项。</p></div></div><div class="option-list">${choices.map((x,i)=>`<button class="option-row ${f.bonusChoice===x.id?'selected':''}" data-action="edit-bonus-choice" data-id="${x.id}"><span class="radio-dot"></span><span class="option-main"><span class="option-title">${esc(x.value)}</span><span class="option-sub">${esc(x.req)}</span></span>${i===0?'<span class="option-tag">最常见</span>':''}</button>`).join('')}<button class="option-row ${f.bonusChoice==='manual'?'selected':''}" data-action="edit-bonus-choice" data-id="manual"><span class="radio-dot"></span><span class="option-main"><span class="option-title">手动添加奖励条件</span><span class="option-sub">列表里没有你实际申请时的奖励</span></span></button></div><div class="edit-footer"><button class="btn primary" data-action="edit-bonus-use" ${f.bonusChoice?'':'disabled'}>${f.bonusChoice==='manual'?'继续':'使用这个奖励'}</button></div></div>`;
    }
    if(f.step==='bonus-manual'){
      const valid=f.bonusReward.trim()&&f.bonusTasks.length&&f.bonusTasks.every(t=>t.desc.trim()&&t.due);
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回奖励选择</button><div class="page-head"><div><h1 class="page-title">手动添加奖励条件</h1></div></div><div class="form-group"><label class="label">你会获得什么</label><textarea id="edit-bonus-reward" class="textarea">${esc(f.bonusReward)}</textarea></div><div>${f.bonusTasks.map((t,i)=>`<div class="task-card"><div class="task-head"><span>条件 ${i+1}</span><button class="icon-btn" data-action="edit-delete-task" data-id="${t.id}">×</button></div><input class="input edit-task-desc" data-id="${t.id}" value="${esc(t.desc)}" placeholder="需要完成什么"/><div style="height:8px"></div><div class="date-field-row"><input class="input edit-task-due" type="date" data-id="${t.id}" value="${esc(t.due)}"/>${t.due?`<button class="btn secondary small" data-action="edit-clear-task-due" data-id="${t.id}">清除日期</button>`:''}</div></div>`).join('')}<button class="btn secondary small" data-action="edit-add-task">+ 再添加一个条件</button></div><div class="edit-footer"><button class="btn primary" data-action="edit-bonus-manual-use" ${valid?'':'disabled'}>使用这些条件</button></div></div>`;
    }
    if(f.step==='change-select'){
      const targets=(p.changeTargets||[]).map(id=>(catalog['信用卡']||[]).find(x=>x.id===id)).filter(Boolean);
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回编辑产品</button><div class="page-head"><div><h1 class="page-title">更换产品</h1><p class="page-subtitle">当前产品：${esc(p.name)}</p></div></div>${targets.length?`<div class="option-list">${targets.map(x=>`<button class="option-row" data-action="edit-change-target" data-id="${x.id}"><span class="option-main"><span class="option-title">${esc(x.name)}</span><span class="option-sub">${esc(x.institution)}</span></span><span>›</span></button>`).join('')}</div>`:`<div class="empty"><h3>暂时没有可选择的变更产品</h3><p>这里只有已经明确维护为可变更目标的产品；不会根据名称或同一发卡行猜测。</p></div>`}</div>`;
    }
    if(f.step==='change-confirm'){
      const t=(catalog['信用卡']||[]).find(x=>x.id===f.changeTargetId);
      return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-back">‹ 返回选择产品</button><div class="page-head"><div><h1 class="page-title">确认更换产品</h1></div></div><div class="report"><h3>${esc(p.name)} → ${esc(t?.name||'')}</h3><p>原产品历史会保留；原产品后续新的福利和年费提醒会停止；旧奖励追踪不会迁移到新产品。</p></div><div class="form-group"><label class="label">变更生效日期</label><input id="edit-change-date" class="input" type="date" max="${localDateISO()}" value="${esc(f.changeDate)}"/></div><button class="btn primary" data-action="edit-change-confirm" ${f.changeDate?'':'disabled'}>确认更换产品</button></div>`;
    }
    const tracked=state.activeAttention.some(a=>a.productId===p.id&&a.type==='bonus') || state.attentionHistory.some(h=>h.productId===p.id&&/奖励/.test(h.action));
    return `<div class="content narrow edit-product-page"><button class="detail-back" data-action="edit-exit">‹ 返回产品详情</button><div class="page-head"><div><h1 class="page-title">编辑产品</h1><p class="page-subtitle">${esc(p.name)}</p></div></div><div class="edit-panel"><div class="form-group"><label class="label">卡号后四位 / 账户识别</label><input class="input" id="edit-instance" value="${esc(f.instance)}" /></div><div class="form-group"><label class="label">账户状态</label><select class="select" id="edit-status"><option ${f.status==='正常'?'selected':''}>正常</option><option ${f.status==='已关闭'?'selected':''}>已关闭</option><option ${f.status==='不确定'?'selected':''}>不确定</option></select></div><div class="form-group"><label class="label">${p.type==='信用卡'?'开卡日期':'开户日期'}</label><input type="date" class="input" id="edit-opened" value="${esc(f.opened)}" /></div>${p.type==='信用卡'?`<button class="option-row" data-action="edit-bonus-open"><span class="option-main"><span class="option-title">开卡奖励</span><span class="option-sub">${f.pendingBonus?esc(f.pendingBonus.reward):tracked?'正在追踪 / 已有记录':'未添加'}</span></span><span>›</span></button>`:''}<button class="option-row" style="margin-top:10px" data-action="edit-change-open"><span class="option-main"><span class="option-title">已变更为其他产品</span><span class="option-sub">只显示已确认可变更目标</span></span><span>›</span></button><div class="edit-footer split"><button class="btn danger" data-action="remove-product-request" data-id="${p.id}">从 NextBonus 中移除</button><button class="btn primary" data-action="save-edit-product" data-id="${p.id}">保存</button></div></div></div>`;
  }

  function renderModal(){
    if(!state.modal && !state.addFlow) return '';
    if(state.addFlow) return addProductModal();
    const m=state.modal;
    if(m.type==='apply-risk') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">确认继续申请</div><button class="close-btn" data-action="modal-close">×</button></div><div class="modal-body"><p class="confirm-copy">${esc(m.copy||'你可能无法获得当前开卡奖励。仍要继续申请吗？')}</p><p class="muted">这只是风险确认，不替你强制拦截申请。</p></div><div class="modal-foot"><button class="btn secondary" data-action="modal-close">返回</button><button class="btn primary" data-action="apply-confirm">继续申请</button></div></div></div>`;
    if(m.type==='simple') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">${esc(m.title)}</div><button class="close-btn" data-action="modal-close">×</button></div><div class="modal-body"><p class="confirm-copy">${esc(m.copy)}</p>${m.detail?`<p class="muted">${esc(m.detail)}</p>`:''}</div><div class="modal-foot"><span></span><button class="btn primary" data-action="modal-close">知道了</button></div></div></div>`;
    if(m.type==='remove-product-confirm') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">从 NextBonus 中移除？</div><button class="close-btn" data-action="modal-close">×</button></div><div class="modal-body"><p class="confirm-copy">这只会删除误添加的 NextBonus 产品记录，不代表关闭真实账户。</p></div><div class="modal-foot"><button class="btn secondary" data-action="modal-close">取消</button><button class="btn danger" data-action="remove-product-confirm" data-id="${esc(m.productId)}">确认移除</button></div></div></div>`;
    if(m.type==='discard-edit') return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">放弃修改？</div></div><div class="modal-body"><p class="confirm-copy">尚未保存的修改会丢失。</p></div><div class="modal-foot"><button class="btn secondary" data-action="modal-close">继续编辑</button><button class="btn danger" data-action="edit-discard-confirm">放弃修改</button></div></div></div>`;
    return '';
  }

  function openAddProduct(){
    state.addFlow={step:'category',category:null,product:null,search:'',filter:'全部',moreFilterOpen:false,reportStatus:null,last4:'',nickname:'',opened:'',track:null,offer:null,reward:'',tasks:[{id:'t1',desc:'',due:''}],savedProductId:null,allowDuplicate:false,submitting:false,committed:false};
    render();
  }

  function addProgress(step){
    const order=['category','product','info','track','offer','manual','membership-confirm','success'];
    let i=Math.max(0,order.indexOf(step));
    let stage=step==='category'||step==='product'?1:step==='info'?2:step==='track'||step==='offer'||step==='manual'?3:4;
    return `<div class="add-progress"><span class="${stage>=1?'done':''}">1</span><i></i><span class="${stage>=2?'done':''}">2</span><i></i><span class="${stage>=3?'done':''}">3</span><i></i><span class="${stage>=4?'done':''}">4</span></div><div class="add-progress-labels"><b>选择产品</b><b>账户信息</b><b>奖励追踪</b><b>完成</b></div>`;
  }

  function addFilterOptions(f){
    if(f.category==='信用卡') return ['全部','American Express','Chase'];
    if(f.category==='银行账户') return ['全部','Checking','Savings','CD'];
    if(f.category==='券商账户') return ['全部','美国券商','国际券商'];
    return ['全部','会籍','等级'];
  }
  function itemMatchesAddFilter(x,f){
    if(!f.filter||f.filter==='全部') return true;
    if(f.category==='信用卡') return x.institution===f.filter;
    if(f.category==='银行账户') return (x.accountType||'Checking')===f.filter;
    if(f.category==='券商账户') return (x.market||'美国券商')===f.filter;
    return (x.subtype||'会籍')===f.filter;
  }
  function findPotentialDuplicate(f){
    if(!f?.product) return null;
    if(f.category==='其他') return state.products.find(p=>p.type==='会籍'&&p.institution===f.product.institution)||null;
    return state.products.find(p=>p.offerId&&f.product.offerId&&p.offerId===f.product.offerId || (p.name.replace(/\b(Card|Account)\b/gi,'').trim().toLowerCase()===f.product.name.replace(/\b(Card|Account)\b/gi,'').trim().toLowerCase()))||null;
  }
  function resetAddAfterCategory(f){
    f.product=null; f.last4=''; f.nickname=''; f.opened=''; f.track=null; f.offer=null; f.reward='';
    f.tasks=[{id:'t1',desc:'',due:''}]; f.savedProductId=null; f.allowDuplicate=false; f.submitting=false; f.committed=false;
  }
  function resetAddAfterProduct(f){
    f.last4=''; f.nickname=''; f.opened=''; f.track=null; f.offer=null; f.reward='';
    f.tasks=[{id:'t1',desc:'',due:''}]; f.savedProductId=null; f.allowDuplicate=false; f.submitting=false; f.committed=false;
  }

  function addProductModal(){
    const f=state.addFlow;
    if(f._confirmClose){
      return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">放弃修改？</div></div><div class="modal-body"><p class="confirm-copy">尚未提交的内容不会保存。</p><p class="muted">你可以继续编辑，或放弃本次添加流程并回到“我的产品”。</p></div><div class="modal-foot"><button class="btn secondary" data-action="add-continue-editing">继续编辑</button><button class="btn danger" data-action="add-discard">放弃并退出</button></div></div></div>`;
    }
    let body='', title='添加产品', footer='';
    if(f.step==='category'){
      title='选择产品类别'; body=`<div class="category-grid">${['信用卡','银行账户','券商账户','其他'].map(c=>`<button class="category-tile" data-action="add-category" data-category="${c}"><div class="category-icon">${c==='信用卡'?'▤':c==='银行账户'?'▦':c==='券商账户'?'↗':'◇'}</div><div class="category-title">${c}</div><div class="category-sub">${c==='其他'?'当前支持会籍 / 等级':'从产品库选择并添加到我的产品'}</div></button>`).join('')}</div>`;
    }else if(f.step==='product'){
      title='搜索并选择产品';
      const source=(catalog[f.category]||[]), items=source.filter(x=>(!f.search||`${x.name} ${x.institution}`.toLowerCase().includes(f.search.toLowerCase()))&&itemMatchesAddFilter(x,f));
      const filters=addFilterOptions(f);
      body=`<div class="search-wrap"><span class="search-icon">⌕</span><input id="add-search" class="search" value="${esc(f.search)}" placeholder="搜索当前类别产品…" />${f.search?`<button class="search-clear" data-action="add-clear-search">×</button>`:''}</div><div class="filters">${filters.map(x=>`<button class="pill ${f.filter===x?'active':''}" data-action="add-filter" data-value="${esc(x)}">${esc(x)}</button>`).join('')}${f.category==='信用卡'?`<button class="pill ${!filters.includes(f.filter)?'active':''}" data-action="add-more-filter">更多</button>`:''}</div>${f.moreFilterOpen?`<div class="add-more-filter"><button data-action="add-filter" data-value="Citi">Citi</button><button data-action="add-filter" data-value="Capital One">Capital One</button><button data-action="add-filter" data-value="Bilt">Bilt</button><button data-action="add-more-filter-close">取消</button></div>`:''}<div class="option-list">${items.map(x=>`<button class="option-row" data-action="add-product-select" data-id="${x.id}">${x.cardImageLocal?`<span class="add-card-art"><img src="${x.cardImageLocal}" alt="${esc(x.name)}" /></span>`:`<div class="mini-art ${x.art}"></div>`}<span class="option-main"><span class="option-title">${esc(x.name)}</span><span class="option-sub">${esc(x.institution)}${x.subtype?` · ${esc(x.subtype)}`:''}</span></span><span>›</span></button>`).join('')}</div>${items.length?'':`<div class="empty"><h3>没有找到这个产品</h3><p>可以修改搜索词，或反馈缺少此产品。</p>${f.reportStatus==='submitted'?`<div class="submitted-note">已提交</div>`:`<button class="btn secondary" data-action="add-report-missing" ${f.reportStatus==='loading'?'disabled':''}>${f.reportStatus==='loading'?'提交中…':'反馈缺少此产品'}</button>`}</div>`}`;
      footer=backOnly();
    }else if(f.step==='info'){
      title='填写最少账户信息';
      const isCard=f.category==='信用卡', duplicate=findPotentialDuplicate(f);
      body=`${isCard?`<div class="form-group"><label class="label">卡号后四位 <span class="muted">（可选）</span></label><input id="add-last4" class="input" maxlength="4" inputmode="numeric" value="${esc(f.last4)}" placeholder="例如 1005" /></div>`:`<div class="form-group"><label class="label">账户昵称 <span class="muted">（可选）</span></label><input id="add-nickname" class="input" value="${esc(f.nickname)}" placeholder="例如 主账户" /></div>`}<div class="form-group"><label class="label">${isCard?'开卡日期':'开户日期'} <span class="muted">（可选）</span></label><div class="date-field-row"><input id="add-opened" type="date" max="${localDateISO()}" class="input" value="${esc(f.opened)}" />${f.opened?`<button class="btn secondary small" data-action="add-clear-opened">清除日期</button>`:''}</div></div><p class="hint">只收当前添加流程真正需要的最少信息，之后可以再编辑。</p>${duplicate&&!f.allowDuplicate?`<div class="duplicate-warning"><strong>你可能已经添加过这个产品</strong><p>${esc(duplicate.name)} ${esc(duplicate.instance||'')}</p><div class="actions two"><button class="btn secondary" data-action="add-view-existing" data-id="${duplicate.id}">查看已添加的产品</button><button class="btn primary" data-action="add-override-duplicate">仍然添加一个</button></div></div>`:''}`;
      footer=backNext('add-to-track','继续',!!duplicate&&!f.allowDuplicate);
    }else if(f.step==='track'){
      title=f.category==='信用卡'?'是否追踪开卡奖励':'是否追踪开户奖励';
      body=`<div class="option-list"><button class="option-row ${f.track===true?'selected':''}" data-action="add-track-choice" data-value="yes"><span class="radio-dot"></span><span class="option-main"><span class="option-title">是，追踪${f.category==='信用卡'?'开卡':'开户'}奖励</span><span class="option-sub">下一步选择你申请 / 开户时对应的奖励</span></span></button><button class="option-row ${f.track===false?'selected':''}" data-action="add-track-choice" data-value="no"><span class="radio-dot"></span><span class="option-main"><span class="option-title">否，只添加${f.category==='信用卡'?'这张卡':'账户'}</span><span class="option-sub">以后仍可从产品详情补开奖励追踪</span></span></button></div>`;
      footer=backNext('add-track-next',f.submitting?'保存中…':'继续',f.track===null||f.submitting);
    }else if(f.step==='offer'){
      title='选择你申请时的奖励'; const olist=publicOfferChoices(f.product);
      body=`<div class="option-list">${olist.map((x,i)=>`<button class="option-row ${f.offer===x.id?'selected':''}" data-action="add-offer-choice" data-id="${x.id}"><span class="radio-dot"></span><span class="option-main"><span class="option-title">${esc(x.value)}</span><span class="option-sub">${esc(x.req)}</span></span>${i===0?`<span class="option-tag">最常见</span>`:''}</button>`).join('')}<button class="option-row ${f.offer==='manual'?'selected':''}" data-action="add-offer-choice" data-id="manual"><span class="radio-dot"></span><span class="option-main"><span class="option-title">手动添加奖励条件</span><span class="option-sub">列表里没有你实际申请时的奖励</span></span></button></div>`;
      footer=backNext('add-offer-next',f.submitting?'保存中…':'继续',!f.offer||f.submitting);
    }else if(f.step==='manual'){
      title='手动添加奖励条件';
      body=`<div class="form-group"><label class="label">你会获得什么</label><textarea id="add-reward" class="textarea" placeholder="例如 $300 现金奖励 + 2 张房券">${esc(f.reward)}</textarea></div><div><label class="label">需要完成什么</label>${f.tasks.map((t,i)=>`<div class="task-card"><div class="task-head"><span>条件 ${i+1}</span><button class="icon-btn" data-action="delete-task" data-id="${t.id}" aria-label="删除条件">×</button></div><input class="input task-desc" data-id="${t.id}" value="${esc(t.desc)}" placeholder="例如 消费 $12,000" /><div style="height:8px"></div><div class="date-field-row"><input type="date" class="input task-due" data-id="${t.id}" value="${esc(t.due)}" />${t.due?`<button class="btn secondary small" data-action="clear-task-due" data-id="${t.id}">清除日期</button>`:''}</div></div>`).join('')}<button class="btn secondary small" data-action="add-task">+ 再添加一个条件</button></div>`;
      const valid=f.reward.trim() && f.tasks.length && f.tasks.every(t=>t.desc.trim()&&t.due); footer=backNext('add-manual-submit',f.submitting?'保存中…':'继续',!valid||f.submitting);
    }else if(f.step==='membership-confirm'){
      const existing=findPotentialDuplicate(f), same=existing&&existing.name===f.product.name, targetLevel=f.product.name.replace(/^.*Honors\s+/,'').replace(/\s+Status$/,'').replace(/^.*Hyatt\s+/,'');
      title='确认添加'; body=`<div class="report"><h3>${esc(f.product.name)}</h3><p>${esc(f.product.institution)} · ${esc(f.product.subtype||'会籍')}</p></div><p class="muted">这里只记录你当前持有的会籍 / 等级，不会自动创建奖励追踪或提醒。</p>${existing?`<div class="duplicate-warning"><strong>这个会籍计划已经在“我的产品”中</strong><p>${esc(existing.name)}</p><div class="actions two"><button class="btn secondary" data-action="add-view-existing" data-id="${existing.id}">查看已有等级</button>${same?'':`<button class="btn primary" data-action="add-membership-update" data-id="${existing.id}">更新为 ${esc(targetLevel)}</button>`}</div></div>`:''}`;
      footer=existing?'':backNext('add-membership-submit',f.submitting?'保存中…':(f.product.subtype==='等级'?'添加此等级':'添加此会员'),f.submitting);
    }else if(f.step==='success'){
      title='添加成功'; body=`<div class="success"><div class="success-icon">✓</div><h2>产品已加入 NextBonus</h2><p>产品和本次需要的追踪状态已经一起保存。</p><div class="actions two"><button class="btn primary" data-action="add-view-product">查看产品详情</button><button class="btn secondary" data-action="add-another">再添加一个产品</button></div></div>`;
    }
    return `<div class="modal-backdrop add-product-backdrop"><div class="modal large add-product-modal"><div class="modal-head"><div><div class="modal-kicker">添加产品</div><div class="modal-title">${esc(title)}</div></div><button class="close-btn" data-action="add-close">×</button></div><div class="add-progress-wrap">${addProgress(f.step)}</div><div class="modal-body">${body}</div>${footer?`<div class="modal-foot">${footer}</div>`:''}</div></div>`;
  }

  function backOnly(){ return `<button class="btn secondary" data-action="add-back">返回</button><span></span>`; }
  function backNext(action,label,disabled=false){ return `<button class="btn secondary" data-action="add-back">返回</button><button class="btn primary" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`; }
  function publicOfferChoices(prod){
    const source=prod?.offerId||null;
    const offer=source?window.NextBonusOfferData?.[source]:null;
    if(!offer) return [];
    return [{id:`current-${source}`,value:offer.primaryValue,req:offer.primaryRequirement,sourceOfferId:source}];
  }

  function submitAddedProduct(){
    const f=state.addFlow; if(!f||f.submitting||f.committed) return;
    f.submitting=true;
    const now=Date.now(), type=f.category==='信用卡'?'信用卡':f.category==='其他'?'会籍':'银行和券商账户';
    const p={id:`p-local-${now}`,offerId:f.product.offerId||null,type,name:f.product.name,institution:f.product.institution,instance:f.category==='信用卡'?(f.last4?`•••• ${f.last4}`:'账户 1'):(f.nickname||f.product.subtype||'主账户'),art:f.product.art||'bank',cardImageLocal:f.product.cardImageLocal||null,opened:f.opened||'',anniversary:f.opened?formatAnniversary(f.opened):'—',annualFee:f.category==='信用卡'?(f.product.annualFee||'以产品规则为准'):'—',status:'正常',earning:f.product.earning||'—',addedAt:now};
    state.products.push(p); f.savedProductId=p.id;
    state.productSearch='';
    state.productSectionExpanded=state.productSectionExpanded||{};
    if(state.products.filter(x=>x.type===type).length>=8) state.productSectionExpanded[type]=true;
    if(f.track){
      const chosen=f.offer==='manual'?null:publicOfferChoices(f.product).find(x=>x.id===f.offer);
      const reward=f.offer==='manual'?f.reward:(chosen?.value||'开户 / 开卡奖励');
      const due=f.offer==='manual'?f.tasks[0]?.due:'';
      const a={id:`a-local-${now}`,productId:p.id,product:`${p.name} ${p.instance}`,action:f.category==='信用卡'?'完成开卡奖励':'完成开户奖励条件',secondary:reward,time:due?`截止 ${shortDate(due)}`:'截止日期以所选奖励规则为准',dueDate:due||null,type:'bonus',summary:'这是你在添加产品时建立的奖励追踪。逐项完成条件即可。',key:reward,keySub:due?`最晚 ${shortDate(due)} 完成`:'按所选奖励规则',instruction:'完成以下条件',checklist:f.offer==='manual'?f.tasks.map(t=>({id:t.id,label:t.desc,done:false,dueDate:t.due})):[{id:'req1',label:'完成对应奖励条件',done:false}],primary:'我已完成',secondaryAction:null,completionKind:'completed'};
      state.activeAttention.push(a);
      if(chosen?.sourceOfferId && isSaved(chosen.sourceOfferId)) removeSaved(chosen.sourceOfferId);
    }
    f.committed=true; f.submitting=false; f.step='success';
  }

  function formatAnniversary(date){ try{ const d=new Date(date+'T00:00:00'); return `${d.getMonth()+1} 月 ${d.getDate()} 日`; }catch(e){return '—';} }
  function shortDate(date){ try{ const d=new Date(date+'T00:00:00'); return `${d.getMonth()+1}/${d.getDate()}`;}catch(e){return date;} }

  function goAddBack(){
    const f=state.addFlow;
    const map={product:'category',info:'product',track:'info',offer:'track',manual:'offer','membership-confirm':'product'};
    if(map[f.step]) f.step=map[f.step]; else if(f.step==='category'){ state.addFlow=null; }
    render();
  }

  function closeAdd(){
    const f=state.addFlow;
    const dirty=f && (f.last4||f.nickname||f.opened||f.offer||f.reward||f.tasks?.some(t=>t.desc||t.due));
    if(dirty && f.step!=='success'){
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
    const history={id:`h-${a.id}-${Date.now()}`,productId:a.productId,product:a.product,action:a.action,time:a.time,result,statusClass,ended:historyDateLabel(),correction,summary:a.summary,key:a.key,keySub:a.keySub,instruction:a.instruction,source:a};
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
    if(action==='poster'){ state.posterIndex=Number(el.dataset.index); render(); return; }
    if(action==='poster-step'){ state.posterIndex=((state.posterIndex||0)+Number(el.dataset.dir)+2)%2; render(); return; }
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
    if(action==='toggle-benefit'){ state.expandedBenefitId=state.expandedBenefitId===el.dataset.id?null:el.dataset.id;render();return; }
    if(action==='toggle-product-history'){ state.productHistoryOpen=!state.productHistoryOpen;render();return; }
    if(action==='history-deeplink'){ state.attentionProductFilter=el.dataset.product;state.attentionTab='history';state.historyStatusFilter='all';state.historyVisibleCount=20;state.route='attention'; const candidate=state.attentionHistory.find(h=>h.id===el.dataset.historyId);state.expandedAttentionId=candidate?.id||null;render();window.scrollTo(0,0);return; }
    if(action==='edit-product'){ const p=currentProduct(); state.editFlow={productId:p.id,step:'main',instance:(p.instance||'').replace('•••• ',''),status:p.status||'不确定',opened:p.opened||'',pendingBonus:null,bonusChoice:null,bonusReward:'',bonusTasks:[{id:'e1',desc:'',due:''}],changeTargetId:null,changeDate:''};render();return; }
    if(action==='edit-exit'){ if(editFlowDirty(state.editFlow)){state.modal={type:'discard-edit'};render();}else{state.editFlow=null;render();}return; }
    if(action==='edit-discard-confirm'){ state.modal=null;state.editFlow=null;render();return; }
    if(action==='edit-back'){ const f=state.editFlow;if(!f)return; f.step=f.step==='bonus-manual'?'bonus-select':f.step==='change-confirm'?'change-select':'main';render();return; }
    if(action==='edit-bonus-open'){ state.editFlow.step='bonus-select';render();return; }
    if(action==='edit-bonus-choice'){ state.editFlow.bonusChoice=el.dataset.id;render();return; }
    if(action==='edit-bonus-use'){ const f=state.editFlow;if(f.bonusChoice==='manual'){f.step='bonus-manual';render();return;} const p=state.products.find(x=>x.id===f.productId);const prod=(catalog['信用卡']||[]).find(x=>x.offerId===p?.offerId)||{name:p?.name,offerId:p?.offerId};const c=publicOfferChoices(prod).find(x=>x.id===f.bonusChoice);if(c){f.pendingBonus={kind:'public',reward:c.value,req:c.req,sourceOfferId:c.sourceOfferId||null};f.step='main';render();}return; }
    if(action==='edit-add-task'){ state.editFlow.bonusTasks.push({id:`e${Date.now()}`,desc:'',due:''});render();return; }
    if(action==='edit-delete-task'){ state.editFlow.bonusTasks=state.editFlow.bonusTasks.filter(t=>t.id!==el.dataset.id);render();return; }
    if(action==='edit-clear-task-due'){ const t=state.editFlow?.bonusTasks.find(x=>x.id===el.dataset.id);if(t)t.due='';render();return; }
    if(action==='edit-bonus-manual-use'){ const f=state.editFlow;if(f.bonusReward.trim()&&f.bonusTasks.length&&f.bonusTasks.every(t=>t.desc.trim()&&t.due)){f.pendingBonus={kind:'manual',reward:f.bonusReward,tasks:structuredClone(f.bonusTasks),sourceOfferId:null};f.step='main';render();}return; }
    if(action==='edit-change-open'){ state.editFlow.step='change-select';render();return; }
    if(action==='edit-change-target'){ state.editFlow.changeTargetId=el.dataset.id;state.editFlow.step='change-confirm';render();return; }
    if(action==='edit-change-confirm'){
      const f=state.editFlow,p=state.products.find(x=>x.id===f.productId),t=(catalog['信用卡']||[]).find(x=>x.id===f.changeTargetId); if(!p||!t||!f.changeDate)return;
      const now=Date.now(), newId=`p-change-${now}`;
      const ending=state.activeAttention.filter(a=>a.productId===p.id);
      ending.forEach((a,i)=>state.attentionHistory.unshift({id:`h-stopped-${a.id}-${now}-${i}`,productId:p.id,product:a.product,action:a.action,time:a.time,dueDate:a.dueDate||null,result:'已结束',resultReason:'已更换产品',statusClass:'stopped',ended:formatLongDate(f.changeDate),correction:null,summary:a.summary,key:a.key,keySub:a.keySub,instruction:a.instruction,source:a}));
      state.activeAttention=state.activeAttention.filter(a=>a.productId!==p.id);
      const old={...p,status:'已更换产品',statusText:`已于 ${formatLongDate(f.changeDate)} 更换产品`,history:[...(p.history||[]),{date:f.changeDate,copy:`已更换为 ${t.name}`,targetProductId:newId}]};
      state.products=state.products.filter(x=>x.id!==p.id); state.pastProducts.unshift(old);
      const np={id:newId,offerId:t.offerId||null,type:'信用卡',name:t.name,institution:t.institution,instance:p.instance,cardImageLocal:t.cardImageLocal||null,opened:f.changeDate,anniversary:formatAnniversary(f.changeDate),annualFee:t.annualFee||'—',status:'正常',earning:t.earning||'—',addedAt:now,history:[{date:f.changeDate,copy:`由 ${p.name} 更换而来`,targetProductId:p.id}]};
      state.products.push(np); state.currentProductId=np.id; state.productSearch=''; state.editFlow=null; render(); toast('产品已更换'); return;
    }
    if(action==='save-edit-product'){ const f=state.editFlow,p=state.products.find(x=>x.id===el.dataset.id); if(!f||!p)return; const ins=document.getElementById('edit-instance')?.value??f.instance; const status=document.getElementById('edit-status')?.value??f.status; const opened=document.getElementById('edit-opened')?.value??f.opened; p.instance=p.type==='信用卡'?(ins?`•••• ${ins}`:p.instance):(ins||p.instance);p.status=status;p.opened=opened;p.anniversary=opened?formatAnniversary(opened):'—'; if(f.pendingBonus&&!state.activeAttention.some(a=>a.productId===p.id&&a.type==='bonus')){ const now=Date.now(),due=f.pendingBonus.kind==='manual'?f.pendingBonus.tasks[0]?.due:null; state.activeAttention.push({id:`a-edit-${now}`,productId:p.id,product:`${p.name} ${p.instance}`,action:'完成开卡奖励',secondary:f.pendingBonus.reward,time:due?`截止 ${shortDate(due)}`:'截止日期以所选奖励规则为准',dueDate:due,type:'bonus',summary:'这是你在编辑产品时补充建立的开卡奖励追踪。',key:f.pendingBonus.reward,keySub:due?`最晚 ${shortDate(due)} 完成`:'按所选奖励规则',instruction:'完成以下条件',checklist:f.pendingBonus.kind==='manual'?f.pendingBonus.tasks.map(t=>({id:t.id,label:t.desc,done:false,dueDate:t.due})):[{id:'req1',label:f.pendingBonus.req||'完成对应奖励条件',done:false}],primary:'我已完成',secondaryAction:null,completionKind:'completed'}); if(f.pendingBonus.sourceOfferId&&isSaved(f.pendingBonus.sourceOfferId))removeSaved(f.pendingBonus.sourceOfferId); } if(status==='已关闭'){ state.products=state.products.filter(x=>x.id!==p.id);p.statusText=`已于 ${formatLongDate(localDateISO())}关闭`;state.pastProducts.unshift(p);const stopped=state.activeAttention.filter(a=>a.productId===p.id);state.activeAttention=state.activeAttention.filter(a=>a.productId!==p.id);stopped.forEach(a=>state.attentionHistory.unshift({id:`h-stop-${a.id}-${Date.now()}`,productId:p.id,product:a.product,action:a.action,time:a.time,dueDate:a.dueDate,result:'已结束',resultReason:'产品已关闭',statusClass:'stopped',ended:historyDateLabel(),correction:null,summary:a.summary,key:a.key,keySub:a.keySub,instruction:a.instruction,source:a}));state.currentProductId=p.id;} state.editFlow=null;render();toast('已保存');return; }
    if(action==='remove-product-request'){ state.modal={type:'remove-product-confirm',productId:el.dataset.id};render();return; }
    if(action==='remove-product-confirm'){ const id=el.dataset.id; state.products=state.products.filter(p=>p.id!==id);state.activeAttention=state.activeAttention.filter(a=>a.productId!==id);state.modal=null;state.editFlow=null;state.route='products';render();toast('已从 NextBonus 中移除');return; }
    if(action==='product-call'){ const phone=el.dataset.phone;if(phone)navigator.clipboard?.writeText(phone);toast(phone?`客服电话 ${phone} 已复制`:'');return; }
    if(action==='product-login-external'){ if(el.dataset.url)window.open(el.dataset.url,'_blank','noopener,noreferrer');return; }
    if(action==='official-rules'){ e.stopPropagation();if(el.dataset.url)window.open(el.dataset.url,'_blank','noopener,noreferrer');return; }

    // Add Product actions
    if(action==='add-close'){ closeAdd();return; }
    if(action==='add-continue-editing'){ state.addFlow._confirmClose=false;render();return; }
    if(action==='add-discard'){ state.addFlow=null;state.modal=null;render();return; }
    if(action==='add-back'){ goAddBack();return; }
    if(action==='add-category'){ const f=state.addFlow; const next=el.dataset.category; if(f.category!==next) resetAddAfterCategory(f); f.category=next; f.step='product';f.search='';f.filter='全部';f.moreFilterOpen=false;f.reportStatus=null;render();return; }
    if(action==='add-filter'){ state.addFlow.filter=el.dataset.value;state.addFlow.moreFilterOpen=false;render();return; }
    if(action==='add-more-filter'){ state.addFlow.moreFilterOpen=!state.addFlow.moreFilterOpen;render();return; }
    if(action==='add-more-filter-close'){ state.addFlow.moreFilterOpen=false;render();return; }
    if(action==='add-clear-search'){ state.addFlow.search='';state.addFlow.reportStatus=null;render();return; }
    if(action==='add-report-missing'){ state.addFlow.reportStatus='loading';render();setTimeout(()=>{if(state.addFlow){state.addFlow.reportStatus='submitted';render();}},150);return; }
    if(action==='add-product-select'){ const f=state.addFlow; const next=(catalog[f.category]||[]).find(x=>x.id===el.dataset.id); if(f.product?.id!==next?.id) resetAddAfterProduct(f); f.product=next; f.allowDuplicate=false; if(f.category==='其他') f.step='membership-confirm'; else f.step='info';render();return; }
    if(action==='add-view-existing'){ const id=el.dataset.id;state.addFlow=null;state.currentProductId=id;state.route='product-detail';render();window.scrollTo(0,0);return; }
    if(action==='add-override-duplicate'){ state.addFlow.allowDuplicate=true;render();return; }
    if(action==='add-clear-opened'){ state.addFlow.opened='';render();return; }
    if(action==='add-to-track'){ state.addFlow.step='track';render();return; }
    if(action==='add-track-choice'){ state.addFlow.track=el.dataset.value==='yes';render();return; }
    if(action==='add-track-next'){ const f=state.addFlow;if(f.track===true){f.step='offer';}else if(f.track===false){submitAddedProduct();}render();return; }
    if(action==='add-offer-choice'){ state.addFlow.offer=el.dataset.id;render();return; }
    if(action==='add-offer-next'){ const f=state.addFlow;if(f.offer==='manual'){f.step='manual';}else{f.track=true;submitAddedProduct();}render();return; }
    if(action==='add-task'){ state.addFlow.tasks.push({id:`t${Date.now()}`,desc:'',due:''});render();return; }
    if(action==='clear-task-due'){ const t=state.addFlow.tasks.find(x=>x.id===el.dataset.id);if(t)t.due='';render();return; }
    if(action==='delete-task'){ state.addFlow.tasks=state.addFlow.tasks.filter(t=>t.id!==el.dataset.id);render();return; }
    if(action==='add-manual-submit'){ state.addFlow.track=true;state.addFlow.offer='manual';submitAddedProduct();render();return; }
    if(action==='add-membership-submit'){ submitAddedProduct();render();return; }
    if(action==='add-membership-update'){ const f=state.addFlow,p=state.products.find(x=>x.id===el.dataset.id);if(p&&f?.product){p.name=f.product.name;p.instance=f.product.name.replace(/^.*Honors\s+/,'').replace(/\s+Status$/,'').replace(/^.*Hyatt\s+/,'');p.addedAt=Date.now();state.productSearch='';f.savedProductId=p.id;f.committed=true;f.step='success';render();}return; }
    if(action==='add-view-product'){ state.currentProductId=state.addFlow.savedProductId;state.addFlow=null;state.route='product-detail';render();return; }
    if(action==='add-another'){ state.addFlow={step:'category',category:null,product:null,search:'',filter:'全部',moreFilterOpen:false,reportStatus:null,last4:'',nickname:'',opened:'',track:null,offer:null,reward:'',tasks:[{id:'t1',desc:'',due:''}],savedProductId:null,allowDuplicate:false,submitting:false,committed:false};render();return; }
  });

  document.addEventListener('input', e => {
    if(e.target.id==='offer-search'){ state.offerSearch=e.target.value; render(); focusEnd('offer-search'); }
    if(e.target.id==='product-search'){ state.productSearch=e.target.value; render(); focusEnd('product-search'); }
    if(e.target.id==='add-search' && state.addFlow){ state.addFlow.search=e.target.value; render(); focusEnd('add-search'); }
    if(e.target.id==='add-last4' && state.addFlow){ state.addFlow.last4=e.target.value.replace(/\D/g,'').slice(0,4); }
    if(e.target.id==='add-nickname' && state.addFlow){ state.addFlow.nickname=e.target.value; }
    if(e.target.id==='add-opened' && state.addFlow){ state.addFlow.opened=e.target.value; }
    if(e.target.id==='add-reward' && state.addFlow){ state.addFlow.reward=e.target.value; updateManualSubmit(); }
    if(e.target.id==='edit-instance' && state.editFlow){ state.editFlow.instance=e.target.value; }
    if(e.target.id==='edit-opened' && state.editFlow){ state.editFlow.opened=e.target.value; }
    if(e.target.id==='edit-bonus-reward' && state.editFlow){ state.editFlow.bonusReward=e.target.value; updateEditManualSubmit(); }
    if(e.target.classList.contains('edit-task-desc') && state.editFlow){ const t=state.editFlow.bonusTasks.find(x=>x.id===e.target.dataset.id);if(t)t.desc=e.target.value; updateEditManualSubmit(); }
    if(e.target.classList.contains('edit-task-due') && state.editFlow){ const t=state.editFlow.bonusTasks.find(x=>x.id===e.target.dataset.id);if(t)t.due=e.target.value; updateEditManualSubmit(); }
    if(e.target.id==='edit-change-date' && state.editFlow){ state.editFlow.changeDate=e.target.value; render(); return; }
    if(e.target.classList.contains('task-desc') && state.addFlow){ const t=state.addFlow.tasks.find(t=>t.id===e.target.dataset.id); if(t)t.desc=e.target.value; updateManualSubmit(); }
    if(e.target.classList.contains('task-due') && state.addFlow){ const t=state.addFlow.tasks.find(t=>t.id===e.target.dataset.id); if(t)t.due=e.target.value; updateManualSubmit(); }
  });

  document.addEventListener('change', e => {
    if(e.target.id==='attention-product-filter'){ state.attentionProductFilter=e.target.value;state.expandedAttentionId=null;state.historyVisibleCount=20;render(); }
    if(e.target.id==='history-status-filter'){ state.historyStatusFilter=e.target.value;state.expandedAttentionId=null;state.historyVisibleCount=20;render(); }
    if(e.target.id==='edit-status' && state.editFlow){ state.editFlow.status=e.target.value; }
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

  function updateEditManualSubmit(){
    if(!state.editFlow) return;
    const valid=state.editFlow.bonusReward.trim() && state.editFlow.bonusTasks.length && state.editFlow.bonusTasks.every(t=>t.desc.trim()&&t.due);
    const btn=document.querySelector('[data-action="edit-bonus-manual-use"]');
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
