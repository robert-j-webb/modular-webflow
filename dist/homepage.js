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
  var animateCounter = ($element) => {
    $($element).each(function() {
      const Cont = { val: 0 };
      const originalText = $(this).text();
      const targetValue = parseFloat(originalText);
      const isOriginalHalf = originalText % 1 >= 0.5 && originalText % 1 < 1;
      if (!isNaN(targetValue)) {
        $(this).css("visibility", "hidden");
        const onUpdate = () => {
          let formattedValue;
          if (Math.abs(targetValue - Cont.val) <= 0.01) {
            formattedValue = targetValue % 1 === 0 ? targetValue.toFixed(0) : targetValue.toFixed(2);
          } else if (Cont.val >= 1) {
            formattedValue = Math.floor(Cont.val).toFixed(0);
          } else {
            formattedValue = Cont.val.toFixed(2);
          }
          $(this).text(formattedValue);
        };
        TweenLite.to(Cont, 1, {
          val: targetValue,
          onUpdate,
          onStart: () => $(this).css("visibility", "visible")
        });
      } else {
        return;
      }
    });
  };
  var graphHeadAnimation = (graphClassPrefix) => {
    const masterTimeline = gsap.timeline();
    masterTimeline.add(letterAnimation(`.graph${graphClassPrefix}_head .text-size-metadata`), "label").add(() => animateCounter(`.graph${graphClassPrefix}_head .graph-number`), "<");
    return masterTimeline;
  };
  var animateGraphRow = (targets, graphClassPrefix) => {
    const masterTimeline = gsap.timeline();
    $(targets).each(function(index) {
      let row = $(this).find(`.graph${graphClassPrefix}_box`);
      let label = $(this).find(`.graph${graphClassPrefix}_label div`);
      let number = $(this).find(`.graph${graphClassPrefix}_row-num div`);
      const codeTimeline = gsap.timeline();
      codeTimeline.from(row, { scaleX: 0, duration: 1 }).add(() => {
        animateCounter(number);
      }, "<").add(letterAnimation(label, "label"));
      masterTimeline.add(codeTimeline, index * 0.2);
    });
    return masterTimeline;
  };
  var animateHorizontalGraph = (target, graphType, trigger) => {
    let triggerElement = $(trigger);
    let tl = gsap.timeline({
      ease: Power2.easeOut,
      paused: true,
      scrollTrigger: {
        trigger: triggerElement,
        start: "70% bottom",
        onEnter: () => {
          tl.play();
        }
      }
    });
    tl.add(graphHeadAnimation(graphType));
    tl.add(animateGraphRow(target, graphType), "<");
    return tl;
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

  // src/utils/termynal.js
  var Termynal = class {
    /**
     * Construct the widget's settings.
     * @param {(string|Node)=} container - Query selector or container element.
     * @param {Object=} options - Custom settings.
     * @param {string} options.prefix - Prefix to use for data attributes.
     * @param {number} options.startDelay - Delay before animation, in ms.
     * @param {number} options.typeDelay - Delay between each typed character, in ms.
     * @param {number} options.lineDelay - Delay between each line, in ms.
     * @param {number} options.progressLength - Number of characters displayed as progress bar.
     * @param {string} options.progressChar – Character to use for progress bar, defaults to █.
     * @param {number} options.progressPercent - Max percent of progress.
     * @param {string} options.cursor – Character to use for cursor, defaults to ▋.
     * @param {Object[]} lineData - Dynamically loaded line data objects.
     * @param {boolean} options.noInit - Don't initialise the animation.
     */
    constructor(container = "#termynal", options = {}) {
      this.container = typeof container === "string" ? document.querySelector(container) : container;
      this.pfx = `data-${options.prefix || "ty"}`;
      this.startDelay = options.startDelay || parseFloat(this.container.getAttribute(`${this.pfx}-startDelay`)) || 600;
      this.typeDelay = options.typeDelay || parseFloat(this.container.getAttribute(`${this.pfx}-typeDelay`)) || 90;
      this.lineDelay = options.lineDelay || parseFloat(this.container.getAttribute(`${this.pfx}-lineDelay`)) || 1500;
      this.progressLength = options.progressLength || parseFloat(this.container.getAttribute(`${this.pfx}-progressLength`)) || 40;
      this.progressChar = options.progressChar || this.container.getAttribute(`${this.pfx}-progressChar`) || "\u2588";
      this.progressPercent = options.progressPercent || parseFloat(this.container.getAttribute(`${this.pfx}-progressPercent`)) || 100;
      this.cursor = options.cursor || this.container.getAttribute(`${this.pfx}-cursor`) || "\u258B";
      this.lineData = this.lineDataToElements(options.lineData || []);
      if (!options.noInit)
        this.init();
    }
    /**
     * Initialise the widget, get lines, clear container and start animation.
     */
    init() {
      this.lines = [...this.container.querySelectorAll(`[${this.pfx}]`)].concat(this.lineData);
      const containerStyle = getComputedStyle(this.container);
      this.container.style.width = containerStyle.width !== "0px" ? containerStyle.width : void 0;
      this.container.style.minHeight = containerStyle.height !== "0px" ? containerStyle.height : void 0;
      this.container.setAttribute("data-termynal", "");
      this.container.innerHTML = "";
      this.start();
    }
    /**
     * Start the animation and rener the lines depending on their data attributes.
     */
    async start() {
      await this._wait(this.startDelay);
      for (let line of this.lines) {
        const type = line.getAttribute(this.pfx);
        const delay = line.getAttribute(`${this.pfx}-delay`) || this.lineDelay;
        if (type === "input") {
          line.setAttribute(`${this.pfx}-cursor`, this.cursor);
          await this.type(line);
          await this._wait(delay);
        } else if (type === "progress") {
          await this.progress(line);
          await this._wait(delay);
        } else {
          this.container.appendChild(line);
          await this._wait(delay);
        }
        line.removeAttribute(`${this.pfx}-cursor`);
      }
      this._emitAnimationEndEvent();
    }
    _emitAnimationEndEvent() {
      const event = new Event("termynal-anim-end");
      this.container.dispatchEvent(event);
    }
    /**
     * Animate a typed line.
     * @param {Node} line - The line element to render.
     */
    async type(line) {
      const chars = [...line.textContent];
      const delay = line.getAttribute(`${this.pfx}-typeDelay`) || this.typeDelay;
      line.textContent = "";
      this.container.appendChild(line);
      for (let char of chars) {
        await this._wait(delay);
        line.textContent += char;
      }
    }
    /**
     * Animate a progress bar.
     * @param {Node} line - The line element to render.
     */
    async progress(line) {
      const progressLength = line.getAttribute(`${this.pfx}-progressLength`) || this.progressLength;
      const progressChar = line.getAttribute(`${this.pfx}-progressChar`) || this.progressChar;
      const chars = progressChar.repeat(progressLength);
      const progressPercent = line.getAttribute(`${this.pfx}-progressPercent`) || this.progressPercent;
      line.textContent = "";
      this.container.appendChild(line);
      for (let i = 1; i < chars.length + 1; i++) {
        await this._wait(this.typeDelay);
        const percent = Math.round(i / chars.length * 100);
        line.textContent = `${chars.slice(0, i)} ${percent}%`;
        if (percent > progressPercent) {
          break;
        }
      }
    }
    /**
     * Helper function for animation delays, called with `await`.
     * @param {number} time - Timeout, in ms.
     */
    _wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    /**
     * Converts line data objects into line elements.
     *
     * @param {Object[]} lineData - Dynamically loaded lines.
     * @param {Object} line - Line data object.
     * @returns {Element[]} - Array of line elements.
     */
    lineDataToElements(lineData) {
      return lineData.map((line) => {
        let div = document.createElement("div");
        div.innerHTML = `<span ${this._attributes(line)}>${line.value || ""}</span>`;
        return div.firstElementChild;
      });
    }
    /**
     * Helper function for generating attributes string.
     *
     * @param {Object} line - Line data object.
     * @returns {string} - String of attributes.
     */
    _attributes(line) {
      let attrs = "";
      for (let prop in line) {
        attrs += this.pfx;
        if (prop === "type") {
          attrs += `="${line[prop]}" `;
        } else if (prop !== "value") {
          attrs += `-${prop}="${line[prop]}" `;
        }
      }
      return attrs;
    }
  };

  // src/homepage.js
  gsap.registerPlugin(ScrollTrigger);
  $(document).ready(function() {
    $(".grapha_row").each(function() {
      animateHorizontalGraph($(this), "a", ".grapha");
    });
    const activeClass = "tab-active";
    const progressLine = ".tabs_block-progress-line";
    const duration = 4e3;
    function cardAnimation(card) {
      return new Promise((resolve) => {
        card.show();
        card.css("opacity", "0.0");
        card.animate({ opacity: "1" }, 200, resolve);
      });
    }
    tabCarousel({
      tabs: $(".tabs_block-link-menu .tabs_block-link"),
      cards: $(".tabs_visuals > img"),
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
    function runCode() {
      termynalsArr.forEach((id) => {
        defineTermynal(id);
        initTermynal(id);
      });
      Object.values(termynals).forEach((instance) => {
        restartAnimation(instance);
      });
      $(`#mojoCode`).css("visibility", "visible");
    }
    const observer = new IntersectionObserver(
      (entries, observer2) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCode();
            observer2.disconnect();
          }
        });
      },
      {
        rootMargin: "0% 0% -50% 0%"
        // Adjust the values as needed
      }
    );
    const headerA1CodeElement = document.querySelector(".headera1_code");
    if (headerA1CodeElement) {
      observer.observe(headerA1CodeElement);
    }
    let termynalsArr = ["termynal-1"];
    const termynals = {};
    function defineTermynal(elementID) {
      console.log(`Defining Termynal for: ${elementID}`);
      termynals[elementID] = new Termynal(`#${elementID}`, {
        startDelay: 600,
        noInit: true
      });
    }
    function initTermynal(elementID) {
      if (termynals[elementID]) {
        termynals[elementID].init();
        $(`#${elementID}`).css("visibility", "visible");
      } else {
        console.warn(`Termynal instance for ${elementID} not found.`);
      }
    }
    function restartAnimation(termynalInstance) {
      termynalInstance.container.addEventListener("termynal-anim-end", () => {
        setTimeout(() => {
          termynalInstance.init();
        }, 3e3);
      });
    }
    function attr(defaultVal, attrVal) {
      const defaultValType = typeof defaultVal;
      if (typeof attrVal !== "string" || attrVal.trim() === "")
        return defaultVal;
      if (attrVal === "true" && defaultValType === "boolean")
        return true;
      if (attrVal === "false" && defaultValType === "boolean")
        return false;
      if (isNaN(attrVal) && defaultValType === "string")
        return attrVal;
      if (!isNaN(attrVal) && defaultValType === "number")
        return +attrVal;
      return defaultVal;
    }
    $(document).ready(function() {
      const initMarquee = () => {
        if (window.matchMedia("(min-width: 992px)").matches) {
          $("[tr-marquee-element='component']").each(function() {
            const componentEl = $(this), panelEl = componentEl.find("[tr-marquee-element='panel']");
            let speedSetting = attr(100, componentEl.attr("tr-marquee-speed")), verticalSetting = attr(false, componentEl.attr("tr-marquee-vertical")), reverseSetting = attr(false, componentEl.attr("tr-marquee-reverse")), moveDistanceSetting = -100;
            if (reverseSetting)
              moveDistanceSetting = 100;
            const updateMarqueePosition = (progress) => {
              if (verticalSetting) {
                gsap.set(panelEl, { yPercent: progress * moveDistanceSetting });
              } else {
                gsap.set(panelEl, { xPercent: progress * moveDistanceSetting });
              }
            };
            const marqueeTimeline = gsap.timeline();
            const scrollTriggerInstance = ScrollTrigger.create({
              trigger: "body",
              start: "top top",
              end: "bottom bottom",
              onUpdate: (self) => {
                const scrollProgress = self.progress;
                updateMarqueePosition(scrollProgress);
              }
            });
            componentEl.data("scrollTrigger", scrollTriggerInstance);
          });
        } else {
          $("[tr-marquee-element='component']").each(function() {
            const componentEl = $(this), panelEl = componentEl.find("[tr-marquee-element='panel']");
            const st = componentEl.data("scrollTrigger");
            if (st) {
              st.kill();
              componentEl.removeData("scrollTrigger");
            }
            gsap.set(panelEl, { clearProps: "all" });
          });
        }
      };
      initMarquee();
      $(window).on("resize", initMarquee);
    });
  });
})();
//# sourceMappingURL=homepage.js.map
