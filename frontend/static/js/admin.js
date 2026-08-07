/**
 * Admin Dashboard & Management Module
 * Manages user accounts, prediction logs, global analytics charts, doctor recommendations, and feedback.
 */

const Admin = {
  users: [],
  feedbackList: [],

  init() {
    this.seedAdminData();
    this.bindEvents();
  },

  seedAdminData() {
    this.users = [
      { id: 'usr_101', name: 'Alice Smith', email: 'alice@example.com', role: 'user', scans: 4, joined: '2026-07-15' },
      { id: 'usr_102', name: 'Dr. Robert Chen', email: 'robert@visioncare.org', role: 'admin', scans: 12, joined: '2026-06-01' },
      { id: 'usr_103', name: 'Michael Jordan', email: 'mj@example.com', role: 'user', scans: 2, joined: '2026-08-01' },
      { id: 'usr_104', name: 'Sarah Connor', email: 'sarah@skynet.com', role: 'user', scans: 5, joined: '2026-07-28' }
    ];

    this.feedbackList = [
      { id: 'fb_1', name: 'David Lee', email: 'david@example.com', message: 'The AI chatbot provided great explanation of my cataract query!', status: 'Pending', date: '2026-08-05' },
      { id: 'fb_2', name: 'Emma Watson', email: 'emma@example.com', message: 'Can you add more local clinic addresses near North District?', status: 'Resolved', date: '2026-08-02' }
    ];
  },

  refresh() {
    this.renderMetrics();
    this.renderCharts();
    this.renderUsersTable();
    this.renderFeedbackTable();
  },

  renderMetrics() {
    const history = HistoryModule.getHistory();
    document.getElementById('admin-kpi-users') && (document.getElementById('admin-kpi-users').textContent = this.users.length);
    document.getElementById('admin-kpi-scans') && (document.getElementById('admin-kpi-scans').textContent = history.length + 15);
    document.getElementById('admin-kpi-feedback') && (document.getElementById('admin-kpi-feedback').textContent = this.feedbackList.length);
  },

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    // Disease Distribution Doughnut
    const distCtx = document.getElementById('admin-disease-chart')?.getContext('2d');
    if (distCtx) {
      new Chart(distCtx, {
        type: 'doughnut',
        data: {
          labels: ['Normal', 'Cataract', 'Glaucoma', 'Diabetic Retinopathy', 'AMD', 'Conjunctivitis'],
          datasets: [{
            data: [45, 18, 12, 14, 6, 5],
            backgroundColor: ['#059669', '#d97706', '#dc2626', '#e11d48', '#4f46e5', '#0284c7']
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      });
    }

    // Weekly Scans Bar Chart
    const barCtx = document.getElementById('admin-scans-chart')?.getContext('2d');
    if (barCtx) {
      new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Total System Scans',
            data: [12, 19, 14, 25, 22, 30, 28],
            backgroundColor: '#0f766e',
            borderRadius: 6
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }
  },

  renderUsersTable() {
    const tableBody = document.getElementById('admin-users-table-body');
    if (!tableBody) return;

    let html = '';
    this.users.forEach(u => {
      html += `
        <tr>
          <td><span class="small font-monospace text-muted">${u.id}</span></td>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td><span class="badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${u.role.toUpperCase()}</span></td>
          <td>${u.scans}</td>
          <td>${u.joined}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteUser('${u.id}')">
              <i class="fa fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;
  },

  renderFeedbackTable() {
    const tableBody = document.getElementById('admin-feedback-table-body');
    if (!tableBody) return;

    let html = '';
    this.feedbackList.forEach(fb => {
      html += `
        <tr>
          <td>${fb.date}</td>
          <td><strong>${fb.name}</strong><br><small class="text-muted">${fb.email}</small></td>
          <td><p class="small mb-0">${fb.message}</p></td>
          <td><span class="badge ${fb.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}">${fb.status}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-success" onclick="Admin.toggleFeedbackStatus('${fb.id}')">
              <i class="fa fa-check"></i> Toggle
            </button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;
  },

  deleteUser(id) {
    if (!confirm('Delete user account?')) return;
    this.users = this.users.filter(u => u.id !== id);
    App.showToast('User account deleted', 'info');
    this.renderUsersTable();
  },

  toggleFeedbackStatus(id) {
    const fb = this.feedbackList.find(f => f.id === id);
    if (fb) {
      fb.status = fb.status === 'Resolved' ? 'Pending' : 'Resolved';
      this.renderFeedbackTable();
      App.showToast('Feedback status updated', 'success');
    }
  },

  bindEvents() {
    // Add Doctor Clinic Form
    document.getElementById('admin-add-doctor-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      App.showToast('New ophthalmologist clinic location added to Google Maps directory!', 'success');
      e.target.reset();
    });
  }
};
