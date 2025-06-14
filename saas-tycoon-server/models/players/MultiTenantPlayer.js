const { v4: uuidv4 } = require('uuid');
const PlayerStats = require('./PlayerStats');
const constants = require('./constants');


function MultiTenantPlayer(name) {
    this.id = uuidv4();
    this.name = name;
    this.playerClass = 'MultiTenant';
    this.ready = false;
    this.features = [];
    this.stats = {
        0: new PlayerStats(
            5000, // cash
            2,    // customers
            0,    // legacySkills
            4,    // cloudNativeSkills
            1     // opsMaturity
        )
    };
    this.turns = {};

   
}

module.exports = MultiTenantPlayer;