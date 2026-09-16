(() => {
  'use strict';

  const SEEN_KEY = 'nextbonus-onboarding-v2-seen';
  const PENDING_KEY = 'nextbonus-onboarding-v2-pending';
  const PAGE_COUNT = 6;
  const SPRITE_SOURCE = 'onboarding.css?v=20260916-1';
  let page = 0;
  let overlay = null;
  let frame = null;
  let art = null;
  let spriteImg = null;
  let spriteUrl = null;
  let dots = null;
  let prevButton = null;
  let nextButton = null;
  let startButton = null;

  function safeGet(key){
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value){
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function safeRemove(key){
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function decodeBase64Image(base64){
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    return new Blob([bytes], {type:'image/webp'});
  }

  async function hydrateArtwork(){
    if (!art || spriteImg) return;
    const response = await fetch(SPRITE_SOURCE, {cache:'no-store'});
    if (!response.ok) throw new Error(`Onboarding artwork source failed: ${response.status}`);
    const css = await response.text();
    const match = css.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
    if (!match) throw new Error('Onboarding artwork payload missing');

    const blob = decodeBase64Image(match[1]);
    spriteUrl = URL.createObjectURL(blob);
    spriteImg = document.createElement('img');
    spriteImg.alt = '';
    spriteImg.setAttribute('aria-hidden', 'true');
    Object.assign(spriteImg.style, {
      position:'absolute',
      left:'0',
      top:'0',
      width:'100%',
      height:'600%',
      maxWidth:'none',
      display:'block',
      objectFit:'fill',
      pointerEvents:'none',
      userSelect:'none',
      willChange:'transform',
      transition:'transform .18s ease'
    });

    const loaded = new Promise((resolve, reject) => {
      spriteImg.onload = resolve;
      spriteImg.onerror = reject;
    });
    spriteImg.src = spriteUrl;
    art.appendChild(spriteImg);
    await loaded;
    art.style.backgroundImage = 'none';
    positionArtwork();
  }

  function positionArtwork(){
    if (!spriteImg) return;
    spriteImg.style.transform = `translateY(-${page * (100 / PAGE_COUNT)}%)`;
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
        <div class="nb-onboarding-art" aria-hidden="true"></div>
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
      if (!dot) return;
      go(Number(dot.dataset.page));
    });

    go(0);
    hydrateArtwork()
      .catch((error) => console.error('[NextBonus onboarding]', error))
      .finally(() => requestAnimationFrame(() => overlay?.classList.add('is-visible')));
  }

  function go(nextPage){
    page = Math.max(0, Math.min(PAGE_COUNT - 1, nextPage));
    if (!frame) return;

    frame.dataset.page = String(page + 1);
    overlay.dataset.page = String(page + 1);
    positionArtwork();

    const allDots = [...dots.querySelectorAll('.nb-onboarding-dot')];
    allDots.forEach((dot, index) => {
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
    spriteImg = null;
    dots = null;
    prevButton = null;
    nextButton = null;
    startButton = null;
    if (spriteUrl) {
      URL.revokeObjectURL(spriteUrl);
      spriteUrl = null;
    }
    window.setTimeout(() => node.remove(), 180);
  }

  function shouldShow(){
    return !safeGet(SEEN_KEY);
  }

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
