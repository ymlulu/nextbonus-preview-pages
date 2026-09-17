(() => {
  'use strict';

  const SEEN_KEY = 'nextbonus-onboarding-v5-seen';
  const PENDING_KEY = 'nextbonus-onboarding-v5-pending';
  const PAGE_COUNT = 6;
  const IMAGE_VERSION = '20260917-3';
  const PAGES = [
    'assets/onboarding/p1.webp',
    'assets/onboarding/p2.webp',
    'assets/onboarding/p3.webp',
    'assets/onboarding/p4.webp',
    'assets/onboarding/p5.webp',
    'assets/onboarding/p6.webp'
  ];

  let page = 0;
  let overlay = null;
  let frame = null;
  let art = null;
  let image = null;
  let dots = null;
  let prevButton = null;
  let nextButton = null;
  let startButton = null;
  const preloaded = new Set();

  function safeGet(key){ try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, value){ try { localStorage.setItem(key, value); } catch (e) {} }
  function safeRemove(key){ try { localStorage.removeItem(key); } catch (e) {} }

  function imageUrl(index){
    return `${PAGES[index]}?v=${IMAGE_VERSION}`;
  }

  function preload(index){
    if (index < 0 || index >= PAGE_COUNT || preloaded.has(index)) return;
    preloaded.add(index);
    const img = new Image();
    img.decoding = 'async';
    img.src = imageUrl(index);
  }

  function showLoadError(){
    if (!art) return;
    art.classList.remove('is-loading');
    art.classList.add('has-error');
    let error = art.querySelector('.nb-onboarding-error');
    if (!error) {
      error = document.createElement('div');
      error.className = 'nb-onboarding-error';
      error.textContent = 'Onboarding 图片加载失败，请刷新重试';
      art.appendChild(error);
    }
  }

  function renderArtwork(){
    if (!image || !art) return;
    art.classList.add('is-loading');
    art.classList.remove('has-error');
    art.querySelector('.nb-onboarding-error')?.remove();

    image.onload = () => {
      art.classList.remove('is-loading');
      image.classList.add('is-ready');
      preload(page + 1);
    };
    image.onerror = showLoadError;
    image.classList.remove('is-ready');
    image.src = imageUrl(page);
  }

  function build(){
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'nb-onboarding';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'NextBonus 首次登录介绍');
    overlay.innerHTML = `
      <div class="nb-onboarding-frame" data-page="1">
        <div class="nb-onboarding-art" aria-live="polite">
          <img class="nb-onboarding-image" alt="NextBonus 新手介绍第 1 页" />
        </div>
        <div class="nb-onboarding-controls" aria-label="Onboarding 导航">
          <button type="button" class="nb-onboarding-btn nb-onboarding-prev" aria-label="上一页">←&nbsp;&nbsp;上一步</button>
          <div class="nb-onboarding-dots" role="tablist" aria-label="Onboarding 页码"></div>
          <button type="button" class="nb-onboarding-btn nb-onboarding-next" aria-label="下一页">下一步&nbsp;&nbsp;→</button>
          <button type="button" class="nb-onboarding-btn nb-onboarding-start" aria-label="开始使用 NextBonus">开始使用&nbsp;&nbsp;→</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.body.classList.add('nb-onboarding-open');

    frame = overlay.querySelector('.nb-onboarding-frame');
    art = overlay.querySelector('.nb-onboarding-art');
    image = overlay.querySelector('.nb-onboarding-image');
    dots = overlay.querySelector('.nb-onboarding-dots');
    prevButton = overlay.querySelector('.nb-onboarding-prev');
    nextButton = overlay.querySelector('.nb-onboarding-next');
    startButton = overlay.querySelector('.nb-onboarding-start');

    dots.innerHTML = Array.from({length: PAGE_COUNT}, (_, i) =>
      `<button type="button" class="nb-onboarding-dot" role="tab" aria-label="第 ${i + 1} 页" data-page="${i}" aria-selected="${i === 0 ? 'true' : 'false'}"></button>`
    ).join('');

    prevButton.addEventListener('click', () => go(page - 1));
    nextButton.addEventListener('click', () => go(page + 1));
    startButton.addEventListener('click', finish);
    dots.addEventListener('click', (event) => {
      const dot = event.target.closest('[data-page]');
      if (dot) go(Number(dot.dataset.page));
    });

    go(0);
    requestAnimationFrame(() => overlay?.classList.add('is-visible'));
  }

  function go(nextPage){
    page = Math.max(0, Math.min(PAGE_COUNT - 1, nextPage));
    if (!frame) return;

    frame.dataset.page = String(page + 1);
    overlay.dataset.page = String(page + 1);
    image.alt = `NextBonus 新手介绍第 ${page + 1} 页`;
    renderArtwork();

    [...dots.querySelectorAll('.nb-onboarding-dot')].forEach((dot, index) => {
      const active = index === page;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    prevButton.hidden = page === 0 || page === PAGE_COUNT - 1;
    nextButton.hidden = page === PAGE_COUNT - 1;
    dots.hidden = page === PAGE_COUNT - 1;
    startButton.hidden = page !== PAGE_COUNT - 1;
  }

  function finish(){
    safeSet(SEEN_KEY, '2026-09');
    safeRemove(PENDING_KEY);
    close();
  }

  function close(){
    if (!overlay) return;
    overlay.classList.remove('is-visible');
    document.body.classList.remove('nb-onboarding-open');
    const node = overlay;
    overlay = null;
    frame = null;
    art = null;
    image = null;
    dots = null;
    prevButton = null;
    nextButton = null;
    startButton = null;
    window.setTimeout(() => node.remove(), 180);
  }

  function shouldShow(){ return !safeGet(SEEN_KEY); }
  function open(){
    if (!shouldShow()) return;
    safeSet(PENDING_KEY, '1');
    build();
  }

  document.addEventListener('click', (event) => {
    const login = event.target.closest('[data-action="login-success"]');
    if (!login || !shouldShow()) return;
    safeSet(PENDING_KEY, '1');
    window.setTimeout(build, 0);
  });

  document.addEventListener('keydown', (event) => {
    if (!overlay) return;
    if (event.key === 'ArrowRight' && page < PAGE_COUNT - 1) {
      event.preventDefault();
      go(page + 1);
    } else if (event.key === 'ArrowLeft' && page > 0) {
      event.preventDefault();
      go(page - 1);
    }
  });

  if (safeGet(PENDING_KEY) && shouldShow()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, {once:true});
    else window.setTimeout(build, 0);
  }

  window.NextBonusOnboarding = Object.freeze({
    open,
    reset(){ safeRemove(SEEN_KEY); safeRemove(PENDING_KEY); },
    isSeen(){ return !!safeGet(SEEN_KEY); }
  });
})();
