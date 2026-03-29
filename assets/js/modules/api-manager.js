import { CONFIG } from './config.js';
import { Utils } from './utils.js';

// =====================================================
// API MANAGER - Same as before
// =====================================================
export class ApiManager {
  constructor() {
    this.teamsUrl = CONFIG.API_URL;
    this.submitUrl = CONFIG.SUBMIT_URL;
  }

  async fetchTeams() {
    try {
      const response = await fetch(this.teamsUrl, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Try to parse as JSON first in case API_URL points to JSON
      const contentType = response.headers.get('Content-Type') || '';
      const isLikelyJson = contentType.includes('application/json') || this.teamsUrl.endsWith('.json');

      if (isLikelyJson) {
        const data = await response.json();
        return data || {};
      }

      // Otherwise parse CSV into { teamName: [players] }
      const text = await response.text();
      const rows = Utils.parseCSV(text);
      const teams = Utils.csvToTeamsMap(rows);
      return teams;
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw new Error(`Failed to fetch teams: ${error.message}`);
    }
  }

  async submitScores(dataToSend) {
    try {
      if (!this.submitUrl) {
        console.warn('SUBMIT_URL is not configured; skipping export.');
        return false;
      }

      const response = await fetch(this.submitUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      // With no-cors we can't read response; assume success
      return true;
    } catch (error) {
      console.error("Error submitting scores:", error);
      throw new Error(`Failed to submit scores: ${error.message}`);
    }
  }
}
