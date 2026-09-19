import { readFile } from 'node:fs/promises';

const failures=[];

async function text(file){
  try{return await readFile(file,'utf8');}
  catch{return null;}
}

function requireFile(content,file){
  if(content===null) failures.push(`Required owner file is missing: ${file}`);
}

function requireText(content,needle,label){
  if(content===null||!content.includes(needle)) failures.push(label);
}

const files={
  agents:await text('AGENTS.md'),
  card:await text('ui/offer-card.js'),
  cardCss:await text('offer-card.css'),
  assessmentClient:await text('features/assessment/client.js'),
  offerDetailTiming:await text('pages/offer-detail/timing.js'),
  offerDetailPage:await text('pages/offer-detail/page.js'),
  offerDetailOverlay:await text('pages/offer-detail/overlay.js'),
  index:await text('index.html')
};

requireFile(files.agents,'AGENTS.md');
requireFile(files.offerDetailTiming,'pages/offer-detail/timing.js');

requireText(files.agents,'Preview publishing is read-only','AGENTS.md must retain the read-only Preview publishing contract.');
requireText(files.card,'class="nb-title-row"','Canonical Offer Card must keep Follow inside the title row.');
requireText(files.card,'class="nb-card-footer"','Canonical Offer Card must keep metadata/provider in the footer.');
requireText(files.card,'providerFooterHtml','Canonical Offer Card must keep provider branding in the footer owner.');
requireText(files.cardCss,'position:static','Offer Card Follow must neutralize the retired absolute-positioned bookmark style.');
requireText(files.cardCss,'.nb-offer-card .nb-card-footer','Offer Card footer layout owner is missing.');
requireText(files.assessmentClient,'getOfferTiming(productId)','Assessment client must expose the formal Offer Timing bridge method.');
requireText(files.offerDetailPage,'data-action="assessment-preview"','Offer Detail must retain the Assessment result-preview action.');
requireText(files.offerDetailOverlay,".nb-offer-apply-primary",'Offer Detail sticky CTA must stay owned by Direct Apply.');
requireText(files.index,'pages/offer-detail/timing.js','index.html must load the Offer Detail Timing adapter.');

if(failures.length){
  console.error('Source integrity guard failed:');
  failures.forEach(item=>console.error(`- ${item}`));
  console.error('This usually means a stale Preview snapshot replaced newer formal owners.');
  process.exit(1);
}

console.log('Source integrity guard OK: canonical owners and read-only publish contract are present.');
