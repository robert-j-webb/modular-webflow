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

  // src/mojo.js
  var activeClass = "tab-active";
  var progressLine = $(".mojo-tabs_progress-line");
  var descSelector = $("#desc-text");
  var tabTimeline = gsap.timeline({ imgPaused: true });
  var duration = 4e3;
  function cardAnimation(card) {
    return new Promise((resolve) => {
      card.show();
      const descTxt = card.attr("desc-text");
      const descWidth = card.attr("desc-width");
      const typeFileNameTimeline = gsap.timeline();
      descSelector.fadeOut(() => {
        descSelector.text(descTxt);
        $(".mojo-tabs_content").css("max-width", descWidth);
        descSelector.fadeIn();
      });
      tabTimeline.add(codeAnimation(card)).add(typeFileNameTimeline, "<");
      tabTimeline.play();
      tabTimeline.then(resolve);
    });
  }
  function revealText(card) {
    const descTxt = card.attr("desc-text");
    const descWidth = card.attr("desc-width");
    const typeFileNameTimeline = gsap.timeline();
    descSelector.fadeOut(() => {
      descSelector.text(descTxt);
      $(".mojo-tabs_content").css("max-width", descWidth);
      descSelector.fadeIn();
    });
  }
  tabCarousel({
    tabs: $(".mojo-tabs_list").eq(0).find(".mojo-tabs_item"),
    cards: $(".mojo-tabs_dashboard").eq(0).find(".dashboard_code-block"),
    onCardLeave: (card) => {
      card.hide();
    },
    onTabLeave: (tab) => {
      tab.removeClass(activeClass);
      progressLine.eq(0).stop();
      progressLine.eq(0).css("width", "0");
    },
    onCardShow: cardAnimation,
    onTabShow: (tab) => {
      return new Promise((resolve) => {
        tab.addClass(activeClass);
        progressLine.eq(0).animate({ width: "100%" }, duration, resolve);
      });
    }
  });
  var codeSlides = $(".mojo-tabs_dashboard").eq(1).find(".dashboard_code-block");
  function initSwiper() {
    new Swiper(".mojo-tabs_slider", {
      slidesPerView: "auto",
      spaceBetween: 12,
      speed: 250,
      autoplay: {
        delay: duration
      },
      centeredSlides: true,
      observer: true,
      on: {
        init: () => {
          progressLine.eq(1).stop(true, true).css("width", "0%");
          progressLine.eq(1).animate({ width: "100%" }, duration);
        },
        slideChange: (swiperInstance) => {
          progressLine.eq(1).stop(true, true).css("width", "0%");
          codeSlides.fadeOut(100, () => {
            let activeCard = codeSlides.eq(swiperInstance.realIndex);
            progressLine.eq(1).animate({ width: "100%" }, duration);
            activeCard.fadeIn();
            revealText(activeCard);
          });
        }
      }
    });
  }
  var observer = new IntersectionObserver(
    (entries, observer2) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          initSwiper();
          observer2.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(document.querySelector(".mojo-tabs_slider"));
})();
//# sourceMappingURL=mojo.js.map
