/**
 * User Dashboard Analytics Module
 * Chart.js initializations, scan metrics, and recent activity log
 */

const Dashboard = {
  scansChart: null,
  diseaseChart: null,

  init() {
    // Initialized when navigated to dashboard view
  },

  refresh() {
    this.updateMetrics();
    this.renderCharts();
    this.renderRecentTable();
  },

  updateMetrics() {
    const history = HistoryModule.getHistory();
    const totalScansEl = document.getElementById('dash-total-scans');
    const lastScanEl = document.getElementById('dash-last-scan');
    const leftStatusEl = document.getElementById('dash-left-status');
    const rightStatusEl = document.getElementById('dash-right-status');

    if (totalScansEl) totalScansEl.textContent = history.length;
    if (lastScanEl) {
      lastScanEl.textContent = history.length > 0 ? history[0].timestamp : 'No scans yet';
    }

    if (history.length > 0) {
      const latest = history[0];
      if (leftStatusEl) {
        leftStatusEl.textContent = latest.leftEye ? latest.leftEye.condition : 'N/A';
      }
      if (rightStatusEl) {
        rightStatusEl.textContent = latest.rightEye ? latest.rightEye.condition : 'N/A';
      }
    }
  },

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    const history = HistoryModule.getHistory();

    // Line Chart - Monthly Scans
    const lineCtx = document.getElementById('dash-trend-chart')?.getContext('2d');
    if (lineCtx) {
      if (this.scansChart) this.scansChart.destroy();

      this.scansChart = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            label: 'Eye Scans Conducted',
            data: [2, 4, 3, 6, 5, 8, 7, history.length || 9],
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20, 184, 166, 0.12)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#0f766e',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Doughnut Chart - Detected Condition Breakdown
    const pieCtx = document.getElementById('dash-disease-chart')?.getContext('2d');
    if (pieCtx) {
      if (this.diseaseChart) this.diseaseChart.destroy();

      const counts = { 'Normal': 0, 'Cataract': 0, 'Glaucoma': 0, 'Diabetic Retinopathy': 0, 'AMD': 0, 'Conjunctivitis': 0 };
      history.forEach(item => {
        if (item.leftEye && counts[item.leftEye.condition] !== undefined) counts[item.leftEye.condition]++;
        if (item.rightEye && counts[item.rightEye.condition] !== undefined) counts[item.rightEye.condition]++;
      });

      // Default baseline counts for visual display if history is low
      const dataValues = history.length > 0 ? Object.values(counts) : [12, 3, 2, 4, 1, 2];

      this.diseaseChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            data: dataValues,
            backgroundColor: [
              '#059669', // Normal - Emerald
              '#d97706', // Cataract - Amber
              '#dc2626', // Glaucoma - Red
              '#e11d48', // DR - Rose
              '#4f46e5', // AMD - Indigo
              '#0284c7'  // Conjunctivitis - Sky
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  },

  renderRecentTable() {
    const tableBody = document.getElementById('dash-recent-table-body');
    if (!tableBody) return;

    const history = HistoryModule.getHistory().slice(0, 5);
    if (history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No scan history recorded yet. Perform your first scan!</td></tr>`;
      return;
    }

    let html = '';
    history.forEach(item => {
      const leftBadge = item.leftEye ? `<span class="badge ${item.leftEye.details.badgeClass}">${item.leftEye.condition} (${item.leftEye.confidence}%)</span>` : '—';
      const rightBadge = item.rightEye ? `<span class="badge ${item.rightEye.details.badgeClass}">${item.rightEye.condition} (${item.rightEye.confidence}%)</span>` : '—';

      html += `
        <tr>
          <td><span class="small text-muted">${item.timestamp}</span></td>
          <td><span class="badge bg-secondary text-uppercase">${item.mode}</span></td>
          <td>${leftBadge}</td>
          <td>${rightBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="HistoryModule.viewDetail('${item.id}')">
              <i class="fa fa-eye"></i> View
            </button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;
  }
};
