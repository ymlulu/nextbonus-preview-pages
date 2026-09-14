(function(root){
  'use strict';
  const K='nextbonus-local-v8-state';
  const read=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(_){return {}}};
  const write=x=>localStorage.setItem(K,JSON.stringify(x));
  function step(){const m=(document.querySelector('.assessment-kicker')?.textContent||'').match(/(\d+)\/(\d+)/);return m?Number(m[1]):0}
  function isCsp(){return (document.querySelector('.assessment-kicker')?.textContent||'').includes('Chase Sapphire Preferred')}
  async function submit(){
    const state=read(),draft=state.assessmentDraft;if(!draft)return;
    const button=document.querySelector('[data-action="assessment-next"]');if(button){button.disabled=true;button.textContent='正在生成…'}
    try{
      const input=root.NBCSPCanonicalMap.fromLegacy(draft.answers||{},root.NBCSPQ6C?.value||'UNKNOWN');
      const raw=await root.AssessmentClient.evaluate({productId:'chase_sapphire_preferred',evaluationDate:new Date().toISOString().slice(0,10),answers:input});
      const result=root.NBCSPResultMap.toPreview(raw),next=read();
      next.assessmentResults=next.assessmentResults||{};next.assessmentResults['chase-sapphire']=result;
      next.assessmentDraft={offerId:'chase-sapphire',step:7,answers:draft.answers||{},completed:true,result};
      next.route='assessment';write(next);location.reload();
    }catch(error){if(button){button.disabled=false;button.textContent='查看结果'}console.error(error)}
  }
  document.addEventListener('click',event=>{
    const next=event.target.closest('[data-action="assessment-next"]');
    if(next&&isCsp()&&step()===8){event.preventDefault();event.stopImmediatePropagation();submit()}
  },true);
})(window);
