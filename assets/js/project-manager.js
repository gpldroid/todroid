/**
 * Web2App Studio Pro - Project Management Module v2.0
 * Handles project persistence, export, and cloud-ready structure
 */
(function () {
  'use strict';

  const core = window.web2appCore || {};
  const storage = core.storage || {};
  const PROJECTS_KEY = 'web2app-projects-v2';
  const MAX_PROJECTS = 50;

  const projectManager = {
    projects: [],

    init: function () {
      this.loadProjects();
      this.setupExportHandlers();
    },

    loadProjects: function () {
      try {
        this.projects = storage.getJSON(PROJECTS_KEY, []);
      } catch (error) {
        console.error('Failed to load projects:', error);
        this.projects = [];
      }
    },

    saveProjects: function () {
      try {
        storage.setJSON(PROJECTS_KEY, this.projects.slice(0, MAX_PROJECTS));
        return true;
      } catch (error) {
        console.error('Failed to save projects:', error);
        return false;
      }
    },

    createProject: function (config) {
      if (!config.name || !config.url) {
        return null;
      }

      const project = {
        id: this.generateId(),
        name: config.name,
        url: config.url,
        package: config.package || 'com.web2app.app',
        version: config.version || '1.0.0',
        color: config.color || '#4f46e5',
        icon: config.icon || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft'
      };

      this.projects.unshift(project);
      this.saveProjects();
      return project;
    },

    updateProject: function (id, updates) {
      const project = this.projects.find(p => p.id === id);
      if (!project) return null;

      Object.assign(project, updates, { updatedAt: new Date().toISOString() });
      this.saveProjects();
      return project;
    },

    deleteProject: function (id) {
      const index = this.projects.findIndex(p => p.id === id);
      if (index === -1) return false;

      this.projects.splice(index, 1);
      this.saveProjects();
      return true;
    },

    getProject: function (id) {
      return this.projects.find(p => p.id === id);
    },

    getAllProjects: function () {
      return this.projects;
    },

    generateId: function () {
      return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    exportProjectAsJSON: function (id) {
      const project = this.getProject(id);
      if (!project) return null;

      const dataStr = JSON.stringify(project, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return true;
    },

    importProjectFromJSON: function (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const project = JSON.parse(e.target.result);
            if (!project.name || !project.url) {
              reject(new Error('Invalid project file'));
              return;
            }
            const newProject = this.createProject(project);
            resolve(newProject);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    },

    setupExportHandlers: function () {
      // Export/Import handlers can be added here
    },

    clearAllProjects: function () {
      if (confirm('Are you sure you want to delete all projects? This cannot be undone.')) {
        this.projects = [];
        this.saveProjects();
        return true;
      }
      return false;
    }
  };

  window.projectManager = projectManager;
  window.addEventListener('DOMContentLoaded', () => projectManager.init());
})();
