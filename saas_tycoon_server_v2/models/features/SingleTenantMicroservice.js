

function SingleTenantMicroservice(price, techDebt, turn) {
    this.architecture = 'microservice';
    this.featureDevCost = 1000;
    this.techDebt = techDebt;
    this.featurePrice = 0;
    this.infrastructureCost = 200;
    this.createdTurn = turn;
    this.revenueStats = {};
    this.calculateRevenue = function (turn, customers) {
        let techDebtCost = this.techDebt * 100;  // techDebt affects total revenue
        let featureRevenue = this.featurePrice * customers; // total feature revenue
        let infrastructureCost = this.infrastructureCost * customers; // infrastructure cost is per customer, since it's monolith
        let netRevenue = featureRevenue - infrastructureCost - techDebtCost;
        this.revenueStats = {
            turn: turn,
            featureRevenue: featureRevenue,
            infrastructureCost: infrastructureCost,
            techDebtCost: techDebtCost,
            netRevenue: netRevenue
        };
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