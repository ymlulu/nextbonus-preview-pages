(() => {
  'use strict';

  function run(root=document){
    window.NextBonusUserFacingCopy?.polish?.(root);
    window.NextBonusTerminologyUI?.polish?.(root);
    window.NextBonusTypography?.sync?.(root);
    window.NextBonusSemanticTypography?.sync?.(root);
  }

  let queued=false;
  function schedule(root=document){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      run(root);
    });
  }

  window.NextBonusUIFinalize=Object.freeze({run,schedule});
})();