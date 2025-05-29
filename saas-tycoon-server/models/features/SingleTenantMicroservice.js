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
    this.calculateRevenue = function (turn, customers) {
        let techDebtCost = Math.min(800,this.techDebt * 100);  // techDebt affects total revenue
        let featureRevenue = this.featurePrice * customers; // total feature revenue
        let infrastructureCost = this.infrastructureCost * customers; // infrastructure cost is per customer, since it's monolith
        let netRevenue = featureRevenue - infrastructureCost - techDebtCost;
        this.revenueStats.push({
            turn: turn,
            featureRevenue: featureRevenue,
            infrastructureCost: infrastructureCost,
            techDebtCost: techDebtCost,
            netRevenue: netRevenue
        });
        return netRevenue;

    }
    this.updateTechDebt = function (turn) {
        let featureAge = turn - this.createdTurn;
        if (featureAge > 4) {
            this.techDebt += 1;
        }
    }
}

module.exports = SingleTenantMicroservice;