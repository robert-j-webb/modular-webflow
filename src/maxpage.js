$(document).ready(function () {
  // #region Marguee
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

  // #endregion

  ScrollTrigger.matchMedia({
    all: function () {
      // #region Tabs Animations
      gsap.registerPlugin(ScrollTrigger);

      let sections = $('.max-flow_content');
      let icons = $('.max-flow_icon');
      let activeClass = 'active';

      let revealEase = 'power4.inOut';

      // --- Elements
      // First Anim
      let flowBox1 = $('.max-flow_box._1');
      let code1 = $('.max-flow-1_code');
      let icons1Box = flowBox1.find('.max-flow_icon-box');
      let icons1 = flowBox1.find(icons);

      // Second Anim
      let flowBox2 = $('.max-flow_box._2');
      let lines2 = $('.max-flow-2_lines');
      let icons2Box = $('.max-flow_logo-grid');
      let icons2 = flowBox2.find(icons);

      // Third Anim
      let flowBox3 = $('.max-flow_box._3');
      let lines3 = $('.max-flow-3_lines-box');
      let linesimg = $('.max-flow-3_lines-img');
      let icons3 = flowBox3.find(icons);

      // Fourth Anim
      let cloudBox = $('.max-flow_box._4');
      let maxServingBox = $('.max-flow_box._5');

      // First Scroll
      let firtScroll = gsap.timeline({
        scrollTrigger: {
          trigger: sections.eq(0),
          start: 'top bottom',
          endTrigger: sections.eq(1),
          end: 'top center',
          scrub: 1,
        },
      });

      firtScroll.from(icons1, {
        yPercent: function (target) {
          if (target === 0) {
            return 230;
          }
          if (target === 1) {
            return 260;
          }
          if (target === 2) {
            return 300;
          }
          if (target === 3) {
            return 250;
          }
          if (target === 4) {
            return 220;
          }
          if (target === 5) {
            return 220;
          }
        },
      });

      // Second Scroll
      let secondScroll = gsap.timeline({
        scrollTrigger: {
          trigger: sections.eq(1),
          start: 'top center',
          endTrigger: sections.eq(1),
          end: 'bottom bottom ',
          onEnter: () => {
            secondRevealTl.play();
          },
          onLeaveBack: () => {
            secondRevealTl.reverse();
          },
        },
      });
      secondScroll.fromTo(
        icons2,
        {
          yPercent: function (target) {
            if (target === 0 || target === 3) {
              return 85;
            }
            if (target === 1 || target === 4) {
              return 80;
            }
            if (target === 2 || target === 5) {
              return 75;
            }
          },
        },
        { yPercent: 0 },
        '<'
      );
      let secondIcons = gsap.timeline({
        scrollTrigger: {
          trigger: sections.eq(1),
          start: 'top center  ',
          endTrigger: sections.eq(2),
          end: 'top botom',
          scrub: 1,
        },
      });
      secondIcons.fromTo(
        icons2,
        {
          yPercent: function (target) {
            if (target === 0) {
              return 85;
            }
            if (target === 1) {
              return 80;
            }
            if (target === 2) {
              return 75;
            }
            if (target === 3) {
              return 100;
            }
            if (target === 4) {
              return 95;
            }
            if (target === 5) {
              return 90;
            }
          },
        },
        {
          yPercent: -15,
        },
        '<'
      );
      secondIcons.fromTo(lines2, { yPercent: 10 }, { yPercent: 0 }, '<');

      // Reveal
      let secondRevealTl = gsap.timeline({ paused: true, ease: revealEase });
      secondRevealTl.call(() => {
        flowBox1.add(flowBox2).toggleClass(activeClass);
      });
      secondRevealTl.to(
        flowBox2,
        {
          opacity: 1,
        },
        '<'
      );
      secondRevealTl.to(code1, { opacity: 0 }, '<');
      secondRevealTl.fromTo(
        icons1Box,
        { yPercent: 0, opacity: 1 },
        { yPercent: -10, opacity: 0 },
        '<'
      );

      // _ Second Step Coming In
      secondRevealTl.fromTo(flowBox2, { yPercent: 5 }, { yPercent: 0 }, '<');
      secondRevealTl.fromTo(icons2Box, { yPercent: 15 }, { yPercent: 0 }, '<');

      // Third Scroll
      let thirdScroll = gsap.timeline({
        scrollTrigger: {
          trigger: sections.eq(2),
          start: 'top center  ',
          endTrigger: sections.eq(2),
          end: 'center center',
          onEnter: () => {
            thirdRevealTL.play();
          },
          onLeaveBack: () => {
            thirdRevealTL.reverse();
          },
        },
      });
      let thirdCard = gsap.timeline({
        scrollTrigger: {
          trigger: sections.eq(2),
          start: 'top center',
          endTrigger: sections.eq(3),
          end: 'top center',
          scrub: 1,
        },
      });
      thirdCard.fromTo(flowBox3, { yPercent: 20 }, { yPercent: 0 });

      // Reveal
      let thirdRevealTL = gsap.timeline({ paused: true, ease: revealEase });
      thirdRevealTL.call(() => {
        flowBox2.toggleClass(activeClass);
      });
      thirdRevealTL.to(flowBox3, { opacity: 1 });
      thirdRevealTL.to(lines2, { opacity: 0 }, '<');
      thirdRevealTL.to(icons2Box, { opacity: 0 }, '<');

      // Fourth Scroll
      let fourthScroll = gsap.timeline({
        scrollTrigger: {
          trigger: sections.eq(3),
          start: 'top center  ',
          endTrigger: sections.eq(3),
          end: 'top top',
          onEnter: () => {
            fourthRevealTL.play();
          },
          onLeaveBack: () => {
            fourthRevealTL.reverse();
          },
        },
      });

      let thirdIcons = gsap.timeline({
        scrollTrigger: {
          trigger: sections.eq(3),
          start: 'top center',
          endTrigger: sections.eq(3),
          end: 'center center',
          scrub: 1,
          markers: false,
        },
      });
      thirdIcons.fromTo(
        icons3,
        {
          yPercent: function (target) {
            if (target === 0) {
              return 100;
            }
            if (target === 1) {
              return 75;
            }
            if (target === 2) {
              return 50;
            }
          },
        },
        { yPercent: 0 }
      );

      // Reveal
      let fourthRevealTL = gsap.timeline({ paused: true, ease: revealEase });
      fourthRevealTL.call(() => {
        flowBox3.toggleClass(activeClass);
      });
      fourthRevealTL.fromTo(
        flowBox3,
        { width: '52em', height: '30.4em', bottom: '11.6em' },
        { width: '40em', height: '18em', bottom: '14em' },
        '<'
      );
      fourthRevealTL.to(flowBox3.find('.max-flow_label').eq(1), { opacity: 0, height: 0 }, '<');
      fourthRevealTL.to(lines3, { scale: 0.95 }, '<');
      fourthRevealTL.fromTo(
        [cloudBox, maxServingBox],
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
        },
        '<'
      );
      fourthRevealTL.to(flowBox1, { height: '29em', bottom: '12.5em' }, '<');
      fourthRevealTL.to(flowBox1.find('.max-flow_label'), { text: 'Max Engine' }, '<');
      fourthRevealTL.to(flowBox2, { height: '23em', bottom: '14em' }, '<');
      fourthRevealTL.to(icons3, { opacity: 1, stagger: 0.1 }, '<');
      fourthRevealTL.to(linesimg.eq(0), { opacity: 0 });
      fourthRevealTL.to(linesimg.eq(1), { opacity: 1 }, '<');
      // #endregion
    },
  });
});
