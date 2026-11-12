(() => {
  'use strict';
  // Shares the existing Deals admin session and Worker. No separate login.
  const $=id=>document.getElementById(id);
  const root=$('cards-list');
  const base=String(window.NextBonusDealsConfig?.apiBase||'').replace(/\/+$/,'');
  const KEY='nextbonus-deals-admin-session';
  let cards=[],busy=false,loaded=false;
  const node=(tag,className,text)=>{
    const result=document.createElement(tag);
    if(className)result.className=className;
    if(text!==undefined)result.textContent=String(text);
    return result;
  };
  const statusLabel=s=>s==='published'?'Published':'Draft';
  const isCardTab=()=>!$('card-view').hidden;
  const notice=(text,isError=false)=>{
    const el=$('notice');el.textContent=text;el.classList.toggle('error',!!isError);
  };
  async function api(path,body){
    const token=sessionStorage.getItem(KEY);
    if(!token)throw Error('登录已过期，请重新登录。');
    const headers={authorization:'Bearer '+token};
    if(body!==undefined)headers['content-type']='application/json';
    const response=await fetch(base+path,{
      method:body===undefined?'GET':'PUT',headers,mode:'cors',
      credentials:'omit',cache:'no-store',
      ...(body!==undefined?{body:JSON.stringify(body)}:{})
    });
    const result=await response.json().catch(()=>({}));
    if(response.status===401){
      window.NextBonusCardAdmin.reset();
      throw Error('登录已过期，请刷新页面重新登录。');
    }
    if(!response.ok)throw Error(result.error||'API HTTP '+response.status);
    return result;
  }
  function safeLink(url,text){
    try{
      const address=new URL(String(url||''));
      if(address.protocol!=='https:')return null;
      const a=node('a','credit-admin-link',text);
      a.href=address.href;a.target='_blank';a.rel='noopener noreferrer';
      return a;
    }catch{return null;}
  }
  function renderCard(card){
    const row=node('article','credit-admin-row');
    row.dataset.slug=card.slug;
    const image=card.imageUrl?node('img','credit-admin-image'):node('div','credit-admin-image credit-admin-placeholder','CARD');
    if(card.imageUrl){image.src=card.imageUrl;image.alt='';image.loading='lazy';}
    row.append(image);
    const main=node('div','credit-admin-main');
    const heading=node('div','credit-admin-title');
    heading.append(node('strong','',card.name));
    heading.append(node('span','status '+card.status,statusLabel(card.status)));
    main.append(heading);
    main.append(node('small','',card.issuer+' · '+card.slug+' · 年费 '+(card.feeCurrency==='CNY'?'¥':'$')+(card.fee||'未提供')));
    if(card.highlight)main.append(node('p','credit-admin-highlight',card.highlight));
    const offers=Array.isArray(card.offers)?card.offers:[];
    main.append(node('small','',offers.length+' 个 Offer · '+(card.status==='published'?'已发布':'待审核')));
    const detail=node('details','credit-admin-detail');
    detail.append(node('summary','','查看完整资料与所有 Offer'));
    for(const [title,value] of [['消费返点',card.spending],['积分 / 返点兑换',card.reward],['年费补充',card.feeExtra]]){
      if(value)detail.append(node('p','',title+'：'+value));
    }
    if(card.articleUrl){
      const link=safeLink(card.articleUrl,'美卡101文章');
      if(link)detail.append(link);
    }
    const list=node('ol','credit-admin-offer-list');
    for(const o of offers){
      const li=node('li','');
      li.append(node('strong','',o.id+' · '+(o.bonus||'未提供奖励文案')));
      if(o.goUrl){const link=safeLink(o.goUrl,' · 查看 Go Link');if(link)li.append(link);}
      list.append(li);
    }
    detail.append(list);
    main.append(detail);row.append(main);
    const editor=node('div','credit-admin-editor');
    editor.hidden=true;
    const form=node('form','credit-offer-form');
    form.noValidate=true;
    form.addEventListener('submit',event=>event.preventDefault());
    const editorTitle=node('strong','credit-editor-title','编辑 Offer');
    const offerSelector=node('select','');
    const options=offers.map(o=>({value:o.id,label:o.id+' · '+(o.bonus||'未填写奖励')}));
    for(const option of options){
      const opt=node('option','',option.label);opt.value=option.value;offerSelector.append(opt);
    }
    const addChoice=node('option','','＋ 新增 Offer');
    addChoice.value='__new__';offerSelector.append(addChoice);
    const field=(labelText,tag,maxLength)=>{
      const wrapper=node('label','credit-admin-field');
      wrapper.append(node('span','',labelText));
      const input=node(tag,'');input.maxLength=maxLength;
      wrapper.append(input);return {wrapper,input};
    };
    const bonus=field('完整奖励文案','textarea',1000);
    const value=field('卡片展示奖励','input',160);
    const requirement=field('消费要求','textarea',320);
    const goUrl=field('申请链接（HTTPS）','input',2048);
    goUrl.input.type='url';goUrl.input.placeholder='https://...';
    const offerId=field('新 Offer ID（仅新增时填写）','input',255);
    offerId.input.placeholder='例如 special-2026';
    function showOffer(){
      const isNew=offerSelector.value==='__new__';
      const selected=offers.find(o=>o.id===offerSelector.value);
      offerId.wrapper.hidden=!isNew;
      bonus.input.value=isNew?'':selected?.bonus||'';
      value.input.value=isNew?'':selected?.value||'';
      requirement.input.value=isNew?'':selected?.requirement||'';
      goUrl.input.value=isNew?'':selected?.goUrl||'';
      if(isNew)offerId.input.value='';
      restore.hidden=isNew||!selected?.edited;
    }
    form.append(editorTitle);
    const pick=node('label','credit-admin-field');
    pick.append(node('span','','选择要编辑的 Offer'),offerSelector);
    form.append(pick,offerId.wrapper,bonus.wrapper,value.wrapper,requirement.wrapper,goUrl.wrapper);
    const editorButtons=node('div','credit-editor-buttons');
    const save=node('button','primary','保存修改');
    save.type='button';
    const restore=node('button','secondary','恢复原始内容');
    restore.type='button';
    const cancel=node('button','secondary','取消');
    cancel.type='button';
    editorButtons.append(save,restore,cancel);
    form.append(editorButtons);
    editor.append(form);main.append(editor);
    offerSelector.addEventListener('change',showOffer);
    save.addEventListener('click',async()=>{
      if(busy)return;
      const isNew=offerSelector.value==='__new__';
      const id=isNew?offerId.input.value.trim():offerSelector.value;
      if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>255)return notice('请填写有效的 Offer ID（小写字母、数字、连字符）。',true);
      const data={bonus:bonus.input.value,value:value.input.value,
        requirement:requirement.input.value,goUrl:goUrl.input.value};
      if(!data.bonus.trim()||!data.goUrl.trim())return notice('奖励文案和申请链接不可留空。',true);
      let u;try{u=new URL(data.goUrl);if(u.protocol!=='https:')throw Error();}catch{return notice('申请链接必须是 HTTPS URL。',true);}
      await change(card,{action:'save-offer',offerId:id,create:isNew,offer:data},'Offer 修改已保存；WordPress 同步不会覆盖它。');
    });
    restore.addEventListener('click',async()=>{
      if(busy)return;
      const selected=offers.find(o=>o.id===offerSelector.value);
      if(!selected?.edited)return;
      if(!window.confirm(selected.manual?'确定删除这条手动新增的 Offer 吗？':'恢复 WordPress 原始 Offer 内容？'))return;
      await change(card,{action:'reset-offer',offerId:selected.id},'已恢复原始内容。');
    });
    cancel.addEventListener('click',()=>{editor.hidden=true;});
    if(offers.length)offerSelector.value=card.primaryOfferId||offers[0].id;
    else offerSelector.value='__new__';
    showOffer();
    const action=node('div','credit-admin-actions');
    const label=node('label','','主 Offer');
    label.htmlFor='card-offer-'+card.slug;
    const select=node('select','');
    select.id=label.htmlFor;
    const blank=node('option','','选择要发布的奖励');
    blank.value='';select.append(blank);
    for(const offer of offers){
      const option=node('option','',offer.id+' · '+(offer.bonus||'无奖励文案'));
      option.value=offer.id;
      option.disabled=!offer.bonus||!offer.goUrl;
      select.append(option);
    }
    select.value=card.primaryOfferId||'';
    action.append(label,select);
    const lockButton=node('button','secondary credit-sync-lock'+(card.syncLocked?' locked':''),card.syncLocked?'🔒 已锁定':'🔓 自动同步');
    lockButton.type='button';
    lockButton.title=card.syncLocked?'点击解锁，后续 WordPress 数据更新将自动同步':'点击锁定，停止 WordPress 自动同步这张卡';
    lockButton.setAttribute('aria-pressed',String(!!card.syncLocked));
    lockButton.addEventListener('click',async()=>{
      if(busy)return;
      await change(card,{action:'set-sync-lock',locked:!card.syncLocked},
        card.syncLocked?'已解锁，后续导入将同步 WordPress。':'已锁定，后续导入将跳过此卡。');
    });
    action.append(lockButton);
    const editButton=node('button','secondary','编辑 Offer');
    editButton.type='button';
    editButton.addEventListener('click',()=>{
      editor.hidden=!editor.hidden;
      if(!editor.hidden)showOffer();
    });
    action.append(editButton);
    const buttons=node('div','credit-admin-buttons');
    const publish=node('button','primary',card.status==='published'?'更新发布':'发布');
    publish.type='button';
    publish.disabled=!select.value;
    select.addEventListener('change',()=>{publish.disabled=busy||!select.value;});
    publish.addEventListener('click',async()=>{
      const selected=offers.find(o=>o.id===select.value);
      if(!selected||!selected.bonus||!selected.goUrl)return notice('先选择有效的主 Offer。',true);
      if(busy)return;
      const question='确定将「'+card.name+'」的 '+selected.bonus+' 设为主 Offer 并发布到 Discover 吗？';
      if(!window.confirm(question))return;
      await change(card,{action:'publish',primaryOfferId:selected.id},'信用卡已发布到 Discover。');
    });
    buttons.append(publish);
    if(card.status==='published'){
      const draft=node('button','secondary','撤回');
      draft.type='button';
      draft.addEventListener('click',async()=>{
        if(busy||!window.confirm('确定撤回「'+card.name+'」？撤回后将不再出现在 Discover。'))return;
        await change(card,{action:'draft'},'已撤回为 Draft。');
      });
      buttons.append(draft);
    }
    action.append(buttons);row.append(action);
    return row;
  }
  function render(){
    const query=$('cards-search').value.trim().toLowerCase();
    const status=$('cards-status').value;
    const filtered=cards.filter(card=>(!status||card.status===status)&&
      (!query||[card.name,card.slug,card.issuer].join(' ').toLowerCase().includes(query)));
    root.replaceChildren(...filtered.map(renderCard));
    if(!filtered.length){
      root.replaceChildren(node('div','credit-admin-empty',cards.length?'没有匹配的信用卡':'还没有导入信用卡，先运行 WordPress Sync。'));
    }
    $('cards-count').textContent='显示 '+filtered.length+' / '+cards.length+' 张信用卡';
  }
  async function change(card,body,success){
    if(busy)return;
    busy=true;root.querySelectorAll('button,select').forEach(el=>el.disabled=true);
    try{
      const response=await api('/api/admin/credit-cards/'+encodeURIComponent(card.slug),body);
      const index=cards.findIndex(x=>x.slug===card.slug);
      if(index!==-1)cards[index]=response.item;
      notice(success);
      render();
    }catch(e){notice('操作失败：'+e.message,true);render();}
    finally{busy=false;}
  }
  async function reload(){
    if(busy)return;
    busy=true;$('cards-reload').disabled=true;
    root.replaceChildren(node('div','credit-admin-empty','正在读取信用卡数据…'));
    try{
      const all=[];
      let offset=0;
      for(let page=0;page<100;page++){
        const data=await api('/api/admin/credit-cards?offset='+offset);
        if(!Array.isArray(data.items))throw Error('信用卡列表格式异常');
        all.push(...data.items);
        if(data.nextOffset==null)break;
        if(!Number.isSafeInteger(data.nextOffset)||data.nextOffset<=offset)throw Error('信用卡分页数据异常');
        offset=data.nextOffset;
        if(page===99)throw Error('信用卡数量超过当前分页上限');
      }
      cards=all;loaded=true;render();notice('');
    }catch(e){
      root.replaceChildren(node('div','credit-admin-empty','读取失败：'+e.message));
      notice(e.message,true);
    }finally{busy=false;$('cards-reload').disabled=false;}
  }
  async function activate(){
    $('list-view').hidden=true;$('editor-view').hidden=true;$('card-view').hidden=false;
    $('tab-cards').classList.add('active');
    $('tab-deals').classList.remove('active');
    $('tab-cards').setAttribute('aria-selected','true');
    $('tab-deals').setAttribute('aria-selected','false');
    if(!loaded)await reload();
  }
  function deactivate(){
    $('card-view').hidden=true;$('list-view').hidden=false;$('editor-view').hidden=true;
    $('tab-deals').classList.add('active');$('tab-cards').classList.remove('active');
    $('tab-deals').setAttribute('aria-selected','true');$('tab-cards').setAttribute('aria-selected','false');
    notice('');
  }
  function reset(){cards=[];loaded=false;root.replaceChildren();}
  $('tab-cards').addEventListener('click',activate);
  $('tab-deals').addEventListener('click',deactivate);
  $('cards-reload').addEventListener('click',reload);
  $('cards-search').addEventListener('input',render);
  $('cards-status').addEventListener('change',render);
  window.NextBonusCardAdmin=Object.freeze({activate,deactivate,reload,reset});
})();
