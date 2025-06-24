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
            5000, // cash
            1,    // customers
            2,    // legacySkills
            1,    // cloudNativeSkills
            0     // opsMaturity
        )
    };
    this.turns = {};
    this.log = [];

}

module.exports = SingleTenantPlayer;