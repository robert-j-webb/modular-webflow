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
