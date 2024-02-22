import { codeAnimation, codeFile, letterAnimation, typeText } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

gsap.registerPlugin(ScrollTrigger);

$(document).ready(function () {
  // #region Stats
  let models = $('.perf_opt-item');
  let types = $('.perf_opt-type_dropdown-item');
  let dropdown = $('.perf_opt-type_dropdown');
  let dropdownMenu = $('.perf_opt-type_dropdown-menu');
  let dropdownMenuItems = $('.perf_opt-type_dropdown-item');
  let dropdownOpen = false;
  let typeIndex = 0;

  // Functions
  function formatNumber(number) {
    // Define or replace with appropriate formatting logic
    return number.toLocaleString('en');
  }
  const animateCounter = ($element, value) => {
    $($element).each(function () {
      const currentText = $(this).text().trim().replace(/,/g, ''); // Remove commas before parsing
      const startValue = parseFloat(currentText) || 0; // Fallback to 0 if not a number
      const targetValue = parseFloat(value);

      if (!isNaN(targetValue) && startValue !== targetValue) {
        const Cont = { val: startValue }; // Initialize with current value

        // Determine the number of decimal places to animate based on the input and target values
        const decimalPlaces = Math.max(
          (startValue.toString().split('.')[1] || '').length,
          (targetValue.toString().split('.')[1] || '').length
        );

        const onUpdate = () => {
          // Use toFixed to control the number of decimal places during the animation
          let formattedValue = formatNumber(Cont.val.toFixed(decimalPlaces));
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

  /* Models */
  function updateModels(index) {
    let selectedRadio = $('input[name="models"]:checked').closest(models);
    selectedRadio = selectedRadio.length ? selectedRadio : models.eq(0);
    models.removeClass('is-active');
    selectedRadio.addClass('is-active');

    let name = selectedRadio.find('span').text();
    let vals1 = selectedRadio.attr('data-values-1').split(', ');
    let vals2 = selectedRadio.attr('data-values-2').split(', ');

    console.log(index);

    animateCounter($('[data-number=1]'), vals1[index]);
    animateCounter($('[data-number=2]'), vals2[index]);
    animateCounter($('[data-label=stats-1]'), vals1[index]);
    animateCounter($('[data-label=stats-2]'), vals2[index]);
    updateText($('[data-label=model'), name);
  }

  /* Type */
  function updateTypes() {
    let selectedType = $('input[name="type"]:checked').closest(types);
    selectedType = selectedType.length ? selectedType : types.eq(0);
    typeIndex = selectedType.closest('.w-dyn-item').index();

    types.removeClass('is-active');
    selectedType.addClass('is-active');

    let name = selectedType.find('span').text();

    $('.perf_opt-type_dropdown div:first-child').text(name);
    $('[data-label="type"]').text(name);
  }

  /* Dropdown */
  function animateDropdown() {
    if (dropdownOpen) {
      gsap.to(dropdownMenu, { height: 0, ease: Power1.easeOut });
      gsap.to(dropdown.find('.icon-embed-custom1'), { rotate: 0, ease: Power1.easeOut });
    } else {
      gsap.to(dropdownMenu, { height: 'auto', ease: Power1.easeOut });
      gsap.to(dropdown.find('.icon-embed-custom1'), { rotate: 180, ease: Power1.easeOut });
    }
  }

  // -- Load
  gsap.set(dropdownMenu, {
    height: '0',
    onComplete: () => {
      dropdownMenu.show();
    },
  });
  updateModels();
  updateTypes();

  // -- Logic
  models.add(types).on('change', () => {
    updateTypes();
    updateModels(typeIndex);
  });

  // Open Click
  dropdown.on('click', function () {
    animateDropdown();
    dropdownOpen = !dropdownOpen;
  });
  types.on('change', function () {
    if (dropdownOpen) {
      animateDropdown();
      dropdownOpen = false;
    }
  });

  $(document).on('click', function (event) {
    if (
      !$(event.target).closest(dropdown).length &&
      !$(event.target).closest(dropdownMenu).length
    ) {
      if (dropdownOpen) {
        animateDropdown();
        dropdownOpen = false;
      }
    }
  });

  // #endregion

  // #region Tabs
  // #region Autoplay Tabs
  const activeClass = 'tab-active';
  const progressLine = '.tabs_block-progress-line';
  const fileNameSelector = '.dashboard_head-filename';
  const tabTimeline = gsap.timeline({ paused: true });
  const duration = 4000;

  // Animates a card, by typing the text and filename.
  function cardAnimation(card) {
    return new Promise((resolve) => {
      card.show();
      const fileNameTxt = card.find('.file-name').text();
      const fileNameEl = card.parent().parent().find(fileNameSelector);
      fileNameEl.text('');
      const typeFileNameTimeline = gsap.timeline();
      typeFileNameTimeline.add(typeText(fileNameEl, fileNameTxt));
      tabTimeline.add(codeAnimation(card)).add(typeFileNameTimeline, '<');
      tabTimeline.play();
      tabTimeline.then(resolve);
    });
  }

  // TABS 1
  tabCarousel({
    tabs: $('.tabs').eq(0).find('.tabs_block-link-menu .tabs_block-link'),
    cards: $('.tabs').eq(0).find('.cardb_visual .dashboard_code-block'),
    onCardLeave: (card) => {
      card.hide();
    },
    onTabLeave: (tab) => {
      tab.removeClass(activeClass);
      // If this is called mid animation (by a click) this will stop it.
      tab.find(progressLine).stop();
      tab.find(progressLine).css('width', '0');
    },
    onCardShow: cardAnimation,
    onTabShow: (tab) => {
      return new Promise((resolve) => {
        tab.addClass(activeClass);
        tab.find(progressLine).animate({ width: '100%' }, duration, resolve);
      });
    },
  });

  swiperCarousel({
    sliderSelector: '.tabs_slider._1',
    // On init and when the swiper slides, we animate the progressbar and code
    // block, but only animate the code the first time it's shown.
    animateOnSlide(activeSlide) {
      // Set progressLine to 0 and then start an animation for it.
      activeSlide
        .find(progressLine)
        .stop(true, true)
        .css('width', '0')
        .animate({ width: '100%' }, duration);

      const codeBlock = activeSlide.find('.dashboard_code-block');

      // Run codeAnimation() this function on that child only if it hasn't been animated before
      if (codeBlock && !codeBlock.hasClass('animated')) {
        cardAnimation(codeBlock);
        codeBlock.addClass('animated');
      }
    },
    onInit() {
      const sliderCodes = $('.tabs_slider').eq(0).find('.cardb_visual .dashboard_code-block');
      $(sliderCodes).hide();
    },
    duration,
  });

  // #endregion

  // #region Swipers
  function initSwiper(swiperSelector, mediaQueryString, customConfig) {
    let swiperInstance;
    let initStatus = false;

    function handleSwiper() {
      const mediaQuery = window.matchMedia(mediaQueryString);
      const shouldInitialize = mediaQuery.matches;

      if (shouldInitialize) {
        if (!initStatus) {
          initStatus = true;
          swiperInstance = new Swiper(swiperSelector, {
            slidesPerView: 1,
            spaceBetween: 24,
            speed: 250,
            observer: true,
            touchMoveStopPropagation: false,
            preventInteractionOnTransition: true,
            pagination: {
              el: '.swiper-navigation.latest',
              type: 'bullets',
              clickable: true,
              bulletActiveClass: 'w-active',
              bulletClass: 'w-slider-dot',
            },
            ...customConfig,
          });
        }
      } else {
        if (initStatus) {
          if (swiperInstance) {
            swiperInstance.destroy(true, true);
          }
          initStatus = false;
        }
      }
    }

    handleSwiper();
    window.addEventListener('resize', handleSwiper);

    return handleSwiper;
  }
  initSwiper('.latest_slider', '(max-width: 991px)', {});
});
