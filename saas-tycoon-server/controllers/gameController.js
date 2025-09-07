const { createGameSession, canStartGame, processTurn } = require('../models/gameSession');
const createPlayer = require('../models/player');
const sessionDAO = require('../db/sessionDAO');
const playerDAO = require('../db/playerDAO');
const PlayerActions = require('../models/players/PlayerActions');

// --- OpenTelemetry ---
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('gameController');

const requestCount = meter.createCounter('game_controller_requests', {
  description: 'Count of requests to gameController functions'
});
const errorCount = meter.createCounter('game_controller_errors', {
  description: 'Count of errors in gameController functions'
});
const requestDuration = meter.createHistogram('game_controller_duration_ms', {
  description: 'Duration of gameController functions in ms'
});

// Helper to sync in-memory and DB 
async function syncSessionToDb(session) {
  await sessionDAO.saveSession(session);
}

// Function to get all game sessions
async function getAllSessions(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'getAllSessions' });
  try {
    const sessions = await sessionDAO.getAllSessions();
    const sessionList = sessions.map(({ id, name, state, players, playerLimit, currentTurn, total_turns, createdAt, finishedAt }) => ({
      id, name, state, playerCount: players.length, playerLimit, currentTurn, total_turns, createdAt, finishedAt
    }));
    res.json(sessionList);
  } catch (err) {
    errorCount.add(1, { function: 'getAllSessions' });
    res.status(500).json({ error: 'Failed to fetch sessions' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'getAllSessions' });
  }
}

// Function to create a new game session
async function createSession(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'createSession' });
  try {
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
  } catch (err) {
    errorCount.add(1, { function: 'createSession' });
    res.status(500).json({ error: 'Failed to create session' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'createSession' });
  }
}

// Function to join a game session
async function joinSession(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'joinSession' });
  try {
    const session = await sessionDAO.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Game not found' });

    const { playerCode, playerType } = req.body;
    const playerInfo = await playerDAO.findByCode(playerCode);
    if (!playerInfo) {
      return res.status(400).json({ error: 'Player cannot be verified. Please check your player code.' });
    }

    const existingPlayer = session.players.find(p => p.name === playerInfo.playerEmail);
    if (existingPlayer) {
      return res.json({ gameId: session.id, playerId: existingPlayer.id, playerName: existingPlayer.name });
    } else {
      if (session.state !== 'not_started') return res.status(400).json({ error: 'Game has already started' });
      if (session.players.length >= session.playerLimit) return res.status(400).json({ error: 'Game is full' });

      try {
        //TODO : update player to have Email. Currently setting email to the player.name. 
        const player = createPlayer(playerInfo.playerEmail, playerType);
        session.players.push(player);
        await syncSessionToDb(session);
        return res.json({ gameId: session.id, playerId: player.id, playerName: player.name });
      } catch (error) {
        errorCount.add(1, { function: 'joinSession' });
        console.error('Error creating player:', error);
        return res.status(400).json({ error: error.message });
      }
    }
  } catch (err) {
    errorCount.add(1, { function: 'joinSession' });
    res.status(500).json({ error: 'Failed to join session' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'joinSession' });
  }
}

// Function to set a player as ready
async function setPlayerReady(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'setPlayerReady' });
  try {
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
  } catch (err) {
    errorCount.add(1, { function: 'setPlayerReady' });
    res.status(500).json({ error: 'Failed to set player ready' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'setPlayerReady' });
  }
}

// Function to get a specific game session
async function getGameSession(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'getGameSession' });
  try {
    const session = await sessionDAO.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Game not found' });

    const { playerId } = req.query;
    if (playerId) {
      const player = session.players.find(p => p.id === playerId);
      if (!player) return res.status(404).json({ error: 'Player not found' });
      return res.json({ player });
    }

    res.json(session);
  } catch (err) {
    errorCount.add(1, { function: 'getGameSession' });
    res.status(500).json({ error: 'Failed to get game session' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'getGameSession' });
  }
}

// Function to get the last event of a game session
async function getLastEvent(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'getLastEvent' });
  try {
    const session = await sessionDAO.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Game not found' });

    const lastEvent = session.events.length > 0 ? session.events[session.events.length - 1] : null;
    res.json({ event: lastEvent, currentTurn: session.currentTurn });
  } catch (err) {
    errorCount.add(1, { function: 'getLastEvent' });
    res.status(500).json({ error: 'Failed to get last event' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'getLastEvent' });
  }
}

// Function to handle player actions
async function performAction(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'performAction' });
  try {
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
      errorCount.add(1, { function: 'performAction', code: action.code });
      console.error('Error applying action:', error);
      return res.status(400).json({ error: error.message || 'Failed to apply action.' });
    }

    const allSubmitted = session.players.every(p => p.turns[turn]);
    if (allSubmitted) {
      processTurn(session);
      // If after processing, the game is over, mark as finished
      if (session.currentTurn >= session.total_turns) {
        session.state = 'finished';
        session.finishedAt = new Date().toISOString();
        session.log.push(`Game session ${session.id} finished at turn ${session.currentTurn}.`);
      }
    }

    await syncSessionToDb(session);
    res.json({ message: 'Action accepted for turn ' + turn });
  } catch (err) {
    errorCount.add(1, { function: 'performAction' });
    res.status(500).json({ error: 'Failed to perform action' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'performAction' });
  }
}

// Create a function to get all sessions after a given start date and in a finished state
// For each session, identify the players who palced in the top 3 by total cash
// Return an array of objects with session id, name, and an array of top players with their name and total cash
async function getTopPlayersSince(req, res) {
  const start = Date.now();
  requestCount.add(1, { function: 'getTopPlayersSince' });
  try {
    const { startDate } = req.query;
    if (!startDate) {
      return res.status(400).json({ error: 'startDate query parameter is required' });
    }

    let validatedDate = new Date(startDate);
    if (isNaN(validatedDate.getTime())) {
      // if startDate is in the -Xm|h|d format, where m, h, d are minutes, hours and days, calculate the date
      if (startDate.startsWith('-') && (startDate.endsWith('m') || startDate.endsWith('h') || startDate.endsWith('d'))) {
        const now = new Date();
        validatedDate = new Date();
        const value = parseInt(startDate.slice(1, -1));
        if (isNaN(value)) {
          return res.status(400).json({ error: `Got ${startDate} - Invalid startDate format. Numerical value not found in format -Xm|h|d.` });
        }
        if (startDate.endsWith('m')) {
          validatedDate.setMinutes(now.getMinutes() - value);
        } else if (startDate.endsWith('h')) {
          validatedDate.setHours(now.getHours() - value);
        } else if (startDate.endsWith('d')) {
          validatedDate.setDate(now.getDate() - value);
        }
      } else {
        return res.status(400).json({ error: `Got ${startDate} - Invalid startDate format. Numerical value not found in format -Xm|h|d.` });
      }
    }

    const sessions = await sessionDAO.getSessionsFinishedSince(validatedDate.toISOString());
    const result = sessions.map(session => {
      const topPlayers = [...session.players]
        .sort((a, b) => {
          const bLength = b.stats ? Object.keys(b.stats).length : 0;
          const aLength = a.stats ? Object.keys(a.stats).length : 0;
          const bCash = b.stats[bLength - 1].cash;
          const aCash = a.stats[aLength - 1].cash;
          return bCash - aCash;
        })
        .slice(0, 3)
        .map(player => {
          const statLength = player.stats ? Object.keys(player.stats).length : 0;
          const lastStat = player.stats[statLength - 1];
          return { name: player.name, totalCash: lastStat.cash, playerClass: player.playerClass, featureCount: player.features.length };
        });

      return {
        sessionId: session.id,
        sessionName: session.name,
        startTime: session.createdAt,
        endTime: session.finishedAt,
        topPlayers
      };
    });

    res.json(result);
  } catch (err) {
    errorCount.add(1, { function: 'getTopPlayersSince' });
    res.status(500).json({ error: 'Failed to get top players' });
  } finally {
    requestDuration.record(Date.now() - start, { function: 'getTopPlayersSince' });
  }
}

module.exports = {
  getAllSessions,
  createSession,
  joinSession,
  setPlayerReady,
  getGameSession,
  getLastEvent,
  performAction,
  getTopPlayersSince
};