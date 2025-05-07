const { v4: uuidv4 } = require('uuid');
const MonolithPlayer = require('./MonolithPlayer');


function createPlayer(name) {
  return new MonolithPlayer(name);
}

module.exports = createPlayer;