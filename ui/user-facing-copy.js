(() => {
  'use strict';

  const EXACT = new Map([
    ['正在生成…', '正在评估…'],
    ['正在生成...', '正在评估…'],
    ['拨打 Recon 电话', '拨打重新审核电话'],
    ['资料说明', '说明'],
    ['任务金额', '资金要求'],
    ['等待 Bonus', '等待奖励'],
    ['Stocks / ETF 0 commission', '美股 / ETF $0 佣金'],
    ['2 个月 Booster', '前 2 个月加息'],
    ['Cash Sweep Booster 需在 App 中激活', 'Cash Sweep 加息活动需在 App 内激活'],
    ['Due', '截止日期'],
    ['2年以上', '2 年以上'],
    ['距离你最近一次申请或获批 Capital One 信用卡是否不足 6 个月？', '距离你最近一次申请或获批 Capital One 信用卡，还不到 6 个月吗？'],
    ['你的 Bilt Card 2.0 持卡和开卡奖励历史是什么？', '关于 Bilt Card 2.0，你属于下面哪种情况？'],
    ['有一项规则目前还不能可靠确认。', '有一项申请规则目前还无法确认。'],
    ['当前 Offer 有历史持卡限制', '当前开卡奖励有历史持卡限制'],
    ['Bilt 2.0 Welcome Bonus', 'Bilt 2.0 开卡奖励'],
    ['这是你在编辑产品时补充建立的开卡奖励追踪。', '这是你后来补充的开卡奖励。'],
    ['截止日期以所选奖励规则为准', '截止日期请以你实际申请时的条款为准'],
    ['按所选奖励规则', '以申请时的条款为准'],
    ['暂时没有可展示的结构化福利信息', '暂时没有可展示的福利信息'],
    ['只有存在已冻结评估规则时，才显示个性化申请结论。', '这张卡目前还没有可用的个性化申请评估。'],
    ['当前没有已冻结的个性化评估流程，因此不显示推测性的评分或结论。', '这张卡目前还没有可用的个性化评估，因此暂不显示申请结论。'],
    ['当前暂未提供可执行的申请入口。', '当前暂未提供申请入口。'],
    ['同样输入得到同样结果', '相同信息得到相同结果'],
    ['只保存评估所需的信息', '只保存完成评估所需的信息'],
    ['这里只记录你当前持有的会籍 / 等级，不会自动创建奖励追踪或提醒。', '这里只记录你当前持有的会籍或等级，不会自动添加奖励提醒。'],
    ['产品和本次需要的追踪状态已经一起保存。', '产品和相关奖励进度已经一起保存。'],
    ['以后仍可从产品详情补开奖励追踪', '以后也可以从产品详情补充开卡奖励'],
    ['只显示已确认可变更目标', '只显示确认可以转换的产品'],
    ['这只是风险确认，不替你强制拦截申请。', '这里会提醒可能的申请风险，但不会替你决定是否申请。'],
    ['这只会删除误添加的 NextBonus 产品记录，不代表关闭真实账户。', '这里只会从 NextBonus 中移除这条产品记录，不会影响你的真实账户。'],
    ['这是你在添加产品时建立的奖励追踪。逐项完成条件即可。', '你的开卡奖励还没完成；按要求逐项完成后即可标记完成。'],
    ['重新处理这项提醒', '重新处理这条提醒'],
    ['产品已不在当前生命周期', '这个产品当前已经结束'],
    ['已重新计算：该事项当前已结束', '已更新：这条提醒当前已结束'],
    ['已重新计算：该事项已经到期', '已更新：这条提醒已经到期'],
    ['已重新计算：该事项重新进入待处理', '已更新：这条提醒重新进入待处理'],
    ['奖励曲线只展示 Assessment 已审核并可比较的历史记录，不会改变当前评估结论。', '这里只展示已经确认、可以直接比较的历史奖励记录。历史走势仅供参考，不会改变当前申请建议。'],
    ['美卡101当前没有足够明确、可直接对应这个产品的长期资料，因此这里不展示推测性的消费回报或福利。', '美卡101目前还没有整理出这款产品足够可靠的长期权益资料，暂时先不展示消费回报和福利。'],
    ['当前数据来自统一 Offer 数据层。因为这里没有可确认的完整追踪截止日期，NextBonus 不自动生成任务，请按你实际申请 / 开户时的条款手动添加。', '这是目前公开可见的奖励。由于无法确认你实际申请时的截止日期，请按申请或开户时看到的条款手动填写。'],
    ['NextBonus 不会根据历史奖励或常见奖励猜测。你可以按实际申请 / 开户条款手动添加。', '目前没有确认到可用的公开奖励，你可以按自己申请或开户时看到的条款手动填写。'],
    ['Smartly Checking 用户自动获得 Bronze Tier benefits', 'Smartly Checking 用户可自动获得 Bronze Tier 权益'],
    ['专文较旧，因此这里只展示文章明确写出的稳定账户能力，不补当前 APY 等未在文中更新的数据。', '这部分资料来自较早版本，当前 APY 等信息可能已经变化。'],
    ['站内专文较旧，因此这里只展示当前仍适合作为产品说明的稳定信息，不把当年的折扣价格当作当前优惠。', '这部分资料来自较早版本，当前价格和优惠请以官网为准。']
  ]);

  const PARTIAL = [
    [/· 当前 Offer 已自动带入/g, '· 已带入你申请时的奖励'],
    [/日期默认选今天供你确认，但 NextBonus 不会把“点击直接申请”的时间当作开卡 \/ 开户日期。当前 Preview 的 Offer 数据如果没有结构化 Deadline Rule，也不会从自然语言里猜截止日。/g, '日期默认选今天，请按实际获批或开户日期确认。如果无法确认你申请时的奖励截止日期，我们不会自动填写，请以申请时的条款为准。'],
    [/NextBonus 找到了相同 Offer 或产品名称的已有产品。查看已有产品不会结束这次申请结果确认。/g, '你可能已经添加过这个产品，请确认是否还要再添加一个。'],
    [/Due\s+(\d{1,2})月(\d{1,2})日/g, '$1 月 $2 日截止'],
    [/通过当前 Premier Offer 开户/g, '通过当前活动入口开户'],
    [/通过当前 Offer 入口/g, '通过当前活动入口'],
    [/通过当前 Offer 开立/g, '通过当前活动入口开立'],
    [/获取 Offer 并开户/g, '通过活动入口开户'],
    [/等待对应档位 Bonus 到账/g, '等待对应档位奖励到账'],
    [/consumer checking/g, '个人 Checking 账户'],
    [/当前 Platinum Offer 有 Family Rule/g, 'AMEX Platinum 当前有 Family Rule'],
    [/6个月/g, '6 个月'],
    [/(\d{1,2})月(\d{1,2})日/g, '$1 月 $2 日']
  ];

  function rewriteString(input) {
    let text = String(input ?? '');
    if (EXACT.has(text)) text = EXACT.get(text);
    for (const [pattern, replacement] of PARTIAL) text = text.replace(pattern, replacement);
    if (/Assessment bridge (failed to load|timeout)|Assessment request failed/i.test(text)) {
      return '评估暂时无法加载，请稍后再试。';
    }
    return text;
  }

  function rewriteTextNode(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script,style,template')) return;
    const before = node.nodeValue;
    const after = rewriteString(before);
    if (after !== before) node.nodeValue = after;
  }

  function rewriteAttributes(root) {
    const nodes = root.querySelectorAll?.('[aria-label],[title],[placeholder]') || [];
    nodes.forEach(el => {
      for (const attr of ['aria-label','title','placeholder']) {
        if (!el.hasAttribute(attr)) continue;
        const before = el.getAttribute(attr);
        const after = rewriteString(before);
        if (after !== before) el.setAttribute(attr, after);
      }
    });
  }

  function hideInternalReleaseIds(root) {
    const nodes = root.querySelectorAll?.('small') || [];
    nodes.forEach(el => {
      const text = (el.textContent || '').trim();
      if (/^(release[-_:]|assessment[-_:]?release|v\d+[-_.].*sha)/i.test(text)) {
        el.hidden = true;
        el.setAttribute('aria-hidden','true');
      }
    });
  }

  function formatEnglishDateText(text) {
    const months = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
    return String(text).replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/g, (_,m,d,y) => `${y} 年 ${months[m]} 月 ${Number(d)} 日`);
  }

  function rewriteDates(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,template')) return;
      const before = node.nodeValue;
      const after = formatEnglishDateText(before);
      if (after !== before) node.nodeValue = after;
    });
  }

  function polish(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(rewriteTextNode);
    rewriteAttributes(root);
    rewriteDates(root);
    hideInternalReleaseIds(root);
  }

  window.NextBonusUserFacingCopy = Object.freeze({ polish });
})();
