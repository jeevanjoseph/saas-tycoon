const generateFeatureName = require("./FeatureNameGenerator")


function MultiTenantMicroservice(price, featureDevCost, techDebt, turn) {
    this.architecture = 'mt-microservice';
    this.name = generateFeatureName();
    this.featureDevCost = featureDevCost;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 300;
    this.createdTurn = turn;
    this.revenueStats = [];
    
}

module.exports = MultiTenantMicroservice;