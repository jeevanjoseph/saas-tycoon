const generateFeatureName = require("./FeatureNameGenerator");


function SingleTenantMicroservice(price,featureDevCost, techDebt, turn) {
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