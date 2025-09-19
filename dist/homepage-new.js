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
      const highlights = $(element).find(".word-highlight");
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
      if (highlights.length) {
        const firstHighlight = highlights[0];
        const currentBgColor = window.getComputedStyle(firstHighlight).getPropertyValue("background-color");
        const currentBoxShadow = window.getComputedStyle(firstHighlight).getPropertyValue("box-shadow");
        const hexToRGBA = (hex, alpha) => {
          const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        const rgbaToTransparent = (rgba) => {
          const rgbaArray = rgba.replace(/^rgba?\(/, "").replace(/\)$/, "").split(",");
          return `rgba(${rgbaArray[0]}, ${rgbaArray[1]}, ${rgbaArray[2]}, 0)`;
        };
        const isHex = (color) => /^#(?:[0-9a-f]{3}){1,2}$/i.test(color);
        const initialBackgroundColor = isHex(currentBgColor) ? hexToRGBA(currentBgColor, 0) : rgbaToTransparent(currentBgColor);
        const initialBoxShadow = currentBoxShadow.replace(/rgba?\([^)]+\)/g, (match) => {
          return isHex(match) ? hexToRGBA(match, 0) : rgbaToTransparent(match);
        });
        Array.from(highlights).forEach((element2) => {
          element2.style.backgroundColor = initialBackgroundColor;
          element2.style.boxShadow = initialBoxShadow;
        });
        codeTimeline.to(
          highlights,
          {
            backgroundColor: currentBgColor,
            boxShadow: currentBoxShadow,
            duration: 0.35
          },
          "<"
        );
      }
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
  var typeText = (element, text) => {
    const codeTimeline = gsap.timeline();
    codeTimeline.to(
      element,
      {
        text: { value: text, ease: "none", speed: 1 }
      },
      "<"
    );
    return codeTimeline;
  };

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

  // src/homepage-new.js
  gsap.registerPlugin(ScrollTrigger);
  $(document).ready(function() {
    let activeStage = 0;
    let stageDelay = 2;
    let stages = $("[class^=headerb_stage-]");
    let stepTitles = ["Programmable", "Performant", "Portable"];
    let loaded = false;
    const heroStep0 = () => {
      let tl = gsap.timeline({
        defaults: {
          ease: Power3.easeOut
        },
        onStart: function() {
          runOnStart(this);
        }
      });
      let logoBox1 = $("#logo-box_1");
      let logo1 = logoBox1.find("#logo_1");
      let logoBox2 = $("#logo-box_2");
      let logo2 = logoBox2.find("#logo_2");
      let logoBox3 = $("#logo-box_3");
      let logo3 = logoBox3.find("#logo_3");
      let title = $("#title");
      let versus = $("#vs");
      let mojoBox = $("#mojo-box");
      tl.add(cycleStage(0));
      tl.fromTo(
        [logoBox1, logoBox2, logoBox3],
        { opacity: 0, xPercent: -10 },
        { opacity: 1, xPercent: 0, stagger: 0.15 }
      );
      tl.fromTo(
        [logo1, logo2, logo3],
        { opacity: 0, xPercent: -10 },
        { opacity: 1, xPercent: 0, stagger: 0.15 },
        "<0.1"
      );
      tl.fromTo(title, { opacity: 0 }, { opacity: 1 }, "<0.2");
      tl.fromTo(mojoBox, { opacity: 0, xPercent: -60 }, { opacity: 1, xPercent: 0, duration: 1 });
      tl.fromTo(versus, { opacity: 0 }, { opacity: 1 }, "<0.5");
      return tl;
    };
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
        },
        onStart: function() {
          runOnStart(this);
        }
      });
      tl.add(cycleStage(1));
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
    const heroStep2 = () => {
      let tl = gsap.timeline({
        ease: Power0.easeOut,
        onStart: function() {
          runOnStart(this);
        }
      });
      tl.add(cycleStage(2));
      tl.add(() => {
      }, "+=4");
      return tl;
    };
    let main = gsap.timeline({
      repeat: -1,
      repeatDelay: stageDelay
    });
    main.add(heroStep0());
    main.add(heroStep1(), `+=${stageDelay}`);
    main.add(heroStep2(), `+=${stageDelay}`);
    function runOnStart(instance) {
      animateLabel();
      animateProgressBar(instance._dur);
      activeStage = (activeStage + 1) % stages.length;
    }
    function cycleStage(index) {
      let tl = gsap.timeline();
      tl.to(stages, {
        opacity: 0,
        duration: 0.2
      });
      tl.set(stages.eq(index), { opacity: 1 });
      return tl;
    }
    function animateProgressBar(duration2) {
      gsap.fromTo(
        ".home-anim_progress-bar",
        { width: "0%" },
        { width: "100%", ease: "none", duration: duration2 + stageDelay }
      );
    }
    let activeAnimation = { timeline: null, splitInstance: null };
    function revertLabel() {
      return new Promise((resolve) => {
        if (activeAnimation.timeline) {
          activeAnimation.timeline.reverse().then(() => {
            if (activeAnimation.splitInstance && activeAnimation.splitInstance.split.revert) {
              activeAnimation.splitInstance.split.revert();
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    }
    function animateLabel() {
      if (loaded) {
        let parentContainer = document.querySelector("#hero-label");
        let container = document.createElement("span");
        container.textContent = `\xA0${stepTitles[activeStage]}\xA0`;
        parentContainer.innerHTML = "";
        parentContainer.appendChild(container);
        activeAnimation.splitInstance = new SplitType(container, { types: "chars" });
        let tl = gsap.timeline();
        $(parentContainer).css({ "padding-right": "0.2em", "padding-left": "0.2em" });
        tl.fromTo(
          $(activeAnimation.splitInstance.chars),
          { opacity: 0 },
          { opacity: 1, ease: "power2", stagger: 0.04 }
        );
        activeAnimation.timeline = tl;
      }
      loaded = true;
    }
    const activeClass = "tab-active";
    const progressLine = ".tabs_block-progress-line";
    const fileNameSelector = ".dashboard_head-filename";
    const tabTimeline = gsap.timeline({ paused: true });
    const duration = 4e3;
    function cardAnimation(card) {
      return new Promise((resolve) => {
        card.show();
        const fileNameTxt = card.find(".file-name").text();
        const fileNameEl = card.parent().parent().find(fileNameSelector);
        fileNameEl.text("");
        const typeFileNameTimeline = gsap.timeline();
        typeFileNameTimeline.add(typeText(fileNameEl, fileNameTxt));
        tabTimeline.add(codeAnimation(card)).add(typeFileNameTimeline, "<");
        tabTimeline.play();
        tabTimeline.then(resolve);
      });
    }
    tabCarousel({
      tabs: $(".tabs").eq(0).find(".tabs_block-link-menu .tabs_block-link"),
      cards: $(".tabs").eq(0).find(".cardb_visual .dashboard_code-block"),
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
      sliderSelector: ".tabs_slider._1",
      // On init and when the swiper slides, we animate the progressbar and code
      // block, but only animate the code the first time it's shown.
      animateOnSlide(activeSlide) {
        activeSlide.find(progressLine).stop(true, true).css("width", "0").animate({ width: "100%" }, duration);
        const codeBlock = activeSlide.find(".dashboard_code-block");
        if (codeBlock && !codeBlock.hasClass("animated")) {
          cardAnimation(codeBlock);
          codeBlock.addClass("animated");
        }
      },
      onInit() {
        const sliderCodes = $(".tabs_slider").eq(0).find(".cardb_visual .dashboard_code-block");
        $(sliderCodes).hide();
      },
      duration
    });
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
                el: ".swiper-navigation.latest",
                type: "bullets",
                clickable: true,
                bulletActiveClass: "w-active",
                bulletClass: "w-slider-dot"
              },
              ...customConfig
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
      handleSwiper();
      window.addEventListener("resize", handleSwiper);
      return handleSwiper;
    }
    initSwiper(".latest_slider", "(max-width: 991px)", {});
  });
})();
//# sourceMappingURL=homepage-new.js.map
