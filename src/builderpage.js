import { codeAnimation } from '$utils/globalFunctions';

// Tabs
const responsive = '(min-width: 992px)';
let isInitialized = false;

const tabLinks = $('.tabs_block-link-menu .tabs_block-link');
const tabCodes = $('.tabs .cardb_visual .dashboard_code-block');
const activeClass = 'tab-active';
const progressLine = $('.tabs_block-progress-line');
const duration = 4000;

let shouldAnimate = true;

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
  codeAnimation(tabCodes.eq(nextIndex));
};

const initTabs = () => {
  isInitialized = true;
  tabLinks.eq(0).addClass(activeClass);

  // Start looped animation
  switchTab();

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
    const codeBlock = swiperInstance.slides[activeIndex].querySelector(
      '.hero-dashboard_code-block'
    );

    // Run codeAnimation() this function on that child
    if (codeBlock) {
      $(codeBlock).show();
      codeAnimation(codeBlock);
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
