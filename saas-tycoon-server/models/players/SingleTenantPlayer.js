const { v4: uuidv4 } = require('uuid');
const PlayerStats = require('./PlayerStats');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const constants = require('./constants');

function SingleTenantPlayer(name) {
    this.id = uuidv4();
    this.name = name;
    this.playerClass = 'SingleTenant';
    this.ready = false;
    this.features = [new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 2, 0)];
    this.stats = {
        0: new PlayerStats(
            constants.SINGLETENANT_STARTING_STATS.cash, // cash
            constants.SINGLETENANT_STARTING_STATS.customers, // customers
            constants.SINGLETENANT_STARTING_STATS.legacySkills, // legacySkills
            constants.SINGLETENANT_STARTING_STATS.cloudNativeSkills, // cloudNativeSkills
            constants.SINGLETENANT_STARTING_STATS.opsMaturity // opsMaturity    
        )
    };
    this.turns = {};
    this.log = [];

}

module.exports = SingleTenantPlayer;