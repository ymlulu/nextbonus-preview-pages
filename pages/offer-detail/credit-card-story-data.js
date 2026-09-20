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

  function makeSlide(section,zh={}){
    return Object.freeze({
      id:section.id,
      background:emptyBackground(),
      layout:DEFAULT_LAYOUT,
      copy:localizedCopy(section.label,zh)
    });
  }

  function makeStory(offerId,copyBySection={}){
    return Object.freeze({
      offerId,
      version:'2026-09-20.2',
      slides:Object.freeze(SECTION_DEFS.map(section=>makeSlide(section,copyBySection[section.id])))
    });
  }

  const AMEX_GOLD_COPY=Object.freeze({
    intro:Object.freeze({
      eyebrow:'AMEX GOLD CARD',
      title:'吃饭、买菜赚 MR 的主力卡',
      summary:'餐饮和美国超市 4x MR，每年还有 Uber、Dining、Resy、Dunkin 等多项日常消费报销。'
    }),
    highlights:Object.freeze({
      eyebrow:'核心亮点',
      title:'餐饮和超市 4x MR',
      summary:'全球餐厅和美国超市都是 4x；再叠加 Uber、Dining、Resy、Dunkin 等报销，日常消费场景很强。'
    }),
    points:Object.freeze({
      eyebrow:'积分使用',
      title:'MR 最值钱的玩法，还是转航空里程',
      summary:'可以转 ANA、Air Canada、British Airways、Delta 等航空伙伴；直接换现金或酒店通常不划算。'
    }),
    fit:Object.freeze({
      eyebrow:'适合谁',
      title:'餐饮、超市花得多，也会用 MR 的人',
      summary:'如果你本来就能用掉主要报销，同时餐饮和美国超市消费较高，这张卡更容易把年费赚回来。'
    })
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
      makeStory(offerId,offerId==='amex-gold'?AMEX_GOLD_COPY:{})
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
