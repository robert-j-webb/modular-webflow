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

  // src/homepage-new.js
  gsap.registerPlugin(ScrollTrigger);
  $(document).ready(function() {
    const intervalId = setInterval(function() {
      if (window.gsap) {
        clearInterval(intervalId);
        setTimeout(() => {
          let heroTl = gsap.timeline();
          heroTl.from("[hero-pattern-lines]", {
            opacity: 0
          });
          heroTl.from("[hero-pattern-square]", {
            scale: 0
          });
          termynalsArr.forEach((id) => {
            defineTermynal(id);
            initTermynal(id);
          });
          Object.values(termynals).forEach((instance) => {
            restartAnimation(instance);
          });
          $(`#mojoCode`).css("visibility", "visible");
        }, 400);
      }
    }, 100);
    let termynalsArr = ["termynal-1"];
    function restartAnimation(termynalInstance) {
      termynalInstance.container.addEventListener("termynal-anim-end", () => {
        setTimeout(() => {
          termynalInstance.init();
        }, 3e3);
      });
    }
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
                el: ".swiper-navigation",
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
      window.addEventListener("load", handleSwiper);
      window.addEventListener("resize", handleSwiper);
      return handleSwiper;
    }
    initSwiper(".carda_slider", "(max-width: 991px)", {});
    $("#deployment-visual").each(function() {
      let triggerElement = $(this);
      let tl = gsap.timeline({
        ease: Power2.easeOut,
        paused: true,
        scrollTrigger: {
          trigger: triggerElement,
          // trigger element - viewport
          start: "50% bottom",
          onEnter: () => {
            tl.play();
          }
        }
      });
      let icons = $(this).find(".cardj_row1").add(".cardj_row2").find(".w-embed");
      tl.fromTo(icons, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05 });
      tl.fromTo($(this).find(".cardj_row2"), { opacity: 0 }, { opacity: 1 }, "<").add(
        letterAnimation($(this).find(".text-size-tiny"), "label")
      );
    });
    $(".cardd_visual.hardware").each(function() {
      let triggerElement = $(this);
      let tl = gsap.timeline({
        ease: Power2.easeOut,
        paused: true,
        scrollTrigger: {
          trigger: triggerElement,
          // trigger element - viewport
          start: "50% bottom",
          onEnter: () => {
            tl.play();
          }
        }
      });
      tl.fromTo(
        $(this).find(".cardd_logo-box"),
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.05 }
      );
      tl.fromTo(
        $(this).find(".cardd_logo-line-2").add(".cardd_logo-line-1"),
        { opacity: 0 },
        { opacity: 1 }
      );
    });
    $(".discord_box").each(function() {
      let triggerElement = $(this);
      let tl = gsap.timeline({
        ease: Power2.easeOut,
        paused: true,
        scrollTrigger: {
          trigger: triggerElement,
          // trigger element - viewport
          start: "50% bottom",
          onEnter: () => {
            tl.play();
          }
        }
      });
      tl.fromTo(
        $(this).find(".discord_card"),
        1,
        { y: "1rem", opacity: 0 },
        { y: "0rem", opacity: 1 }
      ).fromTo(
        $(this).find(".discord_bg"),
        1,
        { y: "1rem", opacity: 0 },
        { y: "0rem", opacity: 1 },
        "<0.3"
      ).from(
        $(this).find(".discord_avatar,.discord_message-text:first-child, .discord_message-time"),
        0.5,
        {
          opacity: 0,
          stagger: 0.15
        },
        "<"
      ).add(letterAnimation($(this).find(".discord_message-text").eq(1), 0.03));
    });
    $(".grapha_row").each(function() {
      animateHorizontalGraph($(this), "a", ".grapha");
    });
  });
  $(window).on("load resize scroll", function() {
    $(".section_videohero").each(function() {
      if (isElementInView($(this))) {
        $(".navbar_wrapper").addClass("white");
      } else {
        $(".navbar_wrapper").removeClass("white");
      }
    });
  });
  function isElementInView(elem) {
    var $elem = $(elem);
    var $window = $(window);
    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();
    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();
    return elemTop < docViewBottom && elemBottom > docViewTop;
  }
})();
//# sourceMappingURL=homepage-new.js.map
