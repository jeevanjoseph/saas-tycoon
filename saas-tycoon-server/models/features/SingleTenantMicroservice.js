const generateFeatureName = require("./FeatureNameGenerator");
const constants = require('../players/constants');

// Helper function to calculate SingleTenantMicroservice development cost
function calculateSingleTenantMicroserviceDevCost(player, turn) {
    const featureCount = player.features.filter(feature => feature.architecture === 'microservice').length;
    const opsMaturity = player.stats[turn].opsMaturity;
    const cloudSkills = player.stats[turn].cloudNativeSkills;
    const customers = player.stats[turn].customers;

    let devCost = constants.DEV_COST_SINGLE_TENANT;

    // Cost increases as more microservices are built
    if (featureCount > constants.RELEASE_RAMP_SINGLE_TENANT) {
        devCost += (featureCount - constants.RELEASE_RAMP_SINGLE_TENANT) * 100;
    }

    // Cloud skills reduce cost
    if (cloudSkills >= constants.SKILL_RAMP_CLOUD) {
        devCost -= (cloudSkills - constants.SKILL_RAMP_CLOUD) * 100;
    }

    // More customers increase cost
    if (customers >= constants.CUSTOMER_RAMP_SINGLE_TENANT) {
        devCost += (customers - constants.CUSTOMER_RAMP_SINGLE_TENANT) * 100;
    }

    // Ops maturity reduces cost
    if (opsMaturity >= constants.OPS_MATURITY_RAMP_SINGLE_TENANT) {
        devCost -= (opsMaturity - constants.OPS_MATURITY_RAMP_SINGLE_TENANT) * 100;
    }

    // Ensure cost does not go below a minimum threshold
    devCost = Math.max(devCost, constants.DEV_COST_SINGLE_TENANT);

    return devCost;
}

function SingleTenantMicroservice(price, featureDevCost, techDebt, turn) {
    this.architecture = 'microservice';
    this.name = generateFeatureName();
    this.featureDevCost = featureDevCost;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 250;
    this.createdTurn = turn;
    this.revenueStats = [];
}

module.exports = SingleTenantMicroservice;
module.exports.calculateSingleTenantMicroserviceDevCost = calculateSingleTenantMicroserviceDevCost;