import { CONFIG } from '../config.js';

// =====================================================
// REVAMPED TIMER MANAGER - Simple countdown from future date
// =====================================================
export class TimerManager {
  constructor(persistenceManager) {
    this.persistenceManager = persistenceManager;
    this.timerInterval = null;
    this.isRunning = false;
    this.endTime = null;
    this.remainingTimeMs = null; // Store remaining time when paused
    this.defaultMinutes = CONFIG.DEFAULT_TIMER_MINUTES;
    this.tickCallback = null;

    this.loadTimerState();
  }


  /**
   * Get time remaining until endTime
   */
  getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor(total / 1000 / 60);

    return {
      total,
      minutes,
      seconds
    };
  }

  /**
   * Load saved timer state
   */
  loadTimerState() {
    const storedEndTime = this.persistenceManager.loadFromStorage('timerEndTime');
    const storedIsRunning = this.persistenceManager.loadFromStorage(CONFIG.STORAGE_KEYS.TIMER_RUNNING);
    const storedRemainingTime = this.persistenceManager.loadFromStorage('timerRemainingTime');

    if (storedEndTime) {
      this.endTime = new Date(storedEndTime);
    }

    if (storedRemainingTime) {
      this.remainingTimeMs = parseInt(storedRemainingTime, 10);
    }

    this.isRunning = (storedIsRunning === true || storedIsRunning === 'true');

    // Check if timer should still be running
    if (this.isRunning && this.endTime) {
      const timeRemaining = this.getTimeRemaining(this.endTime);
      if (timeRemaining.total <= 0) {
        // Timer expired while away
        this.stop();
        this.updateDisplay();
      } else {
        // Resume timer
        this.start();
      }
    } else if (this.remainingTimeMs !== null) {
      // Timer was paused, restore remaining time
      this.setRemainingTime(this.remainingTimeMs);
      this.updateDisplay();
    } else {
      // Initialize with default time if no saved state
      this.reset(this.defaultMinutes);
    }
  }

  /**
   * Save timer state to storage
   */
  saveTimerState() {
    this.persistenceManager.saveToStorage('timerEndTime', this.endTime ? this.endTime.toISOString() : null);
    this.persistenceManager.saveToStorage(CONFIG.STORAGE_KEYS.TIMER_RUNNING, this.isRunning);
    this.persistenceManager.saveToStorage('timerRemainingTime', this.remainingTimeMs);
  }

  /**
   * Set remaining time from milliseconds
   */
  setRemainingTime(milliseconds) {
    this.remainingTimeMs = milliseconds;
    // Set endTime to null when paused to indicate we're using remainingTimeMs
    this.endTime = null;
  }

  /**
   * Update the timer display
   */
  updateDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');

    if (!timerDisplay) return;

    let timeRemaining;

    if (this.isRunning && this.endTime) {
      // Timer is running, calculate from endTime
      timeRemaining = this.getTimeRemaining(this.endTime);
    } else if (this.remainingTimeMs !== null) {
      // Timer is paused, use stored remaining time
      const total = this.remainingTimeMs;
      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor(total / 1000 / 60);
      timeRemaining = { total, minutes, seconds };
    } else {
      // Fallback to default time
      const total = this.defaultMinutes * 60 * 1000;
      const seconds = 0;
      const minutes = this.defaultMinutes;
      timeRemaining = { total, minutes, seconds };
    }

    const absMinutes = Math.abs(timeRemaining.minutes);
    const absSeconds = Math.abs(timeRemaining.seconds);

    const mins = absMinutes.toString().padStart(2, '0');
    const secs = absSeconds.toString().padStart(2, '0');

    let timeString = `${mins}:${secs}`;

    if (timeRemaining.total < 0) {
      timeString = `-${timeString}`;
      timerDisplay.classList.add('timer-negative');
    } else {
      timerDisplay.classList.remove('timer-negative');
    }

    timerDisplay.textContent = timeString;

    // Update game time field if it exists
    const timeInput = document.getElementById('time');
    if (timeInput) {
      timeInput.value = new Date().toLocaleString();
    }
  }

  /**
   * Start the timer
   */
  start() {
    if (this.isRunning) return;

    // If we have remaining time (from pause), set new end time based on it
    if (this.remainingTimeMs !== null) {
      this.endTime = new Date(Date.now() + this.remainingTimeMs);
      this.remainingTimeMs = null; // Clear since we're now running
    }

    // If we still don't have an end time, set default
    if (!this.endTime) {
      this.endTime = new Date(Date.now() + (this.defaultMinutes * 60 * 1000));
    }

    this.isRunning = true;
    this.updateUI();
    this.saveTimerState();

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.updateDisplay();

      const timeRemaining = this.getTimeRemaining(this.endTime);
      if (typeof this.tickCallback === 'function') {
        try {
          this.tickCallback({ ...timeRemaining });
        } catch (err) {
          console.error('Timer tick callback error:', err);
        }
      }
      if (timeRemaining.total <= 0 && this.isRunning) {
        this.stop();
      }
    }, 1000);

    // Initial update
    this.updateDisplay();
    if (typeof this.tickCallback === 'function' && this.endTime) {
      try {
        const initialRemaining = this.getTimeRemaining(this.endTime);
        this.tickCallback({ ...initialRemaining });
      } catch (err) {
        console.error('Timer tick callback error:', err);
      }
    }
  }

  /**
   * Stop/Pause the timer
   */
  stop() {
    if (!this.isRunning) return;

    // Store remaining time when pausing
    if (this.endTime) {
      const timeRemaining = this.getTimeRemaining(this.endTime);
      this.remainingTimeMs = Math.max(0, timeRemaining.total); // Don't store negative time
    }

    this.isRunning = false;
    this.endTime = null; // Clear endTime when paused

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.updateUI();
    this.saveTimerState();
    this.updateDisplay(); // Update display to show paused time
  }

  /**
   * Toggle timer play/pause
   */
  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  setTickCallback(callback) {
    this.tickCallback = (typeof callback === 'function') ? callback : null;
  }

  /**
   * Reset timer to specified minutes
   */
  reset(minutes = this.defaultMinutes) {
    this.stop();

    // Set remaining time and clear endTime
    this.remainingTimeMs = minutes * 60 * 1000;
    this.endTime = null;

    this.saveTimerState();
    this.updateDisplay();
    this.updateUI();
  }

  /**
   * Update UI elements
   */
  updateUI() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timerColumn = document.getElementById('timerColumn');

    if (playPauseBtn) {
      playPauseBtn.textContent = this.isRunning ? "Pause" : "Play";
    }

    if (timerColumn) {
      timerColumn.classList.toggle('timer-running', this.isRunning);
      timerColumn.classList.toggle('timer-paused', !this.isRunning);
    }
  }

  /**
   * Get remaining time in seconds (for debugging/external use)
   */
  getRemainingSeconds() {
    if (this.isRunning && this.endTime) {
      const timeRemaining = this.getTimeRemaining(this.endTime);
      return Math.floor(timeRemaining.total / 1000);
    } else if (this.remainingTimeMs !== null) {
      return Math.floor(this.remainingTimeMs / 1000);
    }
    return 0;
  }
}
