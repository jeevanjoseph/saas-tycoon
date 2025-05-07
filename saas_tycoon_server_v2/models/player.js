const { v4: uuidv4 } = require('uuid');

function createPlayer(name) {
  return {
    id: uuidv4(),
    name,
    ready: false,
    cash: 5000,
    customers: 2,
    features: [],
    skills: { legacy: 1, cloudNative: 0 },
    opMaturity: 1,
    techDebt: 0,
    revenue: 0,
    actions: {}
  };
}

module.exports = createPlayer;