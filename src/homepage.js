gsap.registerPlugin(ScrollTrigger);

import {
  animateHorizontalGraph,
  codeAnimation,
  codeFile,
  letterAnimation,
  wrapLetters,
} from '$utils/globalFunctions';

$(document).ready(function () {
  // Base Hero Elements
  const baseDuration = 1.2;
  const heroLabel = '#heroLabel';
  const heroHeading = '#heroHeading';
  const heroHeadingBox = '.header_highlight-head';
  const heroButtons = '#heroButtons .button';
  const modularBox = '#modularBox';
  const heroBox = '.hero-box';
  const heroBoxInner = '.hero-box_inner';
  const brandBox = modularBox + ' ' + heroBoxInner;

  const brandLogo = '#brandLogo';
  const heroBoxesLeft = heroBox + '[box-direction=left] ' + heroBoxInner;
  const heroBoxesRight = heroBox + '[box-direction=right] ' + heroBoxInner;
  const metadata = '.hero-box_metadata-mask';
  const iconBoxArrow = '.hero-dashboard_arrow';
  const cloudBorder = '.hero-devices_border';

  const introText = '.hero-paragraphs';

  // Dashboard Elements
  const dashboard = '#dashboard';
  const dashboardInner = dashboard + ' .hero-dashboard_inner';
  const dashboardCode = dashboard + ' .hero-dashboard_code';
  const closeCircles = dashboard + ' .hero-dashboard_close circle';
  const dashboardTitle = dashboard + ' .hero-dashboard_head-label';
  const fileType = '#file-type';
  const langTab = dashboard + ' .hero-dashboard_tab';
  const pythonTab = dashboard + ' .hero-dashboard_tab-inner.python';
  const mojoTab = dashboard + ' .hero-dashboard_tab-inner.mojo';
  const pythonCode = dashboard + ' .hero-dashboard_code-block.python';
  const mojoCode = dashboard + ' .hero-dashboard_code-block.mojo';

  // Graphs
  const graphs = '.hero-dashboard_graphs';
  const graphHead = '.hero-dashboard_graph-head';
  const graphBox = '.hero-dashboard_graph-box';
  const firstGraph = $(graphBox).eq(0);
  const graphLabel = '.hero-dashboard_graph-label';
  const graphNumberLabel = '.hero-dashboard_graph-number-label';
  const graphNumber = '.hero-dashboard_graph-number';
  const graphLegend = '.hero-dashboard_graph-legend';

  // Navigation
  const navigationItems = '.hero-navigation_item';

  // Texts
  const headings = [
    $(heroHeading).html(),
    $('.hero-headings').find('div').eq(0).html(),
    $('.hero-headings').find('div').eq(1).html(),
  ];

  // Navigation
  const navigationsText = [
    $(navigationItems).eq(0).text(),
    $(navigationItems).eq(1).text(),
    $(navigationItems).eq(2).text(),
  ];

  // --- Functions
  // Insta Functions
  function switchDeviceIcons() {
    console.log('Devices');
    const hideClass = 'hide';
    $('.hero-devices .hero-box_inner').each(function () {
      const icons = $(this).find('.hero-box_icon');

      const visibleIcon = icons.not('.' + hideClass);
      const nextIndex = visibleIcon.index() >= icons.length - 1 ? 0 : visibleIcon.index() + 1;
      icons.addClass(hideClass);
      icons.eq(nextIndex).removeClass(hideClass);
    });
  }
  function switchHeadings(index) {
    $(heroHeading).html(headings[index]);
    wrapLetters(heroHeading);
    updateNavigation(index);
  }
  function switchParagraphs(index) {
    console.log('Fire' + index);
    $(introText).find('p').stop(true, true).fadeOut().eq(index).fadeIn();
  }

  function updateNavigation(index) {
    let items = $(navigationItems);
    items.removeClass('active');
    items.eq(index).addClass('active');
  }
  const triggerElementClick = (element) => {
    $(element).trigger('click');
  };
  function addClassToElement(element, className) {
    $(element).addClass(className);
  }

  // Animated Functions
  let headingsTimeline = null;
  const animateHeadings = (index, width) => {
    const checkWidth = (width) => {
      if (width) {
        $(heroHeading).width(width);
      } else {
        $(heroHeading).removeAttr('style');
      }
    };
    headingsTimeline = gsap.timeline();
    width = width ? width : '90%';
    headingsTimeline
      .to(heroHeading, { opacity: 0, y: '2em', duration: 0.5 })
      .add(() => {
        let tl = gsap.timeline();
        tl.call(() => {
          checkWidth(width);
          switchHeadings(index);
          switchParagraphs(index);
        });
        return tl;
      })
      .to(heroHeading, { opacity: 1, y: '0em', duration: 0.5 });

    return headingsTimeline;
  };
  const animateLabel = (element, time) => {
    let duration = time;
    let tl = gsap.timeline();
    if (!time) {
      duration = 'label';
    }
    tl.set(element, { opacity: 1 });
    tl.add(letterAnimation(element, duration));

    return tl;
  };
  const scaleGraph = (element) => {
    let tl = gsap.timeline();
    tl.fromTo(element, { scaleY: 0 }, { scaleY: 1, duration: baseDuration }, '<');

    return tl;
  };
  const animateGraph = (parent) => {
    let tl = gsap.timeline();
    tl.add(animateLabel($(parent).find(graphLabel).children()), '<+=0.3')
      .set($(parent).find(graphNumber), { yPercent: 10, opacity: 0 }, '<+=0.3')
      .to(
        $(parent).find(graphNumber),
        { yPercent: 0, opacity: 1, duration: baseDuration },
        '<+=0.15'
      )
      .add(animateLabel($(parent).find(graphLegend).children()), '<+=0.3');

    return tl;
  };

  // Animations Parts
  let brandLogoClickTriggered = false;
  const initialReveal = () => {
    let main = gsap.timeline();
    main
      .addLabel('Start')
      .call(() => {
        if (!brandLogoClickTriggered) {
          triggerElementClick(brandLogo);
          brandLogoClickTriggered = true;
        }
      })
      .call(() => updateNavigation(0))
      .add(letterAnimation(heroHeading, 'heading'), '<')
      .call(() => triggerElementClick(brandLogo))
      .from(heroButtons, { opacity: 0, stagger: 0.1, duration: baseDuration }, '<0.1')
      .from(introText, { opacity: 0, duration: baseDuration })
      .fromTo(
        $(modularBox),
        { width: '19em', opacity: 0 },
        { width: '12.2em', opacity: 1, duration: 1 },
        'Start'
      )
      .addLabel($(navigationItems).eq(0).text())
      .fromTo($(brandBox), { opacity: 0 }, { opacity: 1 }, 'Start+=0.3')
      .call(() => addClassToElement(brandBox, 'border'))
      .add(letterAnimation($(modularBox).find(metadata).find('div'), 0.15), '-=1.15');

    // Hero Boxes Coming
    main
      .addLabel('heroBoxes')
      .from(heroBoxesLeft, { opacity: 0, x: '-12em', stagger: 0.15, duration: 1.2 }, 'heroBoxes')
      .from(heroBoxesRight, { opacity: 0, x: '12em', stagger: 0.15, duration: 1.2 }, '<');

    // Hero Boxes Texts
    main
      .addLabel('heroBoxesText')
      .add(
        letterAnimation($(heroBoxesLeft).closest(heroBox).find(metadata).children(), 'label'),
        'heroBoxesText'
      )
      .add(
        letterAnimation(
          $(heroBoxesRight).closest('.hero-devices_box').find(metadata).children(),
          'label'
        ),
        '<'
      );

    // Arrows + Border
    main
      .addLabel('arrowsAndBorder')
      .call(() => triggerElementClick(iconBoxArrow))
      .to(iconBoxArrow, { opacity: 1, duration: 0 }, 'arrowsAndBorder');
    return main;
  };
  const dashboardTransition = () => {
    let main = gsap.timeline();

    // Expand the Square
    main
      .addLabel('expandSquare')
      .fromTo(
        modularBox,
        { width: '12.2em', height: '12.2em' },
        { width: '90.4em', height: '37.2em', duration: 1 }
      )
      .to(
        [brandLogo, heroBoxesLeft, heroBoxesRight, metadata, iconBoxArrow, cloudBorder],
        { opacity: 0, duration: baseDuration },
        'expandSquare+=0.4'
      );

    // Show Graphs
    main.fromTo(
      [dashboard, graphs],
      { opacity: 0, display: 'none' },
      { opacity: 1, display: 'flex', duration: baseDuration },
      'expandSquare+=0.4'
    );

    return main;
  };
  const platfrom = () => {
    let main = gsap.timeline();

    // Initial Reveal
    main
      .addLabel('Reveal')
      .add(initialReveal())
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .add(gsap.delayedCall(5, () => {}));

    return main;
  };
  const inferenceEngine = () => {
    let main = gsap.timeline();
    // Inference Engine
    main
      .addLabel('showGraph')
      .addLabel('animateGraph1')
      .to(dashboardInner, { opacity: 0, display: 'none' }, '<')
      .add(animateLabel($(graphHead).children(), 0.05), '<')
      .add(scaleGraph($(graphBox).eq(0)), '<')
      .add(animateGraph($(graphBox).eq(0)), '>-0.4')
      .addLabel('animateGraph2')
      .add(scaleGraph($(graphBox).eq(1)), '<')
      .add(animateGraph($(graphBox).eq(1)), '>-0.4')
      .addLabel('animateGraph3')
      .add(scaleGraph($(graphBox).eq(2)), '<')
      .add(animateGraph($(graphBox).eq(2)), '>-0.4')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .add(gsap.delayedCall(6, () => {}));
    return main;
  };
  const mojo = () => {
    let main = gsap.timeline();
    // Transition Code
    main
      .addLabel('graph expand')
      .to([$(graphBox).not(':first-child'), $(graphBox).children(), graphHead], {
        opacity: 0,
        duration: 0.3,
      })
      .to(firstGraph, { width: '100%', duration: 1 })
      .addLabel('show Dashboard')
      .fromTo(
        [dashboardInner],
        { opacity: 0, display: 'none' },
        { opacity: 1, display: 'flex', duration: 0.5 }
      )
      .to(closeCircles, { opacity: 1, stagger: 0.1, duration: baseDuration }, '<-=0.3')
      .add(letterAnimation(dashboardTitle + ' div', 'label'), '<')
      .to([dashboardTitle, langTab], { opacity: 1, duration: baseDuration, stagger: 0.2 }, '<')
      .to(dashboardCode, { opacity: 1, duration: baseDuration }, '<')
      .addLabel('graph fade out')
      .to(graphs, { opacity: 0, display: 'none', duration: 0.5 });

    // Animate the Python Code
    main.addLabel('pythonCode').add(codeAnimation(pythonCode), '<').add(codeFile(fileType, 0), '<');

    // Switch Code Tabs
    main
      .addLabel('switchCodeTabs', '+=2')
      .to(pythonTab, { opacity: 0, duration: baseDuration / 2 }, 'switchCodeTabs')
      .to(mojoTab, { opacity: 1, display: 'flex', duration: baseDuration }, '<')
      .set(pythonCode, { display: 'none' }, '<')
      .set(mojoCode, { display: 'block' }, '<');

    // Animate the Mojo Code
    main.add(codeAnimation(mojoCode), '<').add(codeFile(fileType, 1), '<');

    return main;
  };

  // Hero Animation
  const heroTrigger = {
    trigger: '.section_headera',
    start: 'top center',
    end: 'bottom top',
    toggleActions: 'play none none none',
  };
  const heroAnimation = () => {
    // Animation
    const main = gsap.timeline({
      delay: 0.5,
      ease: Power2.easeOut,
      scrollTrigger: heroTrigger,
      paused: true,
    });

    // Define Animation
    main
      // Platform
      .addLabel(navigationsText[0] + '-Start')
      .add(platfrom(), '<')
      .addLabel(navigationsText[0] + '-End')
      // Dashboard Transition
      .add(dashboardTransition())
      // Inference
      .addLabel(navigationsText[1] + '-Start')
      .add(animateHeadings(1))
      .add(inferenceEngine(), '<')
      .addLabel(navigationsText[1] + '-End')
      // Mojo
      .addLabel(navigationsText[2] + '-Start')
      .add(animateHeadings(2))
      .add(mojo(), '<')
      .addLabel(navigationsText[2] + '-End');

    // --- Start Animation

    // --- Hero Navigation Clicks
    $(navigationItems)
      .off('click')
      .on('click', function (event) {
        event.stopPropagation();
        event.preventDefault();

        let index = $(this).index();
        let text = navigationsText[index];

        if (index === 0) {
          animateHeadings(0);
          if (brandLogoClickTriggered === true) {
            triggerElementClick(brandLogo);
          }
        }

        main.seek(text + '-Start').tweenFromTo(text + '-Start', text + '-End');

        console.log('Click');
      });

    return main;
  };

  // ------------- Start of Hero Dashboard Animation ----------

  ScrollTrigger.matchMedia({
    '(min-width: 768px)': function () {
      brandLogoClickTriggered = false;
      const tl = heroAnimation();
      tl.seek(navigationsText[1] + '-Start').addPause(navigationsText[1] + '-End');
    },
    '(max-width: 767px)': function () {
      let mobileAnim = gsap.timeline({
        scrollTrigger: heroTrigger,
      });
      brandLogoClickTriggered = false;
      mobileAnim.add(initialReveal());
      animateHeadings(0);
    },
  });

  // ------------- End  of Hero Dashboard Animation ----------
  // --- Swieprs
  function initSwiper(swiperSelector, mediaQueryString, customConfig) {
    let swiperInstance;
    let initStatus = false;

    function handleSwiper() {
      const mediaQuery = window.matchMedia(mediaQueryString);
      const shouldInitialize = mediaQuery.matches;

      if (shouldInitialize) {
        if (!initStatus) {
          initStatus = true;
          swiperInstance = new Swiper(swiperSelector, {
            slidesPerView: 1,
            spaceBetween: 24,
            speed: 250,
            observer: true,
            touchMoveStopPropagation: false,
            preventInteractionOnTransition: true,
            pagination: {
              el: '.swiper-navigation',
              type: 'bullets',
              clickable: true,
              bulletActiveClass: 'w-active',
              bulletClass: 'w-slider-dot',
            },
            ...customConfig,
          });
        }
      } else {
        if (initStatus) {
          if (swiperInstance) {
            swiperInstance.destroy(true, true);
          }
          initStatus = false;
        }
      }
    }

    window.addEventListener('load', handleSwiper);
    window.addEventListener('resize', handleSwiper);

    return handleSwiper;
  }

  const handleHeroSwiper = initSwiper('.hero-swiper', '(max-width: 767px)', {
    on: {
      slideChange: function () {
        animateHeadings(this.activeIndex);
      },
    },
  });

  initSwiper('.carda_slider', '(max-width: 991px)', {});

  // --- Homepage Rest
  // Model Deployment
  $('#deployment-visual').each(function () {
    let triggerElement = $(this);
    let tl = gsap.timeline({
      ease: Power2.easeOut,
      paused: true,
      scrollTrigger: {
        trigger: triggerElement,
        // trigger element - viewport
        start: '50% bottom',
        onEnter: () => {
          // Play the timeline when the trigger element enters the viewport
          tl.play();
        },
      },
    });
    let icons = $(this).find('.cardj_row1').add('.cardj_row2').find('.w-embed');
    tl.fromTo(icons, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05 });
    tl.fromTo($(this).find('.cardj_row2'), { opacity: 0 }, { opacity: 1 }, '<').add(
      letterAnimation($(this).find('.text-size-tiny'), 'label')
    );
  });

  // Hardware Animation
  $('.cardd_visual.hardware').each(function () {
    let triggerElement = $(this);
    let tl = gsap.timeline({
      ease: Power2.easeOut,
      paused: true,
      scrollTrigger: {
        trigger: triggerElement,
        // trigger element - viewport
        start: '50% bottom',
        onEnter: () => {
          // Play the timeline when the trigger element enters the viewport
          tl.play();
        },
      },
    });
    tl.fromTo(
      $(this).find('.cardd_logo-box'),
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.05 }
    );
    tl.fromTo(
      $(this).find('.cardd_logo-line-2').add('.cardd_logo-line-1'),
      { opacity: 0 },
      { opacity: 1 }
    );
  });

  // Discord Animation
  $('.discord_box').each(function () {
    let triggerElement = $(this);
    let tl = gsap.timeline({
      ease: Power2.easeOut,
      paused: true,
      scrollTrigger: {
        trigger: triggerElement,
        // trigger element - viewport
        start: '50% bottom',
        onEnter: () => {
          // Play the timeline when the trigger element enters the viewport
          tl.play();
        },
      },
    });
    // Add the animation to the timeline
    tl.fromTo(
      $(this).find('.discord_card'),
      1,
      { y: '1rem', opacity: 0 },
      { y: '0rem', opacity: 1 }
    )
      .fromTo(
        $(this).find('.discord_bg'),
        1,
        { y: '1rem', opacity: 0 },
        { y: '0rem', opacity: 1 },
        '<0.3'
      )
      .from(
        $(this).find('.discord_avatar,.discord_message-text:first-child, .discord_message-time'),
        0.5,
        {
          opacity: 0,
          stagger: 0.15,
        },
        '<'
      )
      .add(letterAnimation($(this).find('.discord_message-text').eq(1), 0.03));
  });

  // Animate Graph
  $('.grapha_row').each(function () {
    animateHorizontalGraph($(this), 'a', '.grapha');
  });
});

// --- Flip Menu Color to Black
$(window).on('load resize scroll', function () {
  $('.section_videohero').each(function () {
    if (isElementInView($(this))) {
      $('.navbar_wrapper').addClass('white');
    } else {
      $('.navbar_wrapper').removeClass('white');
    }
  });
});

function isElementInView(elem) {
  var $elem = $(elem);
  var $window = $(window);

  var docViewTop = $window.scrollTop();
  var docViewBottom = docViewTop + $window.height();

  var elemTop = $elem.offset().top;
  var elemBottom = elemTop + $elem.height();

  // Check if the element is within the viewport
  return elemTop < docViewBottom && elemBottom > docViewTop;
}
