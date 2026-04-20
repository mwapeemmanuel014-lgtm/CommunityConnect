const navToggle = document.querySelector('.nav-toggle');
const navBar = document.querySelector('.nav-bar');

if (navToggle && navBar) {
  navToggle.addEventListener('click', () => {
    navBar.classList.toggle('open');
  });
}

function getStoredReports() {
  try {
    const stored = localStorage.getItem('communityReports');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveReports(reports) {
  try {
    localStorage.setItem('communityReports', JSON.stringify(reports));
  } catch (error) {
    console.warn('Unable to save reports', error);
  }
}

function createReportCard(report) {
  const card = document.createElement('article');
  card.className = 'report-card';

  const category = document.createElement('div');
  category.className = 'report-pill';
  category.textContent = report.category;

  const title = document.createElement('h3');
  title.textContent = report.location || 'Unknown location';

  const description = document.createElement('p');
  description.textContent = report.description;

  const meta = document.createElement('div');
  meta.className = 'report-meta';

  const status = document.createElement('span');
  status.className = 'report-pill status-pill';
  status.textContent = report.status || 'Pending';

  const date = document.createElement('span');
  date.className = 'report-pill';
  date.textContent = report.createdAt || 'Recently';

  meta.append(category, status, date);
  card.append(title, description, meta);

  return card;
}

function renderReportsList(filterCategory = 'All') {
  const reportsList = document.getElementById('reportsList');
  const noReports = document.getElementById('noReports');

  if (!reportsList || !noReports) return;

  const reports = getStoredReports();
  const filtered = filterCategory === 'All'
    ? reports
    : reports.filter((report) => report.category === filterCategory);

  reportsList.innerHTML = '';

  if (!filtered.length) {
    noReports.style.display = 'block';
    reportsList.style.display = 'none';
    return;
  }

  noReports.style.display = 'none';
  reportsList.style.display = 'grid';

  filtered.forEach((report) => {
    reportsList.appendChild(createReportCard(report));
  });
}

function initReportsPage() {
  const categoryFilter = document.getElementById('categoryFilter');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      renderReportsList(categoryFilter.value);
    });
  }

  renderReportsList(categoryFilter ? categoryFilter.value : 'All');
}

function formatReportDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function initReportPage() {
  const form = document.getElementById('issueForm');
  const locationField = document.getElementById('location');
  const descriptionField = document.getElementById('description');
  const categoryField = document.getElementById('category');
  const nameField = document.getElementById('name');
  const imageField = document.getElementById('image');
  const messageBox = document.getElementById('formMessage');
  const locationError = document.getElementById('locationError');
  const descriptionError = document.getElementById('descriptionError');

  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let valid = true;
    locationError.textContent = '';
    descriptionError.textContent = '';

    if (!locationField.value.trim()) {
      locationError.textContent = 'Location is required.';
      valid = false;
    }

    if (!descriptionField.value.trim()) {
      descriptionError.textContent = 'Description is required.';
      valid = false;
    }

    if (!valid) {
      messageBox.style.display = 'none';
      return;
    }

    const newReport = {
      id: Date.now(),
      name: nameField.value.trim() || 'Anonymous',
      location: locationField.value.trim(),
      category: categoryField.value,
      description: descriptionField.value.trim(),
      image: imageField.files && imageField.files[0] ? imageField.files[0].name : '',
      status: 'Pending',
      createdAt: formatReportDate(new Date().toISOString()),
    };

    const reports = getStoredReports();
    reports.unshift(newReport);
    saveReports(reports);

    messageBox.textContent = 'Your report has been submitted successfully. Thank you for helping your community.';
    messageBox.style.display = 'block';

    form.reset();
    locationField.focus();
  });
}

if (document.getElementById('issueForm')) {
  initReportPage();
}

if (document.getElementById('reportsList')) {
  initReportsPage();
}
