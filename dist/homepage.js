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
  function switchDeviceIcons() {
    const hideClass = "hide";
    $(".hero-devices .hero-box_inner").each(function() {
      const icons = $(this).find(".hero-box_icon");
      const visibleIcon = icons.not("." + hideClass);
      const nextIndex = visibleIcon.index() >= icons.length - 1 ? 0 : visibleIcon.index() + 1;
      icons.addClass(hideClass);
      icons.eq(nextIndex).removeClass(hideClass);
    });
  }
  var baseDuration = 1.2;
  var heroLabel = "#heroLabel";
  var heroHeading = "#heroHeading";
  var heroHeadingBox = ".header_highlight-head";
  var heroButtons = "#heroButtons .button";
  var modularBox = "#modularBox";
  var heroBox = ".hero-box";
  var heroBoxInner = ".hero-box_inner";
  var brandBox = modularBox + " " + heroBoxInner;
  var brandLogo = "#brandLogo";
  var heroBoxesLeft = heroBox + "[box-direction=left] " + heroBoxInner;
  var heroBoxesRight = heroBox + "[box-direction=right] " + heroBoxInner;
  var metadata = ".hero-box_metadata-mask";
  var iconBoxArrow = ".hero-dashboard_arrow";
  var cloudBorder = ".hero-devices_border";
  var dashboard = "#dashboard";
  var dashboardInner = dashboard + " .hero-dashboard_inner";
  var dashboardCode = dashboard + " .hero-dashboard_code";
  var closeCircles = dashboard + " .hero-dashboard_close circle";
  var dashboardTitle = dashboard + " .hero-dashboard_head-label";
  var langTab = dashboard + " .hero-dashboard_tab";
  var pythonTab = dashboard + " .hero-dashboard_tab-inner.python";
  var mojoTab = dashboard + " .hero-dashboard_tab-inner.mojo";
  var pythonCode = dashboard + " .hero-dashboard_code-block.python";
  var mojoCode = dashboard + " .hero-dashboard_code-block.mojo";
  var graphs = ".hero-dashboard_graphs";
  var graphBox = ".hero-dashboard_graph-box";
  var graphLabel = ".hero-dashboard_graph-label";
  var graphNumberLabel = ".hero-dashboard_graph-number-label";
  var graphNumber = ".hero-dashboard_graph-number";
  var graphLegend = ".hero-dashboard_graph-legend";
  var main = gsap.timeline({ delay: 0.5, ease: Power2.easeOut, paused: true, repeat: -1 });
  $(document).ready(function() {
    main.addLabel("Start").add(letterAnimation(heroLabel, 0.01)).add(letterAnimation(heroHeading, "heading"), "<").call(() => {
      $(brandLogo).trigger("click");
    }).from(heroButtons, { opacity: 0, stagger: 0.1, duration: baseDuration }, "<0.1").fromTo(
      $(modularBox),
      { width: "19em", opacity: 0 },
      { width: "12.2em", opacity: 1, duration: baseDuration },
      "Start"
    ).add(letterAnimation($(modularBox).find(metadata).find("div"), "label"));
    main.addLabel("heroBoxesLeft").from(
      heroBoxesLeft,
      { opacity: 0, left: "-6em", stagger: 0.15, duration: baseDuration / 2 },
      "heroBoxesLeft"
    ).add(
      letterAnimation($(heroBoxesLeft).closest(heroBox).find(metadata).children(), "label"),
      "<"
    );
    main.addLabel("heroBoxesRight").from(
      heroBoxesRight,
      { opacity: 0, left: "6em", stagger: 0.15, duration: baseDuration / 2 },
      "heroBoxesLeft"
    ).add(
      letterAnimation(
        $(heroBoxesRight).closest(".hero-devices_box").find(metadata).children(),
        "label"
      ),
      "<"
    );
    main.addLabel("arrowsAndBorder").to([cloudBorder, iconBoxArrow], { opacity: 1, duration: baseDuration }, "arrowsAndBorder");
    main.addLabel("loopDevices");
    const CloudsSwitch = gsap.timeline().to(heroBoxesRight, { opacity: 0 }).to(heroBoxesRight, { x: "1em" }).call(switchDeviceIcons).to(heroBoxesRight, { opacity: 1, x: "0" });
    const repeatedCloudsSwitch = gsap.timeline().add(CloudsSwitch).delay(1).repeat(1).repeatDelay(1);
    main.add(repeatedCloudsSwitch, "loopDevices");
    main.addLabel("expandSquare").fromTo(
      modularBox,
      { width: "12.2em", height: "12.2em" },
      { width: "90.4em", height: "37.2em", duration: baseDuration },
      "expandSquare"
    ).to(
      [brandBox, heroBoxesLeft, heroBoxesRight, metadata, iconBoxArrow, cloudBorder],
      { opacity: 0, duration: baseDuration },
      "<"
    ).addLabel("headingUpdate1").to(heroHeading, { opacity: 0, y: "2em", duration: 0.2 }).call(() => {
      $(heroHeading).html(
        'A <span class="word-highlight">new language</span> that <span class="word-highlight">extends</span> <span class="word-highlight">Python</span> but thats <span class="word-highlight">as fast as C</span>'
      );
      wrapLetters(heroHeading);
      $(heroHeadingBox).css("width", "80%");
    }).to(heroHeading, { opacity: 1, y: "0em", duration: 0.2 });
    main.addLabel("showDashboard").fromTo(
      [dashboard, dashboardInner],
      { autoAlpha: 0 },
      { autoAlpha: 1, stagger: 0.2 },
      "showDashboard"
    ).to(closeCircles, { opacity: 1, stagger: 0.1, duration: baseDuration }).add(letterAnimation(dashboardTitle + " div", "label"), "<").to([dashboardTitle, langTab], { opacity: 1, duration: baseDuration, stagger: 0.2 }, "<").to(dashboardCode, { opacity: 1, duration: baseDuration }, "<");
    main.addLabel("pythonCode").add(codeAnimation(pythonCode), "pythonCode+0.3");
    main.addLabel("switchCodeTabs").to(pythonTab, { opacity: 0, duration: baseDuration / 2 }, "switchCodeTabs").to(mojoTab, { opacity: 1, display: "flex", duration: baseDuration }, "<").set(pythonCode, { display: "none" }, "<").set(mojoCode, { display: "block" }, "<");
    main.addLabel("mojoCode").add(codeAnimation(mojoCode), "mojoCode+0.3");
    let graphWidth;
    const firstGraph = $(graphBox).eq(0);
    main.call(() => {
      graphWidth = firstGraph.css("width");
    }).set(firstGraph, { width: "100%" }).set($(graphBox).not(":first-child"), { scaleY: 0 }).addLabel("transitionCode").to(
      [dashboardCode, firstGraph],
      {
        width: () => {
          return graphWidth;
        },
        duration: baseDuration
      },
      "showGraphs"
    ).addLabel("headingUpdate2").to(heroHeading, { opacity: 0, y: "2em", duration: 0.2 }).call(() => {
      $(heroHeading).html(
        'The <span class="word-highlight">fastest unified AI inference</span> <span class="word-highlight">engine</span> in the world.'
      );
      wrapLetters(heroHeading);
    }).to(heroHeading, { opacity: 1, y: "0em", duration: 0.2 });
    main.addLabel("showGraph").to(graphs, { autoAlpha: 1, duration: baseDuration }, "<").to(dashboard, { autoAlpha: 0, duration: baseDuration }, "<");
    const animateLabel = (element) => {
      main.set(element, { opacity: 1 }).add(letterAnimation(element, "label"), "<");
    };
    const animateGraph = (parent) => {
      main.add(animateLabel($(parent).find(graphLabel).children()), "<").add(animateLabel($(parent).find(graphNumberLabel).children()), "<").add(animateLabel($(parent).find(graphLegend).children()), "<").set($(parent).find(graphNumber), { yPercent: 10, opacity: 0 }, "<").to($(parent).find(graphNumber), { yPercent: 0, opacity: 1, duration: baseDuration }, "<");
    };
    main.addLabel("animateGraph1").add(animateGraph($(graphBox).eq(0)));
    main.to($(graphBox).eq(1), { scaleY: 1, duration: baseDuration }).addLabel("animateGraph2").add(animateGraph($(graphBox).eq(1)));
    main.to($(graphBox).eq(2), { scaleY: 1, duration: baseDuration }).addLabel("animateGraph3").add(animateGraph($(graphBox).eq(2)));
    main.to(modularBox, {
      keyframes: {
        "50%": { opacity: 0 },
        "100%": { scale: 0.5 }
      },
      duration: baseDuration
    });
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
    main.play();
  });
})();
//# sourceMappingURL=homepage.js.map
