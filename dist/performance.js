"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/performance.js
  gsap.registerPlugin(ScrollTrigger);
  $(document).ready(function() {
    if (window.location.href.endsWith("/performance")) {
      const heroStep1 = () => {
        let ootfBox = $("#ootb_logo");
        let slowBar1 = $("#bar-slow_1");
        let slowBar2 = $("#bar-slow_2");
        let slowBar3 = $("#bar-slow_3");
        let maxLogo = $("#max_logo");
        let fastBar1 = $("#bar-fast_1");
        let fastBar2 = $("#bar-fast_2");
        let fastBar3 = $("#bar-fast_3");
        let header = $("#headers");
        let numbers = $("#numbers");
        let grid = $("#grid");
        let barsDuration = 0.7;
        let tl = gsap.timeline({
          defaults: {
            ease: Power2.easeOut
          }
        });
        tl.to($(".headerb_stage-2"), { opacity: 1 });
        tl.fromTo(
          [ootfBox, maxLogo, header, numbers],
          { opacity: 0, xPercent: -15 },
          { opacity: 1, xPercent: 0, duration: 0.5 }
        );
        tl.fromTo(grid, { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, "<");
        tl.addLabel("bars-start", "<0.2");
        tl.fromTo(slowBar3, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, "bars-start");
        tl.fromTo(slowBar2, { scaleX: 0 }, { scaleX: 0.428, duration: barsDuration }, "<");
        tl.fromTo(slowBar1, { scaleX: 0 }, { scaleX: 0.295, duration: barsDuration }, "<");
        tl.to(slowBar2, { scaleX: 1, duration: barsDuration });
        tl.to(slowBar1, { scaleX: 0.695, duration: barsDuration }, "<");
        tl.to(slowBar1, { scaleX: 1, duration: barsDuration });
        tl.fromTo(fastBar3, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, "bars-start");
        tl.fromTo(fastBar2, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, "<");
        tl.fromTo(fastBar1, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, "<");
        return tl;
      };
      let main = gsap.timeline({});
      main.add(heroStep1());
    }
    const mask = ".perf2_model-mask";
    let swiper1, swiper2;
    function formatNumber(number) {
      return number.toLocaleString("en");
    }
    const animateCounter = ($element, value) => {
      $($element).each(function() {
        const currentText = $(this).text().trim().replace(/,/g, "");
        const startValue = parseFloat(currentText) || 0;
        const targetValue = parseFloat(value);
        console.log(targetValue);
        if (!isNaN(targetValue) && startValue !== targetValue) {
          const Cont = { val: startValue };
          const decimalPlaces = 1;
          console.log(decimalPlaces);
          const onUpdate = () => {
            let formattedValue = formatNumber(parseFloat(Cont.val.toFixed(decimalPlaces)));
            $(this).text(formattedValue);
          };
          gsap.fromTo(
            Cont,
            { val: startValue },
            {
              val: targetValue,
              duration: 0.7,
              ease: Power1.easeOut,
              onUpdate
            }
          );
        }
      });
    };
    const updateText = ($element, value) => {
      $($element).each(function() {
        gsap.to($element, { text: value, duration: 0.5, ease: Power1.easeOut });
      });
    };
    function toggleNames(swiper, toggle) {
      let { activeIndex, slides } = swiper;
      let activeItem = slides[activeIndex];
      const revealName = (item) => {
        let target = $(item).find(mask);
        let fullHeight = target.find("p").outerHeight();
        gsap.to(target, {
          height: fullHeight
        });
      };
      const tl = gsap.timeline({
        // Trigger reveal after hiding all
        onComplete: () => {
          if (toggle) {
            revealName(activeItem);
          }
        }
      });
      slides.forEach((element) => {
        tl.to(
          $(element).find(mask),
          {
            height: 0,
            duration: 0.2
          },
          "<"
        );
      });
    }
    function updateStats(allSwipers) {
      let activeModelIndex = allSwipers.swiper1.realIndex;
      let activeModel = $(allSwipers.swiper1.slides[activeModelIndex]);
      let statNumberEl = $("[stat-number]");
      let modelNameEl = $("[model-name-full]");
      let instaceNameEl = $("[instance-name-full]");
      let instanceTitles = $(".perf2_slider-2 .perf2_model-mask p");
      let instanceNames = [
        $("[data-instance-1-short]").text(),
        $("[data-instance-2-short]").text(),
        $("[data-instance-3-short]").text()
      ];
      let modelName = activeModel.find("[data-model-full]").text();
      let instances = [
        activeModel.attr("data-instance-1-full"),
        activeModel.attr("data-instance-2-full"),
        activeModel.attr("data-instance-3-full")
      ];
      let performances = [
        activeModel.attr("data-performance-1-val"),
        activeModel.attr("data-performance-2-val"),
        activeModel.attr("data-performance-3-val")
      ];
      let instanceIndex = allSwipers.swiper2.realIndex;
      instanceTitles.each(function(index, element) {
        console.log(index);
        updateText($(element), instances[index]);
      });
      animateCounter(statNumberEl, performances[instanceIndex]);
      updateText(modelNameEl, modelName);
      updateText(instaceNameEl, instanceNames[instanceIndex] + " " + instances[instanceIndex]);
    }
    let swipers = {
      swiper1: initializeSwiper(".perf2_slider-1", {}),
      swiper2: initializeSwiper(".perf2_slider-2")
    };
    let numPerformanceSelections = 0;
    let initialViewOfPerformance;
    const observer = new IntersectionObserver(
      (entry) => {
        if (entry[0].isIntersecting) {
          initialViewOfPerformance = /* @__PURE__ */ new Date();
          observer.disconnect();
        }
      },
      { root: null, threshold: 0.5 }
    );
    observer.observe(document.querySelector(".perf2_slider-1"));
    window.addEventListener("beforeunload", () => {
      const timeInSeconds = Math.round((/* @__PURE__ */ new Date() - initialViewOfPerformance) / 1e3);
      amplitude.track("timeSpentOnPerformance", { timeInSeconds });
      amplitude.track("totalClicksOnPerformance", { count: numPerformanceSelections });
    });
    function initializeSwiper(selector, options) {
      return new Swiper(selector, {
        slidesPerView: 1,
        direction: "vertical",
        observer: true,
        slideToClickedSlide: true,
        init: false,
        threshold: 40,
        freeMode: {
          enabled: true,
          sticky: true
        },
        on: {
          init: function() {
            toggleNames(this, true);
          }
        },
        mousewheel: {
          thresholdDelta: 20
        },
        ...options
      });
    }
    for (let key in swipers) {
      if (swipers.hasOwnProperty(key)) {
        let swiper = swipers[key];
        let debounceTimer;
        swiper.on("slideChange", function() {
          const modelOrInstance = this.slides[this.activeIndex]?.innerText;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            numPerformanceSelections = numPerformanceSelections + 1;
            amplitude.track("performanceSelected", { modelOrInstance });
            toggleNames(this, true);
            updateStats(swipers);
          }, 300);
        });
        swiper.init();
      }
    }
    let scrollSwipers = gsap.timeline({
      scrollTrigger: {
        trigger: $(".perf2"),
        start: "center bottom",
        onEnter: () => {
          swipers.swiper1.slideTo(5, 800, updateStats(swipers));
          swipers.swiper2.slideTo(1, 800);
        }
      }
    });
  });
})();
//# sourceMappingURL=performance.js.map
