const { v4: uuidv4 } = require('uuid');
const createPlayer = require('./player');

function createGameSession(playerLimit = 5) {
  return {
    id: uuidv4(),
    players: [],
    playerLimit,
    currentTurn: 1,
    started: false,
    events: [],
    log: [],
    createdAt: new Date().toISOString()
  };
}

function canStartGame(session) {
  const readyCount = session.players.filter(p => p.ready).length;
  return readyCount >= 2 && readyCount === session.players.length;
}

function processTurn(session) {
  const turn = session.currentTurn;

  // Generate an event starting from turn 2
  let event = null;
  if (turn > 1) {
    event = {
      id: uuidv4(),
      title: "Customer Growth Spike",
      description: "Each team gains 3 new customers.",
      turn: turn
    };
    session.players.forEach(p => {
      p.customers += 3;
    });
    session.events.push(event);
  }

  // Apply base revenue logic
  session.players.forEach(p => {
    p.updateCash();
  });

  session.log.push(`Turn ${turn} completed.`);
  session.currentTurn += 1;
}

module.exports = { createGameSession, canStartGame };