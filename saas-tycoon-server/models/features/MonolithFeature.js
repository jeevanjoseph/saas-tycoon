const generateFeatureName = require("./FeatureNameGenerator");
const constants = require('../players/constants');

// Helper function to calculate Monolith feature development cost
function calculateMonolithDevCost(player, turn) {
    const featureCount = player.features.filter(feature => feature.architecture === 'monolith').length;
    const opsMaturity = player.stats[turn].opsMaturity;
    const skills = player.stats[turn].legacySkills;
    const customers = player.stats[turn].customers;

    let devCost = constants.DEV_COST_MONOLITH;
    if (featureCount > constants.RELEASE_RAMP_MONOLITH) {
        devCost += (featureCount - constants.RELEASE_RAMP_MONOLITH) * 1000;
    }

    if (skills >= constants.SKILL_RAMP_LEGACY) {
        devCost -= (skills - constants.SKILL_RAMP_LEGACY) * 200;
    }

    if (customers >= constants.CUSTOMER_RAMP_MONOLITH) {
        devCost += (customers - constants.CUSTOMER_RAMP_MONOLITH) * 3000;
    }

    if (opsMaturity >= constants.OPS_MATURITY_RAMP_MONOLITH) {
        devCost -= (opsMaturity - constants.OPS_MATURITY_RAMP_MONOLITH) * 400;
    }

    // Ensure cost does not go below a minimum threshold
    devCost = Math.max(devCost, constants.DEV_COST_MONOLITH);

    return devCost;
}

function MonolithFeature(price, featureDevCost, techDebt, turn) {
    this.architecture = 'monolith';
    this.name = generateFeatureName();
    this.featureDevCost = featureDevCost;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 200;
    this.createdTurn = turn;
    this.revenueStats = [];
}

module.exports = MonolithFeature;
module.exports.calculateMonolithDevCost = calculateMonolithDevCost;