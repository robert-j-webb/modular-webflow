"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/legacy.js
  if (document.querySelector(".g-text-stagger-animation")) {
    $(".g-text-stagger-animation").each(function() {
      var spanInserted = $(this).html().split(" ").join(" </span><span>");
      var wrapped = "<span>".concat(spanInserted, "</span>");
      $(this).html(wrapped);
    });
    refPos = $(".g-text-stagger-animation span:first-child").position().top;
    $(".g-text-stagger-animation span").each(function(index) {
      newPos = $(this).position().top;
      if (index === 0) {
        return;
      }
      if (newPos === refPos) {
        $(this).prepend($(this).prev().text() + " ");
        $(this).prev().remove();
      }
      refPos = newPos;
    });
    const spans = document.querySelectorAll(".g-text-stagger-animation span");
    [].forEach.call(spans, (e) => {
      e.style.display = "block";
    });
  }
  var refPos;
  var newPos;
  var observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var element = entry.target;
          var fadeUp = anime.timeline({
            loop: false,
            autoplay: false
          });
          fadeUp.add({
            targets: element.childNodes,
            translateY: [50, 0],
            translateZ: 0,
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 1400,
            delay: (el, i) => 300 + 200 * i
          });
          fadeUp.play();
          observer.unobserve(element);
        }
      });
    },
    {
      threshold: 0.5
    }
  );
  if (document.querySelector(".g-text-stagger-animation")) {
    [].forEach.call(document.querySelectorAll(".g-text-stagger-animation"), function(e) {
      observer.observe(e);
    });
  }
  if (document.querySelector(".blog-carousel_collection-list")) {
    [].forEach.call(document.querySelectorAll(".blog-carousel_collection-list"), function(e) {
      observer.observe(e);
    });
  }
  if (document.getElementById("blog-posts-container")) {
    let setCarouselPadding = function() {
      var scrollPadding = document.getElementById("blog-posts-container").getBoundingClientRect().left;
      var scrollContainer = document.querySelector(".blog-carousel_collection-list");
      var padding;
      if (window.innerWidth < 768) {
        padding = 24;
      } else {
        padding = 64;
      }
      console.log(scrollPadding);
      console.log(padding);
      scrollContainer.style.paddingLeft = scrollPadding + "px";
      scrollContainer.style.paddingRight = scrollPadding + "px";
      scrollContainer.style["scroll-padding-left"] = scrollPadding + "px";
      scrollContainer.style["scroll-padding-right"] = scrollPadding + "px";
    }, scrollToNextPage = function() {
      gallery_scroller.scrollBy({
        top: 0,
        left: gallery_item_size,
        behavior: "smooth"
      });
    }, scrollToPrevPage = function() {
      gallery_scroller.scrollBy({
        top: 0,
        left: -gallery_item_size,
        behavior: "smooth"
      });
    };
    setCarouselPadding2 = setCarouselPadding, scrollToNextPage2 = scrollToNextPage, scrollToPrevPage2 = scrollToPrevPage;
    setCarouselPadding();
    window.addEventListener("resize", setCarouselPadding);
    gallery_scroller = document.querySelector(".blog-carousel_collection-list");
    gallery_item_size = gallery_scroller.querySelector("div").clientWidth;
    document.getElementById("blog-carousel-next-arrow").addEventListener("click", scrollToNextPage);
    document.getElementById("blog-carousel-prev-arrow").addEventListener("click", scrollToPrevPage);
  }
  var gallery_scroller;
  var gallery_item_size;
  var setCarouselPadding2;
  var scrollToNextPage2;
  var scrollToPrevPage2;
  if (document.querySelector(".quotes_collection-list-wrapper")) {
    let scrollToNextPage = function() {
      gallery_scroller.scrollBy({
        top: 0,
        left: gallery_item_size,
        behavior: "smooth"
      });
    }, scrollToPrevPage = function() {
      gallery_scroller.scrollBy({
        top: 0,
        left: -gallery_item_size,
        behavior: "smooth"
      });
    }, hideShowArrows = function() {
      if (document.querySelector(".quotes_collection-list").firstElementChild.getBoundingClientRect().left === 0) {
        document.getElementById("carousel-prev-arrow").style.display = "none";
      } else {
        document.getElementById("carousel-prev-arrow").style.display = "flex";
      }
      if (document.querySelector(".quotes_collection-list").lastElementChild.getBoundingClientRect().left === 0) {
        document.getElementById("carousel-next-arrow").style.display = "none";
      } else {
        document.getElementById("carousel-next-arrow").style.display = "flex";
      }
    };
    scrollToNextPage2 = scrollToNextPage, scrollToPrevPage2 = scrollToPrevPage, hideShowArrows2 = hideShowArrows;
    gallery_scroller = document.querySelector(".quotes_collection-list");
    gallery_item_size = gallery_scroller.querySelector("div").clientWidth;
    document.getElementById("carousel-next-arrow").addEventListener("click", scrollToNextPage);
    document.getElementById("carousel-prev-arrow").addEventListener("click", scrollToPrevPage);
    gallery_scroller.addEventListener("scroll", hideShowArrows);
    hideShowArrows();
  }
  var gallery_scroller;
  var gallery_item_size;
  var scrollToNextPage2;
  var scrollToPrevPage2;
  var hideShowArrows2;
  if (window.location.host === "modular-dev.webflow.io") {
    greenhouse = "modtestingsite";
  } else {
    greenhouse = "modularai";
  }
  var greenhouse;
  var hostName = window.location.hostname;
  if (document.querySelector(".greenhouse-tabs-layout")) {
    fetch(`https://boards-api.greenhouse.io/v1/boards/${greenhouse}/departments`).then((response) => response.json()).then((data) => {
      var jobPositions = data;
      function findDepartmentsWithJobs(jobPositions2) {
        let departmentsWithJobs2 = [];
        for (let i = 0; i < jobPositions2.departments.length; i++) {
          if (jobPositions2.departments[i].jobs.length > 0) {
            departmentsWithJobs2.push(jobPositions2.departments[i]);
          }
        }
        return departmentsWithJobs2;
      }
      var departmentsWithJobs = findDepartmentsWithJobs(jobPositions);
      function appendDepartmentsWithJobs(departmentsWithJobs2) {
        let tabNumber = 1;
        for (let i = 0; i < departmentsWithJobs2.length; i++) {
          let department = departmentsWithJobs2[i];
          let departmentName = department.name;
          let departmentId = department.id;
          let departmentListItem = document.createElement("a");
          departmentListItem.classList.add("greenhouse-tab-link");
          departmentListItem.setAttribute("data-department-id", departmentId);
          departmentListItem.setAttribute("href", "#");
          departmentListItem.addEventListener("click", (e) => {
            if (document.querySelector(".cc-current")) {
              let oldTab = document.querySelector(".cc-current");
              oldTab.classList.remove("cc-current");
            }
            var currentTab = e.target;
            currentTab.classList.add("cc-current");
            function getJobsForDepartment(jobPositions2, departmentId2) {
              let jobsForDepartment2 = [];
              for (let i2 = 0; i2 < jobPositions2.departments.length; i2++) {
                if (jobPositions2.departments[i2].id === departmentId2) {
                  jobsForDepartment2 = jobPositions2.departments[i2].jobs;
                }
              }
              return jobsForDepartment2;
            }
            var jobsForDepartment = getJobsForDepartment(jobPositions, departmentId);
            function appendJobsForDepartment(jobsForDepartment2) {
              document.querySelector(".greenhouse-tabs-content").innerHTML = "";
              for (let i2 = 0; i2 < jobsForDepartment2.length; i2++) {
                let job = jobsForDepartment2[i2];
                let jobTitle = job.title;
                let jobId = job.id;
                let jobLocation = job.location.name;
                let jobListItem = document.createElement("a");
                jobListItem.classList.add("greenhouse-job-position-link");
                jobListItem.setAttribute(
                  "href",
                  `https://${hostName}/career-post?${jobId}&gh_jid=${jobId}`
                );
                jobListItem.setAttribute("data-job-id", jobId);
                jobListItem.innerHTML = `<h4 class="greenhouse-job-position-link-title">${jobTitle}</h4><div class="greenhouse-job-position-link-location">${jobLocation}</div><div class="greenhouse-job-position-link-divider"></div>`;
                document.querySelector(".greenhouse-tabs-content").appendChild(jobListItem);
              }
            }
            appendJobsForDepartment(jobsForDepartment);
          });
          departmentListItem.innerHTML = `<div class="greenhouse-tabs-number">${tabNumber}</div><h3 class="greenhouse-tab-link-title">${departmentName}</h3>`;
          document.querySelector(".greenhouse-tabs-menu").appendChild(departmentListItem);
          tabNumber++;
        }
      }
      appendDepartmentsWithJobs(departmentsWithJobs);
      document.querySelector(".greenhouse-tabs-menu").firstElementChild.click();
    });
  }
  if (window.location.pathname === "/career-post") {
    let getRandomNumber = function() {
      return Math.floor(Math.random() * 6) + 1;
    };
    getRandomNumber2 = getRandomNumber;
    if (window.location.host === "modular-dev.webflow.io") {
      greenhouse = "modtestingsite";
    } else {
      greenhouse = "modularai";
    }
    greenhouseSrc = `https://boards.greenhouse.io/embed/job_board/js?for=${greenhouse}`;
    greenhouseScript = document.createElement("script");
    greenhouseScript.src = greenhouseSrc;
    document.body.appendChild(greenhouseScript);
    jobId = window.location.search.split("=")[1];
    fetch(`https://boards-api.greenhouse.io/v1/boards/${greenhouse}/jobs/${jobId}`).then((response) => response.json()).then((data) => {
      let job = data;
      let jobTitle = job.title;
      let jobLocation = job.location.name;
      document.getElementById("job-title").innerHTML = jobTitle;
      document.getElementById("job-location").innerHTML = jobLocation;
      document.getElementById("job-breadcrumb").innerHTML = jobTitle;
    });
    randomImage = getRandomNumber(6);
    let images = [
      "https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c5d9967c0a74ca7429_career-post-02.jpg",
      "https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c5e91ab786257fe203_career-post-01.jpg",
      "https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c5bbb025deabbdb1fd_career-post-03.jpg",
      "https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c52a77f6a73ed4f81a_career-post-06.jpg",
      "https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c6fb5c4c90a145b452_career-post-05.jpg",
      "https://uploads-ssl.webflow.com/629e315172c95f056b723934/62b936c64d12064c743d9cf3_career-post-07.jpg"
    ];
    document.getElementById("job-image").src = images[randomImage - 1];
  }
  var greenhouse;
  var greenhouseSrc;
  var greenhouseScript;
  var jobId;
  var randomImage;
  var getRandomNumber2;
  if (window.location.pathname === "/team") {
    document.querySelectorAll(".team-overlay_close-link-wrapper").forEach((element) => {
      element.addEventListener("click", (e) => {
        document.body.style.overflow = "unset";
      });
    });
    document.querySelectorAll(".team_link-block").forEach((element) => {
      element.addEventListener("click", (e) => {
        document.body.style.overflow = "hidden";
      });
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.keyCode === 27) {
      document.querySelectorAll(".team-overlay_close-link-wrapper").forEach((element) => {
        element.click();
      });
      document.body.style.overflow = "unset";
    }
  });
  if (window.location.pathname.includes("/blog/")) {
    document.querySelectorAll(".blog-content-wrapper").forEach((element) => {
      var pTag = element.querySelector("p");
      var pColor = window.getComputedStyle(pTag).getPropertyValue("color");
      element.querySelectorAll("a").forEach((a) => {
        a.style.color = pColor;
      });
    });
  }
  if (window.location.pathname === "/" && window.innerWidth > 991) {
    viewportHeight = window.innerHeight;
    section4Height = document.querySelector(".section-4-home").offsetHeight;
    if (viewportHeight < section4Height) {
      stickyValue = viewportHeight - section4Height;
      document.querySelector(".section-4-home").style.top = stickyValue + "px";
    }
  }
  var viewportHeight;
  var section4Height;
  var stickyValue;
  if (window.location.pathname.includes("/blog")) {
    text = document.querySelector(".heading-2");
    textColor = window.getComputedStyle(text).getPropertyValue("color");
    document.querySelectorAll(".nested-author_link-block .small-body-text").forEach((element) => {
      element.style.color = textColor;
    });
  }
  var text;
  var textColor;
  if (window.location.pathname.includes("/about")) {
    let setCarouselPadding = function() {
      var scrollPadding = document.getElementById("case-studies-title-container").getBoundingClientRect().left;
      var scrollContainer = document.querySelector(".case-studies-carousel_collection-list");
      var padding;
      if (window.innerWidth < 768) {
        padding = 24;
      } else {
        padding = 64;
      }
      scrollContainer.style["scroll-padding-left"] = scrollPadding + padding + "px";
      scrollContainer.style["scroll-padding-right"] = scrollPadding + padding + "px";
      scrollContainer.firstChild.style.paddingLeft = scrollPadding + padding + "px";
      scrollContainer.lastChild.style.paddingRight = scrollPadding + padding + "px";
    }, scrollToNextPage = function() {
      gallery_scroller.scrollBy({
        top: 0,
        left: gallery_item_size,
        behavior: "smooth"
      });
    }, scrollToPrevPage = function() {
      gallery_scroller.scrollBy({
        top: 0,
        left: -gallery_item_size,
        behavior: "smooth"
      });
    }, hideShowArrows = function() {
      var galleryScrollerOffsetLeft = Math.round(
        gallery_scroller.firstElementChild.getBoundingClientRect().left
      );
      var galleryScrollerOffsetRight = Math.round(
        gallery_scroller.lastElementChild.getBoundingClientRect().right
      );
      galleryScrollerOffsetRight = Math.round(
        gallery_scroller.lastElementChild.getBoundingClientRect().right
      );
      var galleryScrollerPaddingLeft = window.getComputedStyle(gallery_scroller).getPropertyValue("padding-left");
      var galleryScrollerPaddingRight = window.getComputedStyle(gallery_scroller).getPropertyValue("padding-right");
      galleryScrollerPaddingLeft = galleryScrollerPaddingLeft.slice(0, -2);
      galleryScrollerPaddingRight = galleryScrollerPaddingRight.slice(0, -2);
      galleryScrollerPaddingLeft = parseInt(galleryScrollerPaddingLeft);
      galleryScrollerPaddingRight = parseInt(galleryScrollerPaddingRight);
      var viewportWidth = window.innerWidth;
      if (galleryScrollerOffsetLeft === galleryScrollerPaddingLeft) {
        document.getElementById("case-studies-carousel-prev-arrow").style.display = "none";
      } else {
        document.getElementById("case-studies-carousel-prev-arrow").style.display = "flex";
      }
      if (galleryScrollerOffsetRight >= viewportWidth - galleryScrollerPaddingRight - 2 && galleryScrollerOffsetRight <= viewportWidth - galleryScrollerPaddingRight + 2) {
        document.getElementById("case-studies-carousel-next-arrow").style.display = "none";
      } else {
        document.getElementById("case-studies-carousel-next-arrow").style.display = "flex";
      }
    };
    setCarouselPadding2 = setCarouselPadding, scrollToNextPage2 = scrollToNextPage, scrollToPrevPage2 = scrollToPrevPage, hideShowArrows2 = hideShowArrows;
    setCarouselPadding();
    window.addEventListener("resize", setCarouselPadding);
    gallery_scroller = document.querySelector(".case-studies-carousel_collection-list");
    gallery_item_size = gallery_scroller.querySelector("a").clientWidth;
    document.getElementById("case-studies-carousel-next-arrow").addEventListener("click", scrollToNextPage);
    document.getElementById("case-studies-carousel-prev-arrow").addEventListener("click", scrollToPrevPage);
    gallery_scroller.addEventListener("scroll", hideShowArrows);
    hideShowArrows();
  }
  var setCarouselPadding2;
  var scrollToNextPage2;
  var scrollToPrevPage2;
  var hideShowArrows2;
  document.querySelectorAll(".all-current-category_collection-item").forEach((element) => {
    var link = element.querySelector(".all-blog_heading-link-block").getAttribute("href");
  });
})();
//# sourceMappingURL=legacy.js.map
