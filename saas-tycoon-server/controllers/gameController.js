const { createGameSession, canStartGame, processTurn } = require('../models/gameSession');
const createPlayer = require('../models/player');
const mongoGameSession = require('../db/mongoGameSession');
const PlayerActions = require('../models/players/PlayerActions');

const sessions = {}; // In-memory cache for fast access

// Helper to sync in-memory and DB
async function syncSessionToDb(session) {
  await mongoGameSession.saveSession(session);
  sessions[session.id] = session;
}

// Function to get all game sessions
async function getAllSessions(req, res) {
  try {
    const dbSessions = await mongoGameSession.getAllSessions();
    // TODO: Optimize and dont load all sessions into memory.
    // Do we even need this?
    dbSessions.forEach(s => { sessions[s.id] = s; });
    const sessionList = dbSessions.map(({ id, state, players, playerLimit, currentTurn, total_turns, createdAt }) => ({
      id, state, playerCount: players.length, playerLimit, currentTurn, total_turns, createdAt
    }));
    res.json(sessionList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

// Function to create a new game session
async function createSession(req, res) {
  const { playerLimit } = req.body;
  const session = createGameSession(playerLimit);
  await syncSessionToDb(session);
  res.json({ gameId: session.id });
}

// Function to join a game session
async function joinSession(req, res) {
  const session = await mongoGameSession.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const { playerName, playerType } = req.body;
  const existingPlayer = session.players.find(p => p.name === playerName);
  if (existingPlayer) {
    return res.json({ gameId: session.id, playerId: existingPlayer.id, playerName: existingPlayer.name });
  } else {
    if (session.state !== 'not_started') return res.status(400).json({ error: 'Game has already started' });
    if (session.players.length >= session.playerLimit) return res.status(400).json({ error: 'Game is full' });

    try {
      const player = createPlayer(playerName, playerType);
      session.players.push(player);
      await syncSessionToDb(session);
      return res.json({ gameId: session.id, playerId: player.id, playerName: player.name });
    } catch (error) {
      console.error('Error creating player:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

// Function to set a player as ready
async function setPlayerReady(req, res) {
  const session = await mongoGameSession.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const player = session.players.find(p => p.id === req.body.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  player.ready = true;

  if (session.state === 'not_started' && canStartGame(session)) {
    session.state = 'started';
    session.log.push(`Game session ${session.id} started at turn 1.`);
  }

  await syncSessionToDb(session);
  res.json({ status: 'Player marked ready', gameStarted: session.state });
}

// Function to get a specific game session
async function getGameSession(req, res) {
  const session = await mongoGameSession.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const { playerId } = req.query;
  if (playerId) {
    const player = session.players.find(p => p.id === playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    return res.json({ player });
  }

  res.json(session);
}

// Function to get the last event of a game session
async function getLastEvent(req, res) {
  const session = await mongoGameSession.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const lastEvent = session.events.length > 0 ? session.events[session.events.length - 1] : null;
  res.json({ event: lastEvent, currentTurn: session.currentTurn });
}

// Function to handle player actions
async function performAction(req, res) {
  const { playerId, action, turn } = req.body;
  const session = await mongoGameSession.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Game not found' });

  if (turn !== session.currentTurn) {
    return res.status(400).json({ error: 'Invalid turn. Current turn is ' + session.currentTurn });
  }

  const player = session.players.find(p => p.id === playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  if (player.turns[turn]) {
    return res.status(400).json({ error: 'Action for this turn already submitted.' });
  }

  try {
    PlayerActions.applyAction(player, action, turn);
    player.turns[turn] = action;
  } catch (error) {
    console.error('Error applying action:', error);
    return res.status(400).json({ error: error.message || 'Failed to apply action.' });
  }

  const allSubmitted = session.players.every(p => p.turns[turn]);
  if (allSubmitted) {
    processTurn(session);
  }

  await syncSessionToDb(session);
  res.json({ message: 'Action accepted for turn ' + turn });
}

module.exports = {
  getAllSessions,
  createSession,
  joinSession,
  setPlayerReady,
  getGameSession,
  getLastEvent,
  performAction,
  sessions // still available for in-memory fallback/debug
};