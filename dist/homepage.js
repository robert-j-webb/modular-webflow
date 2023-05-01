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
  var codeAnimation = (className) => {
    const codeBlock = $(className).find("code");
    const lineNumbers = codeBlock.find(".line-numbers-rows").eq(0).clone();
    codeBlock.find(".line-numbers-rows").remove();
    wrapLetters(codeBlock);
    codeBlock.prepend(lineNumbers);
    return revealLetters(codeBlock, 0.01);
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

  // src/homepage.js
  gsap.registerPlugin(ScrollTrigger);
  $(document).ready(function() {
    const baseDuration = 1.2;
    const heroLabel = "#heroLabel";
    const heroHeading = "#heroHeading";
    const heroHeadingBox = ".header_highlight-head";
    const heroButtons = "#heroButtons .button";
    const modularBox = "#modularBox";
    const heroBox = ".hero-box";
    const heroBoxInner = ".hero-box_inner";
    const brandBox = modularBox + " " + heroBoxInner;
    const brandLogo = "#brandLogo";
    const heroBoxesLeft = heroBox + "[box-direction=left] " + heroBoxInner;
    const heroBoxesRight = heroBox + "[box-direction=right] " + heroBoxInner;
    const metadata = ".hero-box_metadata-mask";
    const iconBoxArrow = ".hero-dashboard_arrow";
    const cloudBorder = ".hero-devices_border";
    const introText = "#intro-text";
    const dashboard = "#dashboard";
    const dashboardInner = dashboard + " .hero-dashboard_inner";
    const dashboardCode = dashboard + " .hero-dashboard_code";
    const closeCircles = dashboard + " .hero-dashboard_close circle";
    const dashboardTitle = dashboard + " .hero-dashboard_head-label";
    const langTab = dashboard + " .hero-dashboard_tab";
    const pythonTab = dashboard + " .hero-dashboard_tab-inner.python";
    const mojoTab = dashboard + " .hero-dashboard_tab-inner.mojo";
    const pythonCode = dashboard + " .hero-dashboard_code-block.python";
    const mojoCode = dashboard + " .hero-dashboard_code-block.mojo";
    const graphs = ".hero-dashboard_graphs";
    const graphHead = ".hero-dashboard_graph-head";
    const graphBox = ".hero-dashboard_graph-box";
    const firstGraph = $(graphBox).eq(0);
    const graphLabel = ".hero-dashboard_graph-label";
    const graphNumberLabel = ".hero-dashboard_graph-number-label";
    const graphNumber = ".hero-dashboard_graph-number";
    const graphLegend = ".hero-dashboard_graph-legend";
    const navigationItems = ".hero-navigation_item";
    const headings = [
      $(heroHeading).html(),
      $(".hero-headings").find("div").eq(0).html(),
      $(".hero-headings").find("div").eq(1).html()
    ];
    function switchDeviceIcons() {
      console.log("Devices");
      const hideClass = "hide";
      $(".hero-devices .hero-box_inner").each(function() {
        const icons = $(this).find(".hero-box_icon");
        const visibleIcon = icons.not("." + hideClass);
        const nextIndex = visibleIcon.index() >= icons.length - 1 ? 0 : visibleIcon.index() + 1;
        icons.addClass(hideClass);
        icons.eq(nextIndex).removeClass(hideClass);
      });
    }
    function switchHeadings(index) {
      $(heroHeading).html(headings[index]);
      let tlAnimation;
      wrapLetters(heroHeading);
      updateNavigation(index);
    }
    function updateNavigation(index) {
      let items = $(navigationItems);
      items.removeClass("active");
      items.eq(index).addClass("active");
    }
    const triggerElementClick = (element) => {
      $(element).trigger("click");
    };
    function addClassToElement(element, className) {
      $(element).addClass(className);
    }
    let headingsTimeline = null;
    const animateHeadings = (index, width) => {
      const checkWidth = (width2) => {
        if (width2) {
          $(heroHeading).width(width2);
        } else {
          $(heroHeading).removeAttr("style");
        }
      };
      headingsTimeline = gsap.timeline();
      width = width ? width : "90%";
      headingsTimeline.to(heroHeading, { opacity: 0, y: "2em", duration: 0.5 }).add(() => {
        let tl = gsap.timeline();
        tl.call(() => checkWidth(width)).call(() => switchHeadings(index));
        return tl;
      }).to(heroHeading, { opacity: 1, y: "0em", duration: 0.5 });
      return headingsTimeline;
    };
    const animateLabel = (element, time) => {
      let duration = time;
      let tl = gsap.timeline();
      if (!time) {
        duration = "label";
      }
      tl.set(element, { opacity: 1 });
      tl.add(letterAnimation(element, duration));
      return tl;
    };
    const scaleGraph = (element) => {
      let tl = gsap.timeline();
      tl.fromTo(element, { scaleY: 0 }, { scaleY: 1, duration: baseDuration }, "<");
      return tl;
    };
    const animateGraph = (parent) => {
      let tl = gsap.timeline();
      tl.add(animateLabel($(parent).find(graphLabel).children()), "<+=0.3").set($(parent).find(graphNumber), { yPercent: 10, opacity: 0 }, "<+=0.3").to(
        $(parent).find(graphNumber),
        { yPercent: 0, opacity: 1, duration: baseDuration },
        "<+=0.15"
      ).add(animateLabel($(parent).find(graphLegend).children()), "<+=0.3");
      return tl;
    };
    let brandLogoClickTriggered = false;
    const initialReveal = () => {
      let main = gsap.timeline();
      main.addLabel("Start").call(() => {
        if (!brandLogoClickTriggered) {
          triggerElementClick(brandLogo);
          brandLogoClickTriggered = true;
        }
      }).call(() => updateNavigation(0)).add(letterAnimation(heroHeading, "heading"), "<").call(() => triggerElementClick(brandLogo)).from(heroButtons, { opacity: 0, stagger: 0.1, duration: baseDuration }, "<0.1").from(introText, { opacity: 0, duration: baseDuration }).fromTo(
        $(modularBox),
        { width: "19em", opacity: 0 },
        { width: "12.2em", opacity: 1, duration: 1 },
        "Start"
      ).addLabel($(navigationItems).eq(0).text()).fromTo($(brandBox), { opacity: 0 }, { opacity: 1 }, "Start+=0.3").call(() => addClassToElement(brandBox, "border")).add(letterAnimation($(modularBox).find(metadata).find("div"), 0.15), "-=1.15");
      main.addLabel("heroBoxes").from(heroBoxesLeft, { opacity: 0, x: "-12em", stagger: 0.15, duration: 1.2 }, "heroBoxes").from(heroBoxesRight, { opacity: 0, x: "12em", stagger: 0.15, duration: 1.2 }, "<");
      main.addLabel("heroBoxesText").add(
        letterAnimation($(heroBoxesLeft).closest(heroBox).find(metadata).children(), "label"),
        "heroBoxesText"
      ).add(
        letterAnimation(
          $(heroBoxesRight).closest(".hero-devices_box").find(metadata).children(),
          "label"
        ),
        "<"
      );
      main.addLabel("arrowsAndBorder").call(() => triggerElementClick(iconBoxArrow)).to(iconBoxArrow, { opacity: 1, duration: 0 }, "arrowsAndBorder");
      return main;
    };
    const dashboardTransition = () => {
      let main = gsap.timeline();
      main.addLabel("expandSquare").fromTo(
        modularBox,
        { width: "12.2em", height: "12.2em" },
        { width: "90.4em", height: "37.2em", duration: 1 }
      ).to(
        [brandLogo, heroBoxesLeft, heroBoxesRight, metadata, iconBoxArrow, cloudBorder],
        { opacity: 0, duration: baseDuration },
        "expandSquare+=0.4"
      );
      main.fromTo(
        [dashboard, graphs],
        { opacity: 0, display: "none" },
        { opacity: 1, display: "flex", duration: baseDuration },
        "expandSquare+=0.4"
      );
      return main;
    };
    const platfrom = () => {
      let main = gsap.timeline();
      main.addLabel("Reveal").add(initialReveal()).add(gsap.delayedCall(5));
      return main;
    };
    const inferenceEngine = () => {
      let main = gsap.timeline();
      main.addLabel("showGraph").addLabel("animateGraph1").to(dashboardInner, { opacity: 0, display: "none" }, "<").add(animateLabel($(graphHead).children(), 0.05), "<").add(scaleGraph($(graphBox).eq(0)), "<").add(animateGraph($(graphBox).eq(0)), ">-0.4").addLabel("animateGraph2").add(scaleGraph($(graphBox).eq(1)), "<").add(animateGraph($(graphBox).eq(1)), ">-0.4").addLabel("animateGraph3").add(scaleGraph($(graphBox).eq(2)), "<").add(animateGraph($(graphBox).eq(2)), ">-0.4").add(gsap.delayedCall(6));
      return main;
    };
    const mojo = () => {
      let main = gsap.timeline();
      main.addLabel("graph expand").to([$(graphBox).not(":first-child"), $(graphBox).children(), graphHead], {
        opacity: 0,
        duration: 0.3
      }).to(firstGraph, { width: "100%", duration: 1 }).addLabel("show Dashboard").fromTo(
        [dashboardInner],
        { opacity: 0, display: "none" },
        { opacity: 1, display: "flex", duration: 0.5 }
      ).to(closeCircles, { opacity: 1, stagger: 0.1, duration: baseDuration }, "<-=0.3").add(letterAnimation(dashboardTitle + " div", "label"), "<").to([dashboardTitle, langTab], { opacity: 1, duration: baseDuration, stagger: 0.2 }, "<").to(dashboardCode, { opacity: 1, duration: baseDuration }, "<").addLabel("graph fade out").to(graphs, { opacity: 0, display: "none", duration: 0.5 });
      main.addLabel("pythonCode").add(codeAnimation(pythonCode), "pythonCode+0.3");
      main.addLabel("switchCodeTabs", "+=2").to(pythonTab, { opacity: 0, duration: baseDuration / 2 }, "switchCodeTabs").to(mojoTab, { opacity: 1, display: "flex", duration: baseDuration }, "<").set(pythonCode, { display: "none" }, "<").set(mojoCode, { display: "block" }, "<");
      main.add(codeAnimation(mojoCode), "mojoCode+0.3", "<");
      return main;
    };
    const heroTrigger = {
      trigger: ".section_headera",
      start: "top center",
      end: "bottom top",
      toggleActions: "play pause play pause"
    };
    const heroAnimation = () => {
      const main = gsap.timeline({
        delay: 0.5,
        ease: Power2.easeOut,
        scrollTrigger: heroTrigger
      });
      main.addLabel($(navigationItems).eq(0).text() + "-Start").add(platfrom(), "<").addLabel($(navigationItems).eq(0).text() + "-End").add(dashboardTransition()).addLabel($(navigationItems).eq(1).text() + "-Start").add(animateHeadings(1)).add(inferenceEngine(), "<").addLabel($(navigationItems).eq(1).text() + "-End").addLabel($(navigationItems).eq(2).text() + "-Start").add(animateHeadings(2)).add(mojo(), "<").addLabel($(navigationItems).eq(2).text() + "-End");
      $(navigationItems).off("click").on("click", function(event) {
        event.stopPropagation();
        event.preventDefault();
        let index = $(this).index();
        let text = $(this).text();
        if (index === 0) {
          triggerElementClick(brandLogo);
          main.seek(text + "-Start");
          main.tweenFromTo(text + "-Start", text + "-End");
        } else {
          main.seek(text + "-Start").tweenFromTo(text + "-Start", text + "-End");
        }
        console.log("Click");
      });
      return main;
    };
    ScrollTrigger.matchMedia({
      "(min-width: 768px)": function() {
        let tl = heroAnimation();
      },
      "(max-width: 767px)": function() {
        let tl = gsap.timeline({
          scrollTrigger: heroTrigger
        });
        tl.add(initialReveal());
        animateHeadings(0);
      }
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
    const handleHeroSwiper = initSwiper(".hero-swiper", "(max-width: 767px)", {
      on: {
        slideChange: function() {
          animateHeadings(this.activeIndex);
        }
      }
    });
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
//# sourceMappingURL=homepage.js.map
