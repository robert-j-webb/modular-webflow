import { codeAnimation, letterAnimation, typeText } from '$utils/globalFunctions';

document.documentElement.classList.add('js-enabled');

$(document).ready(function () {
  // Init Reveal
  const intervalId = setInterval(function () {
    if (window.gsap) {
      clearInterval(intervalId); // stop checking for the object
      $('.main-wrapper').delay(300).fadeTo('slow', 1); // run the fadeTo method
    }
  }, 100);

  // Register GSAP
  gsap.registerPlugin(ScrollTrigger);

  // GSAP IMG SET
  $('img').each(function () {
    $(this).removeAttr('loading');
    ScrollTrigger.refresh();
  });

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
  setupLineMaskScrollTriggers();
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

  // Variable Anim
  let revealAnim = {
    y: '100%',
    opacity: 0,
    stagger: {
      each: 0.05,
    },
  };

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
      .from(menuLinksItems, revealAnim, '-=0.2')
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
});
