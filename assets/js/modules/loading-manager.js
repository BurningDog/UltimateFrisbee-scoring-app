import { CONFIG } from '../config.js';

// =====================================================
// LOADING MANAGER - Same as before
// =====================================================
export class LoadingManager {
  constructor() {
    this.loadingInterval = null;
  }

  start() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    const dots = document.getElementById('dots');

    if (!loadingAnimation || !dots) return;

    let dotCount = 0;
    loadingAnimation.style.display = 'block';

    this.loadingInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      dots.textContent = '.'.repeat(dotCount);
    }, CONFIG.LOADING_ANIMATION_INTERVAL);
  }

  stop() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    const dots = document.getElementById('dots');

    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }

    if (loadingAnimation) loadingAnimation.style.display = 'none';
    if (dots) dots.textContent = '';
  }
}
