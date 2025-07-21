// Career Listing
// if location host is modular-dev.webflow.io, add class .webflow-page-type-career-post to body
if (window.location.host === 'modular-dev.webflow.io') {
  var greenhouse = 'modtestingsite';
} else {
  greenhouse = 'modularai';
}

var hostName = window.location.hostname;

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
      `https://${hostName}/company/career-post?${jobId}&gh_jid=${jobId}`
    );
    jobListItem.setAttribute('data-job-id', jobId);
    jobListItem.innerHTML = `<h4 class="greenhouse-job-position-link-title">${jobTitle}</h4><div class="greenhouse-job-position-link-location">${jobLocation}</div><div class="greenhouse-job-position-link-divider"></div>`;
    document.querySelector('.greenhouse-tabs-content').appendChild(jobListItem);
  }
}

if (document.querySelector('.greenhouse-tabs-layout')) {
  async function fetchData() {
    const jobsResponse = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${greenhouse}/jobs`
    );
    const jobsData = await jobsResponse.json();

    function appendAllJobs(jobs) {
      const tabsMenu = document.querySelector('.greenhouse-tabs-menu');
      tabsMenu.innerHTML = '';

      const departmentListItem = document.createElement('a');
      departmentListItem.classList.add('greenhouse-tab-link');
      departmentListItem.href = '#';
      departmentListItem.innerHTML = `
          <h3 class="greenhouse-tab-link-title">All</h3>
          <div class="greenhouse-tab-counter">(${jobs.length})</div>`;

      departmentListItem.addEventListener('click', (e) => {
        const currentTab = document.querySelector('.cc-current');
        if (currentTab) currentTab.classList.remove('cc-current');
        e.target.classList.add('cc-current');

        appendJobsForDepartment(jobs);
      });

      tabsMenu.appendChild(departmentListItem);
    }
    appendAllJobs(jobsData.jobs);

    const departmentsResponse = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${greenhouse}/departments`
    );
    const departmentsData = await departmentsResponse.json();

    var jobPositions = departmentsData;

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

    function appendDepartmentsWithJobs(departmentsWithJobs) {
      const tabsMenu = document.querySelector('.greenhouse-tabs-menu');

      departmentsWithJobs.forEach((department) => {
        const { id: departmentId, name: departmentName, jobs } = department;
        const departmentListItem = document.createElement('a');

        departmentListItem.classList.add('greenhouse-tab-link');
        departmentListItem.dataset.departmentName = departmentName;
        departmentListItem.dataset.departmentId = departmentId;
        departmentListItem.href = '#';
        departmentListItem.innerHTML = `
                  <h3 class="greenhouse-tab-link-title">${departmentName}</h3>
                  <div class="greenhouse-tab-counter">(${jobs.length})</div>
              `;

        departmentListItem.addEventListener('click', (e) => {
          const currentTab = document.querySelector('.cc-current');
          if (currentTab) currentTab.classList.remove('cc-current');
          e.target.classList.add('cc-current');

          // Update the URL with the department name
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('department', departmentName);
          window.history.pushState({}, '', currentUrl);

          const jobsForDepartment = getJobsForDepartment(jobPositions, departmentId);
          appendJobsForDepartment(jobsForDepartment);
        });

        tabsMenu.appendChild(departmentListItem);
      });
    }

    appendDepartmentsWithJobs(departmentsWithJobs);

    // Select department based on query parameter or default to first tab
    selectDepartmentFromQuery();
  }

  fetchData();
}

function selectDepartmentFromQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  const departmentParam = decodeURIComponent(urlParams.get('department'));

  if (departmentParam) {
    const tab = document.querySelector(`[data-department-name="${departmentParam}"]`);
    if (tab) {
      tab.click();
      return;
    }
  }

  // Default to first tab if no matching department found or no parameter provided
  document.querySelector('.greenhouse-tabs-menu').firstElementChild.click();
}

// Career Detail
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

  function getRandomNumber() {
    return Math.floor(Math.random() * 7) + 1;
  }

  var randomImage = getRandomNumber(7);

  // array of 7 items
  let images = [
    'https://uploads-ssl.webflow.com/63f9f100025c058594957cca/664e0a4c3fb8390c982f26ed_careers_1.jpg',
    'https://uploads-ssl.webflow.com/63f9f100025c058594957cca/664e0a4c2a0972c00c89b518_careers_2.jpg',
    'https://uploads-ssl.webflow.com/63f9f100025c058594957cca/664e0a4d866f802f73558a82_careers_3.jpg',
    'https://uploads-ssl.webflow.com/63f9f100025c058594957cca/664e0a4d68cb5b9855976a3e_careers_4.jpg',
    'https://uploads-ssl.webflow.com/63f9f100025c058594957cca/664e0a4cef8736f278b329bd_careers_5.jpg',
    'https://uploads-ssl.webflow.com/63f9f100025c058594957cca/664e0a4d99662e786edecf7a_careers_6.jpg',
    'https://uploads-ssl.webflow.com/63f9f100025c058594957cca/664e0a4c58f7db9766875803_careers_7.jpg',
  ];

  document.getElementById('job-image').src = images[randomImage - 1];
}

// Swiper
const swiper = new Swiper('.careers-testimonial_list', {
  // Optional parameters
  slidesPerView: 'auto',
  spaceBetween: 20,
  // Navigation arrows
  navigation: {
    nextEl: '.swiper-arrow.next',
    prevEl: '.swiper-arrow.prev',
  },
});
