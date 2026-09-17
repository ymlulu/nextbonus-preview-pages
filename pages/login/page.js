(() => {
  'use strict';
  window.NextBonusPageRegistry.register('login',function(ctx){
  const { state, esc }=ctx;

    if(state.loggedIn){ state.route=state.returnSource||'discover'; return ctx.renderRoute('discover'); }
    return `<div class="content narrow login-page"><div class="login-wrap"><div class="login-card mock-login-card"><div class="login-logo"><span class="nb-mini">NB</span></div><h1>登录 NextBonus</h1><p>继续查看你的收藏、产品和提醒。</p><div class="login-actions"><button class="btn primary login-primary" data-action="login-success">继续登录</button><button class="btn secondary" data-action="login-cancel">返回</button></div><div class="legal">登录后将回到你刚才想去的位置。</div></div></div></div>`;
  
  });
})();
