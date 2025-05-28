

function MultiTenantControlPlane(price, techDebt, turn) {
    this.architecture = 'microservice';
    this.name = 'Multi-Tenant Control Plane';
    this.featureDevCost = 1000;
    this.techDebt = techDebt;
    this.featurePrice = 0;
    this.infrastructureCost = 400;
    this.createdTurn = turn;
    this.revenueStats = [];
    this.calculateRevenue = function (turn, customers) {
        let featureRevenue = 0; // total feature revenue - CP - no revenue.
        let infrastructureCost = this.infrastructureCost ; // cost is constant, since it's multitenant
        let techDebtCost = this.techDebt * 100;  // techDebt affects total revenue
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
        if (featureAge > 8) {
            this.techDebt += 1;
        }
    }
}

module.exports = MultiTenantControlPlane;