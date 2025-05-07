const { v4: uuidv4 } = require('uuid');
const MonolithFeature = require('./MonolithFeature');

// Function to create a default player
// with monolith architecture
function MonolithPlayer(name) {
    this.id = uuidv4(),
        this.name = name;
    this.cash = 5000;
    this.customers = 2;
    this.infrastructureCost = 500;
    this.features = [new MonolithFeature(0, 2), new MonolithFeature(0, 2), new MonolithFeature(0, 2), new MonolithFeature(0, 2)];
    this.skills = { legacy: 1, cloudNative: 0 }
    this.opsMaturity = 1;
    this.techDebt = 2;
    this.revenue = 0;
    this.actions = {};
    this.updateCash = function () {
        this.features.forEach(feature => {
            this.cash += feature.calculateRevenue();
        });
    }
}

module.exports = MonolithPlayer;