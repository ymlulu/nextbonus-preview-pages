(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NextBonusBonusTaskRules=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function dateParts(value){
    const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match)return null;
    const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
    const date=new Date(Date.UTC(year,month-1,day));
    if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
    return {year,month,day};
  }

  function iso(year,month,day){
    const pad=value=>String(value).padStart(2,'0');
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  function daysInMonth(year,month){
    return new Date(Date.UTC(year,month,0)).getUTCDate();
  }

  function addMonths(value,months){
    const parts=dateParts(value);if(!parts||!Number.isInteger(months))return null;
    const absolute=parts.year*12+(parts.month-1)+months;
    const year=Math.floor(absolute/12),month=(absolute%12)+1;
    const day=Math.min(parts.day,daysInMonth(year,month));
    return iso(year,month,day);
  }

  function addDays(value,days){
    const parts=dateParts(value);if(!parts||!Number.isInteger(days))return null;
    const date=new Date(Date.UTC(parts.year,parts.month-1,parts.day));
    date.setUTCDate(date.getUTCDate()+days);
    return iso(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate());
  }

  function extractOffset(value){
    const text=String(value||'');
    let match=text.match(/(\d+)\s*(?:months?|mos?\.?|个月)/i);
    if(match)return {unit:'months',value:Number(match[1])};
    match=text.match(/(\d+)\s*(?:days?|天|日)(?:内|以内)?/i);
    if(match)return {unit:'days',value:Number(match[1])};
    if(/\b(?:within\s+(?:the\s+)?)?first[-\s]?year\b|首年|第一年/i.test(text))return {unit:'months',value:12};
    return null;
  }

  function offsetDueDate(openedDate,offset){
    if(!offset)return null;
    if(offset.unit==='months')return addMonths(openedDate,offset.value);
    if(offset.unit==='days')return addDays(openedDate,offset.value);
    return null;
  }

  function nonActionGrant(clause){
    return /\bapproval\s+cash\b|\bupon\s+approval\b|\bat\s+approval\b|获批(?:后|时|即).*(?:到账|奖励|现金)/i.test(String(clause||''));
  }

  function splitClauses(requirement){
    const text=String(requirement||'').trim();
    if(!text)return [];
    const semicolonParts=text.split(/\s*[;；]\s*/).filter(Boolean);
    return semicolonParts.flatMap(part=>{
      const pieces=part.split(/\s+\+\s+|\s*·\s*/).map(item=>item.trim()).filter(Boolean);
      if(pieces.length<=1)return pieces;
      const safeToSplit=pieces.every(piece=>nonActionGrant(piece)||!!extractOffset(piece));
      return safeToSplit?pieces:[part];
    });
  }

  function moneyToken(value){
    const match=String(value||'').match(/\$\s*\d[\d,]*(?:\.\d+)?\+?/);
    return match?match[0].replace(/\s+/g,' '):null;
  }

  function cleanLabel(clause,category){
    const original=String(clause||'').trim();
    if(!original)return '';
    const money=moneyToken(original);
    const isCard=category==='信用卡'||category==='credit_card';
    if(isCard&&money&&(/消费|spend/i.test(original)||/^\$\s*\d/.test(original)))return `消费 ${money}`;
    return original
      .replace(/^\s*\d+\s*(?:months?|mos?\.?|个月|days?|天|日)(?:内|以内)?\s*/i,'')
      .replace(/\s*\/\s*\d+\s*(?:months?|mos?\.?|个月|days?|天|日)(?:内|以内)?\s*/i,' ')
      .replace(/\s+/g,' ')
      .replace(/^[-–—,:，：]+|[-–—,:，：]+$/g,'')
      .trim()||original;
  }

  function displayDate(value){
    const parts=dateParts(value);return parts?`${parts.year} 年 ${parts.month} 月 ${parts.day} 日`:String(value||'');
  }

  function buildPlan(requirement,openedDate,options={}){
    const raw=String(requirement||'').trim();
    if(!raw)return {tasks:[],dueDate:null,distinctDueDates:0,hasRelativeDeadline:false,needsAnchorDate:false};
    const anchorValid=!!dateParts(openedDate);
    const globalOffset=extractOffset(raw);
    const clauses=splitClauses(raw);
    const tasks=[];
    let index=0;
    for(const clause of clauses){
      if(nonActionGrant(clause))continue;
      const ownOffset=extractOffset(clause);
      const offset=ownOffset||(clauses.length===1?globalOffset:null);
      const dueDate=anchorValid&&offset?offsetDueDate(openedDate,offset):null;
      const baseLabel=cleanLabel(clause,options.category);
      if(!baseLabel)continue;
      const label=dueDate?`${baseLabel} · 截止 ${displayDate(dueDate)}`:baseLabel;
      tasks.push({id:`auto${++index}`,label,dueDate,offset:offset?{...offset}:null,sourceText:clause});
    }
    if(!tasks.length&&!nonActionGrant(raw)){
      const offset=globalOffset,dueDate=anchorValid&&offset?offsetDueDate(openedDate,offset):null;
      tasks.push({id:'auto1',label:dueDate?`${raw} · 截止 ${displayDate(dueDate)}`:raw,dueDate,offset:offset?{...offset}:null,sourceText:raw});
    }
    tasks.sort((a,b)=>{
      if(a.dueDate&&b.dueDate)return a.dueDate.localeCompare(b.dueDate);
      if(a.dueDate)return -1;
      if(b.dueDate)return 1;
      return 0;
    });
    tasks.forEach((task,taskIndex)=>{task.id=`auto${taskIndex+1}`;});
    const dueDates=tasks.map(task=>task.dueDate).filter(Boolean);
    const distinct=[...new Set(dueDates)];
    const hasRelativeDeadline=tasks.some(task=>!!task.offset);
    const unresolvedAnchorDate=hasRelativeDeadline&&!anchorValid;
    return{
      tasks:unresolvedAnchorDate?tasks.map(task=>({...task,dueDate:null})):tasks,
      dueDate:unresolvedAnchorDate?null:(distinct[0]||null),
      distinctDueDates:unresolvedAnchorDate?0:distinct.length,
      hasRelativeDeadline:unresolvedAnchorDate?false:hasRelativeDeadline,
      needsAnchorDate:false,
      unresolvedAnchorDate
    };
  }

  return Object.freeze({dateParts,addMonths,addDays,extractOffset,splitClauses,buildPlan,displayDate});
});