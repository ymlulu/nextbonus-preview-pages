(() => {
  'use strict';

  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  let previewDialog=null;

  function closePreview(){
    if(!previewDialog) return;
    previewDialog.close();
    previewDialog.remove();
    previewDialog=null;
  }

  function openPreview(){
    if(previewDialog) return;
    const dialog=document.createElement('dialog');
    dialog.className='nb-assessment-preview-modal';
    dialog.setAttribute('aria-labelledby','nb-assessment-preview-title');
    dialog.innerHTML=`
      <button class="nb-assessment-preview-close" type="button" aria-label="关闭">×</button>
      <div class="nb-assessment-preview-body">
        <div class="nb-assessment-preview-kicker">结果示例</div>
        <h2 id="nb-assessment-preview-title">评估完成后，你会看到什么？</h2>
        <p class="nb-assessment-preview-intro">下面只是结果结构示例，不代表你当前的申请情况。</p>
        <div class="nb-assessment-preview-result">
          <div class="nb-assessment-preview-meta">示例 · 完成于今天</div>
          <strong>可以申请</strong>
          <p>系统会先给一个明确结论，再解释最重要的原因。</p>
          <div class="nb-assessment-preview-grid">
            <div><span>开卡奖励评级</span><b>史高</b></div>
            <div><span>获批可能性</span><b>较高</b></div>
            <div><span>能否拿奖励</span><b>可以</b></div>
            <div><span>长期持有价值</span><b>较高</b></div>
          </div>
        </div>
        <div class="nb-assessment-preview-foot">完整分析里还会展开申请规则、奖励资格、当前 Offer、获批因素和长期价值。</div>
      </div>`;
    dialog.addEventListener('cancel',event=>{
      event.preventDefault();
      closePreview();
    });
    dialog.addEventListener('click',event=>{
      if(event.target===dialog||event.target.closest('.nb-assessment-preview-close')) closePreview();
    });
    document.body.appendChild(dialog);
    previewDialog=dialog;
    dialog.showModal();
  }

  events.register('offer-detail',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;

      if(action==='assessment-preview'){
        openPreview();
        return {handled:true};
      }
      if(action==='annual-value-toggle'){
        ctx.state.offerAnnualValueExpanded=!ctx.state.offerAnnualValueExpanded;
        return {render:true};
      }
      if(action==='annual-value-customize'){
        ctx.state.offerAnnualValueExpanded=true;
        return {handled:true};
      }
      if(action==='assessment-start'){
        const supported=!!window.NextBonusAssessmentContract?.supported?.(ctx.state.currentOfferId);
        if(!supported) return {handled:true};
        if(!ctx.state.loggedIn){
          ctx.openLogin?.('offer-detail',{type:'assessment',offerId:ctx.state.currentOfferId},'offer-detail');
          return {handled:true};
        }
        void window.NextBonusAssessmentPage?.open?.(ctx,{restart:false});
        return {handled:true};
      }
      if(action==='assessment-restart'){
        if(window.NextBonusAssessmentContract?.supported?.(ctx.state.currentOfferId)){
          void window.NextBonusAssessmentPage?.open?.(ctx,{restart:true});
        }
        return {handled:true};
      }
      if(action==='poster'){
        ctx.state.posterIndex=Number(el.dataset.index);
        return {render:true};
      }
      if(action==='poster-step'){
        ctx.state.posterIndex=((ctx.state.posterIndex||0)+Number(el.dataset.dir)+2)%2;
        return {render:true};
      }
      return false;
    }
  });
})();
