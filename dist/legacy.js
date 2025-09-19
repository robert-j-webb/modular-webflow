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
  if (window.location.pathname === "/company/career-post") {
    if (window.location.host === "modular-dev.webflow.io") {
      greenhouse = "modtestingsite";
    } else {
      greenhouse = "modularai";
    }
    document.querySelector('link[rel="canonical"]').href = location.href;
    greenhouseSrc = `https://boards.greenhouse.io/embed/job_board/js?for=${greenhouse}`;
    greenhouseScript = document.createElement("script");
    greenhouseScript.src = greenhouseSrc;
    document.body.appendChild(greenhouseScript);
    jobId = window.location.search.split("=")[1];
    fetch(`https://boards-api.greenhouse.io/v1/boards/${greenhouse}/jobs/${jobId}`).then((response) => response.json()).then((data) => {
      if (data.status === 404) {
        window.location.href = "/company/careers";
        return;
      }
      let job = data;
      let jobTitle = job.title;
      let jobLocation = job.location.name;
      document.getElementById("job-title").innerHTML = jobTitle;
      document.getElementById("job-location").innerHTML = jobLocation;
      document.getElementById("job-breadcrumb").innerHTML = jobTitle;
    });
  }
  var greenhouse;
  var greenhouseSrc;
  var greenhouseScript;
  var jobId;
  if (window.location.pathname.includes("/blog/")) {
    document.querySelectorAll(".blog-content-wrapper").forEach((element) => {
      var pTag = element.querySelector("p");
      if (!pTag) {
        return null;
      }
      var pColor = window.getComputedStyle(pTag).getPropertyValue("color");
      element.querySelectorAll("a").forEach((a) => {
        a.style.color = pColor;
      });
    });
  }
  if (window.location.pathname.includes("/blog")) {
    text = document.querySelector(".heading-2");
    if (text) {
      textColor = window.getComputedStyle(text).getPropertyValue("color");
      document.querySelectorAll(".nested-author_link-block .small-body-text").forEach((element) => {
        element.style.color = textColor;
      });
    }
  }
  var text;
  var textColor;
  document.querySelectorAll(".all-current-category_collection-item").forEach((element) => {
    var link = element.querySelector(".all-blog_heading-link-block").getAttribute("href");
  });
})();
//# sourceMappingURL=legacy.js.map
