import { CONFIG } from './config.js';

// =====================================================
// PERSISTENCE MANAGER - Handles all data persistence
// =====================================================
export class PersistenceManager {
  constructor() {
    this.autoSaveInterval = null;
    this.lastSaveTime = 0;
  }

  /**
   * Save data to localStorage with error handling
   */
  saveToStorage(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      this.lastSaveTime = Date.now();
      localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_SAVE, this.lastSaveTime.toString());
      return true;
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      // Try to free up space by removing old data
      this.cleanupOldData();
      try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
        return true;
      } catch (retryError) {
        console.error(`Retry failed for ${key}:`, retryError);
        return false;
      }
    }
  }

  /**
   * Load data from localStorage
   */
  loadFromStorage(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return fallback;
    }
  }

  /**
   * Save complete game state
   */
  saveGameState(gameState) {
    return this.saveToStorage(CONFIG.STORAGE_KEYS.GAME_STATE, {
      ...gameState,
      timestamp: Date.now()
    });
  }

  /**
   * Load complete game state
   */
  loadGameState() {
    const defaultState = {
      teamAScore: 0,
      teamBScore: 0,
      teamAName: '',
      teamBName: '',
      teamAPlayers: '',
      teamBPlayers: '',
      gameTime: '',
      matchDuration: CONFIG.DEFAULT_TIMER_MINUTES,
      halftimeDuration: 55,
      halftimeBreakDuration: 7,
      timeoutDuration: 75,
      timeoutsTotal: 2,
      timeoutsPerHalf: 0,
      abbaStart: 'NONE',
      stoppageActive: false,
      timeoutState: {
        A: { totalRemaining: 2, halfRemaining: 2 },
        B: { totalRemaining: 2, halfRemaining: 2 }
      },
      halftimeReasonResolved: null,
      scoreLogs: [],
      matchStarted: false,
      timestamp: Date.now()
    };

    return this.loadFromStorage(CONFIG.STORAGE_KEYS.GAME_STATE, defaultState);
  }

  /**
   * Save teams data with expiration
   */
  saveTeamsData(teamsData) {
    const dataWithExpiry = {
      data: teamsData,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    return this.saveToStorage(CONFIG.STORAGE_KEYS.TEAMS_DATA, dataWithExpiry);
  }

  /**
   * Load teams data (check expiration)
   */
  loadTeamsData() {
    const storedData = this.loadFromStorage(CONFIG.STORAGE_KEYS.TEAMS_DATA);

    if (!storedData) return null;

    // Check if data has expired
    if (Date.now() > storedData.expiresAt) {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.TEAMS_DATA);
      return null;
    }

    return storedData.data;
  }

  /**
   * Start auto-save functionality
   */
  startAutoSave(saveCallback) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      if (typeof saveCallback === 'function') {
        saveCallback();
      }
    }, CONFIG.AUTO_SAVE_INTERVAL);
  }

  /**
   * Stop auto-save
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Clean up old data to free space
   */
  cleanupOldData() {
    try {
      // Remove expired teams data
      const teamsData = this.loadFromStorage(CONFIG.STORAGE_KEYS.TEAMS_DATA);
      if (teamsData && Date.now() > teamsData.expiresAt) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TEAMS_DATA);
      }

      // Remove very old game states (older than 7 days)
      const gameState = this.loadFromStorage(CONFIG.STORAGE_KEYS.GAME_STATE);
      if (gameState && gameState.timestamp && (Date.now() - gameState.timestamp) > (7 * 24 * 60 * 60 * 1000)) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.GAME_STATE);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo() {
    let totalSize = 0;
    let itemCount = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
        itemCount++;
      }
    }

    return {
      totalSize: totalSize,
      itemCount: itemCount,
      lastSave: this.loadFromStorage(CONFIG.STORAGE_KEYS.LAST_SAVE)
    };
  }

  /**
   * Clear all app data
   */
  clearAllData() {
    Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    sessionStorage.clear();
  }
}
