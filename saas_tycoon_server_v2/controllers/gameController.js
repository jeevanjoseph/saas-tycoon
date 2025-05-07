const { createGameSession, canStartGame } = require('../models/gameSession');
const createPlayer = require('../models/player');

const sessions = {};

function getAllSessions(req, res) {
  const sessionList = Object.values(sessions).map(({ id, started, players, playerLimit, createdAt }) => ({
    id, started, playerCount: players.length, playerLimit, createdAt
  }));
  res.json(sessionList);
}

function createSession(req, res) {
  const { playerLimit } = req.body;
  const session = createGameSession(playerLimit);
  sessions[session.id] = session;
  res.json({ gameId: session.id });
}

function joinSession(req, res) {
  const session = sessions[req.params.id];
  const playerName = req.body.playerName;
  if (!session) return res.status(404).json({ error: 'Game not found' });
  if (session.started) return res.status(400).json({ error: 'Game has already started' });
  if (session.players.length >= session.playerLimit) return res.status(400).json({ error: 'Game is full' });

  const player = createPlayer(playerName);
  session.players.push(player);
  res.json({ gameId: session.id, playerId: player.id, playerName: player.name });
}

function setPlayerReady(req, res) {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const player = session.players.find(p => p.id === req.body.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  player.ready = true;

  if (!session.started && canStartGame(session)) {
    session.started = true;
    session.log.push(`Game session ${session.id} started at turn 1.`);
  }

  res.json({ status: 'Player marked ready', gameStarted: session.started });
}

function getGameSession(req, res) {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const { playerId } = req.query;
  if (playerId) {
    const player = session.players.find(p => p.id === playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    return res.json({ player });
  }

  res.json(session);
}

function getLastEvent(req, res) {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const lastEvent = session.events.length > 0 ? session.events[session.events.length - 1] : null;
  res.json({ event: lastEvent, currentTurn: session.currentTurn });
}
function performAction(req, res) {
  const { playerId, action, turn } = req.body;
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  if (turn !== session.currentTurn) {
    return res.status(400).json({ error: 'Invalid turn. Current turn is ' + session.currentTurn });
  }

  const player = session.players.find(p => p.id === playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  if (player.actions[turn]) {
    return res.status(400).json({ error: 'Action for this turn already submitted.' });
  }

  player.actions[turn] = action;

  const allSubmitted = session.players.every(p => p.actions[turn]);
  if (allSubmitted) {
    processTurn(session);
  }

  res.json({ message: 'Action accepted for turn ' + turn });
}


module.exports = {
  getAllSessions,
  createSession,
  joinSession,
  setPlayerReady,
  getGameSession,
  sessions
};