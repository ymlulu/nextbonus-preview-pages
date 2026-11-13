(() => {
  'use strict';
  // DD is the source of truth. Use only published API fields and do not infer
  // deadlines, tier requirements, eligibility or affiliate destinations.
  // Present the actions in an executable order, not the canonical DD-first
  // legacy grouping. Honor explicit dependencies and otherwise preserve
  // source order within each semantic phase.
  function displayOrder(items){
    const remaining=items.map((item,index)=>({...item,sourceIndex:index}));
    const byId=new Set(remaining.filter(item=>typeof item.id==='string').map(item=>item.id));
    const out=[],done=new Set();
    const phase=item=>item.subtype==='account_opening'?0:item.type==='dd'||item.subtype==='direct_deposit'?2:1;
    while(remaining.length){
      const ready=remaining.filter(item=>(item.depends_on||[]).every(id=>!byId.has(id)||done.has(id)));
      if(!ready.length){
        // Cyclic or unavailable dependency data should never hide requirements.
        out.push(...remaining);
        break;
      }
      ready.sort((a,b)=>phase(a)-phase(b)||a.sourceIndex-b.sourceIndex);
      const next=ready[0];
      out.push(next);
      if(next.id)done.add(next.id);
      remaining.splice(remaining.indexOf(next),1);
    }
    return out;
  }

  function render(o,{esc,saved,mobileToolbar}){
    if(o?.source!=='bank-offers-api')return '';
    const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s);
    const expired=validDate(o.expiresOn)&&o.expiresOn<new Date().toISOString().slice(0,10);
    const money=c=>window.NextBonusDiscoverBankOffers?.money?.(c)||'';
    const raw=Array.isArray(o.requirements?.requirements)
      ?o.requirements.requirements.filter(x=>typeof x?.description==='string'&&x.description.trim())
        .map(x=>({id:x.id,description:x.description.trim(),type:x.type,subtype:x.subtype,depends_on:Array.isArray(x.depends_on)?x.depends_on:[]}))
      :[];
    const byId=new Map(raw.filter(x=>x.id!=null).map(x=>[x.id,x.description]));
    const tiers=Array.isArray(o.tiers)?o.tiers.filter(t=>
      Number.isSafeInteger(t?.bonus_amount_cents)&&t.bonus_amount_cents>0):[];
    const tierRefs=tiers.map(t=>Array.isArray(t.requirement_ids)
      ?[...new Set(t.requirement_ids.filter(id=>byId.has(id)))] :[]);
    const allTierRefs=new Set(tierRefs.flat());
    // A shared tier requirement must be explicitly linked by *every* tier.
    // For a single tier, keep its requirements with that tier; do not relabel
    // its whole checklist as unconditional "other" account requirements.
    const commonIds=new Set(tierRefs.length>1&&tierRefs.every(refs=>refs.length)
      ?tierRefs[0].filter(id=>tierRefs.every(refs=>refs.includes(id)))
      :[]);
    const common=raw.filter(r=>commonIds.has(r.id)||!allTierRefs.has(r.id));
    const extras=Array.isArray(o.extraRequirements)
      ?o.extraRequirements.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()):[];
    // Avoid duplicating extraRequirements already present as structured facts.
    const known=new Set(raw.map(r=>r.description));
    extras.forEach(description=>{
      if(!known.has(description)){common.push({description});known.add(description);}
    });
    if(!tiers.length){
      if(!raw.length&&o.ddRequired&&o.ddRequirement&&!known.has(o.ddRequirement)){
        common.unshift({description:o.ddRequirement});
      }
    }
    const isDdRequirement=r=>r?.type==='dd'||r?.subtype==='direct_deposit'||
      (o.ddRequired&&typeof r?.description==='string'&&/\b(?:Direct Deposit|DD)\b|直接存款|工资入账/i.test(r.description));
    const reportLink=o.ddReportsUrl
      ?'<a class="nb-bank-dd-report-link" href="'+esc(o.ddReportsUrl)+
        '" target="_blank" rel="noopener noreferrer">查看成功触发的 Direct Deposit 报告 ↗</a>'
      :'';
    // A report belongs to the DD instruction, not to a detached footer.
    // If DD exists only in reward tiers, show one link in the first DD tier.
    const ordered=displayOrder(common);
    const hasDdStep=ordered.some(isDdRequirement);
    let reportShown=false;
    const detailRows=tiers.map((t,index)=>{
      const exclusive=tierRefs[index].filter(id=>!commonIds.has(id));
      const description=exclusive.length?exclusive.map(id=>byId.get(id)).join('；')
        :(tierRefs[index].length?'同上方共同开户要求':'具体档位要求请查看官方条款');
      const tierHasDd=exclusive.some(id=>isDdRequirement(raw.find(r=>r.id===id)));
      const inlineReport=!hasDdStep&&!reportShown&&tierHasDd&&reportLink;
      if(inlineReport)reportShown=true;
      return '<div class="remaining-tier"><span>'+esc(description)+
        (inlineReport?'<span class="nb-bank-dd-report">'+reportLink+'</span>':'')+
        '</span><span><strong>'+esc(money(t.bonus_amount_cents))+'</strong></span></div>';
    }).join('');
    const list=ordered.map((r,index)=>{
      const inlineReport=!reportShown&&isDdRequirement(r)&&reportLink;
      if(inlineReport)reportShown=true;
      return '<div class="remaining-step"><div class="remaining-num">'+(index+1)+
        '</div><div class="remaining-step-card"><div class="remaining-step-title"><span>'+
        esc(r.description)+'</span></div>'+
        (inlineReport?'<div class="nb-bank-dd-report">'+reportLink+'</div>':'')+
        '</div></div>';
    }).join('');
    const eligibility=o.eligibilityNotes
      ?'<details class="remaining-eligibility"><summary>申请资格与限制</summary><div class="remaining-eligibility-copy">'+esc(o.eligibilityNotes)+'</div></details>':'';
    const affiliate=o.applyUrl&&!expired
      ?'<a class="remaining-cta" href="'+esc(o.applyUrl)+'" target="_blank" rel="noopener noreferrer">立即开户 ↗</a>'
      :'<p class="v4-no-action-note">当前没有可用的申请入口。</p>';
    return '<div class="content v4-offer-detail-page remaining-offer nb-bank-api-detail">'+
      mobileToolbar+
      '<div class="v4-offer-detail-grid">'+
      '<section class="v4-offer-poster-shell"><div class="remaining-poster nb-api-bank-poster">'+
      '<div class="remaining-brand">'+esc(o.provider)+'</div>'+
      '<div class="remaining-title">'+esc(o.account||o.name)+'</div>'+
      '<div class="remaining-kicker">CURRENT BANK OFFER</div>'+
      '<div class="remaining-value">'+esc(o.value)+'</div>'+
      (o.requirement?'<div class="remaining-copy">'+esc(o.requirement)+'</div>':'')+
      '</div></section>'+
      '<aside class="v4-decision-panel">'+
      '<div class="remaining-head nb-offer-detail-head"><strong>'+esc(o.name)+'</strong>'+
      '<button class="remaining-save nb-follow-control '+(saved?'saved':'')+'" data-action="bookmark" data-id="'+esc(o.id)+'" type="button">'+(saved?'已关注':'关注')+'</button></div>'+
      '<section class="remaining-reward"><div class="remaining-reward-top"><div class="remaining-reward-label">当前开户奖励</div>'+
      '<div class="remaining-reward-value">'+esc(o.value)+'</div>'+
      '</div>'+
      (detailRows?'<div class="remaining-tier-head"><span>奖励档位要求</span><span>奖励</span></div>'+detailRows:'')+
      '</section>'+
      (list?'<div class="remaining-section-title">步骤</div><div class="remaining-timeline">'+list+'</div>':'')+
      (o.promoCode?'<div class="remaining-section-title">Promo Code：'+esc(o.promoCode)+'</div>':'')+
      affiliate+
      (o.expiresOn?'<div class="remaining-deadline">活动截止：'+esc(o.expiresOn)+'</div>':'')+
      eligibility+
      (o.payoutTiming?'<details class="remaining-eligibility"><summary>奖励发放时间</summary><div class="remaining-eligibility-copy">'+esc(o.payoutTiming)+'</div></details>':'')+
      (o.bonusClawback?'<details class="remaining-eligibility"><summary>奖励追回条款</summary><div class="remaining-eligibility-copy">'+esc(o.bonusClawback)+'</div></details>':'')+
      (o.officialTermsUrl?'<p class="remaining-deadline"><a href="'+esc(o.officialTermsUrl)+'" target="_blank" rel="noopener noreferrer">银行官方条款 ↗</a></p>':'')+
      (o.verifiedOn?'<div class="remaining-deadline">最近核实：'+esc(o.verifiedOn)+'</div>':'')+
      '</aside></div></div>';
  }
  window.NextBonusBankOfferDetail=Object.freeze({render});
})();
