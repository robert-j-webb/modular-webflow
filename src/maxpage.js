import { codeAnimation, codeFile, letterAnimation, typeText } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

$(document).ready(function () {
  // #region Tabs implementation:
  const activeClass = 'tab-active';
  const progressLine = '.tabs_block-progress-line';
  const duration = 4000;

  // Animates a card, by typing the text and filename.
  function cardAnimation(card) {
    return new Promise((resolve) => {
      card.addClass('active');
      resolve();
    });
  }

  // Initializes the tab carousel for desktop
  tabCarousel({
    tabs: $('.tabs .tabs_block-link-menu .tabs_block-link'),
    cards: $('.tabs .max-products .max-products_grid-cell'),
    onCardLeave: (card) => {
      card.removeClass('active');
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

      let cards = $('.tabs_slider .max-products .max-products_grid-cell');

      cards.removeClass('active');
      cards.eq(activeSlide.index()).addClass('active');
    },
    onInit() {
      const sliderCodes = $('.tabs_slider .cardb_visual .dashboard_code-block');
      $(sliderCodes).hide();
    },
    duration,
  });

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
