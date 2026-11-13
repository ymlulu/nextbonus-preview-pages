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
    "ACNB Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/59/d6/bd/59d6bd59-4af1-0fa1-3535-9cd348096e21/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "1st Advantage Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/d0/26/40/d026401b-2b3d-9489-ea51-1d2ff6758afe/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "4Front Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/af/ae/4e/afae4e72-741a-53e7-ba0c-7ea292a64251/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Addition Financial Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f6/0c/89/f60c89d2-658e-61ac-df0d-dde2f14fa00f/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Advia Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/3a/8d/66/3a8d6662-a172-1bc9-fafb-0f3f5e95ab95/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Affinity Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c6/90/ac/c690ac3b-9005-78f9-8e52-22fae931dbab/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Arizona Financial Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/95/ad/68/95ad68f0-ad65-b741-1f5d-4fea05720ed8/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Bank Independent": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0c/c6/bb/0cc6bb64-8007-b326-0112-f763ff078248/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
    "Argent Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/93/54/27/93542791-1917-6dba-c010-fa7243eb4926/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "America's Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/47/3d/6d/473d6d59-ce76-943a-19c5-a70e5b06a63a/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Bar Harbor Bank & Trust": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ad/52/f8/ad52f8cf-58b1-8012-913a-428709675a62/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
    "BOK Financial": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/34/c8/c8/34c8c87c-5879-b52c-86a2-e118c04b7fc5/AppIconBOKF-0-0-1x_U007emarketing-0-0-0-8-0-0-85-220.png/512x512bb.jpg",
    "Blaze Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/22/07/24/22072498-e53a-9df6-a1c5-cf66b15ba1b3/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "BMI Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c6/e8/5e/c6e85ef8-4d65-729c-dc02-72283c11cc37/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Busey Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/1f/6c/37/1f6c37f1-3afd-5394-f4e9-137cc585be4b/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Camden National Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ab/8f/20/ab8f20bd-4a52-cbdc-a24e-2127f097ea3f/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Campus Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/9d/f9/85/9df985c5-6969-ed39-6bde-4555adfbe1be/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Canandaigua National Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/58/b6/64/58b664bd-fe0c-5ac6-baa5-fea4751cbebd/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Centreville Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/39/4a/f3/394af3e8-4c07-6885-b3f4-55dcb283644b/1009_Centreville_AppIcon-0-0-1x_U007epad-0-0-0-1-0-0-85-220.png/512x512bb.jpg",
    "City & County Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f9/3d/26/f93d2641-5154-ec09-7e2b-c3d32b157699/AppIcon_-_CCCU-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Clearview Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/6b/91/3d/6b913d7e-d49a-092f-c9ac-b67356a3dbc2/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Community Choice Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/d2/cf/c7/d2cfc79a-bdac-1e19-3c60-fa7676c565e2/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Community Credit Union of Florida": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b1/f4/a1/b1f4a1af-ff9c-dd74-35f4-7eb60366870c/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "CommunityAmerica Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/3e/ca/8e/3eca8ede-1886-2b10-e9ef-714744d03631/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Credit Human Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/55/9a/3f/559a3f76-7338-aa65-4b3a-d95d120f7d02/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Connexus Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/ad/01/eead0195-7b12-6290-65ea-697b0fa7669a/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Credit Union of the Rockies": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/6a/ba/10/6aba1031-751e-014d-7a80-cca16818ebbf/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
    "Credit Union One": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bc/4c/c8/bc4cc8a4-4477-f329-b555-8e16680cdb60/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Dedham Savings": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/6f/69/ec/6f69ecb7-24dd-ed33-3db6-313bad74730b/AppIcon-0-0-1x_U007emarketing-0-5-85-220.png/512x512bb.jpg",
    "Credit Union West": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/37/9e/b9/379eb9b2-66af-9fa8-8f83-703526120a31/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Desert Financial Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/05/80/8805808a-7e71-0b9d-4be6-ffdb4fe58271/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Delta Community Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/1f/02/aa/1f02aa55-6fa1-5ea2-a479-d3e3251ff78f/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Dupaco Community Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8b/3f/e8/8b3fe8c9-5a12-9a92-19e2-13f4b42f3cc5/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Elevations Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/cc/2a/77/cc2a77f0-eb42-19cb-5002-4338d9e3d1ab/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Embassy Bank for the Lehigh Valley": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/0b/76/65/0b766516-cc41-994f-34eb-8163e341adec/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Everwise Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/27/91/7e/27917e2c-df69-4763-5b29-9bbaae5083eb/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg",
    "Experian": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/02/34/68/02346802-4e23-ee1d-3b2e-dac3e9983f0a/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Financial Plus Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/04/df/bd/04dfbd71-babd-6606-7da7-32b3d0aca406/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Firefighters First Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/39/31/db/3931db8f-0e52-4dfb-b3ec-929b06427d4f/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "First Commonwealth Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/3a/2f/02/3a2f02e5-cc40-2d90-53e7-9f16e157212b/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
    "First Merchants Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/28/88/5b/28885bc6-d377-8867-7d3c-f0732c0d541f/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "First Entertainment Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/63/2c/52/632c524b-7bf5-d0da-46af-7e87eeb67092/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Florence Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ef/1e/56/ef1e56b2-cb51-5777-2d82-2ce37cbeb1f6/1078_FlorenceSavings_AppIcon-0-0-1x_U007epad-0-0-0-1-0-0-85-220.png/512x512bb.jpg",
    "Frontwave Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/af/26/c5/af26c50e-e40d-e8d8-f321-025d5b940275/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "First U.S. Community Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8a/10/76/8a107677-8537-be49-f741-b6bccb47fdf1/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "FourLeaf Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/eb/f0/1c/ebf01c1b-1e92-75e4-239d-8e7f5cb3bb2c/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Gesa Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f2/ee/5e/f2ee5e27-8624-ba47-eed7-1ab52d49bc94/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Greater Nevada Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e9/7f/4c/e97f4c36-c2e0-47b3-5193-6d71a97e63b1/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Grand Bank for Savings": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b5/2c/fb/b52cfb5a-feed-5874-c71a-75e8b10c6b9f/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Grow Financial Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/cb/73/a4/cb73a4dd-74d1-29c6-fdbf-da4bb3ab8f57/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "INOVA Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/3e/bf/61/3ebf61ad-2b91-7ca9-79c9-729020299eb7/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Johnson Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/8b/4c/23/8b4c2335-1d54-9cef-9f65-90ca4a9e7b7f/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Jovia Financial Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0b/7c/52/0b7c5209-72d1-61b4-f9b4-4f7e32d829d1/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "iTHINK Financial Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e4/d3/96/e4d39648-0071-5837-019c-a0d8ea641938/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "Ion Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e4/3d/6e/e43d6e2b-af33-a691-5f16-93ca90bb78e1/1136_IonBank_AppIcon-0-0-1x_U007epad-0-0-0-1-0-0-85-220.png/512x512bb.jpg",
    "Horizon Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/72/98/27/72982762-22f7-28f8-d799-bd820eb72c55/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Kitsap Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fd/02/cb/fd02cb0e-6de4-19c6-cc4b-2497821b00a4/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Members Cooperative Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/db/79/e7/db79e771-8036-c3b0-2640-a319c3f76243/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Lake Ridge Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2f/7b/df/2f7bdfdf-0620-2f85-c4e7-cd82bfd5fa13/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    "Mid Minnesota Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a3/08/28/a3082857-ebd9-02af-8623-2cf6c803d10f/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Mid Penn Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/00/94/12/00941255-f13f-b200-5960-91849cf660a0/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
    "MidFirst Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/60/ef/22/60ef220f-c433-07e7-261d-a3a5e4921829/AppIcon-0-0-1x_U007emarketing-0-11-0-0-0-85-220.png/512x512bb.jpg",
    "MIDFLORIDA Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/3d/1d/91/3d1d9132-ec0a-c6f4-6189-70ca820b781d/AppIcon-1x_U007epad-0-1-85-220-0.png/512x512bb.jpg",
    "Monterra Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/55/e1/3e/55e13e37-663d-4469-6e82-a596ebc17fd8/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "North State Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5d/76/48/5d764802-b8ed-f0b4-e2ae-2d0db6ceb680/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Newtown Savings Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/92/1e/ba/921ebac1-efe6-356f-39b0-17305be5d00e/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Notre Dame Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/53/2b/65/532b6523-a5d1-8720-7ee3-0f92ad7ac5a5/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg",
    "Numerica Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1b/7c/be/1b7cbe3b-a353-c5fe-b412-e72c6548cad7/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "Old National Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/37/4d/b2/374db244-d4aa-ce88-4483-8b0af49d7273/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "OUR Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e7/cb/e1/e7cbe1bd-b923-0af3-71ed-9515615ab992/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
    "Oregon State Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fb/fa/0d/fbfa0dc2-b2cd-0b41-9a08-c0db601b1eaa/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Penn Community Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/d0/97/ca/d097ca86-62e8-9b77-b5ec-b3049356fad7/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Power Financial Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f8/d1/6f/f8d16fdf-43dc-66c1-a6c3-9a6ad5cf82d2/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Red Canoe Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0f/27/7b/0f277b0f-d3eb-265a-4797-7c6d07e7aa11/RedCanoeAppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "REV Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/02/b3/b9/02b3b978-8148-187a-1c10-54922c34c3d0/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Robins Financial Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/21/b5/32/21b53248-982d-6c6a-143e-f650ef2ef92c/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Rogue Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ed/f7/a3/edf7a3fb-3771-6583-5957-34d9b1d325a6/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Royal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c6/8b/fd/c68bfd28-de8d-3f94-8b87-de6fc4fee245/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "Safe 1 Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/15/f3/5c/15f35c49-deaf-34fe-d5a5-ccf23f406140/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
    "S&T Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/91/a6/85/91a68558-35bd-9cca-cd9c-768db88b0a8f/AppIcon-0-0-1x_U007epad-0-6-0-85-220.png/512x512bb.jpg",
    "St. Mary's Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c4/10/38/c41038a7-0c87-487d-adf1-6893176ccc06/AppIcon-0-0-1x_U007emarketing-0-9-0-85-220.png/512x512bb.jpg",
    "Service 1st Federal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/32/a6/c6/32a6c644-331a-14ee-6832-a552b10f3c9d/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Byline Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f6/4d/1f/f64d1fb4-8cc9-3f68-1191-247662cd54f6/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Florida Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/79/01/44/79014498-d6e0-4a9a-4cec-b6fe3adb7e1e/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Old Second National Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/d9/6f/7c/d96f7cb2-5621-c7aa-811e-0156203c6d67/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
    "Municipal Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/2e/da/49/2eda4969-cff1-8062-453f-371299825d72/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Seacoast Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/9c/6a/bb/9c6abba7-e4e8-815b-589c-e7c8708dacb8/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "Republic Bank of Chicago": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f8/98/96/f898960c-fac4-a805-aeb6-d5b671207f65/AppIcon-0-0-1x_U007emarketing-0-5-85-220.png/512x512bb.jpg",
    "PSECU": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b3/08/83/b3088384-4a28-0204-625e-ddafacd932a4/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "SECU Maryland": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c1/a3/55/c1a35564-5cf5-f458-8520-1c1fef364d1e/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "CIBC Bank USA": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/91/9f/e1/919fe1ed-1ad6-d349-c95a-840ce50e3498/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    "First Service Credit Union": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/88/ed/e8/88ede8dc-a37b-7f83-3666-3408c5846615/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    "Republic Bank & Trust Company": "https://is1-ssl.mzstatic.com/image/thumb/Purple125/v4/fb/46/0e/fb460e34-eff7-d42a-e0cc-1c3b0f8463e1/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg",
    "Community State Bank": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ee/3a/62/ee3a62e0-9224-2d81-1047-105fd6374a49/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg",
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
