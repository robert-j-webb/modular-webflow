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
  var animateGraphChart = (target) => {
    let tl = gsap.timeline();
    tl.fromTo(
      target,
      {
        scaleY: 0
      },
      { scaleY: 1, duration: 1 },
      "<"
    );
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
  var animateChartGraph = (target, graphType, trigger) => {
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
    let labels = $(target).find(".text-size-label");
    let labelDot = $(trigger).find(".graphd_legend-dot");
    let chart = $(target).find(".graph-charts");
    tl.add(graphHeadAnimation(graphType));
    tl.add(letterAnimation(labels, "label"), "<").add(animateGraphChart(chart), "<").fromTo(labelDot, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1 }, "<");
    return tl;
  };
  var animateBoxGraph = (target, graphType, trigger) => {
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
    let labels = $(target).find(".text-size-label");
    let box = $(target).find(".graphc_item");
    tl.add(graphHeadAnimation(graphType));
    tl.fromTo(
      box,
      {
        scale: 0,
        opacity: 0
      },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.2
      }
    ).add(letterAnimation(labels, "label"));
    return tl;
  };

  // src/deployerpage.js
  $(document).ready(function() {
    $("#hero").each(function() {
      let tl = gsap.timeline({ delay: 0.2 });
      let heading = $(this).find("h1");
      let par = $(this).find("p");
      let btn = $(this).find(".button");
      tl.to(heading, { opacity: 1 });
      tl.add(letterAnimation(heading), "<");
      tl.to(par, { opacity: 1, duration: 0.5 }, "<1");
      tl.to(btn, { opacity: 1, duration: 0.5 }, "<0.4");
      tl.add(animateChartGraph(".graphd", "d", ".graphd"), "<");
    });
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
            ScrollTrigger.create({
              trigger: "body",
              start: "top top",
              end: "bottom bottom",
              onUpdate: (self) => {
                const scrollProgress = self.progress;
                updateMarqueePosition(scrollProgress);
              }
            });
          });
        } else {
          ScrollTrigger.getAll().forEach((st) => st.kill());
          $("[tr-marquee-element='component']").each(function() {
            const componentEl = $(this), panelEl = componentEl.find("[tr-marquee-element='panel']");
            gsap.set(panelEl, { clearProps: "all" });
          });
        }
      };
      initMarquee();
      $(window).on("resize", initMarquee);
    });
    $(".graphb_row").each(function() {
      animateHorizontalGraph($(this), "b", ".graphb");
    });
    $(".graphc_box").each(function() {
      animateBoxGraph($(this), "c", ".graphc");
    });
  });
})();
//# sourceMappingURL=deployerpage.js.map
