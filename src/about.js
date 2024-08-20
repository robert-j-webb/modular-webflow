const swiper = new Swiper('.about-team_slider', {
  // Optional parameters
  slidesPerView: 'auto',
  spaceBetween: 20,
  // Navigation arrows
  navigation: {
    nextEl: '.swiper-arrow.next',
    prevEl: '.swiper-arrow.prev',
  },
});

const swiperModal = new Swiper('.about-team_modal-slider .max-width-full', {
  // Optional parameters
  slidesPerView: 1,
  noSwiping: false,
  navigation: {
    prevEl: '.about-team-modal-arrow.prev',
    nextEl: '.about-team-modal-arrow.next',
  },
  breakpoints: {
    0: {
      direction: 'horizontal',
      spaceBetween: 8,
      autoHeight: true,
    },
    992: {
      direction: 'vertical',
      spaceBetween: 20,
      autoHeight: false,
    },
  },
});

$('.about-team_card').on('click', function () {
  revealModal($(this).closest('.w-dyn-item').index());
});

$('.blog-detail_hero-list-item')
  .not('[fs-cmsstatic-element]')
  .on('click', function () {
    revealModal($(this).closest('.w-dyn-item').index());
  });

$('[data-modal="hide"]').on('click', hideModal);

function revealModal(index) {
  swiperModal.slideTo(index);
  $('.about-team_modal').fadeIn();
  $('html, body').addClass('overflow-hidden');
}

function hideModal() {
  $('.about-team_modal').fadeOut();
  $('html, body').removeClass('overflow-hidden');
}
