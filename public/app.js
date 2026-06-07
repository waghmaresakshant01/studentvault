document.addEventListener('DOMContentLoaded', () => {
  // ── DOM References ────────────────────────────────────────
  const studentForm = document.getElementById('studentForm');
  const studentTableBody = document.getElementById('studentTableBody');
  const studentsTable = document.getElementById('studentsTable');
  const emptyState = document.getElementById('emptyState');
  const studentCount = document.getElementById('studentCount');
  const toastContainer = document.getElementById('toastContainer');

  // Drawer References
  const formDrawer = document.getElementById('formDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const openDrawerBtnNav = document.getElementById('openDrawerBtnNav');
  const openDrawerBtnTable = document.getElementById('openDrawerBtnTable');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');

  // Search & Filter controls
  const searchInput = document.getElementById('searchInput');
  const filterBranch = document.getElementById('filterBranch');
  const filterYear = document.getElementById('filterYear');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  // Stats Counters (Dashboard)
  const statTotal = document.getElementById('statTotal');
  const statCse = document.getElementById('statCse');
  const statIt = document.getElementById('statIt');
  const statEce = document.getElementById('statEce');

  // Analytics Stats
  const aStatTotal = document.getElementById('aStatTotal');
  const aStatTopBranch = document.getElementById('aStatTopBranch');
  const aStatTopBranchCount = document.getElementById('aStatTopBranchCount');
  const aStatTopYear = document.getElementById('aStatTopYear');
  const aStatTopYearCount = document.getElementById('aStatTopYearCount');

  // Recent List (Dashboard)
  const recentList = document.getElementById('recentList');

  // Edit Modal
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');
  const editIdInput = document.getElementById('editIdInput');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  // Delete Modal
  const deleteModal = document.getElementById('deleteModal');
  const deleteDetails = document.getElementById('deleteDetails');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  let activeStudentToDeleteId = null;

  // ── Chart Instances ──────────────────────────────────────
  let branchChartInstance = null;
  let yearChartInstance = null;

  // ── Color Map for Avatar Circles ──────────────────────────
  const avatarColors = [
    { bg: 'rgba(255, 149, 0, 0.15)', fg: '#FF9500' },
    { bg: 'rgba(59, 130, 246, 0.15)', fg: '#60A5FA' },
    { bg: 'rgba(16, 185, 129, 0.15)', fg: '#34D399' },
    { bg: 'rgba(167, 139, 250, 0.15)', fg: '#A78BFA' },
    { bg: 'rgba(244, 114, 182, 0.15)', fg: '#F472B6' },
    { bg: 'rgba(251, 191, 36, 0.15)', fg: '#FBBF24' },
  ];

  function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }

  function getInitials(name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  // ── Base API URL ──────────────────────────────────────────
  const API_URL = '/api/students';

  // ── SPA Navigation ────────────────────────────────────────
  const views = {
    dashboard: document.getElementById('dashboardView'),
    students: document.getElementById('studentsView'),
    analytics: document.getElementById('analyticsView'),
  };

  const navLinks = {
    dashboard: document.getElementById('navLinkDashboard'),
    students: document.getElementById('navLinkStudents'),
    analytics: document.getElementById('navLinkAnalytics'),
  };

  let currentView = 'dashboard';

  function switchView(target) {
    if (currentView === target) return;

    // Deactivate current view
    if (views[currentView]) {
      views[currentView].classList.remove('active');
    }
    if (navLinks[currentView]) {
      navLinks[currentView].classList.remove('active');
    }

    // Activate target view
    currentView = target;
    if (views[target]) {
      views[target].classList.add('active');
    }
    if (navLinks[target]) {
      navLinks[target].classList.add('active');
    }

    // Trigger chart refresh when switching to analytics
    if (target === 'analytics') {
      fetchStudents(true);
    }

    // Update hash
    window.location.hash = target;
  }

  // Wire nav links
  Object.keys(navLinks).forEach(key => {
    if (navLinks[key]) {
      navLinks[key].addEventListener('click', (e) => {
        e.preventDefault();
        switchView(key);
      });
    }
  });

  // Wire action cards that link to views
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const target = link.getAttribute('href').replace('#', '');
    if (views[target]) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(target);
      });
    }
  });

  // Wire "Add Student" action card
  const actionCardRegister = document.getElementById('actionCardRegister');
  if (actionCardRegister) {
    actionCardRegister.addEventListener('click', () => openDrawer());
  }

  // Read hash on load
  const initialHash = window.location.hash.replace('#', '');
  if (views[initialHash]) {
    views[initialHash].classList.add('active');
    navLinks[initialHash] && navLinks[initialHash].classList.add('active');
    views['dashboard'].classList.remove('active');
    navLinks['dashboard'] && navLinks['dashboard'].classList.remove('active');
    currentView = initialHash;
    if (initialHash === 'analytics') fetchStudents(true);
  } else {
    views['dashboard'].classList.add('active');
    navLinks['dashboard'] && navLinks['dashboard'].classList.add('active');
    currentView = 'dashboard';
  }

  // ── Initialize ────────────────────────────────────────────
  fetchStudents();

  // ── Form Submission (POST) ────────────────────────────────
  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('nameInput').value.trim();
    const rollNo = document.getElementById('rollNoInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();
    const branch = document.getElementById('branchInput').value;
    const year = document.getElementById('yearInput').value;
    const email = document.getElementById('emailInput').value.trim();
    const address = document.getElementById('addressInput').value.trim();

    const studentData = {
      name,
      rollNo,
      phone,
      branch,
      year: Number(year),
      email,
      address: address || undefined
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('success', 'Registration Successful', result.message || 'Student added to database.');
        studentForm.reset();
        resetFiltersUI();
        fetchStudents();
        closeDrawer();
      } else {
        const errorsList = result.errors ? result.errors.map(err => `${err.field}: ${err.message}`) : [];
        showToast('error', result.message || 'Validation Failed', 'Please fix the highlighted errors.', errorsList);
      }
    } catch (err) {
      console.error('Submit form error:', err);
      showToast('error', 'Connection Error', 'Failed to submit request to the server.');
    }
  });

  // ── Edit Form Submission (PUT) ────────────────────────────
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = editIdInput.value;
    const name = document.getElementById('editNameInput').value.trim();
    const rollNo = document.getElementById('editRollNoInput').value.trim();
    const phone = document.getElementById('editPhoneInput').value.trim();
    const branch = document.getElementById('editBranchInput').value;
    const year = document.getElementById('editYearInput').value;
    const email = document.getElementById('editEmailInput').value.trim();
    const address = document.getElementById('editAddressInput').value.trim();

    const updatedData = {
      name,
      rollNo,
      phone,
      branch,
      year: Number(year),
      email,
      address: address || undefined
    };

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('success', 'Student Updated', result.message || 'Record has been modified successfully.');
        closeModal(editModal);
        fetchStudents();
      } else {
        const errorsList = result.errors ? result.errors.map(err => `${err.field}: ${err.message}`) : [];
        showToast('error', result.message || 'Update Failed', 'Please correct the invalid fields.', errorsList);
      }
    } catch (err) {
      console.error('Update student error:', err);
      showToast('error', 'Connection Error', 'Failed to update request.');
    }
  });

  // ── Fetch Students ────────────────────────────────────────
  async function fetchStudents(forAnalytics = false) {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok && result.success) {
        renderStudentsTable(result.data);
        updateStatistics(result.data);
        renderRecentList(result.data);
        if (forAnalytics || currentView === 'analytics') {
          renderCharts(result.data);
          updateAnalyticsStats(result.data);
        }
      } else {
        showToast('error', 'Retrieval Failed', 'Failed to retrieve student directory.');
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      showToast('error', 'Connection Error', 'Could not load student data.');
    }
  }

  // ── Fetch Filtered by Branch ──────────────────────────────
  async function fetchFilteredBranch(branch) {
    try {
      const response = await fetch(`${API_URL}/branch/${branch}`);
      const result = await response.json();

      if (response.ok && result.success) {
        renderStudentsTable(result.data);
      } else {
        showToast('error', 'Filtering Failed', 'Failed to query branch from server.');
      }
    } catch (err) {
      console.error('Fetch filtered branch error:', err);
      showToast('error', 'Connection Error', 'Could not connect to branch API endpoint.');
    }
  }

  // ── Fetch Filtered by Year ────────────────────────────────
  async function fetchFilteredYear(year) {
    try {
      const response = await fetch(`${API_URL}/year/${year}`);
      const result = await response.json();

      if (response.ok && result.success) {
        renderStudentsTable(result.data);
      } else {
        showToast('error', 'Filtering Failed', 'Failed to query year from server.');
      }
    } catch (err) {
      console.error('Fetch filtered year error:', err);
      showToast('error', 'Connection Error', 'Could not connect to year API endpoint.');
    }
  }

  // ── Render Table ──────────────────────────────────────────
  function renderStudentsTable(students) {
    studentTableBody.innerHTML = '';
    studentCount.textContent = students.length;

    if (students.length === 0) {
      studentsTable.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    studentsTable.style.display = 'table';
    emptyState.style.display = 'none';

    students.forEach(student => {
      const tr = document.createElement('tr');
      tr.dataset.id = student._id;

      const initials = getInitials(student.name);
      const colors = getAvatarColor(student.name);
      const addressMeta = student.address
        ? `<div class="student-meta">${student.address}</div>`
        : '';

      tr.innerHTML = `
        <td>
          <div class="student-cell">
            <div class="avatar-circle" style="background:${colors.bg};color:${colors.fg}">
              ${initials}
            </div>
            <div>
              <div class="student-name">${student.name}</div>
              <div class="student-email">${student.email}</div>
              ${addressMeta}
            </div>
          </div>
        </td>
        <td>
          <code class="roll-number">${student.rollNo}</code>
        </td>
        <td>
          <div class="badge-group">
            <span class="tag">${student.branch}</span>
            <span class="tag tag-year">Yr ${student.year}</span>
          </div>
        </td>
        <td>
          <div class="contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span>${student.phone}</span>
          </div>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn edit-btn" title="Edit Student" data-id="${student._id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button class="action-btn delete-btn" title="Delete Student" data-id="${student._id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </td>
      `;

      // Wire edit + delete handlers
      tr.querySelector('.edit-btn').addEventListener('click', () => handleEditClick(student));
      tr.querySelector('.delete-btn').addEventListener('click', () => handleDeleteClick(student));

      studentTableBody.appendChild(tr);
    });
  }

  // ── Update Dashboard Statistics ───────────────────────────
  function updateStatistics(students) {
    const total = students.length;
    const cse = students.filter(s => s.branch === 'CSE').length;
    const it = students.filter(s => s.branch === 'IT').length;
    const ece = students.filter(s => s.branch === 'ECE').length;

    animateCounter(statTotal, total);
    animateCounter(statCse, cse);
    animateCounter(statIt, it);
    animateCounter(statEce, ece);
  }

  // ── Render Recent Registrations ───────────────────────────
  function renderRecentList(students) {
    if (!recentList) return;
    recentList.innerHTML = '';

    if (students.length === 0) {
      recentList.innerHTML = `<div class="recent-empty">No students registered yet.</div>`;
      return;
    }

    // Show last 6 students (most recently added last in array)
    const recent = [...students].reverse().slice(0, 6);
    recent.forEach(student => {
      const colors = getAvatarColor(student.name);
      const initials = getInitials(student.name);
      const yearSuffix = ['', 'st', 'nd', 'rd', 'th'];
      const yearLabel = `${student.year}${yearSuffix[student.year] || 'th'} Year`;

      const item = document.createElement('div');
      item.className = 'recent-item';
      item.innerHTML = `
        <div class="recent-item__avatar" style="background:${colors.bg};color:${colors.fg}">${initials}</div>
        <div class="recent-item__info">
          <div class="recent-item__name">${student.name}</div>
          <div class="recent-item__meta">${student.rollNo} · ${yearLabel}</div>
        </div>
        <span class="recent-item__tag">${student.branch}</span>
      `;
      recentList.appendChild(item);
    });
  }

  // ── Update Analytics Stats ────────────────────────────────
  function updateAnalyticsStats(students) {
    if (!aStatTotal) return;

    aStatTotal.textContent = students.length;

    // Top Branch
    const branchCounts = {};
    students.forEach(s => {
      branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
    });
    const topBranch = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0];
    if (topBranch) {
      aStatTopBranch.textContent = topBranch[0];
      aStatTopBranchCount.textContent = `${topBranch[1]} student${topBranch[1] !== 1 ? 's' : ''} enrolled`;
    } else {
      aStatTopBranch.textContent = '—';
      aStatTopBranchCount.textContent = 'no data yet';
    }

    // Top Year
    const yearCounts = {};
    students.forEach(s => {
      const yearLabel = `Yr ${s.year}`;
      yearCounts[yearLabel] = (yearCounts[yearLabel] || 0) + 1;
    });
    const topYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];
    if (topYear) {
      aStatTopYear.textContent = topYear[0];
      aStatTopYearCount.textContent = `${topYear[1]} student${topYear[1] !== 1 ? 's' : ''} enrolled`;
    } else {
      aStatTopYear.textContent = '—';
      aStatTopYearCount.textContent = 'no data yet';
    }
  }

  // ── Render Charts ─────────────────────────────────────────
  function renderCharts(students) {
    renderBranchChart(students);
    renderYearChart(students);
  }

  function renderBranchChart(students) {
    const branchMap = { CSE: 0, IT: 0, ECE: 0, ME: 0, CE: 0 };
    students.forEach(s => {
      if (branchMap[s.branch] !== undefined) branchMap[s.branch]++;
      else branchMap[s.branch] = (branchMap[s.branch] || 0) + 1;
    });

    const labels = Object.keys(branchMap);
    const data = Object.values(branchMap);

    const chartColors = [
      'rgba(255, 149, 0, 0.85)',
      'rgba(96, 165, 250, 0.85)',
      'rgba(52, 211, 153, 0.85)',
      'rgba(167, 139, 250, 0.85)',
      'rgba(244, 114, 182, 0.85)',
    ];

    const canvas = document.getElementById('branchChart');
    if (!canvas) return;

    if (branchChartInstance) {
      branchChartInstance.destroy();
      branchChartInstance = null;
    }

    branchChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: chartColors,
          borderColor: 'rgba(13, 13, 13, 0.5)',
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.6)',
              font: { family: 'Space Mono', size: 10 },
              padding: 16,
              boxWidth: 12,
              boxHeight: 12,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            titleFont: { family: 'Playfair Display', size: 14 },
            bodyFont: { family: 'Space Mono', size: 11 },
            padding: 14,
          }
        },
        cutout: '65%',
      }
    });
  }

  function renderYearChart(students) {
    const yearMap = { '1st': 0, '2nd': 0, '3rd': 0, '4th': 0 };
    const yearKeyMap = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };
    students.forEach(s => {
      const key = yearKeyMap[s.year] || `Yr ${s.year}`;
      yearMap[key] = (yearMap[key] || 0) + 1;
    });

    const labels = Object.keys(yearMap);
    const data = Object.values(yearMap);

    const canvas = document.getElementById('yearChart');
    if (!canvas) return;

    if (yearChartInstance) {
      yearChartInstance.destroy();
      yearChartInstance = null;
    }

    yearChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Students',
          data,
          backgroundColor: [
            'rgba(255, 149, 0, 0.7)',
            'rgba(96, 165, 250, 0.7)',
            'rgba(52, 211, 153, 0.7)',
            'rgba(167, 139, 250, 0.7)',
          ],
          borderColor: [
            'rgba(255, 149, 0, 1)',
            'rgba(96, 165, 250, 1)',
            'rgba(52, 211, 153, 1)',
            'rgba(167, 139, 250, 1)',
          ],
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            titleFont: { family: 'Playfair Display', size: 14 },
            bodyFont: { family: 'Space Mono', size: 11 },
            padding: 14,
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              font: { family: 'Space Mono', size: 10 },
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              font: { family: 'Space Mono', size: 10 },
              stepSize: 1,
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          }
        }
      }
    });
  }

  // ── Counter Animation ─────────────────────────────────────
  function animateCounter(element, targetValue) {
    if (!element) return;
    const startValue = parseInt(element.textContent) || 0;
    if (startValue === targetValue) {
      element.textContent = targetValue;
      return;
    }

    let current = startValue;
    const step = targetValue > startValue ? 1 : -1;
    const duration = 250;
    const incrementTime = Math.abs(Math.floor(duration / (targetValue - startValue)));
    const interval = Math.max(incrementTime, 15);

    const timer = setInterval(() => {
      current += step;
      element.textContent = current;
      if (current === targetValue) {
        clearInterval(timer);
      }
    }, interval);
  }

  // ── Modal Handlers ────────────────────────────────────────
  function openModal(modal) {
    modal.classList.add('modal-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('modal-active');
    document.body.style.overflow = '';
  }

  function handleEditClick(student) {
    editIdInput.value = student._id;
    document.getElementById('editNameInput').value = student.name;
    document.getElementById('editRollNoInput').value = student.rollNo;
    document.getElementById('editPhoneInput').value = student.phone;
    document.getElementById('editBranchInput').value = student.branch;
    document.getElementById('editYearInput').value = student.year.toString();
    document.getElementById('editEmailInput').value = student.email;
    document.getElementById('editAddressInput').value = student.address || '';

    openModal(editModal);
  }

  function handleDeleteClick(student) {
    activeStudentToDeleteId = student._id;
    deleteDetails.innerHTML = `
      <div><strong>Name:</strong> ${student.name}</div>
      <div><strong>Roll Number:</strong> ${student.rollNo}</div>
      <div><strong>Branch:</strong> ${student.branch}</div>
    `;
    openModal(deleteModal);
  }

  // ── Delete Confirmation ───────────────────────────────────
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!activeStudentToDeleteId) return;

    try {
      const response = await fetch(`${API_URL}/${activeStudentToDeleteId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast('success', 'Student Deleted', result.message || 'Student record was removed.');
        closeModal(deleteModal);
        activeStudentToDeleteId = null;
        fetchStudents();
      } else {
        showToast('error', 'Deletion Failed', result.message || 'Could not delete student from vault.');
      }
    } catch (err) {
      console.error('Delete request error:', err);
      showToast('error', 'Connection Error', 'Failed to communicate deletion request.');
    }
  });

  // ── Close Modal Events ────────────────────────────────────
  closeEditModalBtn.addEventListener('click', () => closeModal(editModal));
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => closeModal(editModal));

  closeDeleteModalBtn.addEventListener('click', () => {
    closeModal(deleteModal);
    activeStudentToDeleteId = null;
  });
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => {
    closeModal(deleteModal);
    activeStudentToDeleteId = null;
  });

  // Close modal on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal(editModal);
    if (e.target === deleteModal) {
      closeModal(deleteModal);
      activeStudentToDeleteId = null;
    }
  });

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editModal.classList.contains('modal-active')) closeModal(editModal);
      if (deleteModal.classList.contains('modal-active')) {
        closeModal(deleteModal);
        activeStudentToDeleteId = null;
      }
    }
  });

  // ── Client-side Live Search ───────────────────────────────
  searchInput.addEventListener('keyup', () => {
    const value = searchInput.value.toLowerCase().trim();
    const rows = studentTableBody.querySelectorAll('tr');

    let visibleCount = 0;

    rows.forEach(row => {
      const name = row.querySelector('.student-name').textContent.toLowerCase();
      const rollNo = row.querySelector('.roll-number').textContent.toLowerCase();

      if (name.includes(value) || rollNo.includes(value)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    studentCount.textContent = visibleCount;

    if (visibleCount === 0 && rows.length > 0) {
      studentsTable.style.display = 'none';
      emptyState.style.display = 'flex';
    } else if (rows.length > 0) {
      studentsTable.style.display = 'table';
      emptyState.style.display = 'none';
    }
  });

  // ── Branch Filter (Server-side) ───────────────────────────
  filterBranch.addEventListener('change', () => {
    const branch = filterBranch.value;
    filterYear.value = '';
    searchInput.value = '';

    if (branch === '') {
      fetchStudents();
    } else {
      fetchFilteredBranch(branch);
    }
  });

  // ── Year Filter (Server-side) ─────────────────────────────
  filterYear.addEventListener('change', () => {
    const year = filterYear.value;
    filterBranch.value = '';
    searchInput.value = '';

    if (year === '') {
      fetchStudents();
    } else {
      fetchFilteredYear(year);
    }
  });

  // ── Clear Filters ─────────────────────────────────────────
  clearFiltersBtn.addEventListener('click', () => {
    resetFiltersUI();
    fetchStudents();
  });

  function resetFiltersUI() {
    searchInput.value = '';
    filterBranch.value = '';
    filterYear.value = '';
  }

  // ── Toast Notifications ───────────────────────────────────
  function showToast(type, title, message, errorList = []) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `
        <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    } else {
      iconSvg = `
        <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      `;
    }

    let errorsMarkup = '';
    if (errorList && errorList.length > 0) {
      errorsMarkup = `
        <ul class="toast-errors-list">
          ${errorList.map(err => `<li>${err}</li>`).join('')}
        </ul>
      `;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
        ${errorsMarkup}
      </div>
    `;

    toastContainer.prepend(toast);

    setTimeout(() => {
      toast.classList.add('toast-closing');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3000);
  }

  // ── Drawer Functionality ──────────────────────────────────
  function openDrawer() {
    formDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    formDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openDrawerBtnNav) openDrawerBtnNav.addEventListener('click', openDrawer);
  if (openDrawerBtnTable) openDrawerBtnTable.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  });
});
