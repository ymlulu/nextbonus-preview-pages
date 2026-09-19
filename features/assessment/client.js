(function(root){
  'use strict';
  const CHANNEL='nextbonus-assessment-v1';
  const DEFAULT_BRIDGE_URL='https://ymlulu.github.io/nextbonus-assessment-test/bridge.html';
  const REQUEST_TIMEOUT_MS=12000;
  let frame=null,frameReady=null,seq=0;
  const pending=new Map();

  function bridgeUrl(){return root.NB_ASSESSMENT_BRIDGE_URL||DEFAULT_BRIDGE_URL}
  function bridgeOrigin(){return new URL(bridgeUrl(),root.location&&root.location.href||undefined).origin}
  function requestId(){seq+=1;return `nb-assessment-${Date.now()}-${seq}`}

  function ensureFrame(){
    if(frameReady)return frameReady;
    frameReady=new Promise((resolve,reject)=>{
      frame=document.createElement('iframe');
      frame.src=bridgeUrl();
      frame.title='NextBonus Assessment Bridge';
      frame.setAttribute('aria-hidden','true');
      frame.tabIndex=-1;
      frame.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-10000px;top:-10000px;';
      frame.onload=()=>resolve(frame);
      frame.onerror=()=>reject(new Error('Assessment bridge failed to load'));
      document.body.appendChild(frame);
    });
    return frameReady;
  }

  function call(method,params){
    return ensureFrame().then(current=>new Promise((resolve,reject)=>{
      const id=requestId();
      const timer=setTimeout(()=>{
        pending.delete(id);
        reject(new Error(`Assessment bridge timeout: ${method}`));
      },REQUEST_TIMEOUT_MS);
      pending.set(id,{resolve,reject,timer});
      current.contentWindow.postMessage({channel:CHANNEL,request_id:id,method,params:params||{}},bridgeOrigin());
    }));
  }

  root.addEventListener('message',event=>{
    if(event.origin!==bridgeOrigin())return;
    const message=event.data;
    if(!message||message.channel!==CHANNEL||!message.request_id)return;
    const item=pending.get(message.request_id);
    if(!item)return;
    clearTimeout(item.timer);pending.delete(message.request_id);
    if(message.ok)item.resolve(message.result);
    else{
      const error=new Error(message.error&&message.error.message||'Assessment request failed');
      error.code=message.error&&message.error.code||'ASSESSMENT_ERROR';
      error.status=message.status||0;
      item.reject(error);
    }
  });

  root.AssessmentClient={
    transport:'static-postMessage',
    bridgeUrl,
    getVersion(){return call('getVersion')},
    getQuestionnaire(productId,locale='zh-CN'){
      return call('getProductAssessment',{product_id:productId,locale});
    },
    getOfferHistory(productId,evaluationDate){
      return call('getOfferHistory',{product_id:productId,evaluation_date:evaluationDate});
    },
    getOfferTiming(productId){
      return call('getOfferTiming',{product_id:productId});
    },
    evaluate({productId,evaluationDate,answers,locale='zh-CN'}){
      return call('evaluate',{request:{product_id:productId,evaluation_date:evaluationDate,answers,locale}});
    }
  };
})(window);