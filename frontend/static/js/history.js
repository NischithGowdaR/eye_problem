/**
 * Scan History Module
 * Manages search, filter, pagination, details view, PDF download, and record deletion
 */

const HistoryModule = {
  records: [],
  filteredRecords: [],
  currentPage: 1,
  pageSize: 5,

  init() {
    this.loadHistory();
    this.bindEvents();
  },

  loadHistory() {
    const saved = localStorage.getItem('eye_scan_history');
    if (saved) {
      this.records = JSON.parse(saved);
    } else {
      // Seed default demonstration history
      this.records = [
        {
          id: 'scan_1723000000000',
          timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(),
          mode: 'both',
          leftEye: { condition: 'Normal', confidence: 96.4, details: Prediction.diseaseDB['Normal'] },
          rightEye: { condition: 'Normal', confidence: 95.8, details: Prediction.diseaseDB['Normal'] },
          predictionTime: '0.38 seconds'
        },
        {
          id: 'scan_1723000000001',
          timestamp: new Date(Date.now() - 86400000 * 10).toLocaleString(),
          mode: 'left',
          leftEye: { condition: 'Cataract', confidence: 92.1, details: Prediction.diseaseDB['Cataract'] },
          rightEye: null,
          predictionTime: '0.45 seconds'
        }
      ];
      localStorage.setItem('eye_scan_history', JSON.stringify(this.records));
    }
    this.filteredRecords = [...this.records];
  },

  getHistory() {
    return this.records;
  },

  addRecord(record) {
    this.records.unshift(record);
    localStorage.setItem('eye_scan_history', JSON.stringify(this.records));
    this.refresh();
  },

  deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this scan record?')) return;

    this.records = this.records.filter(r => r.id !== id);
    localStorage.setItem('eye_scan_history', JSON.stringify(this.records));
    App.showToast('Scan record deleted', 'info');
    this.refresh();
  },

  bindEvents() {
    document.getElementById('history-search-input')?.addEventListener('input', (e) => {
      this.filterData(e.target.value, document.getElementById('history-filter-select')?.value);
    });

    document.getElementById('history-filter-select')?.addEventListener('change', (e) => {
      this.filterData(document.getElementById('history-search-input')?.value, e.target.value);
    });
  },

  filterData(query = '', filterType = 'all') {
    let result = [...this.records];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r => 
        r.timestamp.toLowerCase().includes(q) ||
        (r.leftEye && r.leftEye.condition.toLowerCase().includes(q)) ||
        (r.rightEye && r.rightEye.condition.toLowerCase().includes(q))
      );
    }

    if (filterType === 'abnormal') {
      result = result.filter(r => 
        (r.leftEye && r.leftEye.condition !== 'Normal') || 
        (r.rightEye && r.rightEye.condition !== 'Normal')
      );
    } else if (filterType === 'normal') {
      result = result.filter(r => 
        (r.leftEye && r.leftEye.condition === 'Normal') && 
        (!r.rightEye || r.rightEye.condition === 'Normal')
      );
    }

    this.filteredRecords = result;
    this.currentPage = 1;
    this.renderTable();
  },

  refresh() {
    this.loadHistory();
    this.renderTable();
  },

  renderTable() {
    const tableBody = document.getElementById('history-table-body');
    const paginationEl = document.getElementById('history-pagination');
    if (!tableBody) return;

    if (this.filteredRecords.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No matching scan records found.</td></tr>`;
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageRecords = this.filteredRecords.slice(startIdx, startIdx + this.pageSize);

    let html = '';
    pageRecords.forEach(item => {
      const leftTag = item.leftEye ? `<span class="badge ${item.leftEye.details.badgeClass}">${item.leftEye.condition} (${item.leftEye.confidence}%)</span>` : '—';
      const rightTag = item.rightEye ? `<span class="badge ${item.rightEye.details.badgeClass}">${item.rightEye.condition} (${item.rightEye.confidence}%)</span>` : '—';

      html += `
        <tr>
          <td><span class="small text-muted font-monospace">${item.id}</span></td>
          <td>${item.timestamp}</td>
          <td>${leftTag}</td>
          <td>${rightTag}</td>
          <td><span class="badge bg-light text-dark border">${item.mode.toUpperCase()}</span></td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="HistoryModule.viewDetail('${item.id}')" title="View Full Report">
                <i class="fa fa-eye"></i>
              </button>
              <button class="btn btn-outline-success" onclick="HistoryModule.downloadReport('${item.id}')" title="Download PDF">
                <i class="fa fa-file-pdf-o"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="HistoryModule.deleteRecord('${item.id}')" title="Delete">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;

    // Pagination
    this.renderPagination(paginationEl);
  },

  renderPagination(container) {
    if (!container) return;
    const totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = `<ul class="pagination pagination-sm mb-0">`;
    html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="HistoryModule.setPage(${this.currentPage - 1}); return false;">Prev</a>
    </li>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${i === this.currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="HistoryModule.setPage(${i}); return false;">${i}</a>
      </li>`;
    }

    html += `<li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="HistoryModule.setPage(${this.currentPage + 1}); return false;">Next</a>
    </li>`;
    html += `</ul>`;

    container.innerHTML = html;
  },

  setPage(page) {
    const totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.renderTable();
  },

  viewDetail(id) {
    const record = this.records.find(r => r.id === id);
    if (!record) return;

    Prediction.currentAnalysis = record;
    Prediction.renderResults(record);
    App.navigateTo('prediction-results');
  },

  downloadReport(id) {
    const record = this.records.find(r => r.id === id);
    if (!record) return;
    PDFModule.generateReport(record);
  }
};
