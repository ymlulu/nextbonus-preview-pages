(() => {
  'use strict';

  // Discover uses Preview D1's reviewed snapshots, not DD's live raw catalog.
  // The original DD API client remains separate for Tracker and product workflows.
  const catalog=window.NextBonusBankDisplayCatalog;
  const ORIGIN='https://dd.nextbonus.app';
  const idForSlug=slug=>'bank-offer:'+slug;
  const text=value=>typeof value==='string'?value.trim():'';
  const money=cents=>Number.isSafeInteger(cents)&&cents>=0
    ?'$'+new Intl.NumberFormat('en-US',{minimumFractionDigits:cents%100?2:0,maximumFractionDigits:2}).format(cents/100)
    :'';
  const today=()=>new Date().toISOString().slice(0,10);

  function safeDdUrl(value,prefix){
    if(typeof value!=='string'||!value.trim())return '';
    try{
      const url=new URL(value,ORIGIN);
      if(url.origin!==ORIGIN||!url.pathname.startsWith(prefix)||url.username||url.password)return '';
      return url.href;
    }catch(_){return '';}
  }
  function safeOfficialUrl(value){
    if(typeof value!=='string')return '';
    try{
      const url=new URL(value);
      if(url.protocol!=='https:'||url.username||url.password||!url.hostname||
        url.hostname==='localhost'||url.hostname.endsWith('.localhost'))return '';
      return url.href;
    }catch(_){return '';}
  }
  function adapt(offer){
    const slug=text(offer?.slug);
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return null;
    const bank=text(offer.bank);
    const account=text(offer.account);
    const title=text(offer.title);
    if(!bank||!title||!Number.isSafeInteger(offer.bonusAmountCents)||
      offer.bonusAmountCents<=0)return null;
    if(offer.expiresOn&&offer.expiresOn<today())return null;
    const name=account
      ? (account.toLowerCase().startsWith(bank.toLowerCase())?account:bank+' '+account)
      :title;
    const extras=Array.isArray(offer.extraRequirements)
      ?offer.extraRequirements.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()):[];
    const requirement=[text(offer.ddRequirement),extras[0]]
      .filter(Boolean).join(' · ');
    return Object.freeze({
      id:idForSlug(slug),slug,source:'bank-offers-api',type:'bank',
      textLocale:offer.textLocale==='zh-CN'?'zh-CN':'en-US',
      provider:bank,name,title,account,category:'银行',
      value:money(offer.bonusAmountCents),
      bonusAmountCents:offer.bonusAmountCents,requirement,
      ddRequired:offer.ddRequired===true,ddRequirement:text(offer.ddRequirement),
      extraRequirements:extras,eligibilityNotes:text(offer.eligibilityNotes),
      expiresOn:text(offer.expiresOn)||null,verifiedOn:text(offer.verifiedOn)||null,
      applyUrl:safeDdUrl(offer.applicationUrl,'/go/')||safeOfficialUrl(offer.applicationUrl),
      officialTermsUrl:safeOfficialUrl(offer.officialTermsUrl),
      ddReportsUrl:safeDdUrl(offer.ddReportsUrl,'/accounts/'),
      payoutTiming:text(offer.payoutTiming),bonusClawback:text(offer.bonusClawback),
      promoCode:text(offer.promoCode),availability:offer.availability||null,
      productIds:Array.isArray(offer.productIds)?offer.productIds.filter(x=>typeof x==='string'):[],
      checklistReady:offer.checklistReady===true,
      requirements:offer.checklistReady===true?offer.requirements:null,
      tiers:Array.isArray(offer.tiers)?offer.tiers:[],
      version:offer.version??null,tags:['开户奖励'],
      status:'',featured:offer.featured===true,
      sortOrder:Number.isSafeInteger(offer.sortOrder)?offer.sortOrder:0
    });
  }
  function list(){
    return (catalog?.list?.()||[]).map(adapt).filter(Boolean);
  }
  function getById(id){
    if(typeof id!=='string'||!id.startsWith('bank-offer:'))return null;
    return list().find(offer=>offer.id===id)||null;
  }
  if(catalog){
    catalog.subscribe(()=>{
      window.dispatchEvent?.(new CustomEvent('nextbonus:bank-offers-updated'));
    });
    // Load reviewed display records only on Discover/Watchlist demand.
  }
  window.NextBonusDiscoverBankOffers=Object.freeze({
    list,getById,money,adapt,getState:()=>catalog?.getState?.()||{status:'unavailable'},
    ensure:()=>catalog?.ensure?.(),
    reload:()=>catalog?.load?.()
  });
})();
