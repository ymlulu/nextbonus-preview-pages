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

  function localizedCopy(label,zh={}){
    return Object.freeze({
      'zh-CN':Object.freeze({
        navLabel:label,
        eyebrow:zh.eyebrow||'',
        title:zh.title||'',
        summary:zh.summary||''
      }),
      'en-US':Object.freeze({
        navLabel:'',
        eyebrow:'',
        title:'',
        summary:''
      })
    });
  }

  function makeSlide(section,zh={},background=null){
    return Object.freeze({
      id:section.id,
      background:background||emptyBackground(),
      layout:DEFAULT_LAYOUT,
      copy:localizedCopy(section.label,zh)
    });
  }

  function makeStory(offerId,copyBySection={},backgroundBySection={}){
    return Object.freeze({
      offerId,
      version:'2026-09-20.5',
      slides:Object.freeze(SECTION_DEFS.map(section=>makeSlide(
        section,
        copyBySection[section.id],
        backgroundBySection[section.id]
      )))
    });
  }

  const AMEX_GOLD_COPY=Object.freeze({
    intro:Object.freeze({
      eyebrow:'',
      title:'AMEX Gold 开卡送',
      summary:'100,000 MR'
    }),
    highlights:Object.freeze({
      eyebrow:'',
      title:'4X 餐饮 · 4X 超市',
      summary:'$424 报销福利'
    }),
    points:Object.freeze({
      eyebrow:'',
      title:'Membership Rewards',
      summary:'转里程 · 商务头等舱\n转酒店 · 奢华入住'
    }),
    fit:Object.freeze({
      eyebrow:'',
      title:'日常消费必备',
      summary:'旅游出行必备'
    })
  });

  const AMEX_GOLD_ART=Object.freeze({
    intro:Object.freeze({src:'assets/offer-detail/amex-gold-intro.webp',alt:'',position:'center'}),
    highlights:Object.freeze({src:'assets/offer-detail/amex-gold-benefits.webp',alt:'',position:'center'}),
    points:Object.freeze({src:'assets/offer-detail/amex-gold-points.webp',alt:'',position:'center'}),
    fit:Object.freeze({src:'assets/offer-detail/amex-gold-fit.webp',alt:'',position:'center'})
  });

  const SUPPORTED=Object.freeze([
    'chase-sapphire',
    'amex-gold',
    'amex-platinum',
    'bilt-palladium',
    'capitalone-venturex',
    'citi-strata'
  ]);

  const STORIES=Object.freeze(Object.fromEntries(
    SUPPORTED.map(offerId=>[
      offerId,
      makeStory(
        offerId,
        offerId==='amex-gold'?AMEX_GOLD_COPY:{},
        offerId==='amex-gold'?AMEX_GOLD_ART:{}
      )
    ])
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
