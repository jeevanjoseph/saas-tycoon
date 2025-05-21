

function MultiTenantControlPlane(price, techDebt) {
    this.architecture = 'microservice';
    this.featureDevCost = 2000;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 1000;
    this.calculateRevenue = function () {
        return 0;
    }
}

module.exports = MultiTenantControlPlane;