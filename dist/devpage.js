"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/devpage.js
  var swiper;
  var init = false;
  function swiperMode() {
    const mobile = window.matchMedia("(min-width: 0px) and (max-width: 991px)");
    const desktop = window.matchMedia("(min-width: 992px)");
    if (desktop.matches) {
      if (init) {
        if (swiper) {
          swiper.destroy(true, true);
        }
        init = false;
      }
    } else if (mobile.matches) {
      if (!init) {
        init = true;
        swiper = new Swiper(".steps_component .padding-small", {
          // Optional parameters
          slidesPerView: 1,
          spaceBetween: 24,
          speed: 250,
          observer: true,
          // Enable lazy loading
          pagination: {
            el: ".swiper-navigation",
            type: "bullets",
            clickable: true,
            bulletActiveClass: "w-active",
            bulletClass: "w-slider-dot"
          }
        });
      }
    }
  }
  window.addEventListener("load", function() {
    swiperMode();
  });
  window.addEventListener("resize", function() {
    swiperMode();
  });
})();
//# sourceMappingURL=devpage.js.map
