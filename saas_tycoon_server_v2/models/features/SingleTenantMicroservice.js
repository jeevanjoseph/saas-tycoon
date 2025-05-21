

function SingleTenantMicroservice(price, techDebt) {
    this.architecture = 'microservice';
    this.featureDevCost = 1500;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 500;
    this.calculateRevenue = function () {
        return 1000;
    }
}

module.exports = SingleTenantMicroservice;