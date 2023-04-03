"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/utils/globalFunctions.js
  var wrapLetters = (element) => {
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.parentNode.classList.contains("letter")) {
          const codeText = node.textContent;
          const fragment = document.createDocumentFragment();
          for (let i = 0; i < codeText.length; i++) {
            const span = document.createElement("span");
            span.className = "letter";
            span.textContent = codeText[i];
            fragment.appendChild(span);
          }
          node.parentNode.replaceChild(fragment, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName !== "BR") {
          const childNodes = Array.from(node.childNodes);
          childNodes.forEach(processNode);
        }
      }
    };
    $(element).contents().each(function() {
      processNode(this);
    });
  };
  var revealLetters = (elements, letterDelay) => {
    const codeTimeline = gsap.timeline();
    let globalLetterIndex = 0;
    $(elements).each((elementIndex, element) => {
      const letters = $(element).find(".letter").not(".line-numbers-row .code-letter");
      letters.each((letterIndex, letter) => {
        const wordHighlight = $(letter).closest(".word-highlight");
        if (wordHighlight.length) {
          codeTimeline.fromTo(
            letter,
            { display: "none" },
            { display: "inline" },
            globalLetterIndex * letterDelay,
            "<"
          ).to(wordHighlight, { opacity: 1, duration: 0.2 }, "<");
        } else {
          codeTimeline.fromTo(
            letter,
            { visibility: "hidden" },
            { visibility: "initial" },
            globalLetterIndex * letterDelay,
            "<"
          );
        }
        globalLetterIndex++;
      });
    });
    return codeTimeline;
  };
  var codeAnimation = (className) => {
    const codeBlock = $(className).find("code");
    const lineNumbers = codeBlock.find(".line-numbers-rows").eq(0).clone();
    codeBlock.find(".line-numbers-rows").remove();
    wrapLetters(codeBlock);
    codeBlock.prepend(lineNumbers);
    return revealLetters(codeBlock, 0.01);
  };

  // src/builderpage.js
  var responsive = "(min-width: 992px)";
  var isInitialized = false;
  var tabLinks = $(".tabs_block-link-menu .tabs_block-link");
  var tabCodes = $(".tabs .cardb_visual .dashboard_code-block");
  var activeClass = "tab-active";
  var progressLine = $(".tabs_block-progress-line");
  var duration = 4e3;
  var shouldAnimate = true;
  var tabTimeline = gsap.timeline({ paused: true });
  function switchTab() {
    if (!shouldAnimate) {
      return;
    }
    const currentTab = tabLinks.filter("." + activeClass);
    currentTab.find(progressLine).animate({ width: "100%" }, duration, function() {
      resetTabs();
      const currentIndex = currentTab.index();
      let nextIndex = currentIndex >= tabLinks.length - 1 ? 0 : currentIndex + 1;
      if (nextIndex === currentIndex) {
        nextIndex = currentIndex >= tabLinks.length - 2 ? 0 : currentIndex + 2;
      }
      tabLinks.eq(nextIndex).addClass(activeClass);
      showCode(nextIndex);
      switchTab();
    });
  }
  var resetTabs = () => {
    tabTimeline.clear();
    tabLinks.removeClass(activeClass);
    progressLine.css("width", "0");
    tabCodes.hide();
  };
  var stopAnimation = () => {
    shouldAnimate = false;
    tabLinks.find(progressLine).stop(true, true);
    resetTabs();
  };
  var showCode = (nextIndex) => {
    tabCodes.eq(nextIndex).show();
    tabTimeline.add(codeAnimation(tabCodes.eq(nextIndex)));
    tabTimeline.play();
  };
  var initTabs = () => {
    isInitialized = true;
    tabLinks.eq(0).addClass(activeClass);
    switchTab();
    showCode(0);
    tabLinks.on("click", function() {
      const nextIndex = $(this).index();
      stopAnimation();
      $(this).addClass(activeClass);
      $(this).find(progressLine).animate({ width: "100%" }, 200);
      showCode(nextIndex);
    });
  };
  $(window).on("load resize", function() {
    if (window.matchMedia(responsive).matches) {
      if (!isInitialized) {
        const trigger = ScrollTrigger.create({
          trigger: ".tabs",
          start: "top center",
          onEnter: () => {
            initTabs();
            trigger.kill();
          }
        });
      }
    } else {
      if (isInitialized) {
        stopAnimation();
        isInitialized = false;
      }
    }
  });
  var swiper;
  var init = false;
  var sliderCodes = $(".tabs_slider .cardb_visual .hero-dashboard_code-block");
  function swiperMode() {
    const mobile = window.matchMedia("(min-width: 0px) and (max-width: 991px)");
    const desktop = window.matchMedia(responsive);
    function handleSwiperSlide(swiperInstance) {
      const { activeIndex } = swiperInstance;
      progressLine.stop(true, true);
      progressLine.css("width", "0");
      $(swiperInstance.slides[activeIndex]).find(progressLine).animate({ width: "100%" }, duration);
      const codeBlock = swiperInstance.slides[activeIndex].querySelector(
        ".hero-dashboard_code-block"
      );
      if (codeBlock) {
        $(codeBlock).show();
        codeAnimation(codeBlock);
      }
    }
    if (desktop.matches) {
      if (init) {
        swiper.destroy(true, true);
        init = false;
      }
    } else if (mobile.matches) {
      if (!init) {
        init = true;
        swiper = new Swiper(".tabs_slider", {
          // Optional parameters
          slidesPerView: 1,
          spaceBetween: 24,
          speed: 250,
          autoplay: {
            delay: duration
          },
          observer: true,
          on: {
            init: (swiperInstance) => {
              handleSwiperSlide(swiperInstance);
            },
            slideChange: () => {
              $(sliderCodes).hide();
            },
            transitionEnd: (swiperInstance) => {
              handleSwiperSlide(swiperInstance);
            }
          },
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
//# sourceMappingURL=builderpage.js.map
