import { codeAnimation, codeFile, letterAnimation, typeText } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

gsap.registerPlugin(ScrollTrigger);

$(document).ready(function () {
  // #region Hero Animation

  let activeStage = 0;
  let stageDelay = 2;
  let stages = $('[class^=headerb_stage-]');
  let stepTitles = ['Programmable', 'Performant', 'Portable'];
  let loaded = false;

  // Step 1
  const heroStep0 = () => {
    let tl = gsap.timeline({
      defaults: {
        ease: Power3.easeOut,
      },
      onStart: function () {
        runOnStart(this);
      },
    });
    let logoBox1 = $('#logo-box_1');
    let logo1 = logoBox1.find('#logo_1');

    let logoBox2 = $('#logo-box_2');
    let logo2 = logoBox2.find('#logo_2');

    let logoBox3 = $('#logo-box_3');
    let logo3 = logoBox3.find('#logo_3');

    let title = $('#title');
    let versus = $('#vs');

    let mojoBox = $('#mojo-box');

    tl.add(cycleStage(0));
    tl.fromTo(
      [logoBox1, logoBox2, logoBox3],
      { opacity: 0, xPercent: -10 },
      { opacity: 1, xPercent: 0, stagger: 0.15 }
    );
    tl.fromTo(
      [logo1, logo2, logo3],
      { opacity: 0, xPercent: -10 },
      { opacity: 1, xPercent: 0, stagger: 0.15 },
      '<0.1'
    );
    tl.fromTo(title, { opacity: 0 }, { opacity: 1 }, '<0.2');
    tl.fromTo(mojoBox, { opacity: 0, xPercent: -60 }, { opacity: 1, xPercent: 0, duration: 1 });
    tl.fromTo(versus, { opacity: 0 }, { opacity: 1 }, '<0.5');

    return tl;
  };

  // Step 2
  const heroStep1 = () => {
    let ootfBox = $('#ootb_logo');
    let slowBar1 = $('#bar-slow_1');
    let slowBar2 = $('#bar-slow_2');
    let slowBar3 = $('#bar-slow_3');

    let maxLogo = $('#max_logo');
    let fastBar1 = $('#bar-fast_1');
    let fastBar2 = $('#bar-fast_2');
    let fastBar3 = $('#bar-fast_3');

    let header = $('#headers');
    let numbers = $('#numbers');
    let grid = $('#grid');

    let barsDuration = 0.7;

    let tl = gsap.timeline({
      defaults: {
        ease: Power2.easeOut,
      },
      onStart: function () {
        runOnStart(this);
      },
    });

    // Graph 1
    tl.add(cycleStage(1));
    tl.fromTo(
      [ootfBox, maxLogo, header, numbers],
      { opacity: 0, xPercent: -15 },
      { opacity: 1, xPercent: 0, duration: 0.5 }
    );
    tl.fromTo(grid, { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, '<');

    // Slow Bars
    tl.addLabel('bars-start', '<0.2');
    tl.fromTo(slowBar3, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, 'bars-start');
    tl.fromTo(slowBar2, { scaleX: 0 }, { scaleX: 0.428, duration: barsDuration }, '<');
    tl.fromTo(slowBar1, { scaleX: 0 }, { scaleX: 0.295, duration: barsDuration }, '<');

    tl.to(slowBar2, { scaleX: 1, duration: barsDuration });
    tl.to(slowBar1, { scaleX: 0.695, duration: barsDuration }, '<');

    tl.to(slowBar1, { scaleX: 1, duration: barsDuration });

    tl.fromTo(fastBar3, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, 'bars-start');
    tl.fromTo(fastBar2, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, '<');
    tl.fromTo(fastBar1, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, '<');

    return tl;
  };

  // Step 3
  const heroStep2 = () => {
    let tl = gsap.timeline({
      ease: Power0.easeOut,
      onStart: function () {
        runOnStart(this);
      },
    });
    tl.add(cycleStage(2));
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    tl.add(() => {}, '+=4');

    return tl;
  };

  // Main
  let main = gsap.timeline({
    repeat: -1,
    repeatDelay: stageDelay,
  });

  main.add(heroStep0());
  main.add(heroStep1(), `+=${stageDelay}`);
  main.add(heroStep2(), `+=${stageDelay}`);

  // -- Functions
  function runOnStart(instance) {
    animateLabel();
    animateProgressBar(instance._dur);
    activeStage = (activeStage + 1) % stages.length;
  }

  function cycleStage(index) {
    let tl = gsap.timeline();

    tl.to(stages, {
      opacity: 0,
      duration: 0.2,
    });
    tl.set(stages.eq(index), { opacity: 1 });

    return tl;
  }
  // Header Animations
  function animateProgressBar(duration) {
    gsap.fromTo(
      '.home-anim_progress-bar',
      { width: '0%' },
      { width: '100%', ease: 'none', duration: duration + stageDelay }
    );
  }

  let activeAnimation = { timeline: null, splitInstance: null };

  function revertLabel() {
    return new Promise((resolve) => {
      if (activeAnimation.timeline) {
        activeAnimation.timeline.reverse().then(() => {
          // Ensure SplitType changes are reverted after reversing the animation
          if (activeAnimation.splitInstance && activeAnimation.splitInstance.split.revert) {
            activeAnimation.splitInstance.split.revert(); // Revert changes made by SplitType
          }
          resolve(); // Resolve the promise after reverting
        });
      } else {
        resolve(); // Resolve immediately if there's no animation to revert
      }
    });
  }
  function animateLabel() {
    if (loaded) {
      let parentContainer = document.querySelector('#hero-label');
      let container = document.createElement('span');
      container.textContent = `\u00A0${stepTitles[activeStage]}\u00A0`;
      parentContainer.innerHTML = '';
      parentContainer.appendChild(container);

      // Initialize SplitType for the new content
      activeAnimation.splitInstance = new SplitType(container, { types: 'chars' });
      let tl = gsap.timeline();

      // Animate characters appearing
      $(parentContainer).css({ 'padding-right': '0.2em', 'padding-left': '0.2em' });
      tl.fromTo(
        $(activeAnimation.splitInstance.chars),
        { opacity: 0 },
        { opacity: 1, ease: 'power2', stagger: 0.04 }
      );

      // Update the global activeAnimation object
      activeAnimation.timeline = tl;
    }
    loaded = true;
  }

  // #endregion

  // #region Tabs

  // #region Autoplay Tabs
  const activeClass = 'tab-active';
  const progressLine = '.tabs_block-progress-line';
  const fileNameSelector = '.dashboard_head-filename';
  const tabTimeline = gsap.timeline({ paused: true });
  const duration = 4000;

  // Animates a card, by typing the text and filename.
  function cardAnimation(card) {
    return new Promise((resolve) => {
      card.show();
      const fileNameTxt = card.find('.file-name').text();
      const fileNameEl = card.parent().parent().find(fileNameSelector);
      fileNameEl.text('');
      const typeFileNameTimeline = gsap.timeline();
      typeFileNameTimeline.add(typeText(fileNameEl, fileNameTxt));
      tabTimeline.add(codeAnimation(card)).add(typeFileNameTimeline, '<');
      tabTimeline.play();
      tabTimeline.then(resolve);
    });
  }

  // TABS 1
  tabCarousel({
    tabs: $('.tabs').eq(0).find('.tabs_block-link-menu .tabs_block-link'),
    cards: $('.tabs').eq(0).find('.cardb_visual .dashboard_code-block'),
    onCardLeave: (card) => {
      card.hide();
    },
    onTabLeave: (tab) => {
      tab.removeClass(activeClass);
      // If this is called mid animation (by a click) this will stop it.
      tab.find(progressLine).stop();
      tab.find(progressLine).css('width', '0');
    },
    onCardShow: cardAnimation,
    onTabShow: (tab) => {
      return new Promise((resolve) => {
        tab.addClass(activeClass);
        tab.find(progressLine).animate({ width: '100%' }, duration, resolve);
      });
    },
  });

  swiperCarousel({
    sliderSelector: '.tabs_slider._1',
    // On init and when the swiper slides, we animate the progressbar and code
    // block, but only animate the code the first time it's shown.
    animateOnSlide(activeSlide) {
      // Set progressLine to 0 and then start an animation for it.
      activeSlide
        .find(progressLine)
        .stop(true, true)
        .css('width', '0')
        .animate({ width: '100%' }, duration);

      const codeBlock = activeSlide.find('.dashboard_code-block');

      // Run codeAnimation() this function on that child only if it hasn't been animated before
      if (codeBlock && !codeBlock.hasClass('animated')) {
        cardAnimation(codeBlock);
        codeBlock.addClass('animated');
      }
    },
    onInit() {
      const sliderCodes = $('.tabs_slider').eq(0).find('.cardb_visual .dashboard_code-block');
      $(sliderCodes).hide();
    },
    duration,
  });

  // #endregion

  // #region Swipers
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
              el: '.swiper-navigation.latest',
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

    handleSwiper();
    window.addEventListener('resize', handleSwiper);

    return handleSwiper;
  }
  initSwiper('.latest_slider', '(max-width: 991px)', {});
  // #endregion
});
