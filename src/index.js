import { codeAnimation, letterAnimation } from '$utils/globalFunctions';

$(document).ready(function () {
  gsap.registerPlugin(ScrollTrigger);

  $('img').each(function () {
    $(this).removeAttr('loading');
    ScrollTrigger.refresh();
  });

  // Lines Animation
  let lineMaskTriggers = [];

  function setupLineMaskScrollTriggers() {
    // Kill existing line mask triggers before setting up new ones
    lineMaskTriggers.forEach((st) => st.kill());
    lineMaskTriggers = [];
    $('.line-mask').attr('style', '');

    $('.line-mask').each(function () {
      const computedStyle = window.getComputedStyle($(this)[0]);
      const originalHeight = computedStyle.getPropertyValue('height');

      gsap.set($(this), { height: '100%' });

      const scrollTrigger = ScrollTrigger.create({
        trigger: $(this).closest('.line-mask_wrap'),
        once: true,
        start: 'center bottom',
        invalidateOnRefresh: true,
        onEnter: () => {
          gsap.to($(this), { height: originalHeight, duration: 1.2 });
        },
      });

      // Add the ScrollTrigger instance to the lineMaskTriggers array
      lineMaskTriggers.push(scrollTrigger);
    });
  }

  // Set up the ScrollTriggers on page load
  setupLineMaskScrollTriggers();

  // Debounce function to limit function calls
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Set up the ScrollTriggers on window resize, debounce the handler with 250ms delay
  $(window).on('resize', debounce(setupLineMaskScrollTriggers, 250));

  // Code Blocks Animations to view
  $('.dashboard_inner[code-animation]').each(function () {
    const codeBlock = $(this).find('.dashboard_code-block');
    codeBlock.hide();

    ScrollTrigger.create({
      trigger: $(this),
      once: true,
      start: '50% bottom',
      invalidateOnRefresh: true,
      toggleActions: 'play null null null',
      onEnter: () => {
        codeBlock.show();
        codeAnimation($(this));
      },
    });
  });

  // CTA Animation
  $('#ctaBox').each(function () {
    let label = $(this).find('#ctaLabel');
    let text = $(this).find('#ctaText');
    let triggerElement = $(this);
    let tl = gsap.timeline({
      ease: Power2.easeOut,
      paused: true,
      scrollTrigger: {
        trigger: triggerElement,
        // trigger element - viewport
        start: 'center bottom',
        onEnter: () => {
          // Play the timeline when the trigger element enters the viewport
          tl.play();
        },
      },
    });
    tl.add(letterAnimation(label)).add(letterAnimation(text));
  });
});
