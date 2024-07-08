import { codeAnimation, codeFile, letterAnimation, typeText } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

// #region Tabs
/// Tabs implementation:
const activeClass = 'tab-active';
const progressLine = $('.mojo-tabs_progress-line');
const descSelector = $('#desc-text');
const tabTimeline = gsap.timeline({ imgPaused: true });
const duration = 4000;

// Animates a card, by typing the text and filename.
function cardAnimation(card) {
  return new Promise((resolve) => {
    card.show();

    const descTxt = card.attr('desc-text');
    const descWidth = card.attr('desc-width');
    const typeFileNameTimeline = gsap.timeline();

    // File
    descSelector.fadeOut(() => {
      descSelector.text(descTxt);
      $('.mojo-tabs_content').css('max-width', descWidth);
      descSelector.fadeIn();
    });

    // Code
    tabTimeline.add(codeAnimation(card)).add(typeFileNameTimeline, '<');
    tabTimeline.play();
    tabTimeline.then(resolve);
  });
}

function revealText(card) {
  const descTxt = card.attr('desc-text');
  const descWidth = card.attr('desc-width');
  const typeFileNameTimeline = gsap.timeline();

  // File
  descSelector.fadeOut(() => {
    descSelector.text(descTxt);
    $('.mojo-tabs_content').css('max-width', descWidth);
    descSelector.fadeIn();
  });
}

// TABS 1
tabCarousel({
  tabs: $('.mojo-tabs_list').eq(0).find('.mojo-tabs_item'),
  cards: $('.mojo-tabs_dashboard').eq(0).find('.dashboard_code-block'),
  onCardLeave: (card) => {
    card.hide();
  },
  onTabLeave: (tab) => {
    tab.removeClass(activeClass);
    // If this is called mid animation (by a click) this will stop it.
    progressLine.stop();
    progressLine.css('width', '0');
  },
  onCardShow: cardAnimation,
  onTabShow: (tab) => {
    return new Promise((resolve) => {
      tab.addClass(activeClass);
      progressLine.animate({ width: '100%' }, duration, resolve);
    });
  },
});

let cards = $('.mojo-tabs_dashboard').eq(1).find('.dashboard_code-block');

// SWIPER 1
new Swiper('.mojo-tabs_slider', {
  slidesPerView: 'auto',
  spaceBetween: 12,
  speed: 250,
  autoplay: {
    delay: duration,
  },
  centeredSlides: true,
  observer: true,
  on: {
    slideChange: (swiperInstance) => {
      progressLine.stop();
      progressLine.css('width', '0');
      cards.fadeOut(100, () => {
        let activeCard = cards.eq(swiperInstance.realIndex);
        progressLine.animate({ width: '100%' }, duration);
        activeCard.fadeIn();
        revealText(activeCard);
      });
    },
  },
});
// #endregion
