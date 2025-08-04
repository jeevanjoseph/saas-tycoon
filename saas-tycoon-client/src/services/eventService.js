import axios from 'axios';
import { getBaseUrl } from '../utils/constants';

/**
 * Fetch the latest event for a game.
 * @param {string|number} gameId - The game ID.
 * @returns {Promise<Object|null>} The latest event object or null.
 */
export async function fetchLatestEvent(gameId) {
  try {
    const response = await axios.get(`${getBaseUrl()}/${gameId}/event`);
    return response.data.event || null;
  } catch (error) {
    console.error("Error fetching the latest event:", error);
    return null;
  }
}