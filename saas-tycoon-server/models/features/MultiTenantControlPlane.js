

function MultiTenantControlPlane(price,featureDevCost, techDebt, turn) {
    this.architecture = 'control-plane';
    this.name = 'Multi-Tenant Control Plane';
    this.featureDevCost = featureDevCost;
    this.techDebt = techDebt;
    this.featurePrice = 0;
    this.infrastructureCost = 400;
    this.createdTurn = turn;
    this.revenueStats = [];
    
}

module.exports = MultiTenantControlPlane;