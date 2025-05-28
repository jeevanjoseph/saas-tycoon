const { v4: uuidv4 } = require('uuid');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const PlayerStats = require('./PlayerStats');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const constants = require('./constants');
function MultiTenantPlayer(name) {
    this.id = uuidv4();
    this.name = name;
    this.playerClass = 'MultiTenant';
    this.stats = {
        0: new PlayerStats(
            (cash = 5000),
            (customers = 2),
            (infrastructureCost = 500),
            (features = []),
            (skills = { legacy: 0, cloudNative: 2 }),
            (opsMaturity = 1),
            (techDebt = 0),
            (revenue = 0)
        )
    };
    this.turns = {}
    // Define available actions
    this.actions = {
         BUILD_CONTROL_PLANE: (turn) => {
            if (this.stats[turn].skills.cloudNative < 2) {
                throw new Error('Cloud Native skill must be 2 or more to build control plane.');
            }
            this.stats[turn].cash -= 2000; // Example cost
            this.stats[turn].features.push(new MultiTenantControlPlane(2000, 0, turn)); // Example feature
        },
        BUILD_MULTITENANT_FEATURE: (turn) => {
            const hasControlPlane = this.stats[turn].features.some(
                feature => feature.featurePrice === 0 && feature.architecture === 'microservice'
            );
            if (!hasControlPlane) {
                throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
            }
            this.stats[turn].cash -= 1000; // Example cost
            this.stats[turn].features.push(new MultiTenantMicroservice(1000, 0, turn)); // Example feature
        },
        FIX_BUGS: (turn) => {
            this.stats[turn].cash -= 400; // Example cost
            this.stats[turn].features.forEach((feature) => {
                feature.techDebt = Math.max(0, feature.techDebt - 1);
            }); // Reduce tech debt
        },
        TRAINING: (turn) => {
            this.stats[turn].cash -= 500; // Example cost
            this.stats[turn].skills.cloudNative += 1; // Increase cloud-native skills
        },
        LAUNCH_MARKETING_CAMPAIGN: (turn) => {
            this.stats[turn].cash -= 800; // Example cost
            this.stats[turn].customers += 2; // Example new customers
        },
        DEVOPS: (turn) => {
            this.stats[turn].cash -= 500; // Example cost
            this.stats[turn].opsMaturity += 1; // Increase operational maturity
        },
        ACQUIRE_CUSTOMERS: (turn) => {
            this.stats[turn].cash -= 1500; // Example cost
            this.stats[turn].customers += 3; // Example new customers
        },
        REDUCE_TECH_DEBT: (turn) => {
            this.stats[turn].cash -= 500; // Example cost
            this.stats[turn].techDebt = Math.max(0, this.stats[turn].techDebt - 2); // Reduce tech debt
        },
        EXPAND_TEAM: (turn) => {
            this.stats[turn].cash -= 600; // Example cost
            this.stats[turn].skills.cloudNative += 1; // Increase cloud-native skills
        },
        OPTIMIZE_PRICING: (turn) => {
            this.stats[turn].cash -= 700; // Example cost
            this.stats[turn].revenue += 1000; // Example revenue increase
        },
        CONDUCT_TRAINING: (turn) => {
            this.stats[turn].cash -= 400; // Example cost
            this.stats[turn].skills.cloudNative += 1; // Increase cloud-native skills
        },
        SPECTRA_LIGHTHOUSE_TRAINING: (turn) => {
            this.stats[turn].cash -= 250; // Example cost
            this.stats[turn].skills.cloudNative += 1; // Increase cloud-native skills
        }
    };

    this.eventHandlers = {
        TECH_DEBT_REDUCTION: (turn) => {
          this.stats[turn].features.forEach((feature) => {
              feature.techDebt = Math.max(0, feature.techDebt - 1);
          });
        },
        REVENUE_BOOST: (turn) => {
            this.stats[turn].features.forEach((feature) => {
                feature.featurePrice += 300;
            });
        },
        INFRA_UPGRADE: (turn) => {
          this.stats[turn].opsMaturity += 1;
        },
        CUSTOMER_CHURN: (turn) => {
            this.stats[turn].customers = Math.max(0, this.stats[turn].customers - 1);
        },
        CLOUD_MIGRATION: (turn) => {
          if (this.stats[turn].features.some(f => f.architecture === 'microservice')) {
            this.stats[turn].customers += 1;
          }
        },
        MARKET_DISRUPTION: (turn) => {
            this.stats[turn].features.forEach((feature) => {
                if (feature.architecture === 'monolith') {
                    feature.featurePrice = Math.max(0, feature.featurePrice - 500);
                  }
            });
          
        },
        DOWNTIME: (turn) => {
            this.stats[turn].cash = Math.max(0, this.stats[turn].cash - (100 * (constants.OPS_MATURITY_MAX - this.stats[turn].opsMaturity)));
        },
        VIRAL_MARKETING: (turn) => {
            this.stats[turn].customers += 2;
        },
    }

    // Update cash based on feature revenue
    this.finishTurn = function (turn) {
        let featureRevenue = 0;
        this.stats[turn].features.forEach((feature) => {
            featureRevenue += feature.calculateRevenue(turn, this.stats[turn].customers);  // Calculate net revenue for each feature
            feature.updateTechDebt(turn);  // Update tech debt for each feature based on age
        });
        this.stats[turn].cash += featureRevenue;
    };

    // Apply an action to the player
    this.applyAction = function (action, turn) {
        if (this.actions[action]) {
            this.actions[action](turn);
        } else {
            console.log('Unknown action type:', action);
        }
    };
}

module.exports = MultiTenantPlayer;