import { codeAnimation, codeFile, letterAnimation, typeText } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

$(document).ready(function () {
  /// Tabs implementation:
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
});
