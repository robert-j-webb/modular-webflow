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
    tl.add(animateGraphRow(target, graphType));
    return tl;
  };
  var animateChartGraph = (target, trigger) => {
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
    tl.add(letterAnimation(labels, "label"), "<").add(animateGraphChart(chart), "<").fromTo(labelDot, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1 }, "<");
    return tl;
  };
  var animateBoxGraph = (target, trigger) => {
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
    tl.set(box, {
      scale: 0,
      opacity: 0
    });
    tl.to(box, {
      scale: 1,
      opacity: 1,
      stagger: 0.2
    }).add(letterAnimation(labels, "label"));
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
      tl.add(letterAnimation("h1"), "<");
      tl.to(par, { opacity: 1, duration: 0.5 }, "<1");
      tl.to(btn, { opacity: 1, duration: 0.5 }, "<0.4");
      tl.add(animateChartGraph(".graphd", ".graphd"), "<");
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
    $("[tr-marquee-element='component']").each(function() {
      const componentEl = $(this), panelEl = componentEl.find("[tr-marquee-element='panel']"), triggerHoverEl = componentEl.find("[tr-marquee-element='triggerhover']"), triggerClickEl = componentEl.find("[tr-marquee-element='triggerclick']");
      let speedSetting = attr(100, componentEl.attr("tr-marquee-speed")), verticalSetting = attr(false, componentEl.attr("tr-marquee-vertical")), reverseSetting = attr(false, componentEl.attr("tr-marquee-reverse")), scrollDirectionSetting = attr(false, componentEl.attr("tr-marquee-scrolldirection")), scrollScrubSetting = attr(false, componentEl.attr("tr-marquee-scrollscrub")), moveDistanceSetting = -100, timeScaleSetting = 1, pausedStateSetting = false;
      if (reverseSetting)
        moveDistanceSetting = 100;
      const marqueeTimeline = gsap.timeline({
        repeat: -1,
        onReverseComplete: () => marqueeTimeline.progress(1)
      });
      if (verticalSetting) {
        speedSetting = panelEl.first().height() / speedSetting;
        marqueeTimeline.fromTo(
          panelEl,
          { yPercent: 0 },
          { yPercent: moveDistanceSetting, ease: "none", duration: speedSetting }
        );
      } else {
        speedSetting = panelEl.first().width() / speedSetting;
        marqueeTimeline.fromTo(
          panelEl,
          { xPercent: 0 },
          { xPercent: moveDistanceSetting, ease: "none", duration: speedSetting }
        );
      }
      const scrubObject = { value: 1 };
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (!pausedStateSetting) {
            if (scrollDirectionSetting && timeScaleSetting !== self.direction) {
              timeScaleSetting = self.direction;
              marqueeTimeline.timeScale(self.direction);
            }
            if (scrollScrubSetting) {
              let v = self.getVelocity() * 6e-3;
              v = gsap.utils.clamp(-60, 60, v);
              const scrubTimeline = gsap.timeline({
                onUpdate: () => marqueeTimeline.timeScale(scrubObject.value)
              });
              scrubTimeline.fromTo(
                scrubObject,
                { value: v },
                { value: timeScaleSetting, duration: 0.5 }
              );
            }
          }
        }
      });
      function pauseMarquee(isPausing) {
        pausedStateSetting = isPausing;
        const pauseObject = { value: 1 };
        const pauseTimeline = gsap.timeline({
          onUpdate: () => marqueeTimeline.timeScale(pauseObject.value)
        });
        if (isPausing) {
          pauseTimeline.fromTo(pauseObject, { value: timeScaleSetting }, { value: 0, duration: 0.5 });
          triggerClickEl.addClass("is-paused");
        } else {
          pauseTimeline.fromTo(pauseObject, { value: 0 }, { value: timeScaleSetting, duration: 0.5 });
          triggerClickEl.removeClass("is-paused");
        }
      }
      if (window.matchMedia("(pointer: fine)").matches) {
        triggerHoverEl.on("mouseenter", () => pauseMarquee(true));
        triggerHoverEl.on("mouseleave", () => pauseMarquee(false));
      }
      triggerClickEl.on("click", function() {
        !$(this).hasClass("is-paused") ? pauseMarquee(true) : pauseMarquee(false);
      });
    });
    $(".graphb_row").each(function() {
      animateHorizontalGraph($(this), "b", ".graphb");
    });
    $(".graphc_box").each(function() {
      animateBoxGraph($(this), ".graphc");
    });
  });
})();
//# sourceMappingURL=deployerpage.js.map
