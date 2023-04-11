import { codeAnimation, letterAnimation } from '$utils/globalFunctions';

// Hero
$(document).ready(function () {
  $('#hero').each(function () {
    let tl = gsap.timeline({ delay: 0.2 });
    let heading = $(this).find('h1');
    let par = $(this).find('p');
    let btn = $(this).find('.button');

    tl.to(heading, { opacity: 1 });
    tl.add(letterAnimation('h1'), '<');
    tl.to(par, { opacity: 1, duration: 0.5 }, '<1');
    tl.to(btn, { opacity: 1, duration: 0.5 }, '<0.4');
  });

  /* Swiper
   **************************************************************/
  let swiper;
  let init = false;

  /* Which media query
   **************************************************************/
  function swiperMode() {
    const mobile = window.matchMedia('(min-width: 0px) and (max-width: 991px)');
    const desktop = window.matchMedia('(min-width: 992px)');

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
        swiper = new Swiper('.steps_component .padding-small', {
          // Optional parameters
          slidesPerView: 1,
          spaceBetween: 24,
          speed: 250,
          observer: true,

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
