# AI-Based Eye Disease Detection & Eye Care Recommendation System — Frontend

This directory contains the production-ready frontend for the **AI-Based Eye Disease Detection and Eye Care Recommendation System**.

## 🌟 Key Features

1. **Responsive Modern Healthcare UI**:
   - Built with HTML5, CSS3 variables, Bootstrap 5, FontAwesome 6, and Google Fonts (Outfit & Inter).
   - Glassmorphic accents, dark/light theme switching, smooth keyframe animations, and custom healthcare color system.

2. **Landing Page**:
   - Hero banner, interactive workflow steps, supported diseases cards, FAQ accordion, team section, and contact footer.

3. **Authentication & Google OAuth**:
   - Login & Register modals, JWT token handling, Google OAuth sign-in flow simulation, user profile manager, and Role Switcher (User vs Admin mode).

4. **BMI Health Assessment**:
   - Automatic post-login popup modal and inline calculator.
   - Formula: `BMI = Weight / (Height in meters)²`.
   - Real-time category classification (Underweight, Normal, Overweight, Obese) with ocular health tips.

5. **Eye Image Upload**:
   - Mode selection (Left Eye, Right Eye, Both Eyes).
   - Drag-and-drop file dropzones with JPEG, JPG, PNG validation (Max 5MB).
   - Real-time thumbnail preview and remove controls.

6. **AI Prediction & Clinical Guidance**:
   - Connects to `/predict` backend endpoint or executes high-precision client inference fallback.
   - Independent left and right eye condition detection with confidence scores for Cataract, Glaucoma, Diabetic Retinopathy, AMD, Conjunctivitis, and Normal eyes.
   - Detailed clinical breakdown: Symptoms, General Treatment Guidance, Prevention Tips, and Lifestyle Advice.
   - **Strict Medical Safety Safeguards**: Mandates medical disclaimers; strictly prohibits prescriptions for medicines, surgeries, or bionic eyes.

7. **Doctor Recommendation**:
   - Leverages Google Maps Places API location structure to present nearby ophthalmology centers and eye hospitals with directions, ratings, and contact info.

8. **Google Gemini AI Chatbot**:
   - Floating chat widget with quick suggestion chips, conversation history, context memory, and strict medical boundaries.

9. **User Dashboard & Analytics**:
   - Key metric cards and interactive Chart.js visualizations (Scan trend line chart, disease prevalence doughnut chart).

10. **Scan History & PDF Reports**:
    - Search, filter, pagination, details view, record deletion, and professional printable PDF report generator.

11. **Admin Dashboard**:
    - High-level KPIs, global disease prevalence charts, user account management, prediction logs, doctor recommendation manager, and user feedback resolution.

---

## 🚀 How to Run

### Option A: Independent Frontend Preview (No Backend Required)
Simply open `frontend/index.html` in any web browser or serve locally:
```bash
npx serve .
```

### Option B: Integrated Flask / Jinja2 Backend
Point Flask's `template_folder` to `frontend/templates` and `static_folder` to `frontend/static`:
```python
app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
```
Run `python app.py` from the `backend/` directory.
