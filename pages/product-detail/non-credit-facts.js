(() => {
  'use strict';

  const STORAGE_KEY='nextbonus-local-v8-state';
  let accountFactsCache=null;
  let membershipFactsCache=null;

  const normalize=value=>String(value||'')
    .toLowerCase()
    .replace(/[®™℠]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim()
    .replace(/\s+/g,' ');

  function readState(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}
    catch(_err){return {};}
  }

  function allProducts(state){
    return [
      ...(Array.isArray(state.products)?state.products:[]),
      ...(Array.isArray(state.pastProducts)?state.pastProducts:[])
    ];
  }

  async function loadJson(path){
    const response=await fetch(path,{cache:'no-store'});
    return response.json();
  }

  async function loadAccountFacts(){
    if(!accountFactsCache) accountFactsCache=await loadJson('./account-product-facts.json');
    return accountFactsCache;
  }

  async function loadMembershipFacts(){
    if(!membershipFactsCache) membershipFactsCache=await loadJson('./membership-other-product-facts.json');
    return membershipFactsCache;
  }

  function resolveFact(data,product){
    for(const [key,fact] of Object.entries(data.products||{})){
      if((fact.productIds||[]).includes(product.id)) return [key,fact];
      if((fact.names||[]).map(normalize).includes(normalize(product.name))) return [key,fact];
    }
    return null;
  }

  function logoFor(product){
    const registry=window.NextBonusProductLogoRegistry;
    const registered=registry?.resolve?.(product.id||'',product.offerId||'',product.name||'')||'';
    if(registered) return registered;
    const byInstitution={
      'U.S. Bank':'assets/product-logos/usbank.png',
      'Truist':'assets/product-logos/truist.png',
      'Chase':'assets/product-logos/chase.png',
      'Wells Fargo':'assets/product-logos/wells-fargo.png',
      'Fidelity':'assets/product-logos/fidelity.png',
      'Robinhood':'assets/product-logos/robinhood.png',
      'HSBC':'assets/product-logos/hsbc.svg',
      'Moomoo':'assets/product-logos/moomoo.svg',
      'Hilton':'assets/product-logos/hilton.png',
      'IHG':'assets/product-logos/ihg.png',
      'Marriott':'assets/product-logos/marriott.png',
      'Hyatt':'assets/product-logos/hyatt.png',
      'Delta':'assets/product-logos/delta.png'
    };
    return byInstitution[product.institution]||'';
  }

  function makeHeading(title){
    const head=document.createElement('div');
    head.className='v4-section-head';
    const heading=document.createElement('h2');
    heading.textContent=title;
    head.appendChild(heading);
    return head;
  }

  function buildRows(title,rows){
    if(!rows?.length) return null;
    const section=document.createElement('section');
    section.className='v4-pd-section nb-account-section';
    section.appendChild(makeHeading(title));
    const grid=document.createElement('div');
    grid.className='nb-account-grid';
    rows.forEach(row=>{
      const item=document.createElement('div');
      item.className='nb-account-row';
      const label=document.createElement('strong');
      label.textContent=row[0];
      const value=document.createElement('span');
      value.textContent=row[1];
      item.append(label,value);
      grid.appendChild(item);
    });
    section.appendChild(grid);
    return section;
  }

  function addNotice(page,anchor,text,extraClass=''){
    if(!text) return;
    const notice=document.createElement('section');
    notice.className='v4-pd-section nb-account-notice'+(extraClass?` ${extraClass}`:'');
    notice.appendChild(makeHeading('资料说明'));
    const copy=document.createElement('p');
    copy.textContent=text;
    notice.appendChild(copy);
    page.insertBefore(notice,anchor);
  }

  function addSource(page,anchor,fact){
    const source=document.createElement('div');
    source.className='nb-account-source';
    source.append('资料：');
    const link=document.createElement('a');
    link.href=fact.sourceUrl;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.textContent='美卡101';
    source.appendChild(link);
    if(fact.sourceDate) source.append(` · ${fact.sourceDate}`);
    page.insertBefore(source,anchor);
  }

  function titlesFor(fact){
    if(fact.kind==='brokerage') return ['账户费用与收益','账户功能'];
    if(fact.kind==='membership') return ['会籍信息','核心权益'];
    if(fact.kind==='cashback') return ['平台信息','核心功能'];
    if(fact.kind==='tool') return ['版本与费用','核心功能'];
    return ['账户信息','账户功能与权益'];
  }

  function dateLabelFor(product){
    if(product.type==='会籍') return '获得日期';
    if(product.type==='其他') return '开始使用日期';
    return '开户日期';
  }

  function isPrototypeDate(product){
    if(!product||String(product.id||'').startsWith('p-local-')) return false;
    if(product.type==='会籍'&&(product.opened==='2026-01-01'||product.opened==='2025-01-01')) return true;
    if(product.type==='其他'&&product.opened==='2024-01-01') return true;
    return false;
  }

  function normalizeOverviewDate(page,product){
    const labelText=dateLabelFor(product);
    page.querySelectorAll('.v4-pd-facts > div').forEach(item=>{
      const label=item.querySelector('small');
      const value=item.querySelector('strong');
      if(!label||label.textContent.trim()!=='开户日期') return;
      label.textContent=labelText;
      if(value&&isPrototypeDate(product)) value.textContent='未填写';
    });
  }

  function cleanBaseNonCreditSections(page){
    page.querySelector('.v4-pd-earning')?.remove();
    page.querySelector('.v4-pd-benefits')?.remove();
  }

  async function getResolved(product){
    if(product.type==='银行和券商账户'){
      const data=await loadAccountFacts();
      const resolved=resolveFact(data,product);
      return resolved?{data,resolved}:null;
    }
    if(product.type==='会籍'||product.type==='其他'){
      const data=await loadMembershipFacts();
      const resolved=resolveFact(data,product);
      return resolved?{data,resolved}:null;
    }
    return null;
  }

  async function applyProductDetail(){
    const page=document.querySelector('.v4-product-detail-page');
    if(!page) return;
    const state=readState();
    const product=allProducts(state).find(item=>item.id===state.currentProductId);
    if(!product||product.type==='信用卡') return;

    normalizeOverviewDate(page,product);
    cleanBaseNonCreditSections(page);

    const result=await getResolved(product);
    const anchor=page.querySelector('.v4-pd-history')||null;
    if(!result){
      const marker=`unverified:${normalize(product.name)}`;
      if(page.dataset.nbNonCardFacts===marker) return;
      page.dataset.nbNonCardFacts=marker;
      page.classList.add('nb-account-detail');
      addNotice(
        page,
        anchor,
        '美卡101当前没有足够明确、可直接对应这个产品的长期资料，因此这里不展示推测性的消费回报或福利。',
        'nb-no-verified-detail'
      );
      return;
    }

    const {data,resolved}=result;
    const [key,fact]=resolved;
    const marker=`${key}:${data.version}`;
    if(page.dataset.nbNonCardFacts===marker) return;
    page.dataset.nbNonCardFacts=marker;
    page.classList.add('nb-account-detail');

    const logo=logoFor(product);
    const card=page.querySelector('.v4-pd-card');
    if(card&&logo){
      card.classList.add('nb-account-logo-card');
      card.replaceChildren();
      const image=document.createElement('img');
      image.src=logo;
      image.alt=product.institution||product.name;
      card.appendChild(image);
    }

    const titles=titlesFor(fact);
    const metrics=buildRows(titles[0],fact.metrics);
    const features=buildRows(titles[1],fact.features);
    if(metrics) page.insertBefore(metrics,anchor);
    if(features) page.insertBefore(features,anchor);
    addNotice(page,anchor,fact.notice);
    addSource(page,anchor,fact);
  }

  function applyEditDateLabel(){
    const page=document.querySelector('.edit-product-page');
    if(!page) return;
    const state=readState();
    const product=allProducts(state).find(item=>item.id===state.currentProductId);
    if(!product||product.type==='信用卡') return;
    const input=page.querySelector('#edit-opened');
    const label=input?.closest('.form-group')?.querySelector('.label');
    if(label) label.textContent=dateLabelFor(product);
    if(input&&isPrototypeDate(product)) input.value='';
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    queueMicrotask(()=>{
      queued=false;
      applyProductDetail().catch(()=>{});
      applyEditDateLabel();
    });
  }

  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('storage',schedule);
  document.addEventListener('nb:product-detail-mounted',schedule);
  const app=document.getElementById('app');
  if(app) new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  schedule();

  window.NextBonusProductDetailFacts=Object.freeze({
    apply:applyProductDetail,
    dateLabelFor,
    isPrototypeDate
  });
})();
