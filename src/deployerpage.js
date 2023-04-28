import {
  animateBoxGraph,
  animateChartGraph,
  animateHorizontalGraph,
  letterAnimation,
} from '$utils/globalFunctions';

// Hero Animation
$(document).ready(function () {
  $('#hero').each(function () {
    let tl = gsap.timeline({ delay: 0.2 });
    let heading = $(this).find('h1');
    let par = $(this).find('p');
    let btn = $(this).find('.button');

    tl.to(heading, { opacity: 1 });
    tl.add(letterAnimation(heading), '<');
    tl.to(par, { opacity: 1, duration: 0.5 }, '<1');
    tl.to(btn, { opacity: 1, duration: 0.5 }, '<0.4');
    tl.add(animateChartGraph('.graphd', 'd', '.graphd'), '<');
  });

  // Marquee Strip
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== 'string' || attrVal.trim() === '') return defaultVal;
    if (attrVal === 'true' && defaultValType === 'boolean') return true;
    if (attrVal === 'false' && defaultValType === 'boolean') return false;
    if (isNaN(attrVal) && defaultValType === 'string') return attrVal;
    if (!isNaN(attrVal) && defaultValType === 'number') return +attrVal;
    return defaultVal;
  }
  // marquee component
  $(document).ready(function () {
    const initMarquee = () => {
      if (window.matchMedia('(min-width: 992px)').matches) {
        $("[tr-marquee-element='component']").each(function () {
          const componentEl = $(this),
            panelEl = componentEl.find("[tr-marquee-element='panel']");
          let speedSetting = attr(100, componentEl.attr('tr-marquee-speed')),
            verticalSetting = attr(false, componentEl.attr('tr-marquee-vertical')),
            reverseSetting = attr(false, componentEl.attr('tr-marquee-reverse')),
            moveDistanceSetting = -100;
          if (reverseSetting) moveDistanceSetting = 100;

          const updateMarqueePosition = (progress) => {
            if (verticalSetting) {
              gsap.set(panelEl, { yPercent: progress * moveDistanceSetting });
            } else {
              gsap.set(panelEl, { xPercent: progress * moveDistanceSetting });
            }
          };

          const marqueeTimeline = gsap.timeline();

          const scrollTriggerInstance = ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
              const scrollProgress = self.progress;
              updateMarqueePosition(scrollProgress);
            },
          });

          // Store ScrollTrigger instance in the component's data
          componentEl.data('scrollTrigger', scrollTriggerInstance);
        });
      } else {
        $("[tr-marquee-element='component']").each(function () {
          const componentEl = $(this),
            panelEl = componentEl.find("[tr-marquee-element='panel']");

          // Retrieve and kill the corresponding ScrollTrigger instance
          const st = componentEl.data('scrollTrigger');
          if (st) {
            st.kill();
            componentEl.removeData('scrollTrigger');
          }

          gsap.set(panelEl, { clearProps: 'all' });
        });
      }
    };

    // Run the function on load
    initMarquee();

    // Run the function on resize
    $(window).on('resize', initMarquee);
  });

  // Graph Animation
  // Carousel Graph 1
  $('.graphb_row').each(function () {
    animateHorizontalGraph($(this), 'b', '.graphb');
  });

  // Carousel Graph 2
  $('.graphc_box').each(function () {
    animateBoxGraph($(this), 'c', '.graphc');
  });
});
