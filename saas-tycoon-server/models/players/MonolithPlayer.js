const { v4: uuidv4 } = require('uuid');
const PlayerStats = require('./PlayerStats');
const MonolithFeature = require('../features/MonolithFeature');
const constants = require('./constants')

function MonolithPlayer(name) {
    this.id = uuidv4();
    this.name = name;
    this.playerClass = 'Monolith';
    this.ready = false;
    this.features = [
        new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 4, 0),
        new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 4, 0)
    ];
    this.stats = {
        0: new PlayerStats(
            constants.MONOLITH_STARTING_STATS.cash, // cash
            constants.MONOLITH_STARTING_STATS.customers, // customers
            constants.MONOLITH_STARTING_STATS.legacySkills, // legacySkills
            constants.MONOLITH_STARTING_STATS.cloudNativeSkills, // cloudNativeSkills
            constants.MONOLITH_STARTING_STATS.opsMaturity // opsMaturity
        )
    };
    this.turns = {};
    this.log = [];
    this.actionCooldowns = {}; // { [actionCode]: cooldownTurns }
}

module.exports = MonolithPlayer;