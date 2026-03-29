// =====================================================
// SECONDS TIMER MANAGER - Simple second-based countdown
// =====================================================
export class SecondsTimerManager {
  constructor() {
    this.timerInterval = null;
    this.isRunning = false;
    this.endTime = null;
    this.remainingTimeMs = null;
    this.defaultSeconds = 75;
    this.updateDisplay();
  }

  // Start countdown using current remaining or default
  start() {
    if (this.isRunning) return;
    if (this.remainingTimeMs === null) {
      const secondsInput = document.getElementById('countdownTimeSec');
      const secs = parseInt(secondsInput?.value, 10) || this.defaultSeconds;
      this.remainingTimeMs = secs * 1000;
    }
    this.endTime = new Date(Date.now() + this.remainingTimeMs);
    this.isRunning = true;
    this.timerInterval = setInterval(() => this.tick(), 200);
    this.updateUI();
  }

  // Stop countdown and keep remaining time
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    const timeRemaining = this.getTimeRemaining(this.endTime);
    this.remainingTimeMs = Math.max(0, timeRemaining.total);
    this.endTime = null;
    this.updateUI();
  }

  toggle() { this.isRunning ? this.stop() : this.start(); }

  reset(seconds = this.defaultSeconds) {
    this.stop();
    const secs = Math.max(1, parseInt(seconds, 10) || this.defaultSeconds);
    this.remainingTimeMs = secs * 1000;
    this.updateDisplay();
  }

  getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor(total / 1000 / 60);
    return { total, minutes, seconds };
  }

  tick() {
    const timeRemaining = this.getTimeRemaining(this.endTime);
    this.updateDisplay(timeRemaining);
    if (timeRemaining.total <= 0) {
      this.stop();
      this.remainingTimeMs = 0;
    }
  }

  updateUI() {
    const playPauseBtn = document.getElementById('playPauseSecBtn');
    const timerColumn = document.getElementById('timerColumnSec');
    if (playPauseBtn) playPauseBtn.textContent = this.isRunning ? 'Pause' : 'Play';
    if (timerColumn) {
      timerColumn.classList.toggle('timer-running', this.isRunning);
      timerColumn.classList.toggle('timer-paused', !this.isRunning);
    }
  }

  updateDisplay(existing) {
    const timerDisplay = document.getElementById('timerDisplaySec');
    if (!timerDisplay) return;

    let timeRemaining = existing;
    if (!timeRemaining) {
      if (this.isRunning && this.endTime) {
        timeRemaining = this.getTimeRemaining(this.endTime);
      } else if (this.remainingTimeMs !== null) {
        const total = this.remainingTimeMs;
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor(total / 1000 / 60);
        timeRemaining = { total, minutes, seconds };
      } else {
        const total = this.defaultSeconds * 1000;
        const minutes = Math.floor(this.defaultSeconds / 60);
        const seconds = this.defaultSeconds % 60;
        timeRemaining = { total, minutes, seconds };
      }
    }

    const mins = Math.max(0, timeRemaining.minutes).toString().padStart(2, '0');
    const secs = Math.max(0, timeRemaining.seconds).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  }
}
