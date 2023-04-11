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
    tl.add(letterAnimation('h1'), '<');
    tl.to(par, { opacity: 1, duration: 0.5 }, '<1');
    tl.to(btn, { opacity: 1, duration: 0.5 }, '<0.4');
    tl.add(animateChartGraph('.graphd', '.graphd'), '<');
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
  $("[tr-marquee-element='component']").each(function () {
    const componentEl = $(this),
      panelEl = componentEl.find("[tr-marquee-element='panel']"),
      triggerHoverEl = componentEl.find("[tr-marquee-element='triggerhover']"),
      triggerClickEl = componentEl.find("[tr-marquee-element='triggerclick']");
    let speedSetting = attr(100, componentEl.attr('tr-marquee-speed')),
      verticalSetting = attr(false, componentEl.attr('tr-marquee-vertical')),
      reverseSetting = attr(false, componentEl.attr('tr-marquee-reverse')),
      scrollDirectionSetting = attr(false, componentEl.attr('tr-marquee-scrolldirection')),
      scrollScrubSetting = attr(false, componentEl.attr('tr-marquee-scrollscrub')),
      moveDistanceSetting = -100,
      timeScaleSetting = 1,
      pausedStateSetting = false;
    if (reverseSetting) moveDistanceSetting = 100;
    const marqueeTimeline = gsap.timeline({
      repeat: -1,
      onReverseComplete: () => marqueeTimeline.progress(1),
    });
    if (verticalSetting) {
      speedSetting = panelEl.first().height() / speedSetting;
      marqueeTimeline.fromTo(
        panelEl,
        { yPercent: 0 },
        { yPercent: moveDistanceSetting, ease: 'none', duration: speedSetting }
      );
    } else {
      speedSetting = panelEl.first().width() / speedSetting;
      marqueeTimeline.fromTo(
        panelEl,
        { xPercent: 0 },
        { xPercent: moveDistanceSetting, ease: 'none', duration: speedSetting }
      );
    }
    const scrubObject = { value: 1 };
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (!pausedStateSetting) {
          if (scrollDirectionSetting && timeScaleSetting !== self.direction) {
            timeScaleSetting = self.direction;
            marqueeTimeline.timeScale(self.direction);
          }
          if (scrollScrubSetting) {
            let v = self.getVelocity() * 0.006;
            v = gsap.utils.clamp(-60, 60, v);
            const scrubTimeline = gsap.timeline({
              onUpdate: () => marqueeTimeline.timeScale(scrubObject.value),
            });
            scrubTimeline.fromTo(
              scrubObject,
              { value: v },
              { value: timeScaleSetting, duration: 0.5 }
            );
          }
        }
      },
    });

    function pauseMarquee(isPausing) {
      pausedStateSetting = isPausing;
      const pauseObject = { value: 1 };
      const pauseTimeline = gsap.timeline({
        onUpdate: () => marqueeTimeline.timeScale(pauseObject.value),
      });
      if (isPausing) {
        pauseTimeline.fromTo(pauseObject, { value: timeScaleSetting }, { value: 0, duration: 0.5 });
        triggerClickEl.addClass('is-paused');
      } else {
        pauseTimeline.fromTo(pauseObject, { value: 0 }, { value: timeScaleSetting, duration: 0.5 });
        triggerClickEl.removeClass('is-paused');
      }
    }
    if (window.matchMedia('(pointer: fine)').matches) {
      triggerHoverEl.on('mouseenter', () => pauseMarquee(true));
      triggerHoverEl.on('mouseleave', () => pauseMarquee(false));
    }
    triggerClickEl.on('click', function () {
      !$(this).hasClass('is-paused') ? pauseMarquee(true) : pauseMarquee(false);
    });
  });

  // Graph Animation
  // Hero Chart Graph
  // Carousel Graph 1
  $('.graphb_row').each(function () {
    animateHorizontalGraph($(this), 'b', '.graphb');
  });

  // Carousel Graph 2
  $('.graphc_box').each(function () {
    animateBoxGraph($(this), '.graphc');
  });
});
