import { ScorekeeperApp } from './modules/scorekeeper-app.js';
import { Utils } from './modules/utils.js';

// =====================================================
// APPLICATION INITIALIZATION
// =====================================================
let app;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    app = new ScorekeeperApp();
    await app.init();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    Utils.showNotification('Failed to initialize application. Please refresh the page.', 'error');
  }
});

// Make app instance available globally for debugging
window.ScorekeeperApp = app;
