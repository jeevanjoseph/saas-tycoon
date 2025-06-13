const generateFeatureName = require("./FeatureNameGenerator");


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