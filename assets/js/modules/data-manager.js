import { CONFIG } from './config.js';

// =====================================================
// DATA MANAGER - Enhanced with persistence
// =====================================================
export class DataManager {
  constructor(persistenceManager) {
    this.persistenceManager = persistenceManager;
    this.teamsData = {};
    this.scoreLogs = [];
    this.gameState = {};
    this.isDirty = false; // Track if data needs saving

    this.loadAllData();
  }

  /**
   * Load all persisted data
   */
  loadAllData() {
    // Load game state
    this.gameState = this.persistenceManager.loadGameState();
    this.scoreLogs = this.gameState.scoreLogs || [];

    // Load teams data
    const cachedTeamsData = this.persistenceManager.loadTeamsData();
    if (cachedTeamsData) {
      this.teamsData = cachedTeamsData;
    }
  }

  /**
   * Save current state
   */
  saveCurrentState() {
    if (!this.isDirty) return;

    const success = this.persistenceManager.saveGameState(this.gameState);
    if (success) {
      this.isDirty = false;
    }
    return success;
  }

  /**
   * Mark data as dirty (needs saving)
   */
  markDirty() {
    this.isDirty = true;
  }

  /**
   * Update game state
   */
  updateGameState(updates) {
    Object.assign(this.gameState, updates);
    this.markDirty();
  }

  /**
   * Add new score log
   */
  addScoreLog(logEntry) {
    this.scoreLogs.push(logEntry);
    this.gameState.scoreLogs = this.scoreLogs;
    this.markDirty();
  }

  /**
   * Update existing score log
   */
  updateScoreLog(scoreID, updates) {
    const index = this.scoreLogs.findIndex(log => log.scoreID === scoreID);
    if (index !== -1) {
      Object.assign(this.scoreLogs[index], updates);
      this.gameState.scoreLogs = this.scoreLogs;
      this.markDirty();
      return true;
    }
    return false;
  }

  /**
   * Get score log by ID
   */
  getScoreLog(scoreID) {
    return this.scoreLogs.find(log => log.scoreID === scoreID);
  }

  /**
   * Clear all score logs
   */
  clearScoreLogs() {
    this.scoreLogs = [];
    this.gameState.scoreLogs = [];
    this.markDirty();
  }

  /**
   * Get teams data
   */
  getTeamsData() {
    return this.teamsData;
  }

  /**
   * Set teams data
   */
  setTeamsData(data) {
    this.teamsData = data || {};
    this.persistenceManager.saveTeamsData(this.teamsData);
  }

  /**
   * Remove a score log by ID
   */
  removeScoreLog(scoreID) {
    const index = this.scoreLogs.findIndex(log => log.scoreID === scoreID);
    if (index === -1) return null;
    const [removed] = this.scoreLogs.splice(index, 1);
    this.gameState.scoreLogs = this.scoreLogs;
    this.markDirty();
    return removed;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Reset game state
   */
  resetGameState() {
    this.gameState = {
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
    this.scoreLogs = [];
    this.markDirty();
  }
}
