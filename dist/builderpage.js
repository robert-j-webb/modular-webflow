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
        codeTimeline.fromTo(
          letter,
          { visibility: "hidden" },
          { visibility: "initial" },
          globalLetterIndex * letterDelay,
          "<"
        );
        globalLetterIndex++;
      });
    });
    return codeTimeline;
  };
  var letterAnimation = (elements, letterType) => {
    let letterDelay;
    if (letterType === "label") {
      letterDelay = 0.03;
    } else if (letterType === "heading") {
      letterDelay = 0.01;
    } else if (typeof letterType === "number") {
      letterDelay = letterType;
    } else {
      letterDelay = 0.01;
    }
    wrapLetters(elements);
    return revealLetters(elements, letterDelay);
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
  $(document).ready(function() {
    $("#hero").each(function() {
      let tl = gsap.timeline({ delay: 0.2 });
      let heading = $(this).find("h1");
      let par = $(this).find("p");
      let btn = $(this).find(".button");
      let pythonTab = ".dashboard_tab-inner.python";
      let mojoTab = ".dashboard_tab-inner.mojo";
      let pythonCode = "#pythonCode";
      let mojoCode = "#mojoCode";
      tl.to(heading, { opacity: 1 }).add(letterAnimation("h1"), "<").to(par, { opacity: 1, duration: 0.5 }, "<1").to(btn, { opacity: 1, duration: 0.5 }, "<0.4").fromTo("#dashboard", { opacity: 0 }, { opacity: 1, duration: 0 }, "<").add(codeAnimation(pythonCode), "<").to(pythonTab, { display: "none", duration: 0 }, "+=1").to(mojoTab, { display: "flex", duration: 0 }, "<").set(pythonCode, { display: "none" }, "<").set(mojoCode, { display: "block" }, "<").add(codeAnimation(mojoCode), "<");
    });
    const responsive = "(min-width: 992px)";
    let isInitialized = false;
    const tabLinks = $(".tabs_block-link-menu .tabs_block-link");
    const tabCodes = $(".tabs .cardb_visual .dashboard_code-block");
    const activeClass = "tab-active";
    const progressLine = $(".tabs_block-progress-line");
    const duration = 4e3;
    let shouldAnimate = true;
    let tabTimeline = gsap.timeline({ paused: true });
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
    const resetTabs = () => {
      tabTimeline.clear();
      tabLinks.removeClass(activeClass);
      progressLine.css("width", "0");
      tabCodes.hide();
    };
    const stopAnimation = () => {
      shouldAnimate = false;
      tabLinks.find(progressLine).stop(true, true);
      resetTabs();
    };
    const showCode = (nextIndex) => {
      tabCodes.eq(nextIndex).show();
      tabTimeline.add(codeAnimation(tabCodes.eq(nextIndex)));
      tabTimeline.play();
    };
    const initTabs = () => {
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
    let swiper;
    let init = false;
    const sliderCodes = $(".tabs_slider .cardb_visual .hero-dashboard_code-block");
    function swiperMode() {
      const mobile = window.matchMedia("(min-width: 0px) and (max-width: 991px)");
      const desktop = window.matchMedia(responsive);
      function handleSwiperSlide(swiperInstance) {
        const { activeIndex } = swiperInstance;
        progressLine.stop(true, true);
        progressLine.css("width", "0");
        $(swiperInstance.slides[activeIndex]).find(progressLine).animate({ width: "100%" }, duration);
        const codeBlock = swiperInstance.slides[activeIndex].querySelector(".dashboard_code-block");
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
  });
})();
//# sourceMappingURL=builderpage.js.map
