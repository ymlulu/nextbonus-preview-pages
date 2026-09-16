(() => {
  'use strict';

  const STYLE_ID = 'nextbonus-navigation-ia-style';
  const root = document.getElementById('app');
  const WALLET_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6.5" width="17" height="12" rx="2.5"></rect><path d="M6 6.5V5.8A2.3 2.3 0 0 1 8.3 3.5h8.2"></path><path d="M15.5 11h5v3.5h-5a1.75 1.75 0 0 1 0-3.5z"></path></svg>';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .nb-account-divider{display:none}
      @media (min-width:781px){
        .sidebar .nav{flex:1;min-height:0}
        .sidebar .nav>.nb-account-divider{
          display:block;
          flex:0 0 auto;
          height:1px;
          background:rgba(214,220,230,.82);
          margin:0 10px 10px;
          margin-top:auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setNavLabel(item, label) {
    const node = item?.querySelector('.nav-label');
    if (node && node.textContent !== label) node.textContent = label;
  }

  function setWalletIcon(item) {
    const node = item?.querySelector('.nav-icon');
    if (!node || node.dataset.nbWalletIcon === '1') return;
    node.innerHTML = WALLET_ICON;
    node.dataset.nbWalletIcon = '1';
  }

  function syncAccountRegion(nav) {
    const account = nav.querySelector(':scope > .account-menu');
    const login = nav.querySelector(':scope > .login-item[data-route="login"]');
    const authEntry = account || login;
    let divider = nav.querySelector(':scope > .nb-account-divider');

    if (!authEntry) {
      divider?.remove();
      return;
    }

    if (!divider) {
      divider = document.createElement('div');
      divider.className = 'nb-account-divider';
      divider.setAttribute('aria-hidden', 'true');
    }

    if (divider.nextElementSibling !== authEntry) nav.insertBefore(divider, authEntry);
  }

  function syncVisibleCopy() {
    const nav = root?.querySelector('.sidebar .nav');
    if (nav) {
      const follow = nav.querySelector('.nav-item[data-route="wishlist"]');
      const wallet = nav.querySelector('.nav-item[data-route="products"]');
      setNavLabel(follow, '关注');
      setNavLabel(wallet, '钱包');
      setWalletIcon(wallet);
      syncAccountRegion(nav);
    }

    const walletTitle = root?.querySelector('.v4-products-page .v4-products-head h1');
    if (walletTitle && walletTitle.textContent !== '钱包') walletTitle.textContent = '钱包';

    root?.querySelectorAll('.detail-back-button').forEach(button => {
      const label = button.querySelector('span:last-child');
      if (label?.textContent === '返回收藏') label.textContent = '返回关注';
    });
  }

  function sync() {
    ensureStyles();
    syncVisibleCopy();
  }

  if(window.NextBonusUICommit){
    window.NextBonusUICommit.register('navigation-ia',sync);
  }else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync, { once:true });
  } else {
    sync();
  }
})();
