const { v4: uuidv4 } = require('uuid');
const createPlayer = require('./player');
const PlayerStats = require('./players/PlayerStats');
const events = require('./events/events');
const PlayerActions = require('../models/players/PlayerActions');

// --- OpenTelemetry ---
const { metrics, trace } = require('@opentelemetry/api');
const meter = metrics.getMeter('gameSession');
const tracer = trace.getTracer('gameSession');

const requestCount = meter.createCounter('game_session_requests', {
  description: 'Count of requests to gameSession functions'
});
const errorCount = meter.createCounter('game_session_errors', {
  description: 'Count of errors in gameSession functions'
});
const requestDuration = meter.createHistogram('game_session_duration_ms', {
  description: 'Duration of gameSession functions in ms'
});

// Function to create a default game session
// It generates a unique ID for the session and sets the player limit
function createGameSession(playerLimit, name, parentSpan) {
  const start = Date.now();
  requestCount.add(1, { function: 'createGameSession' });
  return tracer.startActiveSpan('gameSession.createGameSession', { parent: parentSpan }, (span) => {
    try {
      const id = uuidv4();
      return {
        id,
        name: name || id.slice(-4),
        players: [],
        playerLimit,
        currentTurn: 0,
        total_turns: 20, // Default total turns
        state: 'not_started', 
        events: [],
        log: [],
        createdAt: new Date().toISOString(),
        finishedAt: null
      };
    } catch (err) {
      errorCount.add(1, { function: 'createGameSession' });
      span.recordException(err);
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'createGameSession' });
      span.end();
    }
  });
}

// Function to check if the game can be started
// It checks if there are at least 2 players ready
// and if all players are ready
function canStartGame(session, parentSpan) {
  const start = Date.now();
  requestCount.add(1, { function: 'canStartGame' });
  return tracer.startActiveSpan('gameSession.canStartGame', { parent: parentSpan }, (span) => {
    try {
      const readyCount = session.players.filter(p => p.ready).length;
      return readyCount >= 2 && readyCount === session.players.length;
    } catch (err) {
      errorCount.add(1, { function: 'canStartGame' });
      span.recordException(err);
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'canStartGame' });
      span.end();
    }
  });
}

// Function to process a turn
// Processes events, updates player stats, and increments the turn counter
// Handles the logic for generating random events every 3 turns
function processTurn(session, parentSpan) {
  const start = Date.now();
  requestCount.add(1, { function: 'processTurn' });
  return tracer.startActiveSpan('gameSession.processTurn', { parent: parentSpan }, (span) => {
    try {
      let turn = session.currentTurn;
      let event = null;
      //TODO: make the number of turns between events configurable
      if (turn % 3 == 0 && turn > 1) {
        event = events.getRandomEvent(turn);
        event.turn = turn;
        session.events.push(event);
      }
      session.players.forEach(player => {

        //process events if there are any
        if (event !== null) {
          PlayerActions.applyEvent(player, event, turn, span);
        }
        // update the cash on hand for the player
        PlayerActions.finishTurn(player, turn, span);
        //start the next turn stats from the previous turn
        let previousStats = player.stats[turn];
        player.stats[turn + 1] = new PlayerStats(
          previousStats.cash, 
          previousStats.customers, 
          previousStats.legacySkills,
          previousStats.cloudNativeSkills,
          previousStats.opsMaturity
        );

      });
      session.log.push(`Turn ${turn} completed.`);
      session.currentTurn += 1;
    } catch (err) {
      errorCount.add(1, { function: 'processTurn' });
      span.recordException(err);
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'processTurn' });
      span.end();
    }
  });
}

module.exports = { createGameSession, canStartGame, processTurn };