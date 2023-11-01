// ----- HP
gsap.registerPlugin(ScrollTrigger);

function gsapTo(el, yValue) {
  let tl = gsap.timeline();
  return tl.to(el, { y: yValue }, '<');
}

function processCards(cards, cols, actions) {
  cards.each(function (index) {
    const action = actions[index % cols];
    if (action) {
      action($(this));
    }
  });
}

/*** Different ScrollTrigger setups for various screen sizes (media queries) ***/
ScrollTrigger.matchMedia({
  // desktop
  '(min-width: 992px)': function () {
    $('.section_speakersmod .container-large').each(function () {
      let main = gsap.timeline({
        scrollTrigger: {
          trigger: $(this),
          start: 'top center',
          end: 'center center',
          scrub: 1,
        },
      });

      const smallActions = {
        1: (el) => main.add(gsapTo(el, '4rem'), '<'),
        3: (el) => main.add(gsapTo(el, '4rem'), '<'),
      };

      let cardsSmall = $(this).find('.speakers-collection_list.small').find('.speakers-card');

      processCards(cardsSmall, 4, smallActions);
    });
  },
});

// ----- Detail
$(document).ready(function () {
  let faqhead = $('.faq_head');
  let faqbutton = $('#faq-expand');
  let faqbuttontext = faqbutton.text();

  // Faq Items
  faqhead.each(function () {
    $(this).attr('data-state', 'closed');
  });
  faqhead.on('click', function () {
    var $this = $(this);
    var state = $this.attr('data-state');
    $this.attr('data-state', state === 'open' ? 'closed' : 'open');
    $this.toggleClass('is-active');
  });

  // FaQ Button
  faqbutton.click(function () {
    var $button = $(this);
    if ($button.text() === faqbuttontext) {
      faqhead.filter('[data-state="closed"]').click();
      $button.text('Hide All');
    } else {
      faqhead.filter('[data-state="open"]').click();
      $button.text(faqbuttontext);
    }
  });
});
