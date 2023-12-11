"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/utils/tabCarousel.js
  function tabCarousel({ tabs, cards, onCardLeave, onTabLeave, onCardShow, onTabShow }) {
    if (tabs.length !== cards.length) {
      throw new Error(`Cards length: ${cards.length} did not match tabs length: ${tabs.length}`);
    }
    let hasManuallyClicked = false;
    let curIdx = 0;
    async function showCard(curIdx2) {
      const prevCardIdx = curIdx2 === 0 ? cards.length - 1 : curIdx2 - 1;
      await Promise.all([onCardLeave(cards.eq(prevCardIdx)), onTabLeave(tabs.eq(prevCardIdx))]);
      await Promise.all([onCardShow(cards.eq(curIdx2)), onTabShow(tabs.eq(curIdx2))]);
    }
    async function startAnimation() {
      while (!hasManuallyClicked) {
        await showCard(curIdx);
        curIdx += 1;
        if (curIdx === cards.length) {
          curIdx = 0;
        }
      }
    }
    tabs.each((idx, tabEl) => {
      tabEl.onclick = () => {
        onCardLeave(cards.eq(curIdx));
        onTabLeave(tabs.eq(curIdx));
        onCardShow(cards.eq(idx));
        onTabShow(tabs.eq(idx));
        hasManuallyClicked = true;
        curIdx = idx;
      };
    });
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio <= 0)
          return;
        startAnimation();
        intersectionObserver.unobserve(tabs[0]);
      },
      { threshold: 1 }
    );
    intersectionObserver.observe(tabs[0]);
  }
  function swiperCarousel({ animateOnSlide, sliderSelector, onInit, duration }) {
    function handleSwiperSlide({ activeIndex, slides }) {
      if (slides.length === 0) {
        return;
      }
      animateOnSlide($(slides[activeIndex]));
    }
    new Swiper(sliderSelector, {
      slidesPerView: 1,
      spaceBetween: 24,
      speed: 250,
      autoplay: {
        delay: duration
      },
      observer: true,
      on: {
        init: (swiperInstance) => {
          onInit();
          handleSwiperSlide(swiperInstance);
        },
        transitionEnd: (swiperInstance) => {
          handleSwiperSlide(swiperInstance);
        }
      },
      pagination: {
        el: ".swiper-navigation",
        type: "bullets",
        clickable: true,
        bulletActiveClass: "w-active",
        bulletClass: "w-slider-dot"
      }
    });
  }

  // src/maxserving.js
  $(document).ready(function() {
    const activeClass = "tab-active";
    const progressLine = ".tabs_block-progress-line";
    const duration = 4e3;
    const pytorchEls = [
      jQuery(".tabs .graphc_item.tab2_2"),
      jQuery(".tabs .graphc_item.tab1_2"),
      jQuery(".tabs .graphc_item.tab3_2")
    ];
    const pytorchWidthHeight = pytorchEls.map((el) => [el.css("width"), el.css("height")]);
    let prevIdx = 0;
    function cardAnimation(card) {
      return new Promise((resolve) => {
        const curIdx = $(".tabs .tabs_inner").index(card);
        if (curIdx === prevIdx) {
          card.show();
          return resolve();
        }
        const textTimeline = gsap.timeline({
          onComplete: resolve,
          defaults: { ease: "none", speed: 1 }
        });
        card.find(".animateable").each(function() {
          textTimeline.to($(this), { text: { value: $(this).text() } }, ">");
          $(this).html("");
        });
        pytorchEls[curIdx].css("width", pytorchWidthHeight[prevIdx][0]);
        pytorchEls[curIdx].css("height", pytorchWidthHeight[prevIdx][1]);
        card.show();
        pytorchEls[curIdx].animate(
          { width: pytorchWidthHeight[curIdx][0], height: pytorchWidthHeight[curIdx][1] },
          600
        );
        prevIdx = curIdx;
      });
    }
    tabCarousel({
      tabs: $(".tabs .tabs_block-link-menu .tabs_block-link"),
      cards: $(".tabs .tabs_inner"),
      onCardLeave: (card) => {
        card.hide();
      },
      onTabLeave: (tab) => {
        tab.removeClass(activeClass);
        tab.find(progressLine).stop();
        tab.find(progressLine).css("width", "0");
      },
      onCardShow: cardAnimation,
      onTabShow: (tab) => {
        return new Promise((resolve) => {
          tab.addClass(activeClass);
          tab.find(progressLine).animate({ width: "100%" }, duration, resolve);
        });
      }
    });
    swiperCarousel({
      sliderSelector: ".tabs_slider",
      // On init and when the swiper slides, we animate the progressbar and code
      // block, but only animate the code the first time it's shown.
      animateOnSlide(activeSlide) {
        activeSlide.find(progressLine).stop(true, true).css("width", "0").animate({ width: "100%" }, duration);
      },
      onInit() {
      },
      duration
    });
  });
})();
//# sourceMappingURL=maxserving.js.map
