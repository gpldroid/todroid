(function () {
  'use strict';

  const storage = {
    getItem(key, fallback = null) {
      try {
        const value = window.localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (error) {
        return fallback;
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, String(value));
        return true;
      } catch (error) {
        return false;
      }
    },
    removeItem(key) {
      try {
        window.localStorage.removeItem(key);
        return true;
      } catch (error) {
        return false;
      }
    },
    getJSON(key, fallback = []) {
      const raw = this.getItem(key);
      if (!raw) return fallback;
      try {
        return JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    setJSON(key, value) {
      return this.setItem(key, JSON.stringify(value));
    }
  };

  const normalizeUrl = (value) => {
    if (!value || typeof value !== 'string') return 'https://example.com';
    const trimmed = value.trim();
    if (!trimmed) return 'https://example.com';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const safeElement = (id) => document.getElementById(id);

  const safeSetValue = (id, value) => {
    const el = safeElement(id);
    if (el && 'value' in el) {
      el.value = value;
      return true;
    }
    return false;
  };

  const registerGlobalErrorHandlers = () => {
    window.addEventListener('error', (event) => {
      console.warn('Global error caught:', event.message);
    });
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Unhandled promise rejection:', event.reason);
    });
  };

  window.web2appCore = {
    storage,
    normalizeUrl,
    safeElement,
    safeSetValue,
    registerGlobalErrorHandlers
  };

  registerGlobalErrorHandlers();
})();
