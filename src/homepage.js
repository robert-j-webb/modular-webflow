gsap.registerPlugin(ScrollTrigger);

import { ElementFlags } from 'typescript';

import { animateHorizontalGraph, codeAnimation, letterAnimation } from '$utils/globalFunctions';

import { wrapLetters } from './utils/globalFunctions';

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

  // Dashboard Elements
  const dashboard = '#dashboard';
  const dashboardInner = dashboard + ' .hero-dashboard_inner';
  const dashboardCode = dashboard + ' .hero-dashboard_code';
  const closeCircles = dashboard + ' .hero-dashboard_close circle';
  const dashboardTitle = dashboard + ' .hero-dashboard_head-label';
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
    'The <span class="word-highlight">fastest unified AI inference</span> <span class="word-highlight">engine</span> in the world.',
    'A <span class="word-highlight">new language</span> that <span class="word-highlight">extends</span> <span class="word-highlight">Python</span> but thats <span class="word-highlight">as fast as C</span>',
  ];

  // --- Functions
  // Insta Functions
  function switchDeviceIcons() {
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
    let tlAnimation;
    wrapLetters(heroHeading);
    updateNavigation(index);
  }
  function updateNavigation(index) {
    let items = $(navigationItems);
    items.removeClass('active');
    items.eq(index).addClass('active');
  }
  function triggerElementClick(element) {
    $(element).trigger('click');
  }
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
        tl.call(() => checkWidth(width)).call(() => switchHeadings(index));
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
      .add(animateLabel($(parent).find(graphNumberLabel).children()), '<+=0.3')
      .set($(parent).find(graphNumber), { yPercent: 10, opacity: 0 }, '<')
      .to(
        $(parent).find(graphNumber),
        { yPercent: 0, opacity: 1, duration: baseDuration },
        '<+=0.15'
      )
      .add(animateLabel($(parent).find(graphLegend).children()), '<+=0.3');

    return tl;
  };

  // Animations Parts
  const initialReveal = () => {
    let main = gsap.timeline();
    main
      .addLabel('Start')
      .call(() => triggerElementClick(brandLogo))
      .call(() => updateNavigation(0))
      .add(letterAnimation(heroHeading, 'heading'), '<')
      .call(() => triggerElementClick(brandLogo))
      .from(heroButtons, { opacity: 0, stagger: 0.1, duration: baseDuration }, '<0.1')
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
  const platfrom = () => {
    let main = gsap.timeline();

    // Initial Reveal
    main.addLabel('Reveal').add(initialReveal());

    // Loop Devices
    let staggerDuration = (index) => {
      return 2 - 0.15 * index;
    };
    const CloudsSwitch = gsap
      .timeline()
      .to(heroBoxesRight, {
        opacity: 0,
        duration: 0.15,
      })
      .set(heroBoxesRight, {
        x: '3em',
      })
      .call(() => switchDeviceIcons)
      .to(heroBoxesRight, {
        opacity: 1,
        x: '0',
        duration: (index) => {
          return staggerDuration(index);
        },
        stagger: 0.15,
      });

    const repeatedCloudsSwitch = gsap
      .timeline()
      .add(CloudsSwitch)
      .delay(1)
      .repeat(1)
      .repeatDelay(1);
    main.addLabel('loopDevices');
    main.add(repeatedCloudsSwitch, 'loopDevices');

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
      .add(animateGraph($(graphBox).eq(2)), '>-0.4');

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
    return main;
  };
  const mojo = () => {
    let main = gsap.timeline();
    // Mojo
    main.addLabel($(navigationItems).eq(2).text(), '<');

    // Animate the Python Code
    main.addLabel('pythonCode').add(codeAnimation(pythonCode), 'pythonCode+0.3');

    // Switch Code Tabs
    main
      .addLabel('switchCodeTabs')
      .to(pythonTab, { opacity: 0, duration: baseDuration / 2 }, 'switchCodeTabs')
      .to(mojoTab, { opacity: 1, display: 'flex', duration: baseDuration }, '<')
      .set(pythonCode, { display: 'none' }, '<')
      .set(mojoCode, { display: 'block' }, '<');

    // Animate the Mojo Code
    main.add(codeAnimation(mojoCode), 'mojoCode+0.3').addLabel('mojoCode');

    return main;
  };

  // Hero Animation
  const heroAnimation = () => {
    // Animation
    const main = gsap.timeline({
      delay: 0.5,
      ease: Power2.easeOut,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
      },
    });

    // Define Animation
    main
      // Platform
      .addLabel($(navigationItems).eq(0).text())
      .add(platfrom(), '<')
      // Inference
      .addLabel($(navigationItems).eq(1).text())
      .add(animateHeadings(1))
      .add(inferenceEngine(), '<')
      // Mojo
      .addLabel($(navigationItems).eq(2).text())
      .add(animateHeadings(2))
      .add(mojo(), '<');

    // --- Start Animation

    // --- Hero Navigation Clicks
    $(navigationItems).on('click', function () {
      if ($(this).index() === 0) {
        animateHeadings(0, '77%');
      }
      main.restart().seek($(this).text(), false);
    });

    return main;
  };

  // ------------- Start of Hero Dashboard Animation ----------
  ScrollTrigger.matchMedia({
    '(min-width: 768px)': function () {
      let tl = heroAnimation();
      tl.play();
    },
    '(max-width: 767px)': function () {
      let tl = initialReveal();
      animateHeadings(0);
      tl.play();
    },
  });

  // ------------- End  of Hero Dashboard Animation ----------

  // --- Hero Swiper
  let swiper;
  let init = false;

  /* Which media query */
  function swiperMode() {
    const mobile = window.matchMedia('(min-width: 0px) and (max-width: 767px)');
    const desktop = window.matchMedia('(min-width: 768px)');

    // Enable (for desktop)
    if (desktop.matches) {
      if (init) {
        if (swiper) {
          swiper.destroy(true, true);
        }
        init = false;
      }
    }

    // Disable (for desktop)
    else if (mobile.matches) {
      if (!init) {
        init = true;
        swiper = new Swiper('.hero-swiper', {
          // Optional parameters
          slidesPerView: 1,
          spaceBetween: 24,
          speed: 250,
          observer: true,
          touchMoveStopPropagation: false,
          preventInteractionOnTransition: true,
          on: {
            slideChange: function () {
              animateHeadings(swiper.activeIndex);
            },
          },
          // Enable lazy loading
          pagination: {
            el: '.swiper-navigation',
            type: 'bullets',
            clickable: true,
            bulletActiveClass: 'w-active',
            bulletClass: 'w-slider-dot',
          },
        });
      }
    }
  }

  // On Load
  window.addEventListener('load', function () {
    swiperMode();
  });

  // On Resize
  window.addEventListener('resize', function () {
    swiperMode();
  });

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
