(function(root){
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const esc=v=>String(v??'');
  const svg=(tag,attrs,text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs||{}))n.setAttribute(k,v);if(text!=null)n.textContent=text;return n;};
  const div=(cls,text)=>{const n=document.createElement('div');if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
  const compact=n=>Number.isFinite(n)&&Math.abs(n)>=1000&&n%1000===0?`${n/1000}k`:new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n||0);
  function offerLabel(raw){
    return esc(raw).replace(/^(?:up to|as high as|最高可达)\s*/i,'').replace(/([0-9][0-9,]*)\s*(?:points?|pts?)\b/ig,(_,num)=>`${compact(Number(num.replace(/,/g,'')))} points`);
  }
  function month(ms){const d=new Date(ms);return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;}
  function monthStart(ms,delta){const d=new Date(ms);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+delta,1);}
  function positionText(current,low,high){if(!(Number.isFinite(current)&&Number.isFinite(low)&&Number.isFinite(high)))return '无法判断';if(high<=low)return '历史高位';const p=(current-low)/(high-low);return p>=.85?'接近高位':p<=.2?'接近低位':'中间水平';}

  function render(host,payload,evaluationDate){
    if(!host)return;
    host.replaceChildren();
    const current=payload&&payload.current;
    const currentTime=Date.parse(evaluationDate||current?.evaluation_date);
    if(!current||current.display_eligible!==true||!Number.isFinite(current.comparable_value)||!Number.isFinite(currentTime)){
      host.hidden=true;return;
    }
    const source=(payload.history||[]).filter(x=>x.display_eligible===true&&Number.isFinite(x.comparable_value)&&x.bonus_label&&Number.isFinite(Date.parse(x.date))&&Date.parse(x.date)<=currentTime);
    if(!source.length){host.hidden=true;return;}
    host.hidden=false;
    const groups=new Map();
    for(const item of source){const key=`${item.date}:${item.comparable_value}`;if(!groups.has(key))groups.set(key,{...item,records:[]});groups.get(key).records.push(item);}
    const grouped=[...groups.values()].sort((a,b)=>a.date.localeCompare(b.date));
    const conflictDates=new Set(grouped.filter((e,i)=>grouped.some((f,j)=>i!==j&&e.date===f.date)).map(e=>e.date));
    const history=grouped.filter(e=>!conflictDates.has(e.date));
    if(!history.length){host.hidden=true;return;}
    const now={date:new Date(currentTime).toISOString().slice(0,10),date_label:month(currentTime),bonus_label:offerLabel(current.offer_label),comparable_value:current.comparable_value,current:true};
    const points=[...history,now];
    const high=points.reduce((a,b)=>b.comparable_value>a.comparable_value?b:a);
    const low=points.reduce((a,b)=>b.comparable_value<a.comparable_value?b:a);

    const stats=div('nb-oh-stats');
    [['当前奖励',offerLabel(now.bonus_label)],['历史高位',offerLabel(high.bonus_label)],['历史低位',offerLabel(low.bonus_label)],['所处位置',positionText(now.comparable_value,low.comparable_value,high.comparable_value)]].forEach(([k,v])=>{const c=div('nb-oh-stat');c.append(div('nb-oh-stat-name',k),div('nb-oh-stat-value',v));stats.append(c);});
    const bar=div('nb-oh-toolbar');bar.append(div('nb-oh-title','历史奖励走势'));
    const ranges=div('nb-oh-ranges');const b24=document.createElement('button'),ball=document.createElement('button');b24.type=ball.type='button';b24.className='active';ball.className='';b24.textContent='最近 24 个月';ball.textContent='全部历史';ranges.append(b24,ball);bar.append(ranges);
    const stage=div('nb-oh-stage'),details=div('nb-oh-details'),note=div('nb-oh-note','奖励曲线只展示 Assessment 已审核并可比较的历史记录，不会改变当前评估结论。');
    host.append(stats,bar,stage,details,note);

    function show(p){const rows=p.records||[p];details.textContent=`${p.current?'当前':p.date_label} · ${rows.map(r=>offerLabel(r.bonus_label)).join(' / ')}${rows.some(r=>r.spend_requirement)?' · '+rows.map(r=>r.spend_requirement).filter(Boolean).join(' / '):''}`;}
    show(now);
    let mode='24m';
    function draw(){
      stage.replaceChildren();
      const cutoff=monthStart(currentTime,-24);
      const visible=mode==='24m'?history.filter(p=>Date.parse(p.date)>=cutoff):history.slice();
      const carrySource=mode==='24m'?history.filter(p=>Date.parse(p.date)<cutoff).slice(-1)[0]:null;
      const carry=carrySource?{...carrySource,date:new Date(cutoff).toISOString().slice(0,10),carry:true}:null;
      if(!visible.length&&!carry){stage.append(div('nb-oh-empty','这个时间范围内暂无足够历史记录。'));return;}
      const width=Math.max(320,host.clientWidth||700),height=250,left=62,right=width-24,top=34,bottom=height-42;
      const all=carry?[carry,...visible,now]:[...visible,now];
      const firstTime=visible.length?Date.parse(visible[0].date):cutoff;
      const startTime=mode==='24m'?(carry?cutoff:firstTime):firstTime;
      const span=Math.max(1,high.comparable_value-low.comparable_value),vmin=low.comparable_value-span*.18,vmax=high.comparable_value+span*.08;
      const x=p=>p.current?right:left+(Date.parse(p.date)-startTime)/(currentTime-startTime||1)*(right-left);
      const y=p=>bottom-(p.comparable_value-vmin)/(vmax-vmin||1)*(bottom-top);
      const root=svg('svg',{viewBox:`0 0 ${width} ${height}`,width:'100%',height,role:'img','aria-label':'历史奖励走势图'});
      for(const ref of [high,now,low]){const yy=bottom-(ref.comparable_value-vmin)/(vmax-vmin||1)*(bottom-top);root.append(svg('line',{x1:left,x2:right,y1:yy,y2:yy,class:'nb-oh-grid'}));root.append(svg('text',{x:left-8,y:yy+4,'text-anchor':'end',class:'nb-oh-axis'},offerLabel(ref.bonus_label)));}
      let d=`M ${x(all[0])} ${y(all[0])}`;for(const p of all.slice(1))d+=` H ${x(p)} V ${y(p)}`;root.append(svg('path',{d,class:'nb-oh-line'}));
      for(const p of all){if(p.carry)continue;const g=svg('g',{class:`nb-oh-node${p.current?' current':''}`,tabindex:'0',transform:`translate(${x(p)} ${y(p)})`});g.append(svg('circle',{r:p.current?6:5,class:'nb-oh-dot'}));const activate=()=>show(p);g.addEventListener('click',activate);g.addEventListener('focus',activate);root.append(g);}
      for(const t of [startTime,startTime+(currentTime-startTime)/2,currentTime]){const xx=left+(t-startTime)/(currentTime-startTime||1)*(right-left);root.append(svg('text',{x:xx,y:height-14,'text-anchor':t===currentTime?'end':t===startTime?'start':'middle',class:'nb-oh-axis'},t===currentTime?'当前':month(t)));}
      stage.append(root);
    }
    function setMode(next){mode=next;b24.classList.toggle('active',mode==='24m');ball.classList.toggle('active',mode==='all');draw();}
    b24.addEventListener('click',()=>setMode('24m'));ball.addEventListener('click',()=>setMode('all'));
    draw();
  }
  root.NextBonusAssessmentOfferHistoryChart=Object.freeze({render});
})(window);
