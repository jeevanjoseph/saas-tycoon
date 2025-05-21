const { v4: uuidv4 } = require('uuid');
const MonolithPlayer = require('./players/MonolithPlayer');
const SingleTenantPlayer = require('./players/SingleTenantPlayer');
const MultiTenantPlayer = require('./players/MultiTenantPlayer');

function createPlayer(name, playerType) {
  switch (playerType) {
    case 'Monolith':
      return new MonolithPlayer(name);
    case 'SingleTenant':
      return new SingleTenantPlayer(name);
    case 'MultiTenant':
      return new MultiTenantPlayer(name);
    default:
      throw new Error(`Invalid player type: ${playerType}`);
  }
}

module.exports = createPlayer;