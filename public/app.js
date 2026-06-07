document.addEventListener('DOMContentLoaded', () => {
  // Main form & directory views
  const studentForm = document.getElementById('studentForm');
  const studentTableBody = document.getElementById('studentTableBody');
  const studentsTable = document.getElementById('studentsTable');
  const emptyState = document.getElementById('emptyState');
  const studentCount = document.getElementById('studentCount');
  const toastContainer = document.getElementById('toastContainer');

  // Search & Filter controls
  const searchInput = document.getElementById('searchInput');
  const filterBranch = document.getElementById('filterBranch');
  const filterYear = document.getElementById('filterYear');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  // Stats Counters
  const statTotal = document.getElementById('statTotal');
  const statCse = document.getElementById('statCse');
  const statIt = document.getElementById('statIt');
  const statEce = document.getElementById('statEce');

  // Modals overlays
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');
  const editIdInput = document.getElementById('editIdInput');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');

  const deleteModal = document.getElementById('deleteModal');
  const deleteDetails = document.getElementById('deleteDetails');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

  let activeStudentToDeleteId = null;

  // Base API URL
  const API_URL = '/api/students';

  // Initialize App
  fetchStudents();

  // Handle Form Submission (POST)
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('success', 'Registration Successful', result.message || 'Student added to database.');
        studentForm.reset();
        resetFiltersUI();
        fetchStudents();
      } else {
        const errorsList = result.errors ? result.errors.map(err => `${err.field}: ${err.message}`) : [];
        showToast('error', result.message || 'Validation Failed', 'Please fix the highlighted errors.', errorsList);
      }
    } catch (err) {
      console.error('Submit form error:', err);
      showToast('error', 'Connection Error', 'Failed to submit request to the server.');
    }
  });

  // Handle Edit Form Submission (PUT)
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
        headers: {
          'Content-Type': 'application/json'
        },
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

  // Fetch Students from API
  async function fetchStudents() {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok && result.success) {
        renderStudentsTable(result.data);
        updateStatistics(result.data);
      } else {
        showToast('error', 'Retrieval Failed', 'Failed to retrieve student directory.');
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      showToast('error', 'Connection Error', 'Could not load student data.');
    }
  }

  // Fetch Filtered Students by Branch
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

  // Fetch Filtered Students by Year
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

  // Render Table Rows Dynamically
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

      const contactInfo = `
        <div class="contact-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span>${student.email}</span>
        </div>
        <div class="contact-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.622c0-1.275 1.02-2.32 2.302-2.32h11.196c1.282 0 2.302 1.045 2.302 2.32v11.196c0 1.282-1.02 2.302-2.302 2.302H4.552c-1.282 0-2.302-1.02-2.302-2.302V6.622zM10.5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          <span>${student.phone}</span>
        </div>
      `;

      const branchLower = student.branch.toLowerCase();
      const branchBadgeClass = `tag-branch tag-branch-${branchLower}`;

      const addressMarkup = student.address 
        ? `<div class="student-meta">Address: ${student.address}</div>`
        : '';

      tr.innerHTML = `
        <td>
          <div class="student-name">${student.name}</div>
          ${addressMarkup}
        </td>
        <td>
          <code class="roll-number">${student.rollNo}</code>
        </td>
        <td>
          <div class="badge-group">
            <span class="tag ${branchBadgeClass}">${student.branch}</span>
            <span class="tag tag-year">Yr ${student.year}</span>
          </div>
        </td>
        <td>
          ${contactInfo}
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

      // Wire edit action
      tr.querySelector('.edit-btn').addEventListener('click', () => handleEditClick(student));
      // Wire delete action
      tr.querySelector('.delete-btn').addEventListener('click', () => handleDeleteClick(student));

      studentTableBody.appendChild(tr);
    });
  }

  // Update Statistics Box Counts
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

  // Smooth Counter Animation
  function animateCounter(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    if (startValue === targetValue) {
      element.textContent = targetValue;
      return;
    }

    let current = startValue;
    const step = targetValue > startValue ? 1 : -1;
    const duration = 250; // ms
    const incrementTime = Math.abs(Math.floor(duration / (targetValue - startValue)));
    
    // Clamp increment interval
    const interval = Math.max(incrementTime, 15);

    const timer = setInterval(() => {
      current += step;
      element.textContent = current;
      if (current === targetValue) {
        clearInterval(timer);
      }
    }, interval);
  }

  // Open / Close Modals
  function openModal(modal) {
    modal.classList.add('modal-active');
  }

  function closeModal(modal) {
    modal.classList.remove('modal-active');
  }

  // Handle Edit Action
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

  // Handle Delete Action
  function handleDeleteClick(student) {
    activeStudentToDeleteId = student._id;
    deleteDetails.innerHTML = `
      <div><strong>Name:</strong> ${student.name}</div>
      <div><strong>Roll Number:</strong> ${student.rollNo}</div>
      <div><strong>Branch:</strong> ${student.branch}</div>
    `;
    openModal(deleteModal);
  }

  // Execute Delete Action (DELETE)
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

  // Close Modals Click Triggers
  closeEditModalBtn.addEventListener('click', () => closeModal(editModal));
  closeDeleteModalBtn.addEventListener('click', () => {
    closeModal(deleteModal);
    activeStudentToDeleteId = null;
  });

  // Close Modal on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal(editModal);
    if (e.target === deleteModal) {
      closeModal(deleteModal);
      activeStudentToDeleteId = null;
    }
  });

  // Client-side Live Search
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

  // Branch Filter (Server-side)
  filterBranch.addEventListener('change', () => {
    const branch = filterBranch.value;
    // Reset other controls
    filterYear.value = '';
    searchInput.value = '';

    if (branch === '') {
      fetchStudents();
    } else {
      fetchFilteredBranch(branch);
    }
  });

  // Year Filter (Server-side)
  filterYear.addEventListener('change', () => {
    const year = filterYear.value;
    // Reset other controls
    filterBranch.value = '';
    searchInput.value = '';

    if (year === '') {
      fetchStudents();
    } else {
      fetchFilteredYear(year);
    }
  });

  // Clear/Reset Filters
  clearFiltersBtn.addEventListener('click', () => {
    resetFiltersUI();
    fetchStudents();
  });

  function resetFiltersUI() {
    searchInput.value = '';
    filterBranch.value = '';
    filterYear.value = '';
  }

  // Toast Alerts Generator
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
});
