import axios from 'axios';
import { getBaseUrl } from '../utils/constants';

/**
 * Create a new game.
 * @param {number} playerLimit
 * @returns {Promise<Object>}
 */
export async function createGame(playerLimit = 10, name) {
  const res = await axios.post(getBaseUrl(), { playerLimit, name });
  return res.data;
}

/**
 * Join a game.
 * @param {string|number} gameId
 * @param {string} playerName
 * @param {string} playerType
 * @returns {Promise<Object>}
 */
export async function joinGame(gameId, playerCode, playerType) {
  const res = await axios.post(`${getBaseUrl()}/${gameId}/join`, { playerCode, playerType });
  return res.data;
}

/**
 * Fetch all game sessions.
 * @returns {Promise<Array>}
 */
export async function fetchSessions() {
  const res = await axios.get(getBaseUrl());
  return res.data;
}

/**
 * Fetch a specific game's data.
 * @param {string|number} gameId
 * @returns {Promise<Object>}
 */
export async function fetchGame(gameId) {
  const res = await axios.get(`${getBaseUrl()}/${gameId}`);
  return res.data;
}

/**
 * Set player ready.
 * @param {string|number} gameId
 * @param {string|number} playerId
 * @returns {Promise<Object>}
 */
export async function setPlayerReady(gameId, playerId) {
  const res = await axios.post(`${getBaseUrl()}/${gameId}/ready`, { playerId });
  return res.data;
}