Frontend Requirements and Setup

This document describes the recommended runtime, libraries, developer tools, and setup steps for the frontend portion of the project (templates, static assets, and client-side scripts).

1. Goals
- Provide clear list of runtime and tooling requirements for frontend developers.
- Give quick setup commands for local development and basic production build recommendations.

2. Prerequisites
- Node.js (LTS recommended): 18.x or later
  - Verify: node -v
- npm (comes with Node) or yarn (optional)
  - Verify: npm -v
- A modern browser for development: Chrome, Firefox, Edge, Safari (latest stable)
- Optional: Python and Flask if serving templates via backend (project uses Jinja-style templates under frontend/templates)
  - Python 3.8+ recommended
  - Verify: python --version or python3 --version

3. Recommended Frontend Tooling
- Package manager: npm (recommended) or yarn
- Dev server / bundler / build tools (choose one):
  - Vite (fast, modern): https://vitejs.dev/
  - Parcel (zero-config): https://parceljs.org/
  - Webpack (flexible, mature): https://webpack.js.org/
- Linter / Formatter:
  - ESLint (JS linting)
  - Prettier (code formatting)
- CSS linting (optional): stylelint
- Testing (optional):
  - Unit tests: Jest (for JS logic)
  - End-to-end tests: Cypress or Playwright

4. Typical Frontend Dependencies (examples)
- axios — XHR/fetch helper for HTTP requests
- lottie-web — for Lottie animations used in assets/lottie/
- chart.js (or charting lib of choice) — for analytics and charts
- bootstrap or tailwindcss — optional UI frameworks if used
- sweetalert2 — for nicer alerts/modals (optional)
- any icon libraries used (Font Awesome, heroicons, etc.)

Example install (npm):
- Initialize (if package.json not present):
  npm init -y

- Install common runtime deps:
  npm install axios lottie-web chart.js

- Install recommended dev tools:
  npm install --save-dev vite eslint prettier stylelint

5. Serving during development
- If using a bundler/dev server (Vite/Parcel/Webpack dev server):
  - Start the dev server per the chosen tool (e.g. for Vite: npx vite)
- If integrating with a backend (Flask / Django):
  - Run the backend server (e.g. flask run or python app.py) and point it to serve templates from the frontend/templates and static files from frontend/static.
  - Common Flask static/template configuration:
    - templates folder: frontend/templates
    - static folder: frontend/static

6. Build / Production
- Configure chosen bundler to output built assets into a folder the backend expects (e.g., backend/static or frontend/static/dist). Example with Vite: set base and build.outDir in vite.config.js.
- Minify assets, fingerprint (content-hash) filenames for caching, and generate a small manifest if backend needs to reference hashed filenames.

7. Asset recommendations
- Images: keep optimized WebP and compressed PNG/JPEG under frontend/static/images and uploads.
- SVGs: keep source SVGs in frontend/static/icons/svg and run svgo to optimize
- Lottie: store JSON in frontend/assets/lottie and load with lottie-web
- Fonts: use Google Fonts or self-host under frontend/static/fonts

8. Accessibility & Responsive
- Ensure templates and components follow accessibility best practices (aria attributes, semantic markup, focus states).
- Use responsive breakpoints and test on mobile/tablet/desktop.

9. Development scripts (suggested package.json scripts)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx",
    "format": "prettier --write ."
  }
}

10. Optional CI checks
- Linting and basic build on push (GitHub Actions or any CI):
  - Run: npm ci && npm run lint && npm run build

11. Browser support
- Target evergreen browsers (latest stable Chrome/Firefox/Edge/Safari). If older browsers must be supported, add polyfills via core-js or configure bundler transpilation.

12. Notes about integration with this repository
- The frontend folder contains Jinja-style templates under frontend/templates and static assets under frontend/static. If the backend is Flask, ensure Flask's template_folder and static_folder point to these locations when creating the Flask app.
- If a separate frontend-only dev server is used (Vite/Parcel), configure proxying for API calls to the backend (e.g., /api -> http://localhost:5000) to avoid CORS issues during development.

13. Helpful command checklist
- Install Node dependencies: npm install
- Start dev server (Vite example): npm run dev
- Run linter: npm run lint
- Build production assets: npm run build

14. Contact / contributor notes
- Document any project-specific frontend dependency choices in this file as the project evolves (package names and pinned versions). Keep this file up to date whenever new global tooling or critical libraries are added.

---
Generated: requirements.md — frontend
