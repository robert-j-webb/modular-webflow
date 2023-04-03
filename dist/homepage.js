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
  var letterAnimation = (elements, letterType) => {
    let letterDelay;
    if (letterType === "label") {
      letterDelay = 0.03;
    } else if (letterType === "heading") {
      letterDelay = 0.02;
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
  var animateCounter = ($element) => {
    $($element).each(function() {
      const Cont = { val: 0 };
      const originalText = $(this).text();
      const targetValue = parseFloat(originalText);
      if (!isNaN(targetValue)) {
        const onUpdate = () => {
          const formattedValue = Cont.val % 1 === 0 ? Cont.val.toFixed(0) : Cont.val.toFixed(1);
          $(this).text(formattedValue);
        };
        TweenLite.to(Cont, 1, {
          val: targetValue,
          onUpdate
        });
      } else {
        return;
      }
    });
  };
  var animateGraphRow = (targets, graphClassPrefix) => {
    const masterTimeline = gsap.timeline();
    $(targets).each(function(index) {
      let row = $(this).find(`.graph${graphClassPrefix}_box`);
      let label = $(this).find(`.graph${graphClassPrefix}_label div`);
      let number = $(this).find(`.graph${graphClassPrefix}_row-num div`);
      const codeTimeline = gsap.timeline();
      codeTimeline.from(row, { scaleX: 0, duration: 1 }).add(letterAnimation(label, "label")).add(animateCounter(number));
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
        start: "50% bottom",
        onEnter: () => {
          tl.play();
        }
      }
    });
    tl.add(animateGraphRow(target, graphType));
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
  var hightlightClass = "word-highlight";
  var baseDuration = 1.2;
  var heroLabel = "#heroLabel";
  var heroHeading = "#heroHeading";
  var heroButtons = "#heroButtons .button";
  var modularBox = "#modularBox";
  var heroBox = ".hero-box";
  var heroBoxInner = ".hero-box_inner";
  var brandBox = modularBox + " " + heroBoxInner;
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
  var heroSpan1 = ".hero-heading_span1";
  var heroSpan2 = ".hero-heading_span2";
  var heroSpan3 = ".hero-heading_span3";
  var heroSpan4 = ".hero-heading_span4";
  var heroSpan5 = ".hero-heading_span5";
  var heroSpan6 = ".hero-heading_span6";
  var main = gsap.timeline({ delay: 1.5, ease: Power2.easeOut, paused: true, repeat: -1 });
  $(document).ready(function() {
    main.addLabel("heroText").add(letterAnimation(heroLabel, "label")).add(letterAnimation(heroHeading + " span", "heading"), "<").from(heroButtons, { opacity: 0, stagger: 0.1, duration: baseDuration }, "<0.1").addLabel("modularBox").fromTo(
      $(modularBox),
      { width: "19em", opacity: 0 },
      { width: "12.2em", opacity: 1, duration: baseDuration },
      "modularBox"
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
    ).addLabel("headingUpdate1").add(typeText(heroSpan1, "A "), "<").add(typeText(heroSpan2, "new language"), "<").add(typeText(heroSpan3, " that"), "<").add(typeText(heroSpan4, " extends Python "), "<").add(typeText(heroSpan5, "but that's "), "<").add(typeText(heroSpan6, "as fast as C"), "<").add(() => {
      $(heroSpan5).removeClass(hightlightClass);
      $(heroSpan4 + "," + heroSpan6).addClass(hightlightClass);
    }, "<");
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
    ).addLabel("headingUpdate2").add(typeText(heroSpan1, "The "), "<").add(typeText(heroSpan2, "fastest unified AI interfence"), "<").add(typeText(heroSpan3, ""), "<").add(typeText(heroSpan4, "engine"), "<").add(typeText(heroSpan5, "in the world."), "<").add(typeText(heroSpan6, ""), "<").add(() => {
      $(heroSpan6).removeClass(hightlightClass);
    }, "<");
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
    $(".discord_box").each(function() {
      let triggerElement = $(this);
      let tl = gsap.timeline({
        ease: Power2.easeOut,
        paused: true,
        scrollTrigger: {
          trigger: triggerElement,
          // trigger element - viewport
          start: "20% bottom",
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
