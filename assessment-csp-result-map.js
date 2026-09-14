(function(root){
  'use strict';
  root.NBCSPResultMap={
    toPreview(r){
      const d=r.dimensions||{},p=r.report||{},c=r.decision||{};
      return {meta:r.evaluation_date||'',recommendation:c.recommended_action||'',shortSummary:c.summary||'',bonus:d.offer?.rating||'',approval:d.application?.approval_label||'',eligible:d.bonus?.label||'',longTerm:d.long_term?.label||'',isSample:false,report:{applicationCopy:p.application_text||'',bonusCopy:p.bonus_text||'',offerCopy:p.offer_text||'',approvalCopy:p.approval_text||'',longCopy:p.long_term_text||''}};
    }
  };
})(window);
