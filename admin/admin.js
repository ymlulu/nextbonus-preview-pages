(() => {
  'use strict';
  const base=String(window.NextBonusDealsConfig?.apiBase||'').trim().replace(/\/+$/,'');
  const $=id=>document.getElementById(id);
  const form=$('deal-form'),notice=$('notice');
  const SESSION_KEY='nextbonus-deals-admin-session';
  let deals=[],editingId=null,loading=false;
  let token=sessionStorage.getItem(SESSION_KEY)||'';
  function showLogin(error=''){
    token='';
    sessionStorage.removeItem(SESSION_KEY);
    $('login-view').hidden=false;
    $('list-view').hidden=true;
    $('editor-view').hidden=true;
    $('admin-tabs').hidden=true;
    $('card-view').hidden=true;
    window.NextBonusCardAdmin?.reset?.();
    $('logout').hidden=true;
    $('login-submit').disabled=false;
    if(error)message(error,true);
  }
  function showAdmin(){
    $('login-view').hidden=true;
    $('logout').hidden=false;
    $('list-view').hidden=false;
    $('editor-view').hidden=true;
    $('card-view').hidden=true;
    $('admin-tabs').hidden=false;
    $('tab-deals').classList.add('active');
    $('tab-deals').setAttribute('aria-selected','true');
    $('tab-cards').classList.remove('active');
    $('tab-cards').setAttribute('aria-selected','false');
    message('');
  }
  const field=name=>form.elements.namedItem(name);
  function message(text,error=false){
    notice.textContent=text||'';
    notice.classList.toggle('error',!!error);
  }
  async function request(path,{method='GET',body,raw=false}={}){
    if(!/^https:\/\//.test(base)) throw Error('尚未配置 Deals API。部署 Worker 后，请在 features/deals/config.js 填入 apiBase。');
    const options={method,mode:'cors',credentials:'omit',cache:'no-store'};
    options.headers={};
    if(token && path!=='/api/admin/login')options.headers.authorization='Bearer '+token;
    if(body!==undefined){
      options.body=raw?body:JSON.stringify(body);
      options.headers['content-type']=raw?(body.type||'application/octet-stream'):'application/json';
    }
    let response;
    try{response=await fetch(base+path,options);}
    catch(_){throw Error('无法连接 Deals Worker。请检查 API 地址、CORS 和 Worker 部署状态。');}
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      if(response.status===401 && path!=='/api/admin/login'){
        showLogin('登录已过期，请重新输入密码。');
        throw Error('登录已过期');
      }
      if(response.status===403) throw Error('管理员 API 拒绝访问（403）。');
      throw Error(data.error||'HTTP '+response.status);
    }
    return data;
  }
  const dollars=cents=>Number.isSafeInteger(cents)?(cents/100).toFixed(2):'';
  function cents(text){
    const input=String(text||'').trim();
    if(!input) return null;
    if(!/^\d+(?:\.\d{1,2})?$/.test(input)) throw Error('价格最多保留两位小数');
    const [major,minor='']=input.split('.');
    const value=Number(major)*100+Number(minor.padEnd(2,'0'));
    if(!Number.isSafeInteger(value)) throw Error('价格过大');
    return value;
  }
  function setBusy(active){
    loading=active;
    $('save-deal').disabled=active;
    $('upload-image').disabled=active;
    $('reload').disabled=active;
  }
  function setUrlParam(edit){
    const url=new URL(window.location.href);
    url.search='';
    if(edit==='new')url.searchParams.set('new','1');
    else if(edit)url.searchParams.set('edit',edit);
    history.replaceState(null,'',url.pathname+url.search);
  }
  function showList(){
    editingId=null;
    $('list-view').hidden=false;
    $('editor-view').hidden=true;
    setUrlParam(null);
  }
  function openForm(deal=null){
    editingId=deal?.id||null;
    form.reset();
    for(const key of ['title','category','merchant','summary','description','rewardText','promoCode','dealUrl','affiliateUrl','imageUrl','startsOn','expiresOn','slug']){
      const node=field(key);
      if(node)node.value=deal?.[key]||'';
    }
    field('price').value=dollars(deal?.priceCents);
    field('originalPrice').value=dollars(deal?.originalPriceCents);
    field('featured').checked=deal?.featured===true;
    field('status').value=deal?.status||'draft';
    $('editor-title').textContent=editingId?'Edit Deal':'Add Deal';
    $('delete-deal').hidden=!editingId;
    $('list-view').hidden=true;
    $('editor-view').hidden=false;
    setUrlParam(editingId||'new');
    preview();
    window.scrollTo(0,0);
  }
  function preview(){
    const src=String(field('imageUrl').value||'').trim();
    const node=$('image-preview');
    if(/^https:\/\//i.test(src)){node.src=src;node.hidden=false;}
    else{node.removeAttribute('src');node.hidden=true;}
  }
  function makeCell(value,tag='td'){
    const cell=document.createElement(tag);
    cell.textContent=value??'';
    return cell;
  }
  function render(){
    const body=$('deal-rows'),query=$('filter-search').value.trim().toLowerCase();
    const status=$('filter-status').value;
    const filtered=deals.filter(deal=>(!status||deal.status===status)&&(!query||[deal.title,deal.category,deal.merchant].join(' ').toLowerCase().includes(query)));
    body.replaceChildren();
    for(const deal of filtered){
      const row=document.createElement('tr');
      const title=document.createElement('td');
      const wrap=document.createElement('div');wrap.className='deal-cell';
      const image=deal.imageUrl?document.createElement('img'):document.createElement('span');
      image.className='deal-thumb'+(deal.imageUrl?'':' deal-thumb-placeholder');
      if(deal.imageUrl){image.src=deal.imageUrl;image.alt='';image.loading='lazy';}
      else image.textContent='NB';
      const name=document.createElement('div');
      const strong=document.createElement('strong');strong.textContent=deal.title;
      const sub=document.createElement('small');sub.textContent=deal.rewardText||deal.summary||'';
      name.append(strong,sub);wrap.append(image,name);title.append(wrap);row.append(title);
      const context=document.createElement('td');context.textContent=deal.category;
      const merchant=document.createElement('small');merchant.textContent=deal.merchant;context.append(merchant);row.append(context);
      const statusCell=document.createElement('td');const badge=document.createElement('span');badge.className='status '+deal.status;badge.textContent=deal.status;statusCell.append(badge);row.append(statusCell);
      row.append(makeCell((deal.updatedAt||'').slice(0,10)));
      row.append(makeCell(deal.clickCount??0));
      const action=document.createElement('td'),buttons=document.createElement('div');buttons.className='table-actions';
      const edit=document.createElement('button');edit.className='secondary';edit.textContent='Edit';
      edit.type='button';edit.addEventListener('click',()=>openForm(deal));
      const duplicate=document.createElement('button');duplicate.className='secondary';duplicate.textContent='Copy';
      duplicate.type='button';duplicate.addEventListener('click',()=>openForm({...deal,id:null,slug:'',title:deal.title+' (Copy)',status:'draft',featured:false}));
      buttons.append(edit,duplicate);action.append(buttons);row.append(action);body.append(row);
    }
    if(!filtered.length){
      const row=document.createElement('tr');const cell=makeCell(deals.length?'没有匹配的 Deals':'暂无 Deals，点击 Add Deal 添加第一条。');
      cell.colSpan=6;row.append(cell);body.append(row);
    }
    $('count').textContent='显示 '+filtered.length+' / '+deals.length+' 条';
  }
  async function reload(){
    if(loading)return;
    setBusy(true);
    try{
      const all=[];let offset=0,pages=0;
      while(pages++<100){
        const res=await request('/api/admin/deals?limit=100&offset='+offset);
        if(!Array.isArray(res.items)) throw Error('API response missing items');
        all.push(...res.items);
        if(res.nextOffset==null)break;
        if(!Number.isSafeInteger(res.nextOffset)||res.nextOffset<=offset)throw Error('Invalid pagination');
        offset=res.nextOffset;
      }
      deals=all;render();message('');
    }catch(error){
      message(error.message,true);
      $('deal-rows').replaceChildren();
      const tr=document.createElement('tr'),td=makeCell('无法读取后台 Deals：'+error.message);
      td.colSpan=6;tr.append(td);$('deal-rows').append(tr);
    }finally{setBusy(false);}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(loading)return;
    const body={title:field('title').value.trim(),category:field('category').value.trim()||'其他',
      merchant:field('merchant').value.trim(),summary:field('summary').value.trim(),description:field('description').value.trim(),
      rewardText:field('rewardText').value.trim(),promoCode:field('promoCode').value.trim(),
      dealUrl:field('dealUrl').value.trim(),affiliateUrl:field('affiliateUrl').value.trim(),
      imageUrl:field('imageUrl').value.trim(),startsOn:field('startsOn').value||null,expiresOn:field('expiresOn').value||null,
      status:field('status').value,featured:field('featured').checked,currency:'USD'};
    const slug=field('slug').value.trim();
    if(slug)body.slug=slug;
    try{
      body.priceCents=cents(field('price').value);
      body.originalPriceCents=cents(field('originalPrice').value);
      setBusy(true);
      const path=editingId?'/api/admin/deals/'+encodeURIComponent(editingId):'/api/admin/deals';
      await request(path,{method:editingId?'PUT':'POST',body});
      setBusy(false);
      showList();
      await reload();
      message('已保存 Deal。Published 状态会自动出现在 Discover。');
    }catch(error){message('保存失败：'+error.message,true);}
    finally{setBusy(false);}
  });
  $('upload-image').addEventListener('click',async()=>{
    const file=$('image-file').files[0];
    if(!file){message('请先选择图片。',true);return;}
    if(file.size>5*1024*1024){message('图片不能超过 5 MB',true);return;}
    setBusy(true);
    try{
      const result=await request('/api/admin/images',{method:'POST',body:file,raw:true});
      field('imageUrl').value=result.url;
      preview();message('图片已上传到 R2。保存 Deal 后关联这张图片。');
    }catch(error){message('上传失败：'+error.message,true);}
    finally{setBusy(false);}
  });
  $('delete-deal').addEventListener('click',async()=>{
    if(!editingId||loading)return;
    if(!confirm('确定永久删除这条 Deal？'))return;
    setBusy(true);
    try{
      await request('/api/admin/deals/'+encodeURIComponent(editingId),{method:'DELETE'});
      setBusy(false);
      showList();await reload();message('Deal 已删除。');
    }catch(error){message('删除失败：'+error.message,true);}
    finally{setBusy(false);}
  });
  $('new-deal').addEventListener('click',()=>{message('');openForm();});
  $('cancel-edit').addEventListener('click',showList);
  $('cancel-edit-bottom').addEventListener('click',showList);
  $('reload').addEventListener('click',reload);
  $('filter-search').addEventListener('input',render);
  $('filter-status').addEventListener('change',render);
  $('image-url').addEventListener('input',preview);

  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const password=$('admin-password').value;
    $('login-submit').disabled=true;
    try{
      const result=await request('/api/admin/login',{method:'POST',body:{password}});
      if(!result.token)throw Error('登录响应缺少会话信息');
      token=result.token;
      sessionStorage.setItem(SESSION_KEY,token);
      $('admin-password').value='';
      showAdmin();
      await reload();
    }catch(error){
      message(error.message,true);
    }finally{
      $('login-submit').disabled=false;
    }
  });
  $('logout').addEventListener('click',()=>{showLogin();message('已退出后台。');});
  (async()=>{
    if(!token){showLogin();return;}
    try{
      await request('/api/admin/session');
      showAdmin();
      await reload();
    }catch(error){
      showLogin('请输入管理密码。');
      return;
    }
    const params=new URLSearchParams(location.search);
    if(params.has('new'))openForm();
    else if(params.has('edit')){
      const id=params.get('edit');
      let deal=deals.find(row=>row.id===id);
      if(!deal){
        try{deal=(await request('/api/admin/deals/'+encodeURIComponent(id))).item;}
        catch(error){message(error.message,true);}
      }
      if(deal)openForm(deal);
    }
  })();
})();
