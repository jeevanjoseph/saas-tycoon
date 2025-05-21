

function MonolithFeature(price, techDebt) {
    this.architecture = 'monolith';
    this.featureDevCost = 1000;
    this.techDebt = techDebt;
    this.featurePrice = price;
    this.infrastructureCost = 500;
    this.calculateRevenue = function () {
        return 1000;
    }
}

module.exports = MonolithFeature;