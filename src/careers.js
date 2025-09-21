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
  document.querySelector('.roles-list_item').innerHTML = '';
  for (let i = 0; i < jobsForDepartment.length; i++) {
    let job = jobsForDepartment[i];
    let jobTitle = job.title;
    let jobId = job.id;
    let jobLocation = job.location.name;
    let jobListItem = document.createElement('a');
    jobListItem.classList.add('roles-list_link');
    jobListItem.setAttribute(
      'href',
      `https://${hostName}/company/career-post?${jobId}&gh_jid=${jobId}`
    );
    jobListItem.setAttribute('data-job-id', jobId);
    jobListItem.innerHTML = `<div><div class="margin-bottom margin-4"><p class="text-size-small-2 text-weight-medium text-style-tthoves">${jobTitle}</p></div><div class="text-color-twilight60-3"><p class="text-size-xsmall-7">${jobLocation}</p></div></div> <div class="text-color-twilight60-3"><div><p class="text-size-xsmall-7">Apply now</p></div></div>`;

    document.querySelector('.roles-list_item').appendChild(jobListItem);
  }
}

if (document.querySelector('.roles_wrap')) {
  async function fetchData() {
    const jobsResponse = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${greenhouse}/jobs`
    );
    const jobsData = await jobsResponse.json();

    function appendAllJobs(jobs) {
      const tabsMenu = document.querySelector('.roles_wrap .roles-filters');
      tabsMenu.innerHTML = '';

      const departmentListItem = document.createElement('a');
      departmentListItem.classList.add('tabs-item-2');
      departmentListItem.href = '#';
      departmentListItem.innerHTML = `
            <div>All</div>
            <div>(${jobs.length})</div>`;

      $(departmentListItem).on('click', function (e) {
        $('.cc-current').removeClass('cc-current');
        $(this).addClass('cc-current');

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
      const tabsMenu = document.querySelector('.roles_wrap .roles-filters');

      departmentsWithJobs.forEach((department) => {
        const { id: departmentId, name: departmentName, jobs } = department;
        const departmentListItem = document.createElement('a');

        departmentListItem.classList.add('tabs-item-2');
        departmentListItem.dataset.departmentId = departmentId;
        departmentListItem.href = '#';
        departmentListItem.innerHTML = `
                    <div">${departmentName}</div>
                    <div">(${jobs.length})</div>
                `;

        departmentListItem.addEventListener('click', (e) => {
          const currentTab = document.querySelector('.cc-current');
          if (currentTab) currentTab.classList.remove('cc-current');

          const targetLink = e.currentTarget.closest('a') || e.currentTarget.querySelector('a');
          if (targetLink) targetLink.classList.add('cc-current');

          const jobsForDepartment = getJobsForDepartment(jobPositions, departmentId);
          appendJobsForDepartment(jobsForDepartment);
        });

        tabsMenu.appendChild(departmentListItem);
      });
    }

    appendDepartmentsWithJobs(departmentsWithJobs);

    document.querySelector('.roles-filters').firstElementChild.click();
  }

  fetchData();
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
