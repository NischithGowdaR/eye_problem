/**
 * PDF Report Generation Module
 * Formats & triggers printable PDF download for eye screening reports
 */

const PDFModule = {
  generateReport(analysisData) {
    if (!analysisData) {
      App.showToast('No analysis report data available', 'error');
      return;
    }

    const patient = Auth.user || { name: 'John Doe', email: 'patient@example.com' };
    const bmiRecord = BMI.currentRecord || { bmi: '22.5', category: 'Normal Weight' };

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      App.showToast('Please allow popups to view/print PDF report', 'error');
      return;
    }

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EyeCare AI - Clinical Screening Report #${analysisData.id}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; padding: 2rem; color: #1e293b; }
          .header-banner { border-bottom: 3px solid #0f766e; padding-bottom: 1rem; margin-bottom: 2rem; }
          .badge-normal { background-color: #d1fae5; color: #059669; }
          .badge-warning { background-color: #fef3c7; color: #d97706; }
          .badge-danger { background-color: #ffe4e6; color: #e11d48; }
          .disclaimer-box { background-color: #fff7ed; border-left: 4px solid #d97706; padding: 1rem; margin-top: 2rem; }
          @media print {
            .btn-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container max-w-4xl">
          <!-- Action bar -->
          <div class="d-flex justify-content-between align-items-center mb-4 btn-print">
            <button onclick="window.close()" class="btn btn-outline-secondary">Close</button>
            <button onclick="window.print()" class="btn btn-primary bg-teal border-0" style="background-color: #0f766e;">
              Print / Save as PDF
            </button>
          </div>

          <!-- Document Header -->
          <div class="header-banner d-flex justify-content-between align-items-center">
            <div>
              <h2 style="font-family: 'Outfit'; color: #0f766e; font-weight: 700;">👁️ EyeCare AI Systems</h2>
              <p class="text-muted small mb-0">Automated Preliminary Ophthalmic Screening Report</p>
            </div>
            <div class="text-end">
              <div class="fw-bold">Report ID: ${analysisData.id}</div>
              <div class="text-muted small">Date: ${analysisData.timestamp}</div>
            </div>
          </div>

          <!-- Patient & BMI Meta -->
          <div class="row bg-light p-3 rounded mb-4 border">
            <div class="col-md-6">
              <h6 class="fw-bold text-teal">Patient Information</h6>
              <div class="small">Name: <strong>${patient.name}</strong></div>
              <div class="small">Email: ${patient.email}</div>
            </div>
            <div class="col-md-6 text-md-end">
              <h6 class="fw-bold text-teal">Physical Metrics</h6>
              <div class="small">BMI Score: <strong>${bmiRecord.bmi}</strong></div>
              <div class="small">Status: <span class="badge ${bmiRecord.badgeClass}">${bmiRecord.category}</span></div>
            </div>
          </div>

          <!-- Screening Results -->
          <h4 class="fw-bold mb-3" style="color: #0f766e;">Preliminary AI Inference Results</h4>
          <div class="row g-4 mb-4">
            ${analysisData.leftEye ? `
              <div class="col-6">
                <div class="border p-3 rounded text-center">
                  <h5 class="fw-bold">Left Eye</h5>
                  ${analysisData.leftEye.image ? `<img src="${analysisData.leftEye.image}" style="max-height:140px;" class="img-fluid rounded mb-2">` : ''}
                  <div class="badge ${analysisData.leftEye.details.badgeClass} mb-1">${analysisData.leftEye.condition}</div>
                  <div class="h5 fw-bold">${analysisData.leftEye.confidence}% Confidence</div>
                </div>
              </div>
            ` : ''}

            ${analysisData.rightEye ? `
              <div class="col-6">
                <div class="border p-3 rounded text-center">
                  <h5 class="fw-bold">Right Eye</h5>
                  ${analysisData.rightEye.image ? `<img src="${analysisData.rightEye.image}" style="max-height:140px;" class="img-fluid rounded mb-2">` : ''}
                  <div class="badge ${analysisData.rightEye.details.badgeClass} mb-1">${analysisData.rightEye.condition}</div>
                  <div class="h5 fw-bold">${analysisData.rightEye.confidence}% Confidence</div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Disease Information -->
          ${(() => {
            const details = (analysisData.leftEye && analysisData.leftEye.details) || (analysisData.rightEye && analysisData.rightEye.details);
            if (!details) return '';
            return `
              <div class="border p-3 rounded mb-4">
                <h5 class="fw-bold text-dark mb-2">Condition Overview: ${details.name}</h5>
                <p class="small text-muted mb-3">${details.description}</p>
                <div class="row small">
                  <div class="col-6">
                    <strong>Recognized Symptoms:</strong>
                    <ul>${details.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
                  </div>
                  <div class="col-6">
                    <strong>Prevention & Guidance:</strong>
                    <ul>${details.prevention.map(p => `<li>${p}</li>`).join('')}</ul>
                  </div>
                </div>
              </div>
            `;
          })()}

          <!-- Legal Medical Disclaimer -->
          <div class="disclaimer-box rounded">
            <h6 class="fw-bold text-dark mb-1">MANDATORY MEDICAL DISCLAIMER</h6>
            <p class="small text-muted mb-0">
              This document contains preliminary automated computer vision analysis. 
              It does NOT constitute a binding medical diagnosis, prescription for medicine, or surgical advice. 
              Please present this report to a board-certified ophthalmologist for clinical examination.
            </p>
          </div>

          <!-- Footer Signature -->
          <div class="d-flex justify-content-between align-items-center mt-5 pt-3 border-top text-muted small">
            <div>EyeCare AI Web System v1.0 - Automated Medical Reporting</div>
            <div>Digitally Verified Document</div>
          </div>
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  }
};
