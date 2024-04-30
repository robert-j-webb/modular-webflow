import { codeAnimation, codeFile, letterAnimation, typeText } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

gsap.registerPlugin(ScrollTrigger);

$(document).ready(function () {
  //#region HeroAnimtion
  // Step 2
  const heroStep1 = () => {
    let ootfBox = $('#ootb_logo');
    let slowBar1 = $('#bar-slow_1');
    let slowBar2 = $('#bar-slow_2');
    let slowBar3 = $('#bar-slow_3');

    let maxLogo = $('#max_logo');
    let fastBar1 = $('#bar-fast_1');
    let fastBar2 = $('#bar-fast_2');
    let fastBar3 = $('#bar-fast_3');

    let header = $('#headers');
    let numbers = $('#numbers');
    let grid = $('#grid');

    let barsDuration = 0.7;

    let tl = gsap.timeline({
      defaults: {
        ease: Power2.easeOut,
      },
    });

    // Graph 1
    tl.to($('.headerb_stage-2'), { opacity: 1 });
    tl.fromTo(
      [ootfBox, maxLogo, header, numbers],
      { opacity: 0, xPercent: -15 },
      { opacity: 1, xPercent: 0, duration: 0.5 }
    );
    tl.fromTo(grid, { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, '<');

    // Slow Bars
    tl.addLabel('bars-start', '<0.2');
    tl.fromTo(slowBar3, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, 'bars-start');
    tl.fromTo(slowBar2, { scaleX: 0 }, { scaleX: 0.428, duration: barsDuration }, '<');
    tl.fromTo(slowBar1, { scaleX: 0 }, { scaleX: 0.295, duration: barsDuration }, '<');

    tl.to(slowBar2, { scaleX: 1, duration: barsDuration });
    tl.to(slowBar1, { scaleX: 0.695, duration: barsDuration }, '<');

    tl.to(slowBar1, { scaleX: 1, duration: barsDuration });

    tl.fromTo(fastBar3, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, 'bars-start');
    tl.fromTo(fastBar2, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, '<');
    tl.fromTo(fastBar1, { scaleX: 0 }, { scaleX: 1, duration: barsDuration }, '<');

    return tl;
  };

  // Main
  let main = gsap.timeline({});

  main.add(heroStep1());
  //#endregion

  // #region Performance
  const mask = '.perf2_model-mask';
  let swiper1, swiper2;

  // ____ Helping Functions
  function formatNumber(number) {
    return number.toLocaleString('en');
  }

  const animateCounter = ($element, value) => {
    $($element).each(function () {
      const currentText = $(this).text().trim().replace(/,/g, ''); // Remove commas before parsing
      const startValue = parseFloat(currentText) || 0; // Fallback to 0 if not a number
      const targetValue = parseFloat(value);
      console.log(targetValue);

      if (!isNaN(targetValue) && startValue !== targetValue) {
        const Cont = { val: startValue }; // Initialize with current value

        // Determine the number of decimal places to animate based on the input and target values
        const decimalPlaces = 1;

        console.log(decimalPlaces);

        const onUpdate = () => {
          // Use toFixed to control the number of decimal places during the animation,
          // then parseFloat to remove unnecessary trailing zeros.
          let formattedValue = formatNumber(parseFloat(Cont.val.toFixed(decimalPlaces)));
          $(this).text(formattedValue);
        };

        gsap.fromTo(
          Cont,
          { val: startValue },
          {
            val: targetValue,
            duration: 0.7,
            ease: Power1.easeOut,
            onUpdate: onUpdate,
          }
        );
      }
    });
  };

  const updateText = ($element, value) => {
    $($element).each(function () {
      gsap.to($element, { text: value, duration: 0.5, ease: Power1.easeOut });
    });
  };

  // Toggling the full name paragraph
  function toggleNames(swiper, toggle) {
    let { activeIndex, slides } = swiper;
    let activeItem = slides[activeIndex];

    const revealName = (item) => {
      let target = $(item).find(mask);
      let fullHeight = target.find('p').outerHeight(); // Get the full height
      gsap.to(target, {
        height: fullHeight,
      });
    };

    const tl = gsap.timeline({
      // Trigger reveal after hiding all
      onComplete: () => {
        if (toggle) {
          revealName(activeItem);
        }
      },
    });

    // Hide all
    slides.forEach((element) => {
      tl.to(
        $(element).find(mask),
        {
          height: 0,
          duration: 0.2,
        },
        '<'
      );
    });
  }

  // Logic for updatig correct stats
  function updateStats(allSwipers) {
    let activeModelIndex = allSwipers.swiper1.realIndex;

    let activeModel = $(allSwipers.swiper1.slides[activeModelIndex]);

    // Stats el
    let statNumberEl = $('[stat-number]');
    let modelNameEl = $('[model-name-full]');
    let instaceNameEl = $('[instance-name-full]');

    // Data El
    let instanceTitles = $('.perf2_slider-2 .perf2_model-mask p');

    // Data
    let instanceNames = [
      $('[data-instance-1-short]').text(),
      $('[data-instance-2-short]').text(),
      $('[data-instance-3-short]').text(),
    ];

    let modelName = activeModel.find('[data-model-full]').text();
    let instances = [
      activeModel.attr('data-instance-1-full'),
      activeModel.attr('data-instance-2-full'),
      activeModel.attr('data-instance-3-full'),
    ];

    let performances = [
      activeModel.attr('data-performance-1-val'),
      activeModel.attr('data-performance-2-val'),
      activeModel.attr('data-performance-3-val'),
    ];

    // Check realIndex of both swipers
    let instanceIndex = allSwipers.swiper2.realIndex;

    // Stats
    instanceTitles.each(function () {
      let index = $(this).index();
      updateText($(this), instances[index]);
    });

    animateCounter(statNumberEl, performances[instanceIndex]);
    updateText(modelNameEl, modelName);
    updateText(instaceNameEl, instanceNames[instanceIndex] + ' ' + instances[instanceIndex]);
  }

  // Swiper instances
  let swipers = {
    swiper1: initializeSwiper('.perf2_slider-1', {
      initialSlide: 5,
    }),
    swiper2: initializeSwiper('.perf2_slider-2'),
  };

  let numPerformanceSelections = 0;
  let initialViewOfPerformance;

  // Keep track of when the user first views the performance slider.
  const observer = new IntersectionObserver(
    (entry) => {
      if (entry[0].isIntersecting) {
        initialViewOfPerformance = new Date();
        observer.disconnect();
      }
    },
    { root: null, threshold: 0.5 }
  );
  observer.observe(document.querySelector('.perf2_slider-1'));

  window.addEventListener('beforeunload', () => {
    const timeInSeconds = Math.round((new Date() - initialViewOfPerformance) / 1000);
    amplitude.track('timeSpentOnPerformance', { timeInSeconds });
    amplitude.track('totalClicksOnPerformance', { count: numPerformanceSelections });
  });

  // Swiper Logic
  function initializeSwiper(selector, options) {
    return new Swiper(selector, {
      slidesPerView: 1,
      direction: 'vertical',
      observer: true,
      slideToClickedSlide: true,
      init: false,
      threshold: 40,
      freeMode: {
        enabled: true,
        sticky: true,
      },
      on: {
        init: function () {
          toggleNames(this, true);
        },
      },
      mousewheel: {
        thresholdDelta: 20,
      },
      ...options,
    });
  }

  // Custom Events
  for (let key in swipers) {
    if (swipers.hasOwnProperty(key)) {
      let swiper = swipers[key];

      let debounceTimer;

      swiper.on('init', function () {
        updateStats(swipers);
      });
      swiper.on('slideChange', function () {
        const modelOrInstance = this.slides[this.activeIndex]?.innerText;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          numPerformanceSelections = numPerformanceSelections + 1;
          amplitude.track('performanceSelected', { modelOrInstance });
          toggleNames(this, true);
          updateStats(swipers);
        }, 300);
      });

      swiper.init();
    }
  }

  //#endregion
});
