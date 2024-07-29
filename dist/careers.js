"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/careers.js
  var swiper = new Swiper(".about-team_slider", {
    // Optional parameters
    slidesPerView: "auto",
    spaceBetween: 20,
    // Navigation arrows
    navigation: {
      nextEl: ".swiper-arrow.next",
      prevEl: ".swiper-arrow.prev"
    }
  });
  var swiperModal = new Swiper(".about-team_modal-slider .max-width-full", {
    // Optional parameters
    slidesPerView: 1,
    direction: "vertical",
    spaceBetween: 20,
    mousewheel: {
      enabled: true,
      forceToAxis: true,
      thresholdDelta: 25
    },
    freeMode: false,
    shortSwipes: false
  });
})();
//# sourceMappingURL=careers.js.map
