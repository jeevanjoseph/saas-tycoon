import axios from 'axios';
import { API } from '../constants';

/**
 * Create a new game.
 * @param {number} playerLimit
 * @returns {Promise<Object>}
 */
export async function createGame(playerLimit = 10, name) {
  const res = await axios.post(API, { playerLimit, name });
  return res.data;
}

/**
 * Join a game.
 * @param {string|number} gameId
 * @param {string} playerName
 * @param {string} playerType
 * @returns {Promise<Object>}
 */
export async function joinGame(gameId, playerName, playerType) {
  const res = await axios.post(`${API}/${gameId}/join`, { playerName, playerType });
  return res.data;
}

/**
 * Fetch all game sessions.
 * @returns {Promise<Array>}
 */
export async function fetchSessions() {
  const res = await axios.get(API);
  return res.data;
}

/**
 * Fetch a specific game's data.
 * @param {string|number} gameId
 * @returns {Promise<Object>}
 */
export async function fetchGame(gameId) {
  const res = await axios.get(`${API}/${gameId}`);
  return res.data;
}

/**
 * Set player ready.
 * @param {string|number} gameId
 * @param {string|number} playerId
 * @returns {Promise<Object>}
 */
export async function setPlayerReady(gameId, playerId) {
  const res = await axios.post(`${API}/${gameId}/ready`, { playerId });
  return res.data;
}