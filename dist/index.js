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

  // src/index.js
  document.documentElement.classList.add("js-enabled");
  $(document).ready(function() {
    const intervalId = setInterval(function() {
      if (window.gsap) {
        clearInterval(intervalId);
        $(".main-wrapper").delay(300).fadeTo("slow", 1);
      }
    }, 100);
    gsap.registerPlugin(ScrollTrigger);
    if (window.location.pathname !== "/team") {
      $("img").each(function() {
        $(this).removeAttr("loading");
        ScrollTrigger.refresh();
      });
    }
    function addNoScrollbarClass() {
      const allElements = document.querySelectorAll("*");
      for (const element of allElements) {
        if (element.tagName.toLowerCase() === "body" || element.tagName.toLowerCase() === "html") {
          continue;
        }
        const style = window.getComputedStyle(element);
        if (style.overflow === "auto" || style.overflow === "scroll" || style.overflowX === "auto" || style.overflowX === "scroll" || style.overflowY === "auto" || style.overflowY === "scroll") {
          element.classList.add("no-scrollbar");
          element.classList.add("swiper-no-swiping");
        }
      }
    }
    addNoScrollbarClass();
    let lineMaskTriggers = [];
    function setupLineMaskScrollTriggers() {
      lineMaskTriggers.forEach((st) => st.kill());
      lineMaskTriggers = [];
      $(".line-mask").attr("style", "");
      $(".line-mask").each(function() {
        const computedStyle = window.getComputedStyle($(this)[0]);
        const originalHeight = computedStyle.getPropertyValue("height");
        if ($(this).closest(".line-mask_wrap").hasClass("bottom")) {
          gsap.set($(this), { height: "0%" });
        } else {
          gsap.set($(this), { height: "100%" });
        }
        const scrollTrigger = ScrollTrigger.create({
          trigger: $(this).closest(".line-mask_wrap"),
          once: true,
          start: "70% bottom",
          invalidateOnRefresh: true,
          onEnter: () => {
            gsap.to($(this), { height: originalHeight, duration: 1.2 });
          }
        });
        lineMaskTriggers.push(scrollTrigger);
      });
    }
    function debounce(func, wait) {
      let timeout;
      return function() {
        const context = this, args = arguments;
        const later = function() {
          timeout = null;
          func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    let lastWindowWidth = $(window).width();
    setTimeout(() => {
      setupLineMaskScrollTriggers();
    }, 500);
    $(window).on(
      "resize",
      debounce(() => {
        const currentWindowWidth = $(window).width();
        if (currentWindowWidth !== lastWindowWidth) {
          setupLineMaskScrollTriggers();
          lastWindowWidth = currentWindowWidth;
        }
      }, 250)
    );
    $(".dashboard_inner[code-animation]").each(function() {
      const codeBlock = $(this).find(".dashboard_code-block");
      codeBlock.hide();
      ScrollTrigger.create({
        trigger: $(this),
        once: true,
        start: "50% bottom",
        invalidateOnRefresh: true,
        toggleActions: "play null null null",
        onEnter: () => {
          codeBlock.show();
          codeAnimation($(this));
        }
      });
    });
    $("#ctaBox").each(function() {
      let label = $(this).find("#ctaLabel");
      let text = $(this).find("#ctaText");
      let triggerElement = $(this);
      let tl = gsap.timeline({
        ease: Power2.easeOut,
        paused: true,
        scrollTrigger: {
          trigger: triggerElement,
          // trigger element - viewport
          start: "center bottom",
          onEnter: () => {
            tl.play();
          }
        }
      });
      tl.add(letterAnimation(label)).add(letterAnimation(text));
    });
    var menuOpenAnim = false;
    var dropdownOpen = false;
    const menuLinks = ".navbar_part.links";
    const menuLinksItems = ".navbar_link";
    const menuButton = ".navbar_menu-btn";
    let menuText = "Close";
    function createNavReveal() {
      let navReveal2 = gsap.timeline({
        paused: true,
        onComplete: () => {
          disableScroll();
        }
      }).add(typeText(menuButton + " div", () => menuText)).fromTo(menuLinks, { display: "none" }, { display: "flex" }, "<").fromTo(menuLinks, { yPercent: -100 }, { yPercent: 0 }, "<").fromTo(
        menuLinksItems,
        {
          y: "100%",
          opacity: 0
        },
        {
          y: "0%",
          opacity: 1,
          stagger: {
            each: 0.05
          }
        },
        "-=0.2"
      ).fromTo($(".navbar_buttons-respo .button"), { opacity: 0 }, { opacity: 1, stagger: 0.2 }).fromTo(menuLinksItems, { pointerEvents: "none" }, { pointerEvents: "auto" }, "<");
      return navReveal2;
    }
    let scrollPosition;
    const disableScroll = () => {
      if (!menuOpenAnim) {
        scrollPosition = $(window).scrollTop();
        $("html, body").scrollTop(0).addClass("overflow-hidden");
      } else {
        $("html, body").scrollTop(scrollPosition).removeClass("overflow-hidden");
      }
      menuOpenAnim = !menuOpenAnim;
    };
    let navReveal;
    ScrollTrigger.matchMedia({
      "(max-width: 991px)": function() {
        navReveal = createNavReveal();
      }
    });
    $(".navbar_menu-btn").on("click", openMenu);
    function openMenu() {
      if (navReveal) {
        playMenuAnimation();
      }
    }
    function playMenuAnimation() {
      updateMenuText();
      if (!menuOpenAnim) {
        $(".navbar_menu-btn").addClass("open");
        navReveal.timeScale(1).play();
      } else {
        $(".navbar_menu-btn").removeClass("open");
        navReveal.timeScale(1.5).reverse();
        disableScroll();
      }
    }
    function updateMenuText() {
      menuText = menuOpenAnim ? "Menu" : "Close";
    }
    const dropdowns = $(".navbar_dropdown");
    const dropdownInner = $(".navbar_dropdown-inner");
    const dropdownLinks = $(".navbar_dropdown-link-list");
    const movingDiv = $(".navbar_dropdown-bg");
    let lastIndex;
    let divIsActive;
    let leaeveDropdown;
    let duration = 0.5;
    const setInitialStyles = (element, rect, centerX) => {
      movingDiv.fadeIn();
      divIsActive = true;
      gsap.set(movingDiv, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
    };
    const hideMovingDiv = () => {
      const tl = gsap.timeline({ defaults: { ease: Circ.easeOut } });
      tl.to(movingDiv, { duration, autoAlpha: 0 });
      divIsActive = false;
      return tl;
    };
    const animateMovingDiv = (element, rect, duration2, direction) => {
      let subLinks = $(element).find(dropdownLinks);
      let subMain = $(element).find(".navbar_dropdown-main");
      console.log(subMain);
      const tl = gsap.timeline({ defaults: { ease: "circ.out" } });
      tl.to(movingDiv, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        autoAlpha: divIsActive ? 1 : 0,
        duration: duration2,
        delay: 0.2
      });
      tl.to($(element).find(dropdownInner), { opacity: 1, duration: 0.2 }, "<0.05");
      tl.add(animateLinks(subLinks.add(subMain), direction), "<");
      return tl;
    };
    const animateLinks = (links, direction, duration2) => {
      const xPercent = direction === "left" ? -5 : 5;
      const tl = gsap.timeline({ defaults: { ease: "circ.out" } });
      return tl.fromTo(links, { xPercent }, { xPercent: 0, duration: 0.4 });
    };
    const moveDiv = (element) => {
      gsap.killTweensOf(movingDiv);
      let submenu = $(element).find(dropdownInner)[0];
      let rect = submenu.getBoundingClientRect();
      let rectX = element.getBoundingClientRect();
      let centerX = rectX.width / 2;
      let direction;
      if (!divIsActive) {
        setInitialStyles(element, rect, centerX);
      }
      if (lastIndex < $(element).index()) {
        direction = "right";
      } else if (lastIndex > $(element).index()) {
        direction = "left";
      }
      const movingDivTimeline = animateMovingDiv(element, rect, duration, direction);
      lastIndex = $(element).index();
    };
    var dropdownTimeout;
    dropdowns.on("mouseenter", function() {
      if ($(window).width() > 991) {
        clearTimeout(dropdownTimeout);
        moveDiv(this);
      }
    });
    dropdowns.on("mouseleave", function() {
      if ($(window).width() > 991) {
        gsap.killTweensOf(movingDiv);
        gsap.to($(this).find(dropdownInner), { opacity: 0 });
        dropdownTimeout = setTimeout(function() {
          hideMovingDiv();
        }, 50);
      }
    });
    if ($(".tabs.max-tab").length) {
      let cardAnimation2 = function(card) {
        return new Promise((resolve) => {
          card.addClass("active");
          resolve();
        });
      };
      var cardAnimation = cardAnimation2;
      const activeClass = "tab-active";
      const progressLine = ".tabs_block-progress-line";
      const duration2 = 4e3;
      tabCarousel({
        tabs: $(".tabs.max-tab .tabs_block-link-menu .tabs_block-link"),
        cards: $(".tabs.max-tab .max-products .max-products_grid-cell"),
        onCardLeave: (card) => {
          card.removeClass("active");
        },
        onTabLeave: (tab) => {
          tab.removeClass(activeClass);
          tab.find(progressLine).stop();
          tab.find(progressLine).css("width", "0");
        },
        onCardShow: cardAnimation2,
        onTabShow: (tab) => {
          return new Promise((resolve) => {
            tab.addClass(activeClass);
            tab.find(progressLine).animate({ width: "100%" }, duration2, resolve);
          });
        }
      });
      swiperCarousel({
        sliderSelector: ".tabs_slider.max-tab",
        // On init and when the swiper slides, we animate the progressbar and code
        // block, but only animate the code the first time it's shown.
        animateOnSlide(activeSlide) {
          activeSlide.find(progressLine).stop(true, true).css("width", "0").animate({ width: "100%" }, duration2);
          let cards = $(".tabs_slider.max-tab .max-products .max-products_grid-cell");
          cards.removeClass("active");
          cards.eq(activeSlide.index()).addClass("active");
        },
        onInit() {
        },
        duration: duration2
      });
    }
  });
})();
//# sourceMappingURL=index.js.map
