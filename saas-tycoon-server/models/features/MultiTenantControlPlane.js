

function MultiTenantControlPlane(price,featureDevCost, techDebt, turn) {
    this.architecture = 'control-plane';
    this.name = 'Multi-Tenant Control Plane';
    this.featureDevCost = featureDevCost;
    this.techDebt = techDebt;
    this.featurePrice = 0;
    this.infrastructureCost = 300;
    this.createdTurn = turn;
    this.revenueStats = [];
    this.calculateRevenue = function (turn, customers) {
        let featureRevenue = 0; // total feature revenue - CP - no revenue.
        let infrastructureCost = this.infrastructureCost ; // cost is constant, since it's multitenant
        let techDebtCost = Math.min(800,this.techDebt * 100);  // techDebt affects total revenue
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