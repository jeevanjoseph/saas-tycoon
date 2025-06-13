const { v4: uuidv4 } = require('uuid');
const PlayerStats = require('./PlayerStats');
const MonolithFeature = require('../features/MonolithFeature');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const constants = require('./constants');
const { applyAction, getActions, getEventHandlers, finishTurn } = require('./PlayerActions');

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