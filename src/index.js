import { codeAnimation, letterAnimation, typeText } from '$utils/globalFunctions';
import { swiperCarousel, tabCarousel } from '$utils/tabCarousel';

document.documentElement.classList.add('js-enabled');

$(document).ready(function () {
  // Register GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Team has many images and does not appear to have problems when this is removed.
  if (window.location.pathname !== '/team') {
    // GSAP IMG SET
    $('img').each(function () {
      $(this).removeAttr('loading');
      ScrollTrigger.refresh();
    });
  }

  // RemoveScrollBar for all overflow elements
  function addNoScrollbarClass() {
    const allElements = document.querySelectorAll('*');

    for (const element of allElements) {
      // Exclude body and html elements
      if (element.tagName.toLowerCase() === 'body' || element.tagName.toLowerCase() === 'html') {
        continue;
      }

      const style = window.getComputedStyle(element);
      if (
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflowX === 'auto' ||
        style.overflowX === 'scroll' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll'
      ) {
        // Disable Scrollbar
        element.classList.add('no-scrollbar');
        // Fix for inner scroll inside swipers
        element.classList.add('swiper-no-swiping');
      }
    }
  }
  addNoScrollbarClass();

  // -- Lines Animation
  let lineMaskTriggers = [];
  function setupLineMaskScrollTriggers() {
    // Kill existing line mask triggers before setting up new ones
    lineMaskTriggers.forEach((st) => st.kill());
    lineMaskTriggers = [];
    $('.line-mask').attr('style', '');

    $('.line-mask').each(function () {
      const computedStyle = window.getComputedStyle($(this)[0]);
      const originalHeight = computedStyle.getPropertyValue('height');

      if ($(this).closest('.line-mask_wrap').hasClass('bottom')) {
        gsap.set($(this), { height: '0%' });
      } else {
        gsap.set($(this), { height: '100%' });
      }

      const scrollTrigger = ScrollTrigger.create({
        trigger: $(this).closest('.line-mask_wrap'),
        once: true,
        start: '70% bottom',
        invalidateOnRefresh: true,
        onEnter: () => {
          gsap.to($(this), { height: originalHeight, duration: 1.2 });
        },
      });

      // Add the ScrollTrigger instance to the lineMaskTriggers array
      lineMaskTriggers.push(scrollTrigger);
    });
  }
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
  let lastWindowWidth = $(window).width();
  setTimeout(() => {
    setupLineMaskScrollTriggers();
  }, 500);
  $(window).on(
    'resize',
    debounce(() => {
      const currentWindowWidth = $(window).width();

      if (currentWindowWidth !== lastWindowWidth) {
        setupLineMaskScrollTriggers();
        lastWindowWidth = currentWindowWidth;
      }
    }, 250)
  );

  // -- Code Blocks Animations to view
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

  // -- CTA Animation
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

  // -- Menu

  // Base
  var menuOpenAnim = false;
  var dropdownOpen = false;
  const menuLinks = '.navbar_part.links';
  const menuLinksItems = '.navbar_link';
  const menuButton = '.navbar_menu-btn';

  // Menu Animation
  let menuText = 'Close';
  function createNavReveal() {
    let navReveal = gsap
      .timeline({
        paused: true,
        onComplete: () => {
          disableScroll();
        },
      })
      .add(typeText(menuButton + ' div', () => menuText)) // Use a function that returns menuText value
      .fromTo(menuLinks, { display: 'none' }, { display: 'flex' }, '<')
      .fromTo(menuLinks, { yPercent: -100 }, { yPercent: 0 }, '<')
      .fromTo(
        menuLinksItems,
        {
          y: '100%',
          opacity: 0,
        },
        {
          y: '0%',
          opacity: 1,
          stagger: {
            each: 0.05,
          },
        },
        '-=0.2'
      )
      .fromTo($('.navbar_buttons-respo .button'), { opacity: 0 }, { opacity: 1, stagger: 0.2 })
      .fromTo(menuLinksItems, { pointerEvents: 'none' }, { pointerEvents: 'auto' }, '<');
    return navReveal;
  }

  // Scroll Disabler
  let scrollPosition;
  const disableScroll = () => {
    if (!menuOpenAnim) {
      scrollPosition = $(window).scrollTop();
      $('html, body').scrollTop(0).addClass('overflow-hidden');
    } else {
      $('html, body').scrollTop(scrollPosition).removeClass('overflow-hidden');
    }
    menuOpenAnim = !menuOpenAnim;
  };

  let navReveal;

  // GSAP's matchMedia
  ScrollTrigger.matchMedia({
    '(max-width: 991px)': function () {
      // Apply the animation only on screens with a max-width of 991px
      navReveal = createNavReveal();
    },
  });

  // Actions
  // Open on Click
  $('.navbar_menu-btn').on('click', openMenu);

  // Functions
  function openMenu() {
    if (navReveal) {
      playMenuAnimation();
    }
  }

  function playMenuAnimation() {
    updateMenuText();

    if (!menuOpenAnim) {
      $('.navbar_menu-btn').addClass('open');
      navReveal.timeScale(1).play();
    } else {
      $('.navbar_menu-btn').removeClass('open');
      navReveal.timeScale(1.5).reverse();
      disableScroll();
    }
  }

  function updateMenuText() {
    menuText = menuOpenAnim ? 'Menu' : 'Close';
  }

  // Menu Dropdown Animation
  const dropdowns = $('.navbar_dropdown');
  const dropdownInner = $('.navbar_dropdown-inner');
  const dropdownLinks = $('.navbar_dropdown-link-list');
  const movingDiv = $('.navbar_dropdown-bg');
  let lastIndex;
  let divIsActive;
  let leaeveDropdown;
  let duration = 0.5;

  const setInitialStyles = (element, rect, centerX) => {
    movingDiv.fadeIn();
    divIsActive = true;
    gsap.set(movingDiv, {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  };

  const hideMovingDiv = () => {
    const tl = gsap.timeline({ defaults: { ease: Circ.easeOut } });
    tl.to(movingDiv, { duration: duration, autoAlpha: 0 });
    divIsActive = false;
    return tl;
  };

  const animateMovingDiv = (element, rect, duration, direction) => {
    let subLinks = $(element).find(dropdownLinks);
    let subMain = $(element).find('.navbar_dropdown-main');
    console.log(subMain);
    const tl = gsap.timeline({ defaults: { ease: 'circ.out' } });
    tl.to(movingDiv, {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      autoAlpha: divIsActive ? 1 : 0,
      duration: duration,
      delay: 0.2,
    });
    tl.to($(element).find(dropdownInner), { opacity: 1, duration: 0.2 }, '<0.05');
    tl.add(animateLinks(subLinks.add(subMain), direction), '<');
    return tl;
  };

  const animateLinks = (links, direction, duration) => {
    const xPercent = direction === 'left' ? -5 : 5;
    const tl = gsap.timeline({ defaults: { ease: 'circ.out' } });
    return tl.fromTo(links, { xPercent: xPercent }, { xPercent: 0, duration: 0.4 });
  };

  const moveDiv = (element) => {
    gsap.killTweensOf(movingDiv);

    let submenu = $(element).find(dropdownInner)[0];
    let rect = submenu.getBoundingClientRect();
    let rectX = element.getBoundingClientRect();
    let centerX = rectX.width / 2;
    let direction;

    if (!divIsActive) {
      setInitialStyles(element, rect, centerX);
    }

    if (lastIndex < $(element).index()) {
      direction = 'right';
    } else if (lastIndex > $(element).index()) {
      direction = 'left';
    }

    const movingDivTimeline = animateMovingDiv(element, rect, duration, direction);

    lastIndex = $(element).index();
  };

  // Events
  var dropdownTimeout;

  dropdowns.on('mouseenter', function () {
    if ($(window).width() > 991) {
      clearTimeout(dropdownTimeout); // Clear any existing timeout
      moveDiv(this);
    }
  });

  dropdowns.on('mouseleave', function () {
    if ($(window).width() > 991) {
      gsap.killTweensOf(movingDiv);
      gsap.to($(this).find(dropdownInner), { opacity: 0 });
      dropdownTimeout = setTimeout(function () {
        hideMovingDiv();
      }, 50);
    }
  });

  if ($('.tabs.max-tab').length) {
    const activeClass = 'tab-active';
    const progressLine = '.tabs_block-progress-line';
    const duration = 4000;

    // Animates a card, by typing the text and filename.
    function cardAnimation(card) {
      return new Promise((resolve) => {
        card.addClass('active');
        resolve();
      });
    }
    // TABS 2
    tabCarousel({
      tabs: $('.tabs.max-tab .tabs_block-link-menu .tabs_block-link'),
      cards: $('.tabs.max-tab .max-products .max-products_grid-cell'),
      onCardLeave: (card) => {
        card.removeClass('active');
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
      sliderSelector: '.tabs_slider.max-tab',
      // On init and when the swiper slides, we animate the progressbar and code
      // block, but only animate the code the first time it's shown.
      animateOnSlide(activeSlide) {
        // Set progressLine to 0 and then start an animation for it.

        activeSlide
          .find(progressLine)
          .stop(true, true)
          .css('width', '0')
          .animate({ width: '100%' }, duration);

        let cards = $('.tabs_slider.max-tab .max-products .max-products_grid-cell');

        cards.removeClass('active');
        cards.eq(activeSlide.index()).addClass('active');
      },
      duration,
    });
  }
});
