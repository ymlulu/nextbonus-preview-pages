(() => {
  'use strict';

  // User-facing terminology contract:
  // 关注 = the user deliberately follows an Offer.
  // 钱包 = products/accounts/memberships the user already owns or uses.
  // 提醒 = the reminder destination / notification collection.
  // 待处理 = a concrete reminder item that still needs action.
  const EXACT = new Map([
    ['继续查看你的收藏、产品和提醒。', '继续查看你的关注、钱包和提醒。'],
    ['继续查看你的关注、产品和提醒。', '继续查看你的关注、钱包和提醒。'],
    ['返回我的产品', '返回钱包'],
    ['登录后保存到“我的”', '登录后保存到钱包'],
    ['登录后保存到「我的」', '登录后保存到钱包'],
    ['添加到“我的”并开始追踪', '添加到钱包并开始追踪'],
    ['添加到「我的」并开始追踪', '添加到钱包并开始追踪'],
    ['已添加到“我的”', '已添加到钱包'],
    ['已添加到「我的」', '已添加到钱包'],
    ['这个会籍计划已经在“我的产品”中', '这个会籍已经在钱包里'],
    ['这个会籍计划已经在「我的产品」中', '这个会籍已经在钱包里'],
    ['这次收藏机会已经结束或当前不可用。', '这个 Offer 已结束或当前不可用。'],
    ['目前没有需要处理的事项', '暂无待处理事项'],
    ['搜索你的产品、银行、信用卡或账户…', '搜索钱包里的产品…'],
    ['Pending', '审核中'],
    ['我没有提交申请', '没有提交申请'],
    ['稍后确认', '稍后再说']
  ]);

  const PARTIAL = [
    [/需要关注/g, '待处理'],
    [/已取消收藏/g, '已取消关注'],
    [/取消收藏/g, '取消关注'],
    [/已收藏/g, '已关注'],
    [/收藏/g, '关注'],
    [/加入[“「]我的[”」]并开始追踪奖励/g, '加入钱包并开始追踪奖励'],
    [/把这张卡加入[“「]我的[”」]/g, '把这张卡加入钱包'],
    [/把产品和本次奖励追踪一起加入[“「]我的[”」]/g, '把它和这次奖励追踪一起加入钱包'],
    [/回到[“「]我的产品[”」]/g, '回到钱包']
  ];

  function rewrite(value) {
    let text = String(value ?? '');
    if (EXACT.has(text)) text = EXACT.get(text);
    for (const [pattern, replacement] of PARTIAL) text = text.replace(pattern, replacement);
    return text;
  }

  function rewriteTextNode(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script,style,template')) return;
    const before = node.nodeValue;
    const after = rewrite(before);
    if (after !== before) node.nodeValue = after;
  }

  function rewriteAttributes(root) {
    const nodes = root.querySelectorAll?.('[aria-label],[title],[placeholder]') || [];
    nodes.forEach(el => {
      for (const attr of ['aria-label', 'title', 'placeholder']) {
        if (!el.hasAttribute(attr)) continue;
        const before = el.getAttribute(attr);
        const after = rewrite(before);
        if (after !== before) el.setAttribute(attr, after);
      }
    });
  }

  function setText(selector, text, root = document) {
    root.querySelectorAll?.(selector).forEach(el => {
      if ((el.textContent || '').trim() !== text) el.textContent = text;
    });
  }

  function removeNode(node) {
    if (node?.parentNode) node.parentNode.removeChild(node);
  }

  function normalizeApplicationHandoff(root = document) {
    const handoff = root.querySelector?.('#nb-application-handoff-root') || document.getElementById('nb-application-handoff-root');
    const modal = handoff?.querySelector('.nb-ah-modal');
    if (!modal) return;

    const title = modal.querySelector('.nb-ah-title');
    const sub = modal.querySelector('.nb-ah-sub');
    const note = modal.querySelector('.nb-ah-note');
    const body = modal.querySelector('.nb-ah-body');
    const choice = modal.querySelector('[data-handoff-action="not-submitted"]');
    const approvedSubmit = modal.querySelector('[data-handoff-action="approved-submit"]');
    const pendingButton = modal.querySelector('[data-handoff-action="result"][data-result="pending"]');
    const deniedButton = modal.querySelector('[data-handoff-action="result"][data-result="denied"]');
    const approvedButton = modal.querySelector('[data-handoff-action="result"][data-result="approved"]');

    modal.querySelectorAll('[data-handoff-action="defer"]').forEach(button => {
      if (button.matches('.nb-ah-close')) button.setAttribute('aria-label', '稍后再说');
      else button.textContent = '稍后再说';
    });

    if (choice && pendingButton && deniedButton && approvedButton) {
      if (title) title.textContent = '申请结果怎么样？';
      removeNode(sub);
      pendingButton.textContent = '审核中';
      approvedButton.textContent = '已通过';
      deniedButton.textContent = '未通过';
      choice.textContent = '没有提交申请';
      removeNode(note);
      return;
    }

    if (approvedSubmit) {
      const label = modal.querySelector('label[for="nb-ah-anchor"]');
      const input = modal.querySelector('#nb-ah-anchor');
      const isAccount = /开户/.test(label?.textContent || '');
      const question = isAccount ? '哪天开户的？' : '哪天获批的？';
      if (title) title.textContent = question;
      removeNode(sub);
      if (label) {
        label.textContent = question;
        label.style.display = 'none';
      }
      if (input) input.setAttribute('aria-label', question);
      removeNode(note);
      approvedSubmit.textContent = '添加到钱包';
      modal.querySelectorAll('[data-handoff-action="hide"]').forEach(button => {
        if (!button.matches('.nb-ah-close')) button.textContent = '稍后再说';
      });
      return;
    }

    const currentTitle = (title?.textContent || '').trim();
    if (currentTitle === '申请还在审核中') {
      const hasVerifiedStatusAction = !!modal.querySelector('[data-handoff-action="external"], a[href^="tel:"]');
      if (note) {
        if (hasVerifiedStatusAction) removeNode(note);
        else note.textContent = '目前还没有确认可靠的状态查询方式。你可以先保存，之后再回来更新结果。';
      }
      modal.querySelectorAll('[data-handoff-action="hide"]').forEach(button => {
        if (!button.matches('.nb-ah-close')) button.textContent = '稍后再说';
      });
      return;
    }

    if (currentTitle === '这次申请没有通过') {
      const recon = [...modal.querySelectorAll('a[href^="tel:"]')].find(link => /重新审核|Recon|recon/i.test(link.textContent || '')) || null;
      if (recon) {
        recon.textContent = '联系人工重新审核';
        removeNode(note);
      } else if (note) {
        note.textContent = '部分银行可以在被拒后联系人工重新审核，目前还没有确认可靠的联系方式。';
      }
      modal.querySelectorAll('[data-handoff-action="hide"]').forEach(button => {
        if (!button.matches('.nb-ah-close')) button.textContent = '稍后再说';
      });
      return;
    }

    if (modal.querySelector('[data-handoff-action="login"]')) {
      if (title) title.textContent = '登录后保存到钱包';
      if (note) note.textContent = '登录后即可把这个产品添加到钱包，并保存相关奖励进度和提醒。';
    }

    if (body) {
      body.querySelectorAll('.nb-ah-note').forEach(node => {
        const text = node.textContent || '';
        if (/Application Follow-up Registry|Registry|Preview|Context|UserProduct|Product\s*\/\s*Offer\s*\/\s*Assessment/i.test(text)) removeNode(node);
      });
    }
  }

  function normalizeInformationArchitecture(root = document) {
    setText('.attention-page .mock-page-title', '提醒', root);
    const walletSearch = root.querySelector?.('#product-search');
    if (walletSearch) walletSearch.setAttribute('placeholder', '搜索钱包里的产品…');

    root.querySelectorAll?.('.v4-needs-attention .v4-section-head h2, .v4-pd-attention .v4-section-head h2').forEach(heading => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(rewriteTextNode);
    });

    setText('[data-action="open-all-attention"]', '查看全部 ›', root);
    setText('.v4-pd-attention .mock-link[data-action="attention-for-product"]', '查看全部', root);
    setText('.login-page .login-card p', '继续查看你的关注、钱包和提醒。', root);
    normalizeApplicationHandoff(root);
  }

  function polish(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(rewriteTextNode);
    rewriteAttributes(root);
    normalizeInformationArchitecture(root.ownerDocument || document);
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      polish(document.body);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => polish(document.body), { once:true });
  } else {
    polish(document.body);
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true,
    subtree:true,
    characterData:true
  });

  window.NextBonusTerminologyUI = Object.freeze({ polish, rewrite });
})();
