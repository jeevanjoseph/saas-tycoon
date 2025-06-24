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
            1,    // customers
            0,    // legacySkills
            4,    // cloudNativeSkills
            3     // opsMaturity
        )
    };
    this.turns = {};
    this.log = [];

   
}

module.exports = MultiTenantPlayer;