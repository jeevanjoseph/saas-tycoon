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
            cash = 10000,
            customers = 1,
            legacySkills = 4,
            cloudNativeSkills = 0,
            opsMaturity = 0
        )
    };
    this.turns = {};
    this.log = [];
    this.actionCooldowns = {}; // { [actionCode]: cooldownTurns }
}

module.exports = MonolithPlayer;