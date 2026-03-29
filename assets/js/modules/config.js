
// =====================================================
// CONSTANTS AND CONFIGURATION
// =====================================================
export const CONFIG = {
  // API_URL has a demo link
  API_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFk92HGZeA1axdOam7-jS1J-dmMBi2qhgHW4BuDEEPgt2FbiS2LUp2ZuoCd55mT2qyLR3qpomN9Xbo/pub?gid=0&single=true&output=csv",
  SUBMIT_URL: "URL_TO_POST_DATA",
  DEFAULT_TIMER_MINUTES: 100,
  LOADING_ANIMATION_INTERVAL: 500,
  AUTO_SAVE_INTERVAL: 2000, // Auto-save every 2 seconds
  HALFTIME_SCORE_TARGET: 8, // Trigger halftime once a single team reaches this score
  STORAGE_KEYS: {
    SCORE_LOGS: 'scoreLogs',
    TIMER_END_TIME: 'timerEndTime',
    TIMER_RUNNING: 'timerRunning',
    GAME_STATE: 'gameState',
    TEAMS_DATA: 'teamsData',
    LAST_SAVE: 'lastSave'
  }
};

export const SPECIAL_OPTIONS = {
  NA: 'N/A',
  CALLAHAN: '‼CALLAHAN‼',
};
