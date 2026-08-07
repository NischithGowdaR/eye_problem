/**
 * BMI Calculator & Tracker Module
 * Handles BMI popup, calculation formula, category grading, and health tips
 */

const BMI = {
  currentRecord: JSON.parse(localStorage.getItem('eye_bmi_record') || 'null'),

  init() {
    this.bindEvents();
    if (this.currentRecord) {
      this.updateBMIDisplay(this.currentRecord);
    }
  },

  bindEvents() {
    const form = document.getElementById('bmi-modal-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    const calcForm = document.getElementById('bmi-inline-form');
    if (calcForm) {
      calcForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  },

  showPopup() {
    const modalEl = document.getElementById('bmiModal');
    if (modalEl && window.bootstrap) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  },

  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const age = parseFloat(form.querySelector('[name="age"]')?.value || 25);
    const gender = form.querySelector('[name="gender"]')?.value || 'other';
    const height = parseFloat(form.querySelector('[name="height"]')?.value || 170); // in cm
    const weight = parseFloat(form.querySelector('[name="weight"]')?.value || 70); // in kg

    if (height <= 0 || weight <= 0) {
      App.showToast('Please enter valid height and weight values', 'error');
      return;
    }

    const heightMeters = height / 100;
    const bmiValue = parseFloat((weight / (heightMeters * heightMeters)).toFixed(1));
    const categoryInfo = this.getBMICategory(bmiValue);

    const record = {
      age,
      gender,
      height,
      weight,
      bmi: bmiValue,
      category: categoryInfo.name,
      badgeClass: categoryInfo.badgeClass,
      color: categoryInfo.color,
      eyeTip: categoryInfo.eyeTip,
      date: new Date().toLocaleDateString()
    };

    this.currentRecord = record;
    localStorage.setItem('eye_bmi_record', JSON.stringify(record));

    // Update user auth object to record completion
    if (Auth.user) {
      Auth.user.hasCompletedBMI = true;
      localStorage.setItem('eye_user', JSON.stringify(Auth.user));
    }

    this.updateBMIDisplay(record);
    App.showToast(`BMI Calculated: ${bmiValue} (${categoryInfo.name})`, 'success');

    // Close modal if open
    const modalEl = document.getElementById('bmiModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    // Refresh Dashboard if visible
    if (App.activeView === 'dashboard') {
      Dashboard.refresh();
    }
  },

  getBMICategory(bmi) {
    if (bmi < 18.5) {
      return {
        name: 'Underweight',
        badgeClass: 'badge-warning',
        color: '#d97706',
        eyeTip: 'Maintain optimal nutrient intake. Vitamin A, C, and E intake is crucial for retina maintenance.'
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      return {
        name: 'Normal Weight',
        badgeClass: 'badge-normal',
        color: '#059669',
        eyeTip: 'Healthy metabolic status supports stable ocular blood flow and low retinopathy risk.'
      };
    } else if (bmi >= 25 && bmi < 30) {
      return {
        name: 'Overweight',
        badgeClass: 'badge-warning',
        color: '#d97706',
        eyeTip: 'Elevated BMI can contribute to increased ocular pressure and early vascular micro-changes.'
      };
    } else {
      return {
        name: 'Obese',
        badgeClass: 'badge-danger',
        color: '#dc2626',
        eyeTip: 'Higher obesity index increases risk factors for Diabetic Retinopathy, glaucoma pressure, and hypertensive eye changes.'
      };
    }
  },

  updateBMIDisplay(record) {
    const valEls = document.querySelectorAll('.bmi-display-value');
    const catEls = document.querySelectorAll('.bmi-display-category');
    const tipEls = document.querySelectorAll('.bmi-display-tip');

    valEls.forEach(el => el.textContent = record.bmi);
    catEls.forEach(el => {
      el.textContent = record.category;
      el.className = `badge ${record.badgeClass} ms-2`;
    });
    tipEls.forEach(el => el.textContent = record.eyeTip);
  }
};
