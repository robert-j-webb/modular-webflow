// Wraps lines of text in a span

if (document.querySelector('.g-text-stagger-animation')) {
  $('.g-text-stagger-animation').each(function () {
    var spanInserted = $(this).html().split(' ').join(' </span><span>');
    var wrapped = '<span>'.concat(spanInserted, '</span>');
    $(this).html(wrapped);
  });

  var refPos = $('.g-text-stagger-animation span:first-child').position().top;
  var newPos;
  $('.g-text-stagger-animation span').each(function (index) {
    newPos = $(this).position().top;
    if (index === 0) {
      return;
    }
    if (newPos === refPos) {
      $(this).prepend($(this).prev().text() + ' ');
      $(this).prev().remove();
    }
    refPos = newPos;
  });
  const spans = document.querySelectorAll('.g-text-stagger-animation span');
  [].forEach.call(spans, (e) => {
    e.style.display = 'block';
  });
}

// Runs fade up animation when text scrolls into view

var observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var element = entry.target;
        // Fade Up Animation
        var fadeUp = anime.timeline({
          loop: false,
          autoplay: false,
        });

        fadeUp.add({
          targets: element.childNodes,
          translateY: [50, 0],
          translateZ: 0,
          opacity: [0, 1],
          easing: 'easeOutExpo',
          duration: 1400,
          delay: (el, i) => 300 + 200 * i,
        });

        fadeUp.play();
        observer.unobserve(element);
      }
    });
  },
  {
    threshold: 0.5,
  }
);

if (document.querySelector('.g-text-stagger-animation')) {
  [].forEach.call(document.querySelectorAll('.g-text-stagger-animation'), function (e) {
    observer.observe(e);
  });
}

if (document.querySelector('.blog-carousel_collection-list')) {
  [].forEach.call(document.querySelectorAll('.blog-carousel_collection-list'), function (e) {
    observer.observe(e);
  });
}

// get distance of element to right edge of screen

if (document.getElementById('blog-posts-container')) {
  function setCarouselPadding() {
    var scrollPadding = document
      .getElementById('blog-posts-container')
      .getBoundingClientRect().left;
    var scrollContainer = document.querySelector('.blog-carousel_collection-list');

    var padding;

    // set padding to 24px if viewport is less than 768px, otherwise set to 64px
    if (window.innerWidth < 768) {
      padding = 24;
    } else {
      padding = 64;
    }

    scrollContainer.style.paddingLeft = scrollPadding + 'px';
    scrollContainer.style.paddingRight = scrollPadding + 'px';
    scrollContainer.style['scroll-padding-left'] = scrollPadding + 'px';
    scrollContainer.style['scroll-padding-right'] = scrollPadding + 'px';
  }

  setCarouselPadding();

  // call setCarouselPadding() when window is resized
  window.addEventListener('resize', setCarouselPadding);

  var gallery_scroller = document.querySelector('.blog-carousel_collection-list');
  var gallery_item_size = gallery_scroller.querySelector('div').clientWidth;

  document.getElementById('blog-carousel-next-arrow').addEventListener('click', scrollToNextPage);
  document.getElementById('blog-carousel-prev-arrow').addEventListener('click', scrollToPrevPage);

  function scrollToNextPage() {
    gallery_scroller.scrollBy({
      top: 0,
      left: gallery_item_size,
      behavior: 'smooth',
    });
  }
  function scrollToPrevPage() {
    gallery_scroller.scrollBy({
      top: 0,
      left: -gallery_item_size,
      behavior: 'smooth',
    });
  }
}

// if element with class .quotes_collection-list-wrapper exists
if (document.querySelector('.quotes_collection-list-wrapper')) {
  // Quotes carousel

  var gallery_scroller = document.querySelector('.quotes_collection-list');
  var gallery_item_size = gallery_scroller.querySelector('div').clientWidth;

  document.getElementById('carousel-next-arrow').addEventListener('click', scrollToNextPage);
  document.getElementById('carousel-prev-arrow').addEventListener('click', scrollToPrevPage);

  function scrollToNextPage() {
    gallery_scroller.scrollBy({
      top: 0,
      left: gallery_item_size,
      behavior: 'smooth',
    });
  }
  function scrollToPrevPage() {
    gallery_scroller.scrollBy({
      top: 0,
      left: -gallery_item_size,
      behavior: 'smooth',
    });
  }

  function hideShowArrows() {
    if (
      document.querySelector('.quotes_collection-list').firstElementChild.getBoundingClientRect()
        .left === 0
    ) {
      document.getElementById('carousel-prev-arrow').style.display = 'none';
    } else {
      document.getElementById('carousel-prev-arrow').style.display = 'flex';
    }

    if (
      document.querySelector('.quotes_collection-list').lastElementChild.getBoundingClientRect()
        .left === 0
    ) {
      document.getElementById('carousel-next-arrow').style.display = 'none';
    } else {
      document.getElementById('carousel-next-arrow').style.display = 'flex';
    }
  }

  gallery_scroller.addEventListener('scroll', hideShowArrows);

  hideShowArrows();
}

// if current url is /career-post get job id from url and fetch data from API and display it in the page
if (window.location.pathname === '/company/career-post') {
  if (window.location.host === 'modular-dev.webflow.io') {
    var greenhouse = 'modtestingsite';
  } else {
    greenhouse = 'modularai';
  }

  var greenhouseSrc = `https://boards.greenhouse.io/embed/job_board/js?for=${greenhouse}`;
  var greenhouseScript = document.createElement('script');
  greenhouseScript.src = greenhouseSrc;
  document.body.appendChild(greenhouseScript);

  var jobId = window.location.search.split('=')[1];
  fetch(`https://boards-api.greenhouse.io/v1/boards/${greenhouse}/jobs/${jobId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 404) {
        window.location.href = '/company/careers';
        return;
      }
      let job = data;
      let jobTitle = job.title;
      let jobLocation = job.location.name;
      document.getElementById('job-title').innerHTML = jobTitle;
      document.getElementById('job-location').innerHTML = jobLocation;
      document.getElementById('job-breadcrumb').innerHTML = jobTitle;
    });
}

// Make color of nested collections text the same as other text in the section

// if url contains /blog/ get value of color of p inside all elements with class .blog-content-wrapper
if (window.location.pathname.includes('/blog/')) {
  document.querySelectorAll('.blog-content-wrapper').forEach((element) => {
    var pTag = element.querySelector('p');
    if (!pTag) {
      return null;
    }
    // get color value of pTag
    var pColor = window.getComputedStyle(pTag).getPropertyValue('color');

    // for all a tags inside element change color to p color
    element.querySelectorAll('a').forEach((a) => {
      a.style.color = pColor;
    });
  });
}

// if url contains /blog get value of color of .grid-wapper h2
if (window.location.pathname.includes('/blog')) {
  var text = document.querySelector('.heading-2');
  if (text) {
    var textColor = window.getComputedStyle(text).getPropertyValue('color');
    //for each .nested-author_link-block .small-body-text change color to textColor
    document.querySelectorAll('.nested-author_link-block .small-body-text').forEach((element) => {
      element.style.color = textColor;
    });
  }
}

// for each element with class .all-current-category_collection-item get the href value of .all-blog_heading-link-block inside of it
// and set the href value of .all-current-category_collection-item to that value
document.querySelectorAll('.all-current-category_collection-item').forEach((element) => {
  var link = element.querySelector('.all-blog_heading-link-block').getAttribute('href');
});
