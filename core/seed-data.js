(() => {
  'use strict';

const defaultProducts = [
    {id:'p-amex-plat-1005', offerId:'amex-platinum', type:'信用卡', name:'AMEX Platinum', institution:'American Express', instance:'•••• 1005', opened:'2026-04-15', anniversary:'4 月 15 日', annualFee:'$895', status:'正常', earning:'机票 5x · 预付酒店 5x · 其他 1x'},
    {id:'p-hilton-aspire-2308', type:'信用卡', name:'Hilton Aspire', institution:'American Express', instance:'•••• 2308', opened:'2025-10-02', anniversary:'10 月 2 日', annualFee:'$550', status:'正常', earning:'Hilton 14x · 其他 3x'},
    {id:'p-csr-2948', type:'信用卡', name:'Chase Sapphire Reserve', institution:'Chase', instance:'•••• 2948', opened:'2024-10-02', anniversary:'10 月 2 日', annualFee:'$795', status:'正常', earning:'旅行 / 餐饮高回报'},
    {id:'p-marriott-brilliant-6503', type:'信用卡', name:'Marriott Bonvoy Brilliant', institution:'American Express', instance:'•••• 6503', opened:'2024-08-03', anniversary:'8 月 3 日', annualFee:'$650', status:'正常', earning:'Marriott 6x'},
    {id:'p-amex-biz-4321', type:'信用卡', name:'AMEX Business Plus', institution:'American Express', instance:'•••• 4321', opened:'2025-03-12', anniversary:'3 月 12 日', annualFee:'$0', status:'正常', earning:'日常消费回报'},
    {id:'p-freedom-7182', type:'信用卡', name:'Chase Freedom Unlimited', institution:'Chase', instance:'•••• 7182', opened:'2023-06-18', anniversary:'6 月 18 日', annualFee:'$0', status:'正常', earning:'1.5x 起'},
    {id:'p-citi-3490', type:'信用卡', name:'Citi Double Cash', institution:'Citi', instance:'•••• 3490', opened:'2023-11-08', anniversary:'11 月 8 日', annualFee:'$0', status:'正常', earning:'2% 现金回报'},

    {id:'p-usbank', type:'银行和券商账户', name:'U.S. Bank Smartly Checking', institution:'U.S. Bank', instance:'主账户', opened:'2026-08-24', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-truist', type:'银行和券商账户', name:'Truist One Checking', institution:'Truist', instance:'Checking', opened:'2026-07-10', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-chase-checking', type:'银行和券商账户', name:'Chase Total Checking', institution:'Chase', instance:'Checking', opened:'2026-06-18', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-wf-checking', type:'银行和券商账户', name:'Wells Fargo Everyday Checking', institution:'Wells Fargo', instance:'Checking', opened:'2026-05-21', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-fidelity', type:'银行和券商账户', name:'Fidelity Cash Management Account', institution:'Fidelity', instance:'CMA', opened:'2026-02-05', annualFee:'$0', status:'正常', earning:'—'},
    {id:'p-robinhood', type:'银行和券商账户', name:'Robinhood Brokerage Account', institution:'Robinhood', instance:'Brokerage', opened:'2026-01-26', annualFee:'$0', status:'正常', earning:'—'},

    {id:'p-hilton', type:'会籍', name:'Hilton Honors Diamond', institution:'Hilton', instance:'Diamond', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-ihg', type:'会籍', name:'IHG One Rewards Platinum', institution:'IHG', instance:'Platinum', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-marriott-status', type:'会籍', name:'Marriott Bonvoy Titanium', institution:'Marriott', instance:'Titanium', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-hyatt', type:'会籍', name:'World of Hyatt Globalist', institution:'Hyatt', instance:'Globalist', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},
    {id:'p-delta-status', type:'会籍', name:'Delta SkyMiles Platinum', institution:'Delta', instance:'Platinum', opened:'2026-01-01', annualFee:'—', status:'正常', earning:'—'},


  ];

  const defaultPastProducts = [
    {id:'p-old-amex-gold', type:'信用卡', name:'AMEX Gold', institution:'American Express', instance:'•••• 5510', statusText:'已于 2026 年 9 月 12 日关闭', status:'已关闭', opened:'2023-02-12', annualFee:'$325', earning:'餐饮 / 超市 4x'},
    {id:'p-old-freedom-flex', type:'信用卡', name:'Chase Freedom Flex', institution:'Chase', instance:'•••• 1948', statusText:'已于 2026 年 1 月 5 日关闭', status:'已关闭', opened:'2022-07-09', annualFee:'$0', earning:'季度 5x'},
    {id:'p-old-hilton-gold', type:'会籍', name:'Hilton Gold Status', institution:'Hilton', instance:'Gold', statusText:'已于 2025 年 12 月 31 日关闭', status:'已结束', opened:'2025-01-01', annualFee:'—', earning:'—'}
  ];

  const defaultAttention = [
    {id:'a-bonus-plat', productId:'p-amex-plat-1005', product:'AMEX Platinum', action:'完成开卡奖励', secondary:'6个月消费 $12,000，获得 175,000 MR', time:'截止 9月18日', dueDate:'2026-09-18', type:'bonus', summary:'这笔开卡奖励仍在追踪中。完成全部消费条件后即可结束这条任务。', key:'175,000 MR', keySub:'最晚 9月18日完成', instruction:'完成以下条件', checklist:[{id:'c1',label:'完成 $12,000 合格消费',done:false}], primary:'我已完成', secondaryAction:null, completionKind:'completed'},
    {id:'a-hilton-credit', productId:'p-hilton-aspire-2308', product:'Hilton Aspire', action:'使用 $200 Hilton 酒店报销', secondary:'', time:'本期截止 9月18日', dueDate:'2026-09-18', type:'benefit', summary:'本期 Hilton 酒店报销仍可使用。', key:'$200 Hilton 酒店报销', keySub:'本期可用至 9月18日', instruction:'本期怎么处理', checklist:[], primary:'已使用', secondaryAction:'本期不再提醒', completionKind:'used'},
    {id:'a-csr-fee', productId:'p-csr-2948', product:'Chase Sapphire Reserve', action:'查看即将收取的 $795 年费', secondary:'', time:'年费日 10月2日', dueDate:'2026-10-02', type:'annual', summary:'下一次年费即将收取。现在适合重新确认这张卡是否仍值得长期保留。', key:'$795 年费', keySub:'年费日 10月2日', instruction:'确认你已经看过', checklist:[], primary:'我已查看', secondaryAction:null, completionKind:'viewed'},
    {id:'a-plat-fee', productId:'p-amex-plat-1005', product:'AMEX Platinum', action:'年费即将收取', secondary:'$895 年费', time:'年费日 2027年4月15日', dueDate:'2027-04-15', type:'annual', summary:'下一次年费将在 2027 年 4 月 15 日收取。', key:'$895 年费', keySub:'2027年4月15日', instruction:'确认你已经看过', checklist:[], primary:'我已查看', secondaryAction:null, completionKind:'viewed'},
    {id:'a-rule-change', productId:'p-amex-plat-1005', product:'AMEX Platinum', action:'年费与福利已更新', secondary:'生效日期 2025年9月18日', time:'生效 10月1日', dueDate:'2026-10-01', type:'change', summary:'这张卡的年费与部分福利已经更新。', key:'权益更新', keySub:'10月1日生效', instruction:'确认变化', checklist:[], primary:'知道了', secondaryAction:null, completionKind:'confirmed'},
    {id:'a-usbank', productId:'p-usbank', product:'U.S. Bank Smartly Checking', action:'完成开户奖励条件', secondary:'完成开户与 Direct Deposit 条件', time:'截止 10月12日', dueDate:'2026-10-12', type:'bonus', summary:'这个开户奖励包含多个完成条件。', key:'最高 $450', keySub:'截止 10月12日', instruction:'完成以下条件', checklist:[{id:'u1',label:'账户已成功开立',done:true},{id:'u2',label:'完成符合要求的 Direct Deposit',done:false}], primary:'我已完成', secondaryAction:null, completionKind:'completed'}
  ];

  const defaultHistory = [
    {id:'h-uber', productId:'p-amex-plat-1005', product:'AMEX Platinum', action:'使用本期 Uber Cash', time:'本期截止 Aug 31', dueDate:'2026-08-31', result:'已使用', statusClass:'used', ended:'Sep 01, 2026', correction:'撤销已使用', summary:'8 月 Uber Cash 福利已在当期确认使用。', key:'$15 Uber Cash', keySub:'8 月周期', instruction:'历史记录'},
    {id:'h-bonus-gold', productId:'p-amex-gold-7712', product:'AMEX Gold •••• 7712', action:'完成开卡奖励', time:'截止 Feb 03', dueDate:'2026-02-03', result:'已完成', statusClass:'used', ended:'Jan 21, 2026', correction:'撤销完成', summary:'开卡奖励要求已确认完成。', key:'90,000 MR', keySub:'完成于 Jan 21', instruction:'历史记录'},
    {id:'h-benefit-skip', productId:'p-hilton', product:'Hilton Honors Diamond', action:'使用季度酒店福利', time:'本期截止 Jun 30', dueDate:'2026-06-30', result:'本期已忽略', statusClass:'skipped', ended:'Jun 22, 2026', correction:'恢复本期提醒', summary:'你当时选择本期不再提醒。', key:'季度福利', keySub:'2026 Q2', instruction:'历史记录'},
    {id:'h-expired', productId:'p-csp-2948', product:'Chase Sapphire Preferred •••• 2948', action:'使用年度酒店福利', time:'本期截止 Aug 11', dueDate:'2026-08-11', result:'已到期', statusClass:'expired', ended:'Aug 11, 2026', correction:null, summary:'这项年度福利已经超过当期使用窗口。', key:'$50 酒店福利', keySub:'已到期', instruction:'历史记录'},
    {id:'h-stopped', productId:'p-old-card', product:'AMEX Green •••• 4481', action:'使用 CLEAR 报销', time:'本期截止 Mar 31', dueDate:'2026-03-31', result:'已结束', resultReason:'产品已关闭', statusClass:'stopped', ended:'Mar 01, 2026', correction:null, summary:'产品关闭后，未来周期福利提醒已经停止。', key:'CLEAR 报销', keySub:'产品生命周期结束', instruction:'历史记录'}
  ];


  const defaultWatchlist = [
    {id:'seed-watch-amex-platinum',offerId:'amex-platinum',stage:'saved',status:'saved',sourceType:'seed',sourceOrder:0},
    {id:'seed-watch-hsbc-checking',offerId:'hsbc-checking',stage:'saved',status:'saved',sourceType:'seed',sourceOrder:1},
    {id:'seed-watch-moomoo',offerId:'moomoo',stage:'saved',status:'saved',sourceType:'seed',sourceOrder:2},
    {id:'seed-history-travel-transfer',offerId:'travel-transfer',stage:'history',status:'expired',sourceType:'seed',sourceOrder:3}
  ];

  window.NextBonusSeedData=Object.freeze({defaultProducts,defaultPastProducts,defaultAttention,defaultHistory,defaultWatchlist});
})();
