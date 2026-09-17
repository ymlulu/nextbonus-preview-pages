(()=>{
  'use strict';

  const K='nextbonus-local-v8-state';
  const STYLE_ID='nextbonus-welcome-bonus-layout';
  const O={
    'amex-platinum':'amex-platinum',
    'amex-gold':'amex-gold',
    'chase-sapphire':'chase-sapphire-preferred',
    'bilt-palladium':'bilt-palladium',
    'capitalone-venturex':'capitalone-venturex',
    'citi-strata':'citi-strata-elite'
  };
  const I={
    'p-hilton-aspire-2308':'hilton-aspire',
    'p-csr-2948':'chase-sapphire-reserve',
    'p-marriott-brilliant-6503':'marriott-brilliant',
    'p-amex-biz-4321':'amex-blue-business-plus',
    'p-freedom-7182':'chase-freedom-unlimited',
    'p-citi-3490':'citi-double-cash'
  };
  const N={
    'amex platinum':'amex-platinum',
    'amex platinum card':'amex-platinum',
    'amex gold':'amex-gold',
    'amex gold card':'amex-gold',
    'chase sapphire preferred':'chase-sapphire-preferred',
    'bilt palladium card':'bilt-palladium',
    'capital one venture x':'capitalone-venturex',
    'citi strata elite':'citi-strata-elite',
    'hilton aspire':'hilton-aspire',
    'chase sapphire reserve':'chase-sapphire-reserve',
    'marriott bonvoy brilliant':'marriott-brilliant',
    'amex business plus':'amex-blue-business-plus',
    'blue business plus':'amex-blue-business-plus',
    'chase freedom unlimited':'chase-freedom-unlimited',
    'citi double cash':'citi-double-cash'
  };

  let F=null;
  let q=false;

  const n=s=>String(s||'')
    .toLowerCase()
    .replace(/[®™℠]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim()
    .replace(/\s+/g,' ');

  const r=()=>{
    try{return JSON.parse(localStorage.getItem(K)||'{}');}
    catch{return{};}
  };

  const a=s=>[
    ...(Array.isArray(s.products)?s.products:[]),
    ...(Array.isArray(s.pastProducts)?s.pastProducts:[])
  ];

  const e=s=>String(s??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');

  const key=p=>p?.type==='信用卡'
    ?(O[p.offerId]||I[p.id]||N[n(p.name)]||null)
    :null;

  async function facts(){
    if(F)return F;
    F=await(await fetch('./credit-card-product-facts.json',{cache:'no-store'})).json();
    return F;
  }

  function sync(s,p,k,d,v){
    p.annualFee=d.fee;
    p.earning=d.earning;
    p.benefits=d.benefits.map((x,i)=>({id:`nb-${k}-${i+1}`,title:x[0],short:x[1],benefitId:x[2]||null,cycleType:x[3]||null}));
    p.productDetailDataVersion=v;
    try{localStorage.setItem(K,JSON.stringify(s));}catch{}
  }

  function ensureBonusStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .nb-welcome-bonus-section{padding-top:12px;padding-bottom:12px}
      .nb-welcome-bonus-card{min-height:92px;border:1px solid #e6ebf3;border-radius:14px;background:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:1fr 1fr;column-gap:28px;align-items:center;padding:14px 18px}
      .nb-welcome-bonus-value{grid-column:1;grid-row:1;margin:0;align-self:end}
      .nb-welcome-bonus-requirement{grid-column:1;grid-row:2;margin:4px 0 0;align-self:start;min-height:0;white-space:normal;overflow:visible;text-overflow:clip}
      .nb-welcome-bonus-complete{grid-column:2;grid-row:1;justify-self:end;align-self:end}
      .nb-welcome-bonus-deadline{grid-column:2;grid-row:2;justify-self:end;align-self:start;display:inline-flex;align-items:center;gap:6px;padding:4px 0}
      .nb-welcome-bonus-focus{border-radius:12px;box-shadow:0 0 0 4px rgba(10,113,255,.08)}
      @media(max-width:600px){.nb-welcome-bonus-card{column-gap:14px;padding:12px 14px}}
    `;
    document.head.appendChild(style);
  }

  function displayDate(value){
    const match=String(value||'').slice(0,10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match?`${match[1]}/${match[2]}/${match[3]}`:'';
  }

  function normalizeReward(value){
    const raw=String(value||'开卡奖励').trim().replace(/^AS HIGH AS\s+/i,'');
    const points=raw.match(/^([\d,]+)\s+(MR|UR|TYP)$/i);
    if(points){
      const amount=Number(points[1].replaceAll(',',''));
      if(Number.isFinite(amount)&&amount>=1000&&amount%1000===0){
        return `最高 ${amount/1000}k ${points[2].toUpperCase()}`;
      }
    }
    return /^最高\s+/u.test(raw)?raw:`最高 ${raw}`;
  }

  function requirementCopy(bonus){
    const explicit=String(bonus?.requirement||'').trim();
    const secondary=String(bonus?.secondary||'').trim();
    const checklist=Array.isArray(bonus?.checklist)?bonus.checklist:[];
    const source=explicit||secondary||String(checklist[0]?.label||'').trim();

    let match=source.match(/(\d+)\s*个月\s*消费\s*(\$[\d,.]+)/u);
    if(match)return `消费 ${match[2]} / ${match[1]} 个月`;

    match=source.match(/(\$[\d,.]+)\s*\/\s*(\d+)\s*(?:个月|months?)/i);
    if(match)return `消费 ${match[1]} / ${match[2]} 个月`;

    return source.replace(/，?获得.*$/u,'').replace(/^完成\s*/u,'').trim()||'完成对应奖励条件';
  }

  function currentBonus(state,productId){
    return (Array.isArray(state.activeAttention)?state.activeAttention:[])
      .filter(item=>item.productId===productId&&item.type==='bonus')
      .sort((x,y)=>String(x.dueDate||'9999').localeCompare(String(y.dueDate||'9999')))[0]||null;
  }

  function renderWelcomeBonus(page,state,product){
    page.querySelector('.nb-welcome-bonus-section')?.remove();
    const bonus=currentBonus(state,product.id);
    if(!bonus)return;

    const benefits=page.querySelector('.v4-pd-benefits');
    if(!benefits)return;

    ensureBonusStyles();
    const section=document.createElement('section');
    section.className='v4-pd-section nb-welcome-bonus-section';
    const due=product.opened&&bonus.dueDate?displayDate(bonus.dueDate):'未计算';
    const reward=normalizeReward(bonus.key||bonus.secondary||'开卡奖励');
    const requirement=requirementCopy(bonus);

    section.innerHTML=`
      <div class="v4-section-head"><h2>开卡奖励</h2></div>
      <div class="nb-welcome-bonus-card">
        <strong class="primary-value nb-welcome-bonus-value">${e(reward)}</strong>
        <span class="requirement nb-welcome-bonus-requirement">${e(requirement)}</span>
        <button class="btn secondary small nb-welcome-bonus-complete" type="button" data-action="complete-attention" data-id="${e(bonus.id)}">标记完成</button>
        <button class="mock-link nb-welcome-bonus-deadline" type="button" data-action="edit-product" data-nb-focus-opened="1"><span>截止日期</span><strong>${e(due)}</strong><span aria-hidden="true">›</span></button>
      </div>`;

    benefits.before(section);
  }

  function render(page,d,state,product){
    const fee=[...page.querySelectorAll('.v4-pd-facts>div')]
      .find(x=>x.querySelector('small')?.textContent.trim()==='年费')
      ?.querySelector('strong');
    if(fee)fee.textContent=d.fee;

    const earn=page.querySelector('.v4-pd-earning');
    if(earn){
      const ps=d.earning.split('·').map(x=>x.trim()).filter(Boolean);
      earn.className=`v4-pd-earning ${ps.length===1?'single':''}`;
      earn.innerHTML=ps.map((x,i)=>`${i?'<i></i>':''}<div><span class="earn-icon ${i===0?'blue':i===1?'purple':'green'}">${i===0?'✦':i===1?'▥':'♧'}</span><span><b>${e(x)}</b><small>消费回报</small></span></div>`).join('');
    }

    const sec=page.querySelector('.v4-pd-benefits');
    if(!sec)return;

    const h=sec.querySelector('.nb-card-section-title,.v4-section-head');
    [...sec.children].forEach(c=>{if(c!==h)c.remove();});

    if(!d.benefits.length){
      const z=document.createElement('div');
      z.className='timeline-empty';
      z.textContent='美卡101当前文章没有列出需要单独追踪的长期福利';
      sec.appendChild(z);
      renderWelcomeBonus(page,state,product);
      window.dispatchEvent(new CustomEvent('nextbonus-product-facts-rendered'));
      return;
    }

    const w=document.createElement('div');
    const l=document.createElement('div');
    const rr=document.createElement('div');
    const cut=Math.ceil(d.benefits.length/2);
    w.className='v4-benefit-lists nb-card-benefit-columns';

    d.benefits.forEach(([t,s,bid,cycle],i)=>{
      const row=document.createElement('div');
      row.className='v4-benefit-item-wrap';
      row.innerHTML=`<div class="v4-benefit-row"${bid?` data-benefit-id="${e(bid)}"`:''}${cycle?` data-cycle-type="${e(cycle)}"`:''}><span class="v4-benefit-icon">◇</span><strong>${e(t)}</strong><small>${e(s)}</small></div>`;
      (i<cut?l:rr).appendChild(row);
    });

    w.append(l,rr);
    sec.appendChild(w);
    renderWelcomeBonus(page,state,product);
    window.dispatchEvent(new CustomEvent('nextbonus-product-facts-rendered'));
  }

  async function apply(){
    const page=document.querySelector('.v4-product-detail-page');
    if(!page)return;
    const s=r();
    const p=a(s).find(x=>x.id===s.currentProductId);
    const k=key(p);
    if(!k)return;
    const f=await facts();
    const d=f.cards[k];
    if(!d)return;
    const m=`${k}:${f.version}`;
    if(page.dataset.nbFacts===m){
      renderWelcomeBonus(page,s,p);
      return;
    }
    page.dataset.nbFacts=m;
    sync(s,p,k,d,f.version);
    render(page,d,s,p);
  }

  function schedule(){
    if(q)return;
    q=true;
    queueMicrotask(()=>{
      q=false;
      apply().catch(()=>{});
    });
  }

  function afterUiEvent(){setTimeout(schedule,0);}

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('[data-nb-focus-opened="1"]');
    if(!target)return;
    setTimeout(()=>{
      const input=document.getElementById('edit-opened');
      if(!input)return;
      const group=input.closest('.form-group');
      group?.classList.add('nb-welcome-bonus-focus');
      input.focus({preventScroll:true});
      input.scrollIntoView({block:'center',behavior:'smooth'});
      setTimeout(()=>group?.classList.remove('nb-welcome-bonus-focus'),1200);
    },0);
  },true);

  window.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('storage',schedule);
  window.addEventListener('popstate',afterUiEvent);
  document.addEventListener('click',afterUiEvent);
  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' ')afterUiEvent();
  });
  schedule();
})();