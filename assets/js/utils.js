// =====================================================
// UTILITY FUNCTIONS
// =====================================================
export const Utils = {
  /**
   * Safe JSON parse with fallback
   */
  safeJsonParse: (str, fallback = null) => {
    try {
      return JSON.parse(str) || fallback;
    } catch (e) {
      console.warn('JSON parse failed:', e);
      return fallback;
    }
  },

  /**
   * Debounce function to limit rapid function calls
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Show user notification
   */
  showNotification: (message, type = 'info') => {
    if (type === 'error') {
      console.error(message);
      alert(`Error: ${message}`);
    } else {
      console.log(message);
      if (type === 'success') {
        const successEl = document.getElementById('successMessage');
        if (successEl) {
          successEl.textContent = message;
          successEl.style.display = 'block';
          setTimeout(() => {
            successEl.style.display = 'none';
          }, 5000);
        }
      }
    }
  },

  /**
   * Create DOM element with attributes and content
   */
  createElement: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    if (content) element.textContent = content;
    return element;
  },

  /**
   * Generate unique ID
   */
  generateId: () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Sanitize a string for safe filenames
   */
  sanitizeFilename: (name, fallback = 'Game') => {
    const base = (name || '').toString().trim() || fallback;
    // Replace invalid filename chars and trim length
    return base.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').slice(0, 120);
  },

  /**
   * Convert array of fields to a CSV line with proper escaping
   */
  toCSVLine: (fields) => {
    return fields.map((v) => {
      let s = (v === null || v === undefined) ? '' : String(v);
      if (/[",\n\r]/.test(s)) {
        s = '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',');
  },

  /**
   * Download text content as a file on the client
   */
  downloadTextFile: (filename, text, mime = 'text/csv;charset=utf-8;') => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Parse CSV text into array of rows (handles quoted commas)
   */
  parseCSV: (text) => {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(cell);
        cell = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (cell !== '' || row.length > 0) {
          row.push(cell);
          rows.push(row);
          row = [];
          cell = '';
        }
      } else {
        if (char !== '\r') cell += char; // ignore stray CR
      }
    }

    // push last cell/row if any
    if (cell !== '' || row.length > 0) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  },

  /**
   * Convert CSV rows (first row team names) to { teamName: [players] }
   */
  csvToTeamsMap: (rows) => {
    if (!rows || rows.length === 0) return {};
    const header = rows[0].map(h => (h || '').trim()).filter(Boolean);
    const teams = {};
    header.forEach((teamName, colIdx) => {
      const players = [];
      for (let r = 1; r < rows.length; r++) {
        const val = (rows[r][colIdx] || '').trim();
        if (val) players.push(val);
      }
      teams[teamName] = players;
    });
    return teams;
  }
};
