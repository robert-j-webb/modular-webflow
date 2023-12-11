import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

import { typeText } from './utils/globalFunctions';

$(document).ready(function () {
  // #region Tabs implementation

  const activeClass = 'tab-active';
  const progressLine = '.tabs_block-progress-line';
  const duration = 4000;

  // The pytorch Els are the only ones that change size, so we can just get them
  // once at initialization and order them appropriately.
  const pytorchEls = [
    jQuery('.tabs .graphc_item.tab2_2'),
    jQuery('.tabs .graphc_item.tab1_2'),
    jQuery('.tabs .graphc_item.tab3_2'),
  ];
  const pytorchWidthHeight = pytorchEls.map((el) => [el.css('width'), el.css('height')]);
  let prevIdx = 0;

  function cardAnimation(card) {
    return new Promise((resolve) => {
      const curIdx = $('.tabs .tabs_inner').index(card);

      // Do nothing if we are returning to same index we were on. Maybe this
      // should be present for all tabs?
      if (curIdx === prevIdx) {
        card.show();
        return resolve();
      }
      const textTimeline = gsap.timeline({
        onComplete: resolve,
        defaults: { ease: 'none', speed: 1 },
      });

      card.find('.animateable').each(function () {
        textTimeline.to($(this), { text: { value: $(this).text() } }, '>');
        $(this).html('');
      });

      // Set current pytorch el to previous one's width / height so we can animate to actual width/height
      pytorchEls[curIdx].css('width', pytorchWidthHeight[prevIdx][0]);
      pytorchEls[curIdx].css('height', pytorchWidthHeight[prevIdx][1]);
      card.show();

      // I use a jQuery animate. I could use gsap here but it's not needed.
      pytorchEls[curIdx].animate(
        { width: pytorchWidthHeight[curIdx][0], height: pytorchWidthHeight[curIdx][1] },
        600
      );
      prevIdx = curIdx;
    });
  }

  // Initializes the tab carousel for desktop
  tabCarousel({
    tabs: $('.tabs .tabs_block-link-menu .tabs_block-link'),
    cards: $('.tabs .tabs_inner'),
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
});
