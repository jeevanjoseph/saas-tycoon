import axios from 'axios';
import { getBaseUrl } from '../utils/constants';

/**
 * Upload a player list CSV file.
 * @param {File} file - CSV file with player data.
 * @returns {Promise<Object>}
 */
export async function uploadPlayerList(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${getBaseUrl()}/playerlist-upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

/**
 * Verify a player by playerCode.
 * @param {string} playerCode
 * @returns {Promise<Object>}
 */
export async function verifyPlayer(playerCode) {
    const res = await axios.post(`${getBaseUrl()}/verify-player`, { playerCode });
  return res.data;
}