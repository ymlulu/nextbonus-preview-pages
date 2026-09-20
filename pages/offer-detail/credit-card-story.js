(() => {
  'use strict';

  function render({esc,offer,state,locale='zh-CN'}){
    const data=window.NextBonusCreditCardStoryData;
    const story=data?.resolve?.(offer?.id,locale);
    if(!story?.slides?.length) return '';

    const index=data.clampIndex(story,state?.posterIndex);
    const slide=story.slides[index];
    const background=slide.background?.src
      ? `<img class="nb-credit-story-background" src="${esc(slide.background.src)}" alt="${esc(slide.background.alt||'')}" style="object-position:${esc(slide.background.position||'center')}" />`
      : '<div class="nb-credit-story-background-placeholder" aria-hidden="true"></div>';

    const copyHasBody=!!(slide.eyebrow||slide.title||slide.summary);
    const copy=copyHasBody
      ? `<div class="nb-credit-story-copy" data-placement="${esc(slide.layout?.textPlacement||'left-top')}">
          ${slide.eyebrow?`<div class="nb-credit-story-eyebrow">${esc(slide.eyebrow)}</div>`:''}
          ${slide.title?`<h2>${esc(slide.title)}</h2>`:''}
          ${slide.summary?`<p>${esc(slide.summary)}</p>`:''}
        </div>`
      : '<div class="nb-credit-story-copy is-empty" aria-hidden="true"></div>';

    const dots=story.slides.map((item,i)=>
      `<span class="${i===index?'active':''}" aria-hidden="true"></span>`
    ).join('');

    const carousel=story.slides.map((item,i)=>
      `<button type="button" class="nb-credit-story-nav-item ${i===index?'active':''}" data-action="poster" data-index="${i}" aria-pressed="${i===index?'true':'false'}">
        <span>${esc(item.navLabel)}</span>
      </button>`
    ).join('');

    return `<div class="nb-credit-story" data-offer-id="${esc(offer.id)}" data-story-version="${esc(story.version)}">
      <div class="nb-credit-story-stage">
        ${background}
        ${copy}
        <div class="nb-credit-story-dots" aria-hidden="true">${dots}</div>
      </div>
      <nav class="nb-credit-story-carousel" aria-label="信用卡介绍">
        ${carousel}
      </nav>
    </div>`;
  }

  window.NextBonusCreditCardStory=Object.freeze({render});
})();
