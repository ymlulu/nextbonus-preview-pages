(() => {
  'use strict';

  // Exact bank-level mapping: one verified official App Store icon shared by
  // every Discover offer from that institution. No guessing by offer title.
  const appIcons=Object.freeze({
    // VERIFIED_APP_ICONS_BEGIN
    "Ally Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bd/05/ad/bd05ad56-dea3-1acb-a5c9-2131c25f21c8/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "American Express": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/54/75/e9/5475e91f-3843-25b5-ddeb-dc5b1d306e6b/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Associated Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/cd/6d/e6/cd6de64b-d395-5f18-77ea-c280b66ab50b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg",
    "Bank of America": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/dd/39/93/dd399398-8daa-e1d0-d427-1a5c620c7de0/AppIcon-0-0-1x_U007epad-0-11-0-0-85-220.png/512x512bb.jpg",
    "Barclays": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/15/9b/87/159b87d5-7a5c-243c-9f98-20ca5ffc8a70/AppIcon-0-0-1x_U007emarketing-0-8-0-sRGB-85-220.png/512x512bb.jpg",
    "Capital One": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/f1/b2/f7/f1b2f741-d614-9daf-593c-a644c2ad86cb/AppIcon-0-0-1x_U007epad-0-1-P3-85-220.png/512x512bb.jpg",
    "Chime": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b0/2b/6d/b02b6d68-6bf6-c619-a337-7a19b41bcd3a/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg",
    "Citi": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/7c/51/cb/7c51cbdc-a521-cdd3-46dd-31c12a7f4aa8/AppIcon-0-0-1x_U007emarketing-0-8-0-sRGB-85-220.png/512x512bb.jpg",
    "Fifth Third": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1f/67/19/1f6719d3-4e2c-41c1-8c48-d5a6f4d89163/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "HSBC": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/34/e7/fa/34e7fabf-9d29-6e41-dbe6-74c3c0c55e9e/IconUS-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Huntington Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/af/d2/7c/afd27cdb-2969-1156-78e8-953ef644ba98/AppIcon.m-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "KeyBank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/84/31/9c/84319c56-8232-e981-924f-c2ef18d03683/key-icon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Navy Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1b/bd/c4/1bbdc4e5-0a46-ad8d-ea26-c50fc6402b56/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "PNC": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ed/a1/d6/eda1d647-2c5d-c7d7-67d5-723c67d19f8a/AppIcon_Glass-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
    "Regions Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b2/d2/00/b2d2004a-5d8e-9426-b49b-91292f5ee508/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Santander Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/6f/06/97/6f069720-7592-d629-dfb8-ae3fc3211364/AppIcon-1x_U007emarketing-0-7-0-85-220-0.png/512x512bb.jpg",
    "SoFi": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/6b/65/fd/6b65fd5e-b09c-5a2c-8a50-ea95b2893c49/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "TD Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/18/5c/2b/185c2baf-68f0-a173-3645-bbaed6ef05da/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "Truist": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/49/dd/af/49ddafd2-cb94-8169-a0b6-686fa77eee7f/AppIcon-0-0-1x_U007epad-0-11-0-85-220.png/512x512bb.jpg",
    "Webster Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a3/0a/29/a30a29d1-63da-5741-48d5-dddf9e17330c/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Bask Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5b/57/f8/5b57f802-d601-e536-476c-5bf8ba4ec0c4/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Banner Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/17/b5/f6/17b5f6f2-fd1b-dde2-e27f-38889782007b/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Bell Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/68/7d/c7/687dc78f-96fa-c9b7-c014-c751a1033424/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Dollar Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/3e/7e/91/3e7e9185-c58e-b421-27ad-38e3ee8c0a2e/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Eastern Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/92/ec/35/92ec3518-e9e9-19a6-18f8-5cd3eaa4f1e4/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
    "Fulton Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/6d/d6/c1/6dd6c11d-595a-6ad0-11d9-6c8833e9aa29/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Hancock Whitney": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/0d/a4/81/0da48114-fa49-6947-d876-4662c768cad9/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Hanmi Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/75/46/31/754631d5-e4a9-812c-0d0e-21308c675684/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "U.S. Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/28/36/dc/2836dc93-5500-96b8-a18c-8fc5334f0f10/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Wells Fargo": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ac/e4/c9/ace4c91d-c787-4501-ea95-29c4d035e22a/AppIcon-0-0-1x_U007epad-0-0-0-11-0-0-sRGB-85-220.png/512x512bb.jpg",
    "2UFI": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c1/c6/a9/c1c6a952-1424-e610-b95b-c9aaa426f811/AppIcon-1x_U007emarketing-0-6-0-85-220-0.png/512x512bb.jpg",
    "Farmers Insurance Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/d2/8f/c5/d28fc5d2-2f69-dc4d-2ccf-db59849dd4b0/FigfcuAppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "FIG Credit Union (Farmers Insurance FCU)": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/d2/8f/c5/d28fc5d2-2f69-dc4d-2ccf-db59849dd4b0/FigfcuAppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "First Mark Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1e/73/d4/1e73d485-d0f9-d0bf-9cf3-a671bf6718f0/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Hudson Valley Federal": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f1/30/2c/f1302cc1-e0e4-e2d2-ea4a-03f68650a925/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Popular Community Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f4/c6/cd/f4c6cd0a-c9f5-b5f9-ff87-7df302523097/AppIcon-0-0-1x_U007epad-0-6-0-85-220.png/512x512bb.jpg",
    "Quorum FCU": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/83/7c/12/837c12b4-73e9-ee91-ebfa-1e8f32a4cede/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "E*TRADE": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a7/28/31/a72831e7-24e8-38c1-ec3d-485a6140dba9/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Axos Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/53/ea/f0/53eaf02c-7aa6-df06-f49d-2b5607997201/appicon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "BMO": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a3/90/e2/a390e269-1f10-87e2-56a6-0e5aadb7a7e7/AppIcon-0-0-1x_U007epad-0-1-sRGB-85-220.png/512x512bb.jpg",
    "Chase": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e6/6e/12/e66e1291-c0b4-2f98-9a2f-3491df098a35/ChaseLiquidGlass-0-0-1x_U007epad-0-1-0-0-sRGB-85-220.png/512x512bb.jpg",
    "America First Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c3/12/5a/c3125a78-e9d0-6409-dd0c-ab6d78eea9f2/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Bank of New Hampshire": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/47/22/bb/4722bba9-eae6-cf91-04f7-555a2fd647db/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Citizens Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/00/d5/53/00d5537e-ab0d-2d8c-0223-c8e2211502f5/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "M&T Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/10/86/fd/1086fd42-86c6-1346-68d0-1be0d942b6f5/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Beacon Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/64/15/4f/64154f6b-09a5-7b6d-59c6-3356b0abfda8/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Bravera Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/40/53/15/405315a7-9684-5992-1a13-cba7c43d74c6/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
    "Great Plains Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2f/e7/47/2fe7470c-6408-b77a-fd01-af61421423ca/AppIcon-0-0-1x_U007emarketing-0-5-85-220.png/512x512bb.jpg",
    "Picatinny Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/f7/4b/75/f74b75ac-bde4-aecf-bd7e-cbec4d3f895c/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    // VERIFIED_APP_ICONS_END
  });

  // Existing checked-in brand assets remain available when an official
  // mobile-banking app icon is not yet verified.
  const brandMarks=Object.freeze({
    'American Express':'assets/product-logo-marks/amex.svg',
    'Capital One':'assets/product-logo-marks/capital-one.svg',
    'Chase':'assets/product-logos/chase.png',
    'Citi':'assets/product-logo-marks/citi.svg',
    'HSBC':'assets/product-logos/hsbc.svg',
    'Truist':'assets/product-logos/truist.png',
    'U.S. Bank':'assets/product-logos/usbank.png',
    'Wells Fargo':'assets/product-logos/wells-fargo.png'
  });

  const R2_BASE='https://nextbonus-preview-deals.uscc101-data.workers.dev/api/public/images/';
  const objectKey=name=>'bank-logo-'+String(name).normalize('NFKD').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-v1.webp';
  const normalize=value=>String(value||'').normalize('NFKC').toLowerCase()
    .replace(/[®™℠]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const byName=new Map();
  for(const [name,src] of Object.entries(brandMarks))
    byName.set(normalize(name),Object.freeze({src,kind:'brand'}));
  const canonicalSources=new Map();
  for(const [name,src] of Object.entries(appIcons)){
    if(!/^https:\/\/is[0-9]+-ssl\.mzstatic\.com\/image\/thumb\//.test(src))continue;
    // Source URLs shared by aliased institutions map to the same R2 key.
    if(!canonicalSources.has(src))canonicalSources.set(src,objectKey(name));
    byName.set(normalize(name),Object.freeze({
      src:R2_BASE+canonicalSources.get(src),fallbackSrc:src,kind:'app'
    }));
  }
  function resolve(bank){return byName.get(normalize(bank))||null;}

  // R2 is primary; Apple CDN is a temporary fallback while assets sync.
  // After both fail, show the institution name instead of an empty visual.
  if(typeof document!=='undefined')document.addEventListener('error',event=>{
    const image=event.target;
    if(image?.tagName!=='IMG'||!image.parentElement?.classList?.contains('nb-bank-logo-art'))return;
    const fallback=image.dataset?.fallbackSrc;
    if(fallback&&!image.dataset.fallbackTried){
      image.dataset.fallbackTried='1';
      image.src=fallback;
      return;
    }
    image.parentElement.classList.add('is-broken');
  },true);

  window.NextBonusBankLogoRegistry=Object.freeze({resolve,
    appIconCount:Object.keys(appIcons).length,
    knownBankCount:byName.size});
})();
