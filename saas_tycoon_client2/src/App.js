import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/game';

function App() {
  const [sessions, setSessions] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [game, setGame] = useState(null);

  useEffect(() => {
    if (!gameId) {
      axios.get(API).then(res => setSessions(res.data));
    } else {
      const interval = setInterval(() => {
        axios.get(\`\${API}/\${gameId}\`).then(res => setGame(res.data));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameId]);

  const createGame = async () => {
    const res = await axios.post(API, { playerLimit: 5 });
    setGameId(res.data.gameId);
  };

  const joinGame = async (id) => {
    const res = await axios.post(\`\${API}/\${id}/join\`, { playerName });
    setGameId(res.data.gameId);
    setPlayerId(res.data.playerId);
  };

  const setReady = async () => {
    await axios.post(\`\${API}/\${gameId}/ready\`, { playerId });
  };

  if (!gameId) {
    return (
      <div className="container">
        <h1>SaaS Tycoon</h1>
        <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Enter name" />
        <button onClick={createGame} disabled={!playerName}>Create Game</button>
        <h2>Available Games</h2>
        <ul>
          {sessions.filter(s => !s.started).map(s => (
            <li key={s.id}>
              {s.id} ({s.playerCount}/{s.playerLimit})
              <button onClick={() => joinGame(s.id)}>Join</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Game ID: {gameId}</h1>
      <h2>Turn: {game?.currentTurn}</h2>
      <button onClick={setReady}>I'm Ready</button>
      <div className="players">
        {game?.players.map(player => (
          <div key={player.id} className="player-card">
            <h3>{player.name} {player.id === playerId && "(You)"}</h3>
            <p>Cash: ${player.cash}</p>
            <p>Customers: {player.customers}</p>
            <p>Features: {player.features.length}</p>
            <p>Cloud Skills: {player.skills.cloudNative}</p>
            <p>Legacy Skills: {player.skills.legacy}</p>
            <p>Op Maturity: {player.opMaturity}</p>
            <p>Tech Debt: {player.techDebt}</p>
            <p>Revenue: ${player.revenue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;