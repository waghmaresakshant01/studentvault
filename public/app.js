document.addEventListener('DOMContentLoaded', () => {
  const studentForm = document.getElementById('studentForm');
  const studentTableBody = document.getElementById('studentTableBody');
  const studentsTable = document.getElementById('studentsTable');
  const emptyState = document.getElementById('emptyState');
  const studentCount = document.getElementById('studentCount');
  const toastContainer = document.getElementById('toastContainer');

  // Base API URL
  const API_URL = '/api/students';

  // Initialize App
  fetchStudents();

  // Handle Form Submission
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
        fetchStudents();
      } else {
        // Validation or uniqueness errors returned by API
        const errorsList = result.errors ? result.errors.map(err => `${err.field}: ${err.message}`) : [];
        showToast('error', result.message || 'Validation Failed', 'Please fix the highlighted errors.', errorsList);
      }
    } catch (err) {
      console.error('Submit form error:', err);
      showToast('error', 'Connection Error', 'Failed to submit request to the server.');
    }
  });

  // Fetch Students from API
  async function fetchStudents() {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok && result.success) {
        renderStudentsTable(result.data);
      } else {
        showToast('error', 'Retrieval Failed', 'Failed to retrieve student directory.');
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      showToast('error', 'Connection Error', 'Could not load student data.');
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

      // Contact column markup
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

      // Branch color class mapping
      const branchLower = student.branch.toLowerCase();
      const branchBadgeClass = `tag-branch tag-branch-${branchLower}`;

      // Address string or empty
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
            <button class="action-btn edit-btn" title="Edit Student">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button class="action-btn delete-btn" title="Delete Student">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </td>
      `;

      studentTableBody.appendChild(tr);
    });
  }

  // Toast System
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

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('toast-closing');
      // Wait for exit transition to complete
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3000);
  }
});
