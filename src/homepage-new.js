gsap.registerPlugin(ScrollTrigger);

import { animateHorizontalGraph, letterAnimation } from '$utils/globalFunctions';

$(document).ready(function () {
  // Init Reveal
  const intervalId = setInterval(function () {
    if (window.gsap) {
      clearInterval(intervalId); // stop checking for the object
      setTimeout(() => {
        let heroTl = gsap.timeline();

        heroTl.from('[hero-pattern-lines]', {
          opacity: 0,
        });
        heroTl.from('[hero-pattern-square]', {
          scale: 0,
        });

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
      }, 400);
    }
  }, 100);

  let termynalsArr = ['termynal-1'];

  function restartAnimation(termynalInstance) {
    termynalInstance.container.addEventListener('termynal-anim-end', () => {
      setTimeout(() => {
        termynalInstance.init();
      }, 3000); // (DEFINE THE DELAY BEFORE REINIT);
    });
  }

  // Dictionary to hold the Termynal objects by their IDs
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
