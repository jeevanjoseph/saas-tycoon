const { v4: uuidv4 } = require('uuid');
const PlayerStats = require('./PlayerStats');
const MonolithFeature = require('../features/MonolithFeature');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const constants = require('./constants');
const { applyAction, getActions, getEventHandlers, finishTurn } = require('./PlayerActions');

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
            1,    // legacySkills
            1,    // cloudNativeSkills
            0     // opsMaturity
        )
    };
    this.turns = {};
}

module.exports = SingleTenantPlayer;