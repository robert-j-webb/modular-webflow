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
        codeTimeline.to(highlights, {
          backgroundColor: currentBgColor,
          boxShadow: currentBoxShadow,
          duration: 0.35
        });
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

  // src/devpage.js
  $(document).ready(function() {
    $("#hero").each(function() {
      let tl = gsap.timeline({ delay: 0.2 });
      let heading = $(this).find("h1");
      let par = $(this).find("p");
      let btn = $(this).find(".button");
      tl.to(heading, { opacity: 1 });
      tl.add(letterAnimation("h1"), "<");
      tl.to(par, { opacity: 1, duration: 0.5 }, "<1");
      tl.to(btn, { opacity: 1, duration: 0.5 }, "<0.4");
    });
    let swiper;
    let init = false;
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
  });
})();
//# sourceMappingURL=devpage.js.map
