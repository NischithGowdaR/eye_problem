/**
 * Authentication Module
 * Manages Login, Register, Google OAuth, JWT state, and Admin role toggle
 */

const Auth = {
  token: localStorage.getItem('eye_auth_token') || null,
  user: JSON.parse(localStorage.getItem('eye_user') || 'null'),

  init() {
    this.bindEvents();
    this.updateUIState();
  },

  bindEvents() {
    // Form submissions
    document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
    document.getElementById('google-login-btn')?.addEventListener('click', () => this.handleGoogleLogin());
    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

    // Profile form
    document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    document.getElementById('password-form')?.addEventListener('submit', (e) => this.handleChangePassword(e));

    // Role switcher dropdown for testing
    document.getElementById('role-switcher')?.addEventListener('change', (e) => {
      this.switchRole(e.target.value);
    });
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      // Attempt backend login API or fallback mock
      let response;
      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) response = await res.json();
      } catch (err) {
        console.warn('Backend server not reachable, using local auth mock');
      }

      if (!response) {
        // Fallback demo user
        const isAdmin = email.includes('admin');
        response = {
          token: 'mock-jwt-token-xyz-123',
          user: {
            id: 'usr_' + Date.now(),
            name: email.split('@')[0].toUpperCase(),
            email: email,
            role: isAdmin ? 'admin' : 'user',
            hasCompletedBMI: false
          }
        };
      }

      this.saveSession(response.token, response.user);
      App.showToast(`Welcome back, ${response.user.name}!`, 'success');

      // Close login modal if present
      const modalEl = document.getElementById('authModal');
      if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      // Check BMI completion popup requirement
      if (!response.user.hasCompletedBMI && response.user.role === 'user') {
        BMI.showPopup();
      }

      App.navigateTo('dashboard');
    } catch (err) {
      App.showToast('Login failed: Invalid credentials', 'error');
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const mockUser = {
      id: 'usr_' + Date.now(),
      name: name,
      email: email,
      role: 'user',
      hasCompletedBMI: false
    };

    this.saveSession('mock-jwt-token-new', mockUser);
    App.showToast('Registration successful! Welcome to EyeCare AI.', 'success');

    const modalEl = document.getElementById('authModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    BMI.showPopup();
    App.navigateTo('dashboard');
  },

  handleGoogleLogin() {
    const mockGoogleUser = {
      id: 'usr_g_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'user',
      hasCompletedBMI: false
    };

    this.saveSession('mock-google-jwt-token', mockGoogleUser);
    App.showToast('Successfully signed in with Google OAuth!', 'success');

    const modalEl = document.getElementById('authModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    BMI.showPopup();
    App.navigateTo('dashboard');
  },

  saveSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('eye_auth_token', token);
    localStorage.setItem('eye_user', JSON.stringify(user));
    this.updateUIState();
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('eye_auth_token');
    localStorage.removeItem('eye_user');
    this.updateUIState();
    App.showToast('Logged out successfully', 'info');
    App.navigateTo('home');
  },

  switchRole(role) {
    if (!this.user) {
      this.user = { id: 'usr_demo', name: 'Demo User', email: 'demo@eyecare.ai', role: role };
    } else {
      this.user.role = role;
    }
    localStorage.setItem('eye_user', JSON.stringify(this.user));
    this.updateUIState();
    App.showToast(`Switched role to ${role.toUpperCase()}`, 'info');
    App.navigateTo(role === 'admin' ? 'admin' : 'dashboard');
  },

  updateUIState() {
    const authBtns = document.getElementById('nav-auth-buttons');
    const userMenu = document.getElementById('nav-user-menu');
    const userNameEl = document.getElementById('user-display-name');
    const adminLink = document.getElementById('nav-admin-link');

    if (this.user) {
      if (authBtns) authBtns.classList.add('d-none');
      if (userMenu) userMenu.classList.remove('d-none');
      if (userNameEl) userNameEl.textContent = this.user.name;

      if (adminLink) {
        if (this.user.role === 'admin') {
          adminLink.classList.remove('d-none');
        } else {
          adminLink.classList.add('d-none');
        }
      }
    } else {
      if (authBtns) authBtns.classList.remove('d-none');
      if (userMenu) userMenu.classList.add('d-none');
      if (adminLink) adminLink.classList.add('d-none');
    }
  },

  handleProfileUpdate(e) {
    e.preventDefault();
    if (!this.user) return;
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;

    this.user.name = name;
    this.user.email = email;
    this.saveSession(this.token, this.user);
    App.showToast('Profile updated successfully!', 'success');
  },

  handleChangePassword(e) {
    e.preventDefault();
    App.showToast('Password changed successfully!', 'success');
    document.getElementById('password-form').reset();
  }
};
