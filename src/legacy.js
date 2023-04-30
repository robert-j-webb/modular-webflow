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

    console.log(scrollPadding);
    console.log(padding);

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

// if location host is modular-dev.webflow.io, add class .webflow-page-type-career-post to body
if (window.location.host === 'modular-dev.webflow.io') {
  var greenhouse = 'modtestingsite';
} else {
  greenhouse = 'modularai';
}

var hostName = window.location.hostname;

// fetch data from API and display it in the page
if (document.querySelector('.greenhouse-tabs-layout')) {
  fetch(`https://boards-api.greenhouse.io/v1/boards/${greenhouse}/departments`)
    .then((response) => response.json())
    .then((data) => {
      var jobPositions = data;
      // find departments with job positions on jobPositions object
      function findDepartmentsWithJobs(jobPositions) {
        let departmentsWithJobs = [];
        for (let i = 0; i < jobPositions.departments.length; i++) {
          if (jobPositions.departments[i].jobs.length > 0) {
            departmentsWithJobs.push(jobPositions.departments[i]);
          }
        }
        return departmentsWithJobs;
      }
      var departmentsWithJobs = findDepartmentsWithJobs(jobPositions);

      // append departments with jobs to the element with class .greenhouse-tabs-menu
      function appendDepartmentsWithJobs(departmentsWithJobs) {
        let tabNumber = 1;
        for (let i = 0; i < departmentsWithJobs.length; i++) {
          let department = departmentsWithJobs[i];
          let departmentName = department.name;
          let departmentId = department.id;
          let departmentListItem = document.createElement('a');
          departmentListItem.classList.add('greenhouse-tab-link');
          departmentListItem.setAttribute('data-department-id', departmentId);
          departmentListItem.setAttribute('href', '#');
          departmentListItem.addEventListener('click', (e) => {
            // if element with class .cc-current exists, remove it
            if (document.querySelector('.cc-current')) {
              let oldTab = document.querySelector('.cc-current');
              oldTab.classList.remove('cc-current');
            }

            var currentTab = e.target;
            currentTab.classList.add('cc-current');

            // get jobs for department with id 4001072005
            function getJobsForDepartment(jobPositions, departmentId) {
              let jobsForDepartment = [];
              for (let i = 0; i < jobPositions.departments.length; i++) {
                if (jobPositions.departments[i].id === departmentId) {
                  jobsForDepartment = jobPositions.departments[i].jobs;
                }
              }
              return jobsForDepartment;
            }

            var jobsForDepartment = getJobsForDepartment(jobPositions, departmentId);

            // for each job in jobsForDepartment append a job to the element with class .greenhouse-tabs-content
            function appendJobsForDepartment(jobsForDepartment) {
              document.querySelector('.greenhouse-tabs-content').innerHTML = '';
              for (let i = 0; i < jobsForDepartment.length; i++) {
                let job = jobsForDepartment[i];
                let jobTitle = job.title;
                let jobId = job.id;
                let jobLocation = job.location.name;
                let jobListItem = document.createElement('a');
                jobListItem.classList.add('greenhouse-job-position-link');
                jobListItem.setAttribute(
                  'href',
                  `https://${hostName}/career-post?${jobId}&gh_jid=${jobId}`
                );
                jobListItem.setAttribute('data-job-id', jobId);
                jobListItem.innerHTML = `<h4 class="greenhouse-job-position-link-title">${jobTitle}</h4><div class="greenhouse-job-position-link-location">${jobLocation}</div><div class="greenhouse-job-position-link-divider"></div>`;
                document.querySelector('.greenhouse-tabs-content').appendChild(jobListItem);
              }
            }
            appendJobsForDepartment(jobsForDepartment);
          });
          departmentListItem.innerHTML = `<div class="greenhouse-tabs-number">${tabNumber}</div><h3 class="greenhouse-tab-link-title">${departmentName}</h3>`;
          document.querySelector('.greenhouse-tabs-menu').appendChild(departmentListItem);
          tabNumber++;
        }
      }

      appendDepartmentsWithJobs(departmentsWithJobs);

      // get first element in .greenhouse-tabs-menu and click it
      document.querySelector('.greenhouse-tabs-menu').firstElementChild.click();
    });
}

// if current url is /career-post get job id from url and fetch data from API and display it in the page
if (window.location.pathname === '/career-post') {
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
      let job = data;
      let jobTitle = job.title;
      let jobLocation = job.location.name;
      document.getElementById('job-title').innerHTML = jobTitle;
      document.getElementById('job-location').innerHTML = jobLocation;
      document.getElementById('job-breadcrumb').innerHTML = jobTitle;
    });

  function getRandomNumber() {
    return Math.floor(Math.random() * 6) + 1;
  }

  var randomImage = getRandomNumber(6);

  // array of 7 items
  let images = [
    'https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c5d9967c0a74ca7429_career-post-02.jpg',
    'https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c5e91ab786257fe203_career-post-01.jpg',
    'https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c5bbb025deabbdb1fd_career-post-03.jpg',
    'https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c52a77f6a73ed4f81a_career-post-06.jpg',
    'https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c6fb5c4c90a145b452_career-post-05.jpg',
    'https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c64d12064c743d9cf3_career-post-07.jpg',
  ];

  document.getElementById('job-image').src = images[randomImage - 1];
}

// if url is /team
if (window.location.pathname === '/team') {
  // add event listener to all elements with class .team-overlay_close-link-wrapper
  document.querySelectorAll('.team-overlay_close-link-wrapper').forEach((element) => {
    element.addEventListener('click', (e) => {
      document.body.style.overflow = 'unset';
    });
  });

  // add event listener to all elements with class .team_link-block
  document.querySelectorAll('.team_link-block').forEach((element) => {
    element.addEventListener('click', (e) => {
      document.body.style.overflow = 'hidden';
    });
  });
}

// if user presses the escape key close the overlay
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 27) {
    // simulate click on all elements with class .team-overlay_close-link-wrapper
    document.querySelectorAll('.team-overlay_close-link-wrapper').forEach((element) => {
      element.click();
    });
    document.body.style.overflow = 'unset';
  }
});

// Make color of nested collections text the same as other text in the section

// if url contains /blog/ get value of color of p inside all elements with class .blog-content-wrapper
if (window.location.pathname.includes('/blog/')) {
  document.querySelectorAll('.blog-content-wrapper').forEach((element) => {
    var pTag = element.querySelector('p');
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
  var textColor = window.getComputedStyle(text).getPropertyValue('color');
  //for each .nested-author_link-block .small-body-text change color to textColor
  document.querySelectorAll('.nested-author_link-block .small-body-text').forEach((element) => {
    element.style.color = textColor;
  });
}

// CUSTOMER STORIES CAROUSEL
// get distance of element to right edge of screen

if (window.location.pathname.includes('/about')) {
  function setCarouselPadding() {
    var scrollPadding = document
      .getElementById('case-studies-title-container')
      .getBoundingClientRect().left;
    var scrollContainer = document.querySelector('.case-studies-carousel_collection-list');

    var padding;

    // set padding to 24px if viewport is less than 768px, otherwise set to 64px
    if (window.innerWidth < 768) {
      padding = 24;
    } else {
      padding = 64;
    }

    scrollContainer.style['scroll-padding-left'] = scrollPadding + padding + 'px';
    scrollContainer.style['scroll-padding-right'] = scrollPadding + padding + 'px';

    scrollContainer.firstChild.style.paddingLeft = scrollPadding + padding + 'px';
    scrollContainer.lastChild.style.paddingRight = scrollPadding + padding + 'px';
  }

  setCarouselPadding();

  // call setCarouselPadding() when window is resized
  window.addEventListener('resize', setCarouselPadding);

  // CUSTOMER STORIES CAROUSEL BUTTONS
  gallery_scroller = document.querySelector('.case-studies-carousel_collection-list');
  gallery_item_size = gallery_scroller.querySelector('a').clientWidth;

  document
    .getElementById('case-studies-carousel-next-arrow')
    .addEventListener('click', scrollToNextPage);
  document
    .getElementById('case-studies-carousel-prev-arrow')
    .addEventListener('click', scrollToPrevPage);

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

  // Hide arrows depending on scroll position

  function hideShowArrows() {
    //get distance of first child of element with class .case-studies-carousel_collection-list to left edge of parent element
    var galleryScrollerOffsetLeft = Math.round(
      gallery_scroller.firstElementChild.getBoundingClientRect().left
    );
    var galleryScrollerOffsetRight = Math.round(
      gallery_scroller.lastElementChild.getBoundingClientRect().right
    );

    // get distance of last child of element with class .case-studies-carousel_collection-list to right edge of parent element
    galleryScrollerOffsetRight = Math.round(
      gallery_scroller.lastElementChild.getBoundingClientRect().right
    );

    // get padding left and right of element with class .case-studies-carousel_collection-list
    var galleryScrollerPaddingLeft = window
      .getComputedStyle(gallery_scroller)
      .getPropertyValue('padding-left');
    var galleryScrollerPaddingRight = window
      .getComputedStyle(gallery_scroller)
      .getPropertyValue('padding-right');
    // delete px from string
    galleryScrollerPaddingLeft = galleryScrollerPaddingLeft.slice(0, -2);
    galleryScrollerPaddingRight = galleryScrollerPaddingRight.slice(0, -2);
    // make string into number
    galleryScrollerPaddingLeft = parseInt(galleryScrollerPaddingLeft);
    galleryScrollerPaddingRight = parseInt(galleryScrollerPaddingRight);

    // get viewport width
    var viewportWidth = window.innerWidth;

    if (galleryScrollerOffsetLeft === galleryScrollerPaddingLeft) {
      document.getElementById('case-studies-carousel-prev-arrow').style.display = 'none';
    } else {
      document.getElementById('case-studies-carousel-prev-arrow').style.display = 'flex';
    }

    if (
      galleryScrollerOffsetRight >= viewportWidth - galleryScrollerPaddingRight - 2 &&
      galleryScrollerOffsetRight <= viewportWidth - galleryScrollerPaddingRight + 2
    ) {
      document.getElementById('case-studies-carousel-next-arrow').style.display = 'none';
    } else {
      document.getElementById('case-studies-carousel-next-arrow').style.display = 'flex';
    }
  }

  // add scroll event listener to element with class .case-studies-carousel_collection-list
  gallery_scroller.addEventListener('scroll', hideShowArrows);

  hideShowArrows();
}

// for each element with class .all-current-category_collection-item get the href value of .all-blog_heading-link-block inside of it
// and set the href value of .all-current-category_collection-item to that value
document.querySelectorAll('.all-current-category_collection-item').forEach((element) => {
  var link = element.querySelector('.all-blog_heading-link-block').getAttribute('href');
});
