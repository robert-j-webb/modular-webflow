"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/modconf.js
  gsap.registerPlugin(ScrollTrigger);
  function gsapTo(el, yValue) {
    let tl = gsap.timeline();
    return tl.to(el, { y: yValue }, "<");
  }
  function processCards(cards, cols, actions) {
    cards.each(function(index) {
      const action = actions[index % cols];
      if (action) {
        action($(this));
      }
    });
  }
  ScrollTrigger.matchMedia({
    // desktop
    "(min-width: 992px)": function() {
      $(".section_speakersmod .container-large").each(function() {
        let main = gsap.timeline({
          scrollTrigger: {
            trigger: $(this),
            start: "top center",
            end: "center center",
            scrub: 1
          }
        });
        const smallActions = {
          1: (el) => main.add(gsapTo(el, "4rem"), "<"),
          3: (el) => main.add(gsapTo(el, "4rem"), "<")
        };
        let cardsSmall = $(this).find(".speakers-collection_list.small").find(".speakers-card");
        processCards(cardsSmall, 4, smallActions);
      });
    }
  });
  $(document).ready(function() {
    $(".section_mod-agenda,.section_faqmod").each(function() {
      let faqhead = $(this).find(".faq_head,.mod-agenda_item");
      let faqbutton = $(this).find("#faq-expand");
      let faqbuttontext = faqbutton.text();
      faqhead.each(function() {
        $(this).attr("data-state", "closed");
      });
      faqhead.on("click", function() {
        var $this = $(this);
        var state = $this.attr("data-state");
        $this.attr("data-state", state === "open" ? "closed" : "open");
        $this.toggleClass("is-active");
      });
      faqbutton.click(function() {
        var $button = $(this);
        if ($button.text() === faqbuttontext) {
          faqhead.filter('[data-state="closed"]').click();
          $button.text("Hide All");
        } else {
          faqhead.filter('[data-state="open"]').click();
          $button.text(faqbuttontext);
        }
      });
    });
  });
})();
//# sourceMappingURL=modconf.js.map
