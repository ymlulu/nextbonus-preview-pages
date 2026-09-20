(() => {
  'use strict';

  const DEFAULT_LAYOUT=Object.freeze({
    textPlacement:'left-top',
    textMaxWidth:'48%',
    visualFocus:'right'
  });

  const SECTION_DEFS=Object.freeze([
    Object.freeze({id:'intro',label:'卡片简介'}),
    Object.freeze({id:'highlights',label:'核心亮点'}),
    Object.freeze({id:'points',label:'积分使用'}),
    Object.freeze({id:'fit',label:'适合谁'})
  ]);

  function emptyBackground(){
    return Object.freeze({
      src:null,
      alt:'',
      position:'center'
    });
  }

  function localizedCopy(label){
    return Object.freeze({
      'zh-CN':Object.freeze({
        navLabel:label,
        eyebrow:'',
        title:'',
        summary:''
      }),
      'en-US':Object.freeze({
        navLabel:'',
        eyebrow:'',
        title:'',
        summary:''
      })
    });
  }

  function makeSlide(section){
    return Object.freeze({
      id:section.id,
      background:emptyBackground(),
      layout:DEFAULT_LAYOUT,
      copy:localizedCopy(section.label)
    });
  }

  function makeStory(offerId){
    return Object.freeze({
      offerId,
      version:'2026-09-20.1',
      slides:Object.freeze(SECTION_DEFS.map(makeSlide))
    });
  }

  const SUPPORTED=Object.freeze([
    'chase-sapphire',
    'amex-gold',
    'amex-platinum',
    'bilt-palladium',
    'capitalone-venturex',
    'citi-strata'
  ]);

  const STORIES=Object.freeze(Object.fromEntries(
    SUPPORTED.map(offerId=>[offerId,makeStory(offerId)])
  ));

  function get(offerId){
    return STORIES[offerId]||null;
  }

  function resolveCopy(slide,locale='zh-CN'){
    const preferred=slide?.copy?.[locale]||{};
    const fallback=slide?.copy?.['zh-CN']||{};
    return Object.freeze({
      navLabel:preferred.navLabel||fallback.navLabel||'',
      eyebrow:preferred.eyebrow||fallback.eyebrow||'',
      title:preferred.title||fallback.title||'',
      summary:preferred.summary||fallback.summary||''
    });
  }

  function resolve(offerId,locale='zh-CN'){
    const story=get(offerId);
    if(!story) return null;
    return Object.freeze({
      offerId:story.offerId,
      version:story.version,
      locale,
      slides:Object.freeze(story.slides.map(slide=>Object.freeze({
        id:slide.id,
        background:slide.background,
        layout:slide.layout,
        ...resolveCopy(slide,locale)
      })))
    });
  }

  function clampIndex(story,index){
    const count=story?.slides?.length||0;
    if(!count) return 0;
    const n=Number(index);
    if(!Number.isFinite(n)) return 0;
    return Math.max(0,Math.min(count-1,Math.trunc(n)));
  }

  window.NextBonusCreditCardStoryData=Object.freeze({
    sectionDefs:SECTION_DEFS,
    supported:SUPPORTED,
    stories:STORIES,
    get,
    resolve,
    clampIndex
  });
})();
