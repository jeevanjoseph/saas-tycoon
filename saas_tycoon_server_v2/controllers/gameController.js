const { createGameSession, canStartGame, processTurn } = require('../models/gameSession');
const createPlayer = require('../models/player');

const sessions = {};

// Function to get all game sessions
// This function will be called when the client requests all game sessions
// It returns a list of all sessions with their details
function getAllSessions(req, res) {
  const sessionList = Object.values(sessions).map(({ id, started, players, playerLimit, createdAt }) => ({
    id, started, playerCount: players.length, playerLimit, createdAt
  }));
  res.json(sessionList);
}

// Function to create a new game session
// It generates a unique ID for the session and sets the player limit
// It also initializes the session with an empty players array and a log
// It returns the game ID to the client
function createSession(req, res) {
  const { playerLimit } = req.body;
  const session = createGameSession(playerLimit);
  sessions[session.id] = session;
  res.json({ gameId: session.id });
}

// Function to join a game session
// It checks if the session exists and if the game has already started
// It also checks if the game is full and creates a new player
// If the player is successfully added, it returns the game ID and player ID
function joinSession(req, res) {
  const session = sessions[req.params.id];
  const { playerName, playerType } = req.body;

  if (!session) return res.status(404).json({ error: 'Game not found' });

  const existingPlayer = session.players.find(p => p.name === playerName);
  if (existingPlayer) {
    return res.json({ gameId: session.id, playerId: existingPlayer.id, playerName: existingPlayer.name });
  } else {
    if (session.started) return res.status(400).json({ error: 'Game has already started' });
    if (session.players.length >= session.playerLimit) return res.status(400).json({ error: 'Game is full' });

    try {
      const player = createPlayer(playerName, playerType);
      session.players.push(player);
      return res.json({ gameId: session.id, playerId: player.id, playerName: player.name });
    } catch (error) {
      console.error('Error creating player:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

// Function to set a player as ready
// It checks if the session exists and if the player is part of the session
// It also checks if the game can be started based on the number of players ready
// If the game can be started, it sets the session as started and logs the event
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

// Function to get a specific game session
// It returns the session details and the players in the session
// It checks if the session exists and if the player is part of the session
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

// Function to get the last event of a game session
// It returns the last event and the current turn of the game
// It checks if the session exists and if the player is part of the session
function getLastEvent(req, res) {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const lastEvent = session.events.length > 0 ? session.events[session.events.length - 1] : null;
  res.json({ event: lastEvent, currentTurn: session.currentTurn });
}

// Function to handle player actions
// This function will be called when a player submits an action
// It checks if the action is valid, updates the player's state,
// and processes the turn if all players have submitted their actions
function performAction(req, res) {
  const { playerId, action, turn } = req.body;
  const session = sessions[req.params.id];
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
    player.applyAction(action, turn);
    player.turns[turn] = action;
  } catch (error) {
    console.error('Error applying action:', error);
    return res.status(400).json({ error: error.message || 'Failed to apply action.' });
  }

  const allSubmitted = session.players.every(p => p.turns[turn]);
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
  getLastEvent,
  performAction,
  sessions
};