const { v4: uuidv4 } = require('uuid');
const createPlayer = require('./player');

const events = [
  {
    id: uuidv4(),
    title: "Tech Debt Reduction",
    type: "TECH_DEBT_REDUCTION",
    description: "Each team reduces their tech debt by 5 points.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Revenue Boost",
    type: "REVENUE_BOOST",
    description: "Each team gains an additional $500 in revenue.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Infrastructure Upgrade",
    type: "INFRA_UPGRADE",
    description: "Each team spends $300 but gains +2 operational maturity.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Customer Churn",
    type: "CUSTOMER_CHURN",
    description: "Each team loses 2 customers due to market competition.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Feature Launch Success",
    type: "FEATURE_LAUNCH",
    description: "Each team gains $1000 in revenue from a successful feature launch.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Cloud Migration",
    type: "CLOUD_MIGRATION",
    description: "Teams with cloud-native features gain +3 customers.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Market Disruption",
    type: "MARKET_DISRUPTION",
    description: "Teams with legacy features lose $200 in revenue.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Operational Excellence",
    type: "OPERATIONAL_EXCELLENCE",
    description: "Teams with high operational maturity gain +5 customers.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Unexpected Downtime",
    type: "DOWNTIME",
    description: "Each team loses $300 due to unexpected downtime.",
    turn:0
  },
  {
    id: uuidv4(),
    title: "Viral Marketing Campaign",
    type: "VIRAL_MARKETING",
    description: "Each team gains 10 new customers from a viral campaign.",
    turn:0
  }
];

function getRandomEvent(events) {
  const randomIndex = Math.floor(Math.random() * events.length);
  return events[randomIndex];
}
// Function to create a default game session
// It generates a unique ID for the session and sets the player limit
function createGameSession(playerLimit = 10) {
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

// Function to check if the game can be started
// It checks if there are at least 2 players ready
// and if all players are ready
function canStartGame(session) {
  const readyCount = session.players.filter(p => p.ready).length;
  return readyCount >= 2 && readyCount === session.players.length;
}

// Function to process a turn
// It generates an event starting from turn 2
// and applies the base revenue logic
// It updates the session log and increments the turn
function processTurn(session) {
  const turn = session.currentTurn;
  let event = null;
  if (turn > 1) {
    event = getRandomEvent(events);
    event.turn = turn;
    session.players.forEach(p => {
      // Apply event effects based on the event type
      switch (event.type) {
        case "TECH_DEBT_REDUCTION":
          p.techDebt = Math.max(0, p.techDebt - 5);
          break;
        case "REVENUE_BOOST":
          p.revenue += 500;
          break;
        case "INFRA_UPGRADE":
          p.opMaturity += 2;
          break;
        case "CUSTOMER_CHURN":
          p.customers = Math.max(0, p.customers - 2);
          break;
        case "FEATURE_LAUNCH":
          p.revenue += 1000;
          break;
        case "CLOUD_MIGRATION":
          if (p.features.some(f => f.architecture === 'cloud')) {
            p.customers += 3;
          }
          break;
        case "MARKET_DISRUPTION":
          if (p.features.some(f => f.architecture === 'legacy')) {
            p.revenue = Math.max(0, p.revenue - 200);
          }
          break;
        case "OPERATIONAL_EXCELLENCE":
          if (p.opMaturity > 5) {
            p.customers += 5;
          }
          break;
        case "DOWNTIME":
          p.revenue = Math.max(0, p.revenue - 300);
          break;
        case "VIRAL_MARKETING":
          p.customers += 10;
          break;
      }
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

module.exports = { createGameSession, canStartGame , processTurn };