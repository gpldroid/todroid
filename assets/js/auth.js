/**
 * Web2App Studio Pro - Authentication & Session Management v1.0
 * Handles user sessions, login/logout, and download permissions
 */
(function () {
  'use strict';

  const core = window.web2appCore || {};
  const storage = core.storage || {
    getItem: (key, fallback = null) => {
      try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    setItem: (key, value) => {
      try { window.localStorage.setItem(key, String(value)); return true; } catch { return false; }
    },
    removeItem: (key) => {
      try { window.localStorage.removeItem(key); return true; } catch { return false; }
    },
    getJSON: (key, fallback = {}) => {
      try {
        const raw = storage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    setJSON: (key, value) => storage.setItem(key, JSON.stringify(value))
  };

  const AUTH_KEY = 'web2app-auth-session';
  const AUTH_TOKEN_KEY = 'web2app-auth-token';
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  const auth = {
    isAuthenticated: false,
    user: null,
    token: null,

    init: function () {
      this.restoreSession();
      this.setupAuthUI();
    },

    restoreSession: function () {
      const session = storage.getJSON(AUTH_KEY);
      const token = storage.getItem(AUTH_TOKEN_KEY);

      if (session && token && !this.isSessionExpired(session)) {
        this.user = session.user;
        this.token = token;
        this.isAuthenticated = true;
        this.updateAuthUI();
      } else {
        this.logout();
      }
    },

    isSessionExpired: function (session) {
      const createdAt = session.createdAt || Date.now();
      return Date.now() - createdAt > SESSION_TIMEOUT;
    },

    login: async function (email, password) {
      if (!email || !password) {
        this.showAuthMessage('Please enter both email and password', 'error');
        return false;
      }

      if (!this.validateEmail(email)) {
        this.showAuthMessage('Please enter a valid email address', 'error');
        return false;
      }

      const loginBtn = document.getElementById('auth-login-btn');
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
      }

      try {
        // Simulated authentication - In production, connect to a real auth service
        const token = this.generateToken(email);
        const user = {
          email: email,
          name: email.split('@')[0],
          loginTime: new Date().toLocaleString()
        };

        const session = {
          user: user,
          createdAt: Date.now(),
          expiresAt: Date.now() + SESSION_TIMEOUT
        };

        storage.setJSON(AUTH_KEY, session);
        storage.setItem(AUTH_TOKEN_KEY, token);

        this.user = user;
        this.token = token;
        this.isAuthenticated = true;

        this.updateAuthUI();
        this.closeAuthModal();
        this.showAuthMessage(`Welcome, ${user.name}!`, 'success');
        return true;
      } catch (error) {
        this.showAuthMessage('Authentication failed: ' + error.message, 'error');
        return false;
      } finally {
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = '<i class="fa-solid fa-sign-in-alt mr-1.5"></i> Sign In';
        }
      }
    },

    logout: function () {
      storage.removeItem(AUTH_KEY);
      storage.removeItem(AUTH_TOKEN_KEY);
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.updateAuthUI();
      this.showAuthMessage('You have been signed out', 'info');
    },

    validateEmail: function (email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    generateToken: function (email) {
      return btoa(email + ':' + Date.now() + ':' + Math.random()).replace(/[^a-z0-9]/gi, '').substring(0, 32);
    },

    setupAuthUI: function () {
      const loginBtn = document.getElementById('auth-trigger-login');
      const logoutBtn = document.getElementById('auth-logout-btn');
      const authModal = document.getElementById('auth-modal');
      const closeAuthBtn = document.getElementById('auth-close-modal');
      const loginFormBtn = document.getElementById('auth-login-btn');

      if (loginBtn) {
        loginBtn.addEventListener('click', () => this.openAuthModal());
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to sign out?')) {
            this.logout();
          }
        });
      }

      if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => this.closeAuthModal());
      }

      if (authModal) {
        authModal.addEventListener('click', (e) => {
          if (e.target === authModal) this.closeAuthModal();
        });
      }

      if (loginFormBtn) {
        loginFormBtn.addEventListener('click', () => this.handleLoginSubmit());
      }

      const emailInput = document.getElementById('auth-email-input');
      const passwordInput = document.getElementById('auth-password-input');
      if (emailInput && passwordInput) {
        [emailInput, passwordInput].forEach(input => {
          input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLoginSubmit();
          });
        });
      }
    },

    handleLoginSubmit: function () {
      const email = document.getElementById('auth-email-input')?.value || '';
      const password = document.getElementById('auth-password-input')?.value || '';
      this.login(email, password);
    },

    openAuthModal: function () {
      const modal = document.getElementById('auth-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('auth-email-input')?.focus();
      }
    },

    closeAuthModal: function () {
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.add('hidden');
      // Clear form
      const emailInput = document.getElementById('auth-email-input');
      const passwordInput = document.getElementById('auth-password-input');
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    },

    updateAuthUI: function () {
      const authTrigger = document.getElementById('auth-trigger-login');
      const userProfile = document.getElementById('auth-user-profile');
      const userName = document.getElementById('auth-user-name');
      const userEmail = document.getElementById('auth-user-email');
      const logoutBtn = document.getElementById('auth-logout-btn');

      if (this.isAuthenticated && this.user) {
        if (authTrigger) authTrigger.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        if (userName) userName.textContent = this.user.name || 'User';
        if (userEmail) userEmail.textContent = this.user.email || '';
      } else {
        if (authTrigger) authTrigger.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
      }
    },

    showAuthMessage: function (msg, type = 'info') {
      if (typeof showToast === 'function') {
        showToast(msg, type);
      } else {
        console.log(`[${type.toUpperCase()}] ${msg}`);
      }
    },

    canDownload: function () {
      return this.isAuthenticated;
    }
  };

  window.web2appAuth = auth;
  window.addEventListener('DOMContentLoaded', () => auth.init());
})();
