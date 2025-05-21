const { v4: uuidv4 } = require('uuid');
const MonolithFeature = require('../features/MonolithFeature');
const PlayerStats = require('./PlayerStats');

// Function to create a default player
// with monolith architecture
function MonolithPlayer(name) {
    this.id = uuidv4();
    this.name = name;
    this.playerClass = 'Monolith';
    this.stats = { 
        0: new PlayerStats(cash = 5000,
            customers = 2,
            infrastructureCost = 500,
            features = features = [new MonolithFeature(0, 2)],
            skills = { legacy: 1, cloudNative: 1 },
            opsMaturity = 0,
            techDebt = 1,
            revenue = 0)    
    };
    this.actions = {};
    this.updateCash = function () {
        this.features.forEach(feature => {
            this.cash += feature.calculateRevenue();
        });
    };
    this.applyAction = function (action) {
        // Apply the action to the player
        switch (action.type) {
            case 'upgrade':
                this.cash -= action.cost;
                this.features.push(new MonolithFeature(action.price, action.techDebt));
                break;
            case 'downgrade':
                this.cash += action.refund;
                this.features = this.features.filter(feature => feature.id !== action.featureId);
                break;
            case 'payTechDebt':
                this.cash -= action.amount;
                this.techDebt -= action.amount;
                break;
            default:
                console.log('Unknown action type');
        }
    }
}


module.exports = MonolithPlayer;