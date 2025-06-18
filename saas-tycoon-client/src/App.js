import React, { useEffect, useState } from 'react';
import JoinGamePage from './JoinGamePage';
import GamePage from './GamePage';
import constants from './constants';
import {
  createGame,
  joinGame,
  fetchSessions,
  fetchGame,
  setPlayerReady
} from './services/gameService';

function App() {
  const [sessions, setSessions] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerType, setPlayerType] = useState(constants.DEFAULT_PLAYER_TYPE);
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId) {
      const interval = setInterval(() => {
        fetchSessions()
          .then(setSessions)
          .catch((err) => {
            console.error('Error fetching game sessions:', err)
            setError(err.response?.data.error || err.message || 'Unknown error');
          });
      }, 2000+Math.floor(Math.random()*500));
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        fetchGame(gameId)
          .then(setGame)
          .catch((err) => {
            console.error('Error fetching game data:', err)
            setError(err.response?.data.error || err.message || 'Unknown error');
          });
      }, 2000+Math.floor(Math.random()*500));
      return () => clearInterval(interval);
    }
  }, [gameId]);

  const handleCreateGame = async (sessionName, playerCount) => {
    try {
      const data = await createGame(playerCount, sessionName);
      setGameId(data.gameId);
      handleJoinGame(data.gameId);
    } catch (err) {
      console.error('Error creating game:', err);
      setError(err.response?.data.error || err.message || 'Unknown error');
    }
  };

  const handleJoinGame = async (id) => {
    try {
      const res = await joinGame(id, playerName, playerType);
      setGameId(res.gameId);
      setPlayerId(res.playerId);
    } catch (err) {
      console.error('Error joining game:', err);
      setError(err.response?.data.error || err.message || 'Unknown error');
    }
  };

  const handleSetReady = async () => {
    try {
      await setPlayerReady(gameId, playerId);
    } catch (err) {
      console.error('Error setting player ready:', err);
      setError(err.response?.data.error || err.message || 'Unknown error');
    }
  };

  if (!gameId) {
    return (
      <JoinGamePage
        playerName={playerName}
        setPlayerName={setPlayerName}
        playerType={playerType}
        setPlayerType={setPlayerType}
        sessions={sessions}
        createGame={handleCreateGame}
        joinGame={handleJoinGame}
        error={error}
        setError={setError}
      />
    );
  }

  return <GamePage gameId={gameId} game={game} playerId={playerId} setReady={handleSetReady} />;
}

export default App;