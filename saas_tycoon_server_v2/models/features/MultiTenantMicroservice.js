

function MultiTenantMicroservice(price, techDebt) {
    this.architecture = 'microservice';
    this.featureDevCost = 1000;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 500;
    this.calculateRevenue = function () {
        return 1000;
    }
}

module.exports = MultiTenantMicroservice;