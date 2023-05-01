import { codeAnimation, letterAnimation } from '$utils/globalFunctions';

$(document).ready(function () {
  // Hero Animation
  $('#hero').each(function () {
    let heading = $(this).find('h1');
    let par = $(this).find('p');
    let btn = $(this).find('.button');
    let tab = '.dashboard_tab-inner';
    let fileType = '#file-type';
    let tabBrand = '.dashboard_tab-brand-box';
    let tabBrandBG = $(tabBrand).find('rect');
    let tabBrandLogo = $(tabBrand).find('path');
    let pythonLabel = '.dashboard_tab-label.python';
    let mojoLabel = '.dashboard_tab-label.mojo';
    let progressLineCode = '.dashboard_progress-line';
    let pythonCode = '#pythonCode';
    let mojoCode = '#mojoCode';

    const pythonCodeAnim = () => {
      let tl = gsap.timeline();

      tl.fromTo('#dashboard', { opacity: 0 }, { opacity: 1, duration: 0 }, '<').add(
        codeAnimation(pythonCode),
        '<'
      );
      return tl;
    };

    const mojoCodeAnim = () => {
      let tl = gsap.timeline();
      tl.to(tabBrand, { xPercent: 133 }, '+=2')
        .to(tabBrandBG, { fill: '#B5C0F6' }, '<')
        .to(tabBrandLogo, { fill: '#020C13' }, '<')
        .to(pythonLabel, { opacity: 0 }, '<')
        .to(mojoLabel, { opacity: '1', duration: 0 })
        .add(letterAnimation(mojoLabel, 'label'), '<')
        .set(pythonCode, { display: 'none' }, '<')
        .set(mojoCode, { display: 'block' }, '<')
        .add(codeAnimation(mojoCode), '<')
        .add(gsap.delayedCall(3));
      return tl;
    };

    let reveal = gsap.timeline({ delay: 0.6 });
    reveal
      .to(heading, { opacity: 1 })
      .call(() => {
        codeAnim.play();
      })
      .add(letterAnimation('h1'), '<')
      .to(par, { opacity: 1, duration: 0.5 })
      .to(btn, { opacity: 1, duration: 0.5 });

    let codeAnim = gsap.timeline({ repeat: -1, paused: true });
    // Python Code
    codeAnim
      .add(pythonCodeAnim())
      // Mojo Code
      .add(mojoCodeAnim());
  });

  // Tabs
  const responsive = '(min-width: 992px)';
  let isInitialized = false;

  const tabLinks = $('.tabs_block-link-menu .tabs_block-link');
  const tabCodes = $('.tabs .cardb_visual .dashboard_code-block');
  const activeClass = 'tab-active';
  const progressLine = $('.tabs_block-progress-line');
  const duration = 4000;

  let shouldAnimate = true;
  let tabTimeline = gsap.timeline({ paused: true });

  function switchTab() {
    if (!shouldAnimate) {
      return;
    }
    const currentTab = tabLinks.filter('.' + activeClass);
    currentTab.find(progressLine).animate({ width: '100%' }, duration, function () {
      // Reset
      resetTabs();

      // Add
      const currentIndex = currentTab.index();
      let nextIndex = currentIndex >= tabLinks.length - 1 ? 0 : currentIndex + 1;

      // Ensure that the nextIndex is not the same as the currentIndex
      if (nextIndex === currentIndex) {
        nextIndex = currentIndex >= tabLinks.length - 2 ? 0 : currentIndex + 2;
      }

      tabLinks.eq(nextIndex).addClass(activeClass);
      showCode(nextIndex);
      switchTab();
    });
  }

  const resetTabs = () => {
    tabTimeline.clear();
    tabLinks.removeClass(activeClass);
    progressLine.css('width', '0');
    tabCodes.hide();
  };

  const stopAnimation = () => {
    shouldAnimate = false;
    tabLinks.find(progressLine).stop(true, true); // stop the animation immediately
    resetTabs();
  };

  const showCode = (nextIndex) => {
    tabCodes.eq(nextIndex).show();
    tabTimeline.add(codeAnimation(tabCodes.eq(nextIndex)));
    tabTimeline.play();
  };

  const initTabs = () => {
    isInitialized = true;
    tabLinks.eq(0).addClass(activeClass);

    // Start looped animation
    switchTab();
    showCode(0);

    // User Click
    tabLinks.on('click', function () {
      const nextIndex = $(this).index();
      stopAnimation();
      $(this).addClass(activeClass);
      $(this).find(progressLine).animate({ width: '100%' }, 200);
      showCode(nextIndex);
    });
  };

  $(window).on('load resize', function () {
    if (window.matchMedia(responsive).matches) {
      if (!isInitialized) {
        // Define a ScrollTrigger for the .tabs element
        const trigger = ScrollTrigger.create({
          trigger: '.tabs',
          start: 'top center',
          onEnter: () => {
            initTabs();
            trigger.kill(); // Remove the ScrollTrigger once the function has been called
          },
        });
      }
    } else {
      if (isInitialized) {
        stopAnimation();
        isInitialized = false;
      }
    }
  });

  /* Swiper
   **************************************************************/
  let swiper;
  let init = false;
  const sliderCodes = $('.tabs_slider .cardb_visual .hero-dashboard_code-block');

  /* Which media query
   **************************************************************/
  function swiperMode() {
    const mobile = window.matchMedia('(min-width: 0px) and (max-width: 991px)');
    const desktop = window.matchMedia(responsive);

    function handleSwiperSlide(swiperInstance) {
      // Get Active Index
      const { activeIndex } = swiperInstance;

      // Run ProgressBar
      progressLine.stop(true, true);
      progressLine.css('width', '0');
      $(swiperInstance.slides[activeIndex]).find(progressLine).animate({ width: '100%' }, duration);

      // Find child ".hero-dashboard_code-block"
      const codeBlock = swiperInstance.slides[activeIndex].querySelector('.dashboard_code-block');

      // Run codeAnimation() this function on that child only if it hasn't been animated before
      if (codeBlock && !codeBlock.classList.contains('animated')) {
        $(codeBlock).show();
        codeAnimation(codeBlock);
        codeBlock.classList.add('animated'); // Add 'animated' class after running the animation
      }
    }

    // Enable (for desktop)
    if (desktop.matches) {
      if (init) {
        swiper.destroy(true, true);
        init = false;
      }
    }

    // Disable (for desktop)
    else if (mobile.matches) {
      if (!init) {
        init = true;
        swiper = new Swiper('.tabs_slider', {
          // Optional parameters
          slidesPerView: 1,
          spaceBetween: 24,
          speed: 250,
          autoplay: {
            delay: duration,
          },
          observer: true,
          on: {
            init: (swiperInstance) => {
              handleSwiperSlide(swiperInstance);
            },
            slideChange: () => {
              $(sliderCodes).hide();
            },
            transitionEnd: (swiperInstance) => {
              handleSwiperSlide(swiperInstance);
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

  /* On Load
   **************************************************************/
  window.addEventListener('load', function () {
    swiperMode();
  });

  /* On Resize
   **************************************************************/
  window.addEventListener('resize', function () {
    swiperMode();
  });
});
