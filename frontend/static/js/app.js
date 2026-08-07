/**
 * Main Application Core & Router
 * AI-Based Eye Disease Detection & Eye Care Recommendation System
 */

const App = {
  currentUser: null,
  activeView: 'home',
  
  init() {
    this.bindNavigation();
    this.bindThemeToggle();
    Auth.init();
    BMI.init();
    Upload.init();
    Prediction.init();
    Chatbot.init();
    Dashboard.init();
    HistoryModule.init();
    Admin.init();
    
    // Check url hash or default to home
    const initialView = window.location.hash.replace('#', '') || 'home';
    this.navigateTo(initialView);

    console.log('👁️ Eye Care AI Application Initialized');
  },

  navigateTo(viewId) {
    const views = document.querySelectorAll('.app-view');
    views.forEach(view => {
      view.classList.add('d-none');
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.classList.remove('d-none');
      this.activeView = viewId;
      window.location.hash = viewId;
      window.scrollTo(0, 0);

      // Update Nav active link
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === `#${viewId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // View specific refresh triggers
      if (viewId === 'dashboard') Dashboard.refresh();
      if (viewId === 'history') HistoryModule.refresh();
      if (viewId === 'admin') Admin.refresh();
    } else {
      // Default fallback to home
      document.getElementById('view-home')?.classList.remove('d-none');
    }
  },

  bindNavigation() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-navigate]');
      if (link) {
        e.preventDefault();
        const targetView = link.getAttribute('data-navigate');
        this.navigateTo(targetView);
      }
    });
  },

  bindThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem('eye_app_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('eye_app_theme', newTheme);
      this.updateThemeIcon(newTheme);
    });
  },

  updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle-btn i');
    if (!icon) return;
    if (theme === 'dark') {
      icon.className = 'fa fa-sun-o text-warning';
    } else {
      icon.className = 'fa fa-moon-o text-secondary';
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0 show mb-2`;
    toast.role = 'alert';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="fa fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
