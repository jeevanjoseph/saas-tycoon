import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JoinGamePage from './JoinGamePage';
import GamePage from './GamePage';

const API = 'http://localhost:3000/api/game';

function App() {
  const [sessions, setSessions] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [game, setGame] = useState(null);

  useEffect(() => {
    if (!gameId) {
      axios
        .get(API)
        .then((res) => setSessions(res.data))
        .catch((err) => console.error('Error fetching game sessions:', err));
    } else {
      const interval = setInterval(() => {
        axios
          .get(`${API}/${gameId}`)
          .then((res) => setGame(res.data))
          .catch((err) => console.error('Error fetching game data:', err));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameId]);

  const createGame = async () => {
    try {
      const res = await axios.post(API, { playerLimit: 5 });
      setGameId(res.data.gameId);
      joinGame(res.data.gameId);
    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  const joinGame = async (id) => {
    try {
      const res = await axios.post(`${API}/${id}/join`, { playerName });
      setGameId(res.data.gameId);
      setPlayerId(res.data.playerId);
    } catch (err) {
      console.error('Error joining game:', err);
    }
  };

  const setReady = async () => {
    try {
      await axios.post(`${API}/${gameId}/ready`, { playerId });
    } catch (err) {
      console.error('Error setting player ready:', err);
    }
  };

  if (!gameId) {
    return (
      <JoinGamePage
        playerName={playerName}
        setPlayerName={setPlayerName}
        sessions={sessions}
        createGame={createGame}
        joinGame={joinGame}
      />
    );
  }

  return <GamePage gameId={gameId} game={game} playerId={playerId} setReady={setReady} />;
}

export default App;