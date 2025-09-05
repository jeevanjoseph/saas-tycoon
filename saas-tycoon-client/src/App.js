import React, { useEffect, useState } from 'react';
import JoinGamePage from './JoinGamePage';
import GamePage from './GamePage';
import SpectatePage from './SpectatePage'; 
import LeadersPage from './LeadersPage'; // Add this import
import constants from './utils/constants';
import './static/css/saas-tycoon.css';
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
  const [playerCode, setPlayerCode] = useState('');
  const [playerType, setPlayerType] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [spectateId, setSpectateId] = useState(null); // <-- Add spectate state
  const [showLeaders, setShowLeaders] = useState(false);

  useEffect(() => {
    // Only fetch sessions if NOT on leaderboard page
    if (!gameId && !spectateId && !showLeaders) {
      const interval = setInterval(() => {
        fetchSessions()
          .then(setSessions)
          .catch((err) => {
            console.error('Error fetching game sessions:', err)
            setError(err.response?.data.error || err.message || 'Unknown error');
          });
      }, 2000 + Math.floor(Math.random() * 500));
      return () => clearInterval(interval);
    } else if (spectateId) {
      const interval = setInterval(() => {
        fetchGame(spectateId)
          .then(setGame)
          .catch((err) => {
            console.error('Error fetching game data:', err)
            setError(err.response?.data.error || err.message || 'Unknown error');
          });
      }, 2000 + Math.floor(Math.random() * 500));
      return () => clearInterval(interval);
    } else if (gameId) {
      const interval = setInterval(() => {
        fetchGame(gameId)
          .then(setGame)
          .catch((err) => {
            console.error('Error fetching game data:', err)
            setError(err.response?.data.error || err.message || 'Unknown error');
          });
      }, 2000 + Math.floor(Math.random() * 500));
      return () => clearInterval(interval);
    }
    // If showLeaders is true, do not fetch sessions or games
  }, [gameId, spectateId, showLeaders]);

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
      const res = await joinGame(id, playerCode, playerType);
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

  // Add the onSpectate handler
  const handleSpectate = (id) => {
    setSpectateId(id);
    setGameId(null);
    setPlayerId(null);
  };

  // Add the handler
  const handleShowLeaders = () => {
    setShowLeaders(true);
    setSpectateId(null);
    setGameId(null);
    setPlayerId(null);
  };

  // Show SpectatePage if spectateId is set
  if (spectateId) {
    return (
      <SpectatePage
        game={game}
      />
    );
  }

  // Show LeadersPage if showLeaders is true
  if (showLeaders) {
    return (
      <LeadersPage />
    );
  }

  if (!gameId) {
    return (
      <JoinGamePage
        playerName={playerName}
        setPlayerName={setPlayerName}
        playerCode={playerCode}
        setPlayerCode={setPlayerCode}
        playerType={playerType}
        setPlayerType={setPlayerType}
        sessions={sessions}
        createGame={handleCreateGame}
        joinGame={handleJoinGame}
        error={error}
        setError={setError}
        onSpectate={handleSpectate}
        onShowLeaders={handleShowLeaders} 
      />
    );
  }

  return <GamePage gameId={gameId} game={game} playerId={playerId} setReady={handleSetReady} />;
}

export default App;