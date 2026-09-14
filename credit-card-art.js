(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';

  // Canonical credit-card art contract:
  // one product identity -> one approved high-resolution card face.
  // The web asset is preferred; an existing repository asset remains the offline/failure fallback.
  const ART = Object.freeze({
    'amex-platinum': Object.freeze({
      key: 'amex-platinum',
      web: 'https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/platinum-card.png',
      local: 'assets/product-detail/amex-platinum-card.png',
      source: 'American Express'
    }),
    'amex-gold': Object.freeze({
      key: 'amex-gold',
      web: 'https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/gold-card.png',
      local: 'assets/product-art/amex-gold.png',
      source: 'American Express'
    }),
    'chase-sapphire-preferred': Object.freeze({
      key: 'chase-sapphire-preferred',
      web: 'https://www.chase.com/content/services/structured-image/image.mobile.png/chase-ux/bucket/secondary/digital/accepted-cards/card_sapphire_pref.png',
      local: 'assets/product-art/chase-sapphire.png',
      source: 'Chase'
    }),
    'bilt-palladium': Object.freeze({
      key: 'bilt-palladium',
      web: 'https://images.squarespace-cdn.com/content/v1/64271785788d513050ff4486/24243b6f-d249-4871-af23-6494a151d86c/Bilt_Palladium_4k_front.jpg',
      local: 'assets/product-art/bilt-palladium.png',
      source: 'public 4K card-art mirror'
    }),
    'capitalone-venturex': Object.freeze({
      key: 'capitalone-venturex',
      web: 'https://ecm.capitalone.com/WCM/card/products/venturex-cg-static-card-1000x630-2.png',
      local: 'assets/product-art/capitalone-venturex.png',
      source: 'Capital One'
    }),
    'citi-strata-elite': Object.freeze({
      key: 'citi-strata-elite',
      web: 'https://lsja3tgfz37mp0wt.public.blob.vercel-storage.com/cards/1763055861195-strata-elite-dsk.fc987627983eaaf8cdd3.png',
      local: 'assets/product-art/citi-strata.png',
      source: 'public card-art mirror'
    }),
    'hilton-aspire': Object.freeze({
      key: 'hilton-aspire',
      web: null,
      local: 'assets/product-cards/hilton-aspire-local.png',
      source: 'local 640x404 approved card art'
    }),
    'chase-sapphire-reserve': Object.freeze({
      key: 'chase-sapphire-reserve',
      web: 'https://www.chase.com/content/dam/unified-assets/card-art/chase-sapphire/sapphire-reserve/halo/alternate/card_sapphireRes_chip_RFID.png',
      local: 'assets/product-cards/chase-sapphire-reserve-local.png',
      source: 'Chase'
    }),
    'marriott-brilliant': Object.freeze({
      key: 'marriott-brilliant',
      web: null,
      local: 'assets/product-cards/marriott-brilliant-local.png',
      source: 'local 640x404 approved card art'
    }),
    'amex-blue-business-plus': Object.freeze({
      key: 'amex-blue-business-plus',
      web: 'https://lsja3tgfz37mp0wt.public.blob.vercel-storage.com/cards/1762445090938-blue-business-plus.avif',
      local: 'assets/product-cards/amex-blue-business-plus-local.png',
      source: 'public card-art mirror'
    }),
    'chase-freedom-unlimited': Object.freeze({
      key: 'chase-freedom-unlimited',
      web: 'https://www.chase.com/content/services/structured-image/image.mobile.png/chase-ux/bucket/secondary/digital/accepted-cards/card_freedom_ultd.png',
      local: 'assets/product-cards/chase-freedom-unlimited-local.png',
      source: 'Chase'
    }),
    'citi-double-cash': Object.freeze({
      key: 'citi-double-cash',
      web: 'https://lsja3tgfz37mp0wt.public.blob.vercel-storage.com/cards/1763056014256-double-cash-dsk.2d4ef4f13bb063243a7a.webp',
      local: 'assets/product-cards/citi-double-cash-local.png',
      source: 'public card-art mirror'
    })
  });

  const byOfferId = Object.freeze({
    'amex-platinum': ART['amex-platinum'],
    'amex-gold': ART['amex-gold'],
    'chase-sapphire': ART['chase-sapphire-preferred'],
    'bilt-palladium': ART['bilt-palladium'],
    'capitalone-venturex': ART['capitalone-venturex'],
    'citi-strata': ART['citi-strata-elite']
  });

  const byProductId = Object.freeze({
    'p-amex-plat-1005': ART['amex-platinum'],
    'p-hilton-aspire-2308': ART['hilton-aspire'],
    'p-csr-2948': ART['chase-sapphire-reserve'],
    'p-marriott-brilliant-6503': ART['marriott-brilliant'],
    'p-amex-biz-4321': ART['amex-blue-business-plus'],
    'p-freedom-7182': ART['chase-freedom-unlimited'],
    'p-citi-3490': ART['citi-double-cash']
  });

  const byName = Object.freeze({
    'amex platinum': ART['amex-platinum'],
    'amex platinum card': ART['amex-platinum'],
    'the platinum card from american express': ART['amex-platinum'],
    'amex gold': ART['amex-gold'],
    'amex gold card': ART['amex-gold'],
    'american express gold card': ART['amex-gold'],
    'chase sapphire preferred': ART['chase-sapphire-preferred'],
    'chase sapphire preferred card': ART['chase-sapphire-preferred'],
    'bilt palladium card': ART['bilt-palladium'],
    'capital one venture x': ART['capitalone-venturex'],
    'capital one venture x rewards': ART['capitalone-venturex'],
    'citi strata elite': ART['citi-strata-elite'],
    'hilton aspire': ART['hilton-aspire'],
    'hilton honors aspire': ART['hilton-aspire'],
    'hilton honors american express aspire card': ART['hilton-aspire'],
    'chase sapphire reserve': ART['chase-sapphire-reserve'],
    'marriott bonvoy brilliant': ART['marriott-brilliant'],
    'marriott bonvoy brilliant american express card': ART['marriott-brilliant'],
    'amex business plus': ART['amex-blue-business-plus'],
    'blue business plus': ART['amex-blue-business-plus'],
    'blue business plus credit card from american express': ART['amex-blue-business-plus'],
    'chase freedom unlimited': ART['chase-freedom-unlimited'],
    'citi double cash': ART['citi-double-cash'],
    'citi double cash card': ART['citi-double-cash']
  });

  function normalizeName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[®™℠]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function resolveAsset(product) {
    if (!product || product.type !== '信用卡') return null;
    if (product.offerId && byOfferId[product.offerId]) return byOfferId[product.offerId];
    if (product.id && byProductId[product.id]) return byProductId[product.id];
    return byName[normalizeName(product.name)] || null;
  }

  function resolve(product) {
    const asset = resolveAsset(product);
    return asset?.web || asset?.local || null;
  }

  function resolveOfferAsset(offerId) {
    return byOfferId[offerId] || null;
  }

  function resolveOffer(offerId) {
    const asset = resolveOfferAsset(offerId);
    return asset?.web || asset?.local || null;
  }

  function allProducts(state) {
    return [
      ...(Array.isArray(state.products) ? state.products : []),
      ...(Array.isArray(state.pastProducts) ? state.pastProducts : [])
    ];
  }

  function productMap(state) {
    return new Map(allProducts(state).map((product) => [product.id, product]));
  }

  function forceImage(img, asset, alt) {
    if (!img || !asset) return;
    const normalized = typeof asset === 'string' ? { web: asset, local: null } : asset;
    const failedWeb = img.dataset.canonicalFailedFor === normalized.web;
    const primary = failedWeb ? (normalized.local || normalized.web) : (normalized.web || normalized.local);
    if (!primary) return;

    if (img.getAttribute('src') !== primary) img.setAttribute('src', primary);
    if (alt) img.setAttribute('alt', alt);
    img.dataset.canonicalCardArt = normalized.key || '1';

    img.onerror = () => {
      if (normalized.local && img.getAttribute('src') !== normalized.local) {
        img.dataset.canonicalFailedFor = normalized.web || primary;
        img.setAttribute('src', normalized.local);
      }
    };
  }

  function normalizeStoredProducts(state) {
    let changed = false;
    for (const collectionName of ['products', 'pastProducts']) {
      const collection = Array.isArray(state[collectionName]) ? state[collectionName] : [];
      for (const product of collection) {
        const asset = resolveAsset(product);
        if (!asset) continue;
        if (product.cardImageLocal !== asset.local) {
          product.cardImageLocal = asset.local;
          changed = true;
        }
        if (product.cardImageWeb !== asset.web) {
          product.cardImageWeb = asset.web;
          changed = true;
        }
        if (product.cardArtKey !== asset.key) {
          product.cardArtKey = asset.key;
          changed = true;
        }
      }
    }
    if (changed) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
    }
  }

  function applyAddProductImages() {
    document.querySelectorAll('.add-card-art img').forEach((img) => {
      const asset = byName[normalizeName(img.getAttribute('alt'))];
      if (asset) forceImage(img, asset, img.getAttribute('alt'));
    });
  }

  function applyOwnedProductImages(state, products) {
    document.querySelectorAll('.v4-owned-product-card.credit-tile[data-id]').forEach((tile) => {
      const product = products.get(tile.dataset.id);
      const asset = resolveAsset(product);
      if (!asset) return;
      forceImage(tile.querySelector('.v4-owned-product-art img'), asset, product.name);
    });
  }

  function applyProductDetailImage(state, products) {
    const page = document.querySelector('.v4-product-detail-page');
    if (!page) return;
    const product = products.get(state.currentProductId);
    const asset = resolveAsset(product);
    if (!asset) return;
    forceImage(page.querySelector('.v4-pd-card.credit-card-art img'), asset, product.name);
  }

  function applyCanonicalArt() {
    const state = readState();
    normalizeStoredProducts(state);
    const products = productMap(state);
    applyAddProductImages();
    applyOwnedProductImages(state, products);
    applyProductDetailImage(state, products);
  }

  window.NextBonusCreditCardArt = Object.freeze({
    ART,
    byOfferId,
    byProductId,
    resolve,
    resolveAsset,
    resolveOffer,
    resolveOfferAsset
  });
  window.dispatchEvent(new CustomEvent('nextbonus-card-art-ready'));

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      applyCanonicalArt();
    });
  }

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', scheduleApply);
  window.addEventListener('storage', scheduleApply);
  scheduleApply();
})();
