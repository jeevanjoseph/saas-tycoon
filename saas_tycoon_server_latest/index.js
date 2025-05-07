
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const gameSessions = {};

function MonolithFeature(price, techDebt){
  this.architecture = 'monolith';
  this.featureDevCost = 1000;
  this.techDebt = techDebt;
  this.featurePrice = price;
  this.infrastructureCost = 500;
  this.calculateRevenue = function(){
    return 1000;
  }
}

function MonolithPlayer(name){
  this.id = uuidv4(),
  this.name = name;
  this.cash = 5000;
  this.customers = 2;
  this.infrastructureCost = 500;
  this.features = [new MonolithFeature(0,2),new MonolithFeature(0,2),new MonolithFeature(0,2),new MonolithFeature(0,2)];
  this.skills = { legacy: 1, cloudNative: 0 }
  this.opsMaturity = 1;
  this.techDebt = 2;
  this.revenue = 0;
  this.actions = {};
  this.updateCash = function(){
    this.features.forEach(feature => {
      this.cash += feature.calculateRevenue();
    });
  } 
}

function createDefaultPlayer(name) {
  return new MonolithPlayer(name);
}

function createGameSession(playerLimit) {
  return {
    id: uuidv4(),
    players: [],
    playerLimit,
    currentTurn: 1,
    started: false,
    events: [],
    log: [],
  };
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

app.post('/api/game', (req, res) => {
  const { playerLimit } = req.body;
  const session = createGameSession(playerLimit || 5);
  gameSessions[session.id] = session;
  res.json({ gameId: session.id });
});

app.post('/api/game/:id/join', (req, res) => {
  const { id } = req.params;
  const { playerName } = req.body;
  const session = gameSessions[id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  if (session.players.length >= session.playerLimit) {
    return res.status(400).json({ error: 'Game is full' });
  }

  const player = createDefaultPlayer(playerName);
  session.players.push(player);
  res.json({ gameId: session.id, playerId: player.id, playerName: player.name });
});

app.get('/api/game/:id', (req, res) => {
  const session = gameSessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const { playerId } = req.query;
  if (playerId) {
    const player = session.players.find(p => p.id === playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    return res.json({ player });
  }

  res.json(session);
});

app.post('/api/game/:id/action', (req, res) => {
  const { playerId, action, turn } = req.body;
  const session = gameSessions[req.params.id];
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
});

app.get('/api/game/:id/event', (req, res) => {
  const session = gameSessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Game not found' });

  const lastEvent = session.events.length > 0 ? session.events[session.events.length - 1] : null;
  res.json({ event: lastEvent, currentTurn: session.currentTurn });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
