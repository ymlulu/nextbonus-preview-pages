(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const base=String(window.NextBonusDealsConfig?.apiBase||'').replace(/\/+$/,'');
 const KEY='nextbonus-deals-admin-session';
 const root=$('bank-offers-list');
 let items=[],busy=false,loaded=false;
 const el=(name,className,text)=>{
  const node=document.createElement(name);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=String(text);
  return node;
 };
 const notice=(s,err=false)=>{const n=$('notice');n.textContent=s;n.classList.toggle('error',!!err);};
 async function api(path,body){
  const token=sessionStorage.getItem(KEY);
  if(!token)throw Error('管理会话已过期，请重新登录。');
  const response=await fetch(base+path,{method:body===undefined?'GET':'PUT',
   headers:{authorization:'Bearer '+token,...(body!==undefined?{'content-type':'application/json'}:{})},
   mode:'cors',credentials:'omit',cache:'no-store',
   ...(body!==undefined?{body:JSON.stringify(body)}:{})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(result.error||'HTTP '+response.status);
  return result;
 }
 const fmt=v=>Number.isSafeInteger(v)?'$'+(v/100).toLocaleString('en-US',{maximumFractionDigits:2}):'—';
 const formField=(label,kind,initial,max=3000)=>{
  const wrap=el('label','bank-admin-field');
  wrap.append(el('span','',label));
  const input=el(kind);input.maxLength=max;
  if(kind==='input')input.type='text';
  input.value=initial??'';
  wrap.append(input);
  return {wrap,input};
 };
 function makeCard(o){
  const row=el('article','bank-admin-row');
  const heading=el('div','bank-admin-heading');
  heading.append(el('strong','',o.bank+' · '+o.account));
  heading.append(el('span','status '+o.status,o.status));
  if(o.sourceMissing)heading.append(el('span','status draft','来源已移除'));
  if(o.textLocale!=='zh-CN')heading.append(el('span','status draft','英文回退'));
  row.append(heading);
  row.append(el('div','bank-admin-muted',o.slug+' · '+fmt(o.bonusAmountCents)+(o.expiresOn?' · 截止 '+o.expiresOn:'')));
  const summary=el('p','bank-admin-summary',o.ddRequirement||o.title||'');
  row.append(summary);
  const action=el('div','bank-admin-buttons');
  const button=(label,kind,fn)=>{
   const b=el('button',kind,label);b.type='button';b.addEventListener('click',fn);return b;
  };
  const change=async(body,message)=>{
   if(busy)return;
   busy=true;
   try{
    const result=await api('/api/admin/bank-display-offers/'+encodeURIComponent(o.slug),body);
    const at=items.findIndex(x=>x.slug===o.slug);
    if(at>=0)items[at]=result.item;
    notice(message);
   }catch(e){notice('操作失败：'+e.message,true);}
   finally{busy=false;render();}
  };
  action.append(button(o.syncLocked?'🔒 已锁定':'🔓 自动同步','secondary'+(o.syncLocked?' bank-locked':''),
   ()=>change({action:'set-sync-lock',locked:!o.syncLocked},o.syncLocked?'已解锁':'已锁定')));
  action.append(button(o.featured?'★ Featured':'☆ Featured','secondary',()=>change({
   action:'set-featured',featured:!o.featured},o.featured?'已取消精选':'已设为 Featured')));
  action.append(button('编辑展示','secondary',()=>{editor.hidden=!editor.hidden;}));
  action.append(button(o.status==='published'?'已发布':'发布','primary',async()=>{
   if(o.status==='published')return;
   if(!window.confirm('确定发布「'+o.bank+' '+o.account+'」？'))return;
   await change({action:'publish'},'已发布到 Discover');
  }));
  if(o.status==='published')action.append(button('撤回','secondary',async()=>{
   if(!window.confirm('撤回「'+o.bank+' '+o.account+'」？'))return;
   await change({action:'draft'},'已撤回');
  }));
  row.append(action);
  const editor=el('div','bank-admin-editor');editor.hidden=true;
  const sourceLink=o.applicationUrl||'';
  const reward=formField('奖励金额（美元）','input',Number.isSafeInteger(o.bonusAmountCents)?String(o.bonusAmountCents/100):'',30);
  const link=formField('申请链接（/go/... 或 HTTPS）','input',sourceLink,2048);
  const dd=formField('Direct Deposit 要求','textarea',o.ddRequirement,3000);
  const extra=formField('额外要求（每行一项）','textarea',(o.extraRequirements||[]).join('\n'),3000);
  const eligibility=formField('资格与限制','textarea',o.eligibilityNotes,3000);
  const payout=formField('发放时间','textarea',o.payoutTiming,3000);
  const clawback=formField('追回规则','textarea',o.bonusClawback,3000);
  const promo=formField('Promo Code','input',o.promoCode,3000);
  const expiry=formField('截止日期（YYYY-MM-DD）','input',o.expiresOn||'',10);
  const sort=formField('展示顺序（越小越靠前）','input',String(o.sortOrder||0),6);
  const fields=[reward,link,dd,extra,eligibility,payout,clawback,promo,expiry,sort];
  editor.append(...fields.map(x=>x.wrap));
  const tools=el('div','bank-admin-buttons');
  tools.append(button('保存修改','primary',async()=>{
   const amount=Number(reward.input.value);
   if(!Number.isFinite(amount)||amount<=0||!Number.isSafeInteger(Math.round(amount*100)))return notice('奖励金额无效',true);
   const order=Number(sort.input.value);
   if(!Number.isSafeInteger(order)||order<0||order>999999)return notice('排序必须是非负整数',true);
   const patch={
    bonusAmountCents:Math.round(amount*100),
    applicationUrl:link.input.value.trim(),
    ddRequirement:dd.input.value,
    extraRequirements:extra.input.value.split('\n').map(s=>s.trim()).filter(Boolean),
    eligibilityNotes:eligibility.input.value,
    payoutTiming:payout.input.value,
    bonusClawback:clawback.input.value,
    promoCode:promo.input.value,
    expiresOn:expiry.input.value.trim()||null
   };
   try{
    await change({action:'save-overrides',patch},'展示修改已保存，不影响 DD Database。');
    if(order!==o.sortOrder){
     const current=items.find(x=>x.slug===o.slug);
     if(current){
      const r=await api('/api/admin/bank-display-offers/'+encodeURIComponent(o.slug),
       {action:'set-sort-order',sortOrder:order});
      const at=items.findIndex(x=>x.slug===o.slug);
      if(at>=0)items[at]=r.item;render();
     }
    }
   }catch(e){notice('排序修改失败：'+e.message,true);}
  }));
  tools.append(button('恢复 DD 原始内容','secondary',async()=>{
   if(!o.editedFields?.length)return notice('没有需要恢复的人工修改');
   if(!window.confirm('恢复该 Offer 的 DD Database 原始展示内容？'))return;
   await change({action:'reset-overrides'},'已恢复 DD 原始展示');
  }));
  editor.append(tools);
  row.append(editor);
  return row;
 }
 function render(){
  const q=$('bank-offers-search').value.trim().toLowerCase();
  const st=$('bank-offers-status').value;
  const filtered=items.filter(o=>(!st||o.status===st)&&
   (!q||[o.bank,o.account,o.slug,o.title].join(' ').toLowerCase().includes(q)));
  root.replaceChildren(...filtered.map(makeCard));
  if(!filtered.length)root.append(el('div','credit-admin-empty',
   items.length?'没有匹配的银行奖励':'暂无记录，请先运行 DD Bank Display Sync Action'));
  $('bank-offers-count').textContent='显示 '+filtered.length+' / '+items.length+' 条银行奖励';
 }
 async function reload(){
  if(busy)return;
  busy=true;$('bank-offers-reload').disabled=true;
  root.replaceChildren(el('div','credit-admin-empty','正在读取本地银行奖励…'));
  try{
   const all=[];let offset=0;
   for(let page=0;page<100;page++){
    const result=await api('/api/admin/bank-display-offers?offset='+offset);
    if(!Array.isArray(result.items))throw Error('后台银行奖励响应异常');
    all.push(...result.items);
    if(result.nextOffset==null)break;
    if(!Number.isSafeInteger(result.nextOffset)||result.nextOffset<=offset)throw Error('分页异常');
    offset=result.nextOffset;
   }
   items=all;loaded=true;render();notice('');
  }catch(e){
   notice(e.message,true);
   root.replaceChildren(el('div','credit-admin-empty','读取失败：'+e.message));
  }finally{busy=false;$('bank-offers-reload').disabled=false;}
 }
 function activate(){
  $('list-view').hidden=true;$('editor-view').hidden=true;$('card-view').hidden=true;
  $('bank-offers-view').hidden=false;
  for(const id of ['tab-deals','tab-cards','tab-bank-offers']){
   const b=$(id),active=id==='tab-bank-offers';
   b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));
  }
  if(!loaded)reload();
 }
 function deactivate(){$('bank-offers-view').hidden=true;}
 function reset(){items=[];loaded=false;root.replaceChildren();}
 $('tab-bank-offers').addEventListener('click',activate);
 $('bank-offers-reload').addEventListener('click',reload);
 $('bank-offers-search').addEventListener('input',render);
 $('bank-offers-status').addEventListener('change',render);
 window.NextBonusBankDisplayAdmin=Object.freeze({activate,deactivate,reset,reload});
})();
