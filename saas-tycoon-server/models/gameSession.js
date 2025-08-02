const { v4: uuidv4 } = require('uuid');
const createPlayer = require('./player');
const PlayerStats = require('./players/PlayerStats');
const events = require('./events/events'); // Import the events module
const PlayerActions = require('../models/players/PlayerActions');


// Function to create a default game session
// It generates a unique ID for the session and sets the player limit
function createGameSession(playerLimit, name) {
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
    createdAt: new Date().toISOString()
  };
}

// Function to check if the game can be started
// It checks if there are at least 2 players ready
// and if all players are ready
function canStartGame(session) {
  const readyCount = session.players.filter(p => p.ready).length;
  return readyCount >= 2 && readyCount === session.players.length;
}

// Function to process a turn
// Processes events, updates player stats, and increments the turn counter
// Handles the logic for generating random events every 3 turns
function processTurn(session) {
  let turn = session.currentTurn;
  let event = null;
  //TODO: make the number of turns between events configurable
  if (turn %3 ==0 && turn > 1) {
    event = events.getRandomEvent(turn);
    event.turn = turn;
    session.events.push(event);
  }
  session.players.forEach(player => {

    //process events if there are any
    if (event !== null) {
      PlayerActions.applyEvent(player, event, turn);
    }
    // update the cash on hand for the player
    PlayerActions.finishTurn(player, turn);
    //start the next turn stats from the previous turn
    let previousStats = player.stats[turn];
    player.stats[turn + 1] = new PlayerStats(previousStats.cash, 
                                              previousStats.customers, 
                                              previousStats.legacySkills,
                                              previousStats.cloudNativeSkills,
                                              previousStats.opsMaturity);

  });

  // Apply base revenue logic
  //session.players.forEach(p => {
  //  p.updateCash();
  //});

  session.log.push(`Turn ${turn} completed.`);
  session.currentTurn += 1;
}

module.exports = { createGameSession, canStartGame, processTurn };