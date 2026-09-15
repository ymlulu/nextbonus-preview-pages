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
    ['目前没有需要处理的事项', '暂无待处理事项']
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

  function normalizeInformationArchitecture(root = document) {
    setText('.attention-page .mock-page-title', '提醒', root);

    root.querySelectorAll?.('.v4-needs-attention .v4-section-head h2, .v4-pd-attention .v4-section-head h2').forEach(heading => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(rewriteTextNode);
    });

    setText('[data-action="open-all-attention"]', '查看全部 ›', root);
    setText('.v4-pd-attention .mock-link[data-action="attention-for-product"]', '查看全部', root);
    setText('.login-page .login-card p', '继续查看你的关注、钱包和提醒。', root);
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
