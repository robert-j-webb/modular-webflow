"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/maxpage.js
  $(document).ready(function() {
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
//# sourceMappingURL=maxpage.js.map
