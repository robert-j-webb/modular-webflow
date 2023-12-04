gsap.registerPlugin(ScrollTrigger);
import { animateHorizontalGraph } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

import { Termynal } from './utils/termynal';
$(document).ready(function () {
  // #region Animate Graph

  $('.grapha_row').each(function () {
    animateHorizontalGraph($(this), 'a', '.grapha');
  });
  // #endregion

  // #region Tabs implementation

  const activeClass = 'tab-active';
  const progressLine = '.tabs_block-progress-line';
  const duration = 4000;

  // Animates a card, by typing the text and filename.
  function cardAnimation(card) {
    return new Promise((resolve) => {
      card.show();
      card.css('opacity', '0.0');
      card.animate({ opacity: '1' }, 200, resolve);
    });
  }

  // Initializes the tab carousel for desktop
  tabCarousel({
    tabs: $('.tabs_block-link-menu .tabs_block-link'),
    cards: $('.tabs_visuals > img'),
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
    sliderSelector: '.tabs_slider',
    // On init and when the swiper slides, we animate the progressbar and code
    // block, but only animate the code the first time it's shown.
    animateOnSlide(activeSlide) {
      // Set progressLine to 0 and then start an animation for it.
      activeSlide
        .find(progressLine)
        .stop(true, true)
        .css('width', '0')
        .animate({ width: '100%' }, duration);
    },
    onInit() {},
    duration,
  });

  // #endregion

  // #region Termynal Animation
  // Define your existing code as a function
  function runCode() {
    // Define all Termynal instances on page load
    termynalsArr.forEach((id) => {
      defineTermynal(id);
      initTermynal(id);
    });

    // Set up infinite loop animation for each Termynal instance
    Object.values(termynals).forEach((instance) => {
      restartAnimation(instance);
    });
    $(`#mojoCode`).css('visibility', 'visible');
  }

  // Initialize the Intersection Observer
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCode();
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: '0% 0% -50% 0%', // Adjust the values as needed
    }
  );

  // Target the element you want to observe (replace with your specific selector)
  const headerA1CodeElement = document.querySelector('.headera1_code');

  // Start observing the element
  if (headerA1CodeElement) {
    observer.observe(headerA1CodeElement);
  }

  // Terminal Logic
  let termynalsArr = ['termynal-1'];
  const termynals = {};

  function defineTermynal(elementID) {
    console.log(`Defining Termynal for: ${elementID}`);
    termynals[elementID] = new Termynal(`#${elementID}`, {
      startDelay: 600,
      noInit: true,
    });
  }
  function initTermynal(elementID) {
    if (termynals[elementID]) {
      termynals[elementID].init();
      $(`#${elementID}`).css('visibility', 'visible');
    } else {
      console.warn(`Termynal instance for ${elementID} not found.`);
    }
  }
  function restartAnimation(termynalInstance) {
    termynalInstance.container.addEventListener('termynal-anim-end', () => {
      setTimeout(() => {
        termynalInstance.init();
      }, 3000); // (DEFINE THE DELAY BEFORE REINIT);
    });
  }

  // #endregion

  // #region Marguee
  // Marquee Strip
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== 'string' || attrVal.trim() === '') return defaultVal;
    if (attrVal === 'true' && defaultValType === 'boolean') return true;
    if (attrVal === 'false' && defaultValType === 'boolean') return false;
    if (isNaN(attrVal) && defaultValType === 'string') return attrVal;
    if (!isNaN(attrVal) && defaultValType === 'number') return +attrVal;
    return defaultVal;
  }
  // marquee component
  $(document).ready(function () {
    const initMarquee = () => {
      if (window.matchMedia('(min-width: 992px)').matches) {
        $("[tr-marquee-element='component']").each(function () {
          const componentEl = $(this),
            panelEl = componentEl.find("[tr-marquee-element='panel']");
          let speedSetting = attr(100, componentEl.attr('tr-marquee-speed')),
            verticalSetting = attr(false, componentEl.attr('tr-marquee-vertical')),
            reverseSetting = attr(false, componentEl.attr('tr-marquee-reverse')),
            moveDistanceSetting = -100;
          if (reverseSetting) moveDistanceSetting = 100;

          const updateMarqueePosition = (progress) => {
            if (verticalSetting) {
              gsap.set(panelEl, { yPercent: progress * moveDistanceSetting });
            } else {
              gsap.set(panelEl, { xPercent: progress * moveDistanceSetting });
            }
          };

          const marqueeTimeline = gsap.timeline();

          const scrollTriggerInstance = ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
              const scrollProgress = self.progress;
              updateMarqueePosition(scrollProgress);
            },
          });

          // Store ScrollTrigger instance in the component's data
          componentEl.data('scrollTrigger', scrollTriggerInstance);
        });
      } else {
        $("[tr-marquee-element='component']").each(function () {
          const componentEl = $(this),
            panelEl = componentEl.find("[tr-marquee-element='panel']");

          // Retrieve and kill the corresponding ScrollTrigger instance
          const st = componentEl.data('scrollTrigger');
          if (st) {
            st.kill();
            componentEl.removeData('scrollTrigger');
          }

          gsap.set(panelEl, { clearProps: 'all' });
        });
      }
    };

    // Run the function on load
    initMarquee();

    // Run the function on resize
    $(window).on('resize', initMarquee);
  });
  // #endregion
});
