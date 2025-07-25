import axios from 'axios';
import { getBaseUrl } from '../constants';

/**
 * Submits a player action to the backend.
 * @param {Object} params
 * @param {string|number} gameId
 * @param {string|number} playerId
 * @param {Object} action - The action object (must have .code and .name)
 * @param {number} turn
 * @returns {Promise<Object>} The response from the backend
 */
export async function submitPlayerAction({ gameId, playerId, action, turn }) {
  return axios.post(`${getBaseUrl()}/${gameId}/action`, {
    playerId,
    action: action,
    turn
  });
}