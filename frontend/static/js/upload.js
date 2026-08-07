/**
 * Eye Image Upload Module
 * Handles file dropzones, eye selection mode, image preview, validation, and preprocessing
 */

const Upload = {
  mode: 'both', // 'left', 'right', or 'both'
  leftFile: null,
  rightFile: null,

  init() {
    this.bindModeSelector();
    this.setupDropzone('left');
    this.setupDropzone('right');
    this.bindUploadAction();
  },

  bindModeSelector() {
    const buttons = document.querySelectorAll('[data-eye-mode]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        buttons.forEach(b => b.classList.remove('active', 'btn-primary-custom'));
        buttons.forEach(b => b.classList.add('btn-secondary-custom'));
        
        btn.classList.remove('btn-secondary-custom');
        btn.classList.add('active', 'btn-primary-custom');

        this.mode = btn.getAttribute('data-eye-mode');
        this.updateDropzoneVisibility();
      });
    });
  },

  updateDropzoneVisibility() {
    const leftContainer = document.getElementById('container-left-eye');
    const rightContainer = document.getElementById('container-right-eye');

    if (this.mode === 'left') {
      leftContainer?.classList.remove('d-none');
      rightContainer?.classList.add('d-none');
    } else if (this.mode === 'right') {
      leftContainer?.classList.add('d-none');
      rightContainer?.classList.remove('d-none');
    } else {
      leftContainer?.classList.remove('d-none');
      rightContainer?.classList.remove('d-none');
    }
  },

  setupDropzone(eyeSide) {
    const dropzone = document.getElementById(`dropzone-${eyeSide}`);
    const fileInput = document.getElementById(`file-input-${eyeSide}`);
    const previewContainer = document.getElementById(`preview-${eyeSide}`);
    const previewImg = document.getElementById(`img-preview-${eyeSide}`);

    if (!dropzone || !fileInput) return;

    // Click to choose file
    dropzone.addEventListener('click', (e) => {
      if (e.target.closest('.remove-btn')) return;
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFileSelect(file, eyeSide);
    });

    // Drag & Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) this.handleFileSelect(file, eyeSide);
    });

    // Remove file button
    const removeBtn = previewContainer?.querySelector('.remove-btn');
    removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearEyeFile(eyeSide);
    });
  },

  handleFileSelect(file, eyeSide) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      App.showToast('Invalid file format. Please upload JPG, JPEG, or PNG.', 'error');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      App.showToast('File size exceeds 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const previewContainer = document.getElementById(`preview-${eyeSide}`);
      const previewImg = document.getElementById(`img-preview-${eyeSide}`);
      const dropContent = document.getElementById(`drop-content-${eyeSide}`);

      if (previewImg && previewContainer) {
        previewImg.src = e.target.result;
        previewContainer.classList.remove('d-none');
        if (dropContent) dropContent.classList.add('d-none');
      }

      if (eyeSide === 'left') this.leftFile = file;
      if (eyeSide === 'right') this.rightFile = file;

      App.showToast(`${eyeSide.toUpperCase()} Eye image loaded cleanly`, 'success');
    };
    reader.readAsDataURL(file);
  },

  clearEyeFile(eyeSide) {
    const fileInput = document.getElementById(`file-input-${eyeSide}`);
    const previewContainer = document.getElementById(`preview-${eyeSide}`);
    const dropContent = document.getElementById(`drop-content-${eyeSide}`);

    if (fileInput) fileInput.value = '';
    if (previewContainer) previewContainer.classList.add('d-none');
    if (dropContent) dropContent.classList.remove('d-none');

    if (eyeSide === 'left') this.leftFile = null;
    if (eyeSide === 'right') this.rightFile = null;
  },

  bindUploadAction() {
    const analyzeBtn = document.getElementById('start-analysis-btn');
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener('click', () => {
      if (this.mode === 'left' && !this.leftFile) {
        App.showToast('Please upload an image of the Left Eye', 'error');
        return;
      }
      if (this.mode === 'right' && !this.rightFile) {
        App.showToast('Please upload an image of the Right Eye', 'error');
        return;
      }
      if (this.mode === 'both' && (!this.leftFile && !this.rightFile)) {
        App.showToast('Please upload at least one eye image', 'error');
        return;
      }

      Prediction.startAnalysisProcess({
        mode: this.mode,
        leftFile: this.leftFile,
        rightFile: this.rightFile
      });
    });
  }
};
