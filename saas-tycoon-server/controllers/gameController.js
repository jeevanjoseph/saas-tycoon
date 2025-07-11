const { createGameSession, canStartGame, processTurn } = require('../models/gameSession');
const createPlayer = require('../models/player');
const sessionDAO = require('../db/sessionDAO');
const PlayerActions = require('../models/players/PlayerActions');

// Helper to sync in-memory and DB 
async function syncSessionToDb(session) {
  await sessionDAO.saveSession(session);
}

// Function to get all game sessions
async function getAllSessions(req, res) {
  try {
    const sessions = await sessionDAO.getAllSessions();
    const sessionList = sessions.map(({ id, name, state, players, playerLimit, currentTurn, total_turns, createdAt }) => ({
      id, name, state, playerCount: players.length, playerLimit, currentTurn, total_turns, createdAt
    }));
    res.json(sessionList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

// Function to create a new game session
async function createSession(req, res) {
  const { playerLimit, name } = req.body;
  if(name){
  // Use DAO to check for duplicate session name
  const existingSession = await sessionDAO.getSessionByName(name);
  
  if (existingSession) {
    return res.status(400).json({ error: 'A game session with this name already exists.' });
  }
}

  const session = createGameSession(playerLimit, name);
  await syncSessionToDb(session);
  res.json({ gameId: session.id });
}

// Function to join a game session
async function joinSession(req, res) {
  const session = await sessionDAO.getSessionById(req.params.id);
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
  const session = await sessionDAO.getSessionById(req.params.id);
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
  const session = await sessionDAO.getSessionById(req.params.id);
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
  const session = await sessionDAO.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const lastEvent = session.events.length > 0 ? session.events[session.events.length - 1] : null;
  res.json({ event: lastEvent, currentTurn: session.currentTurn });
}

// Function to handle player actions
async function performAction(req, res) {
  const { playerId, action, turn } = req.body;
  const session = await sessionDAO.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Game not found' });

  // Prevent actions if session is finished
  if (session.state === 'finished' || session.currentTurn >= session.total_turns) {
    return res.status(400).json({ error: 'Game is finished. No more actions allowed.' });
  }

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
    // If after processing, the game is over, mark as finished
    if (session.currentTurn >= session.total_turns) {
      session.state = 'finished';
    }
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
  performAction
};