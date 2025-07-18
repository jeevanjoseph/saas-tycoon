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
           constants.MULTITENANT_STARTING_STATS.cash, // cash
           constants.MULTITENANT_STARTING_STATS.customers, // customers
           constants.MULTITENANT_STARTING_STATS.legacySkills, // legacySkills
           constants.MULTITENANT_STARTING_STATS.cloudNativeSkills, // cloudNativeSkills
           constants.MULTITENANT_STARTING_STATS.opsMaturity // opsMaturity
        )
    };

    this.turns = {};
    this.log = [];

   
}

module.exports = MultiTenantPlayer;