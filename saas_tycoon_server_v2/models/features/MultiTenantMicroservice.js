

function MultiTenantMicroservice(price, techDebt, turn) {
    this.architecture = 'microservice';
    this.featureDevCost = 1000;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 600;
    this.createdTurn = turn;
    this.revenueStats = {};
    this.calculateRevenue = function (turn, customers) {
        let techDebtCost = this.techDebt * 100;  // techDebt affects total revenue
        let featureRevenue = this.featurePrice * customers; // total feature revenue
        let infrastructureCost = this.infrastructureCost; // infrastructure cost is constant, since it's multitenant
        let netRevenue = featureRevenue - infrastructureCost - techDebtCost;
        this.revenueStats= {
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
        if (featureAge > 8) {
            this.techDebt += 1;
        }
    }
}

module.exports = MultiTenantMicroservice;