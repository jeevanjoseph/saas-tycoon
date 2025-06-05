const { v4: uuidv4 } = require('uuid');
const MonolithFeature = require('../features/MonolithFeature');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const constants = require('./constants');
const PlayerStats = require('./PlayerStats');
// Function to create a default player
// with monolith architecture
function SingleTenantPlayer(name) {
    this.id = uuidv4();
    this.name = name;
    this.playerClass = 'SingleTenant';
    this.ready = false;
    this.features = [new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 2, 0)];
    this.stats = {
        0: new PlayerStats(cash = 5000,
            customers = 1,
            legacySkills = 1,
            cloudNativeSkills = 1,
            opsMaturity = 0)
    };
    this.turns = {};
    this.actions = {
        BUILD_MONOLITH_FEATURE: (turn) => {
            this.stats[turn].cash -= constants.DEV_COST_MONOLITH;
            this.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
        },
        BUILD_CONTROL_PLANE: (turn) => {
            if (this.stats[turn].cloudNativeSkills < 4) {
                throw new Error('Cloud Native skill must be 2 or more to build control plane.');
            }
            this.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
            this.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
        },
        BUILD_MULTITENANT_FEATURE: (turn) => {
            const hasControlPlane = this.features.some(
                feature => feature.architecture === 'control-plane'
            );
            if (!hasControlPlane) {
                throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
            }
            this.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
            this.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn)); // Example feature
        },
        BUILD_SINGLETENANT_FEATURE: (turn) => {
            if (this.stats[turn].cloudNativeSkills < 1) {
                throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
            }
            this.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
            this.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn)); // Example feature
        },
        TECH_DEBT_REDUCTION: (turn) => {
            const buggyFeatures = this.features.filter(feature => feature.techDebt > 2);
            this.stats[turn].cash -= 200 * buggyFeatures.length;
            buggyFeatures.forEach(feature => {
                feature.techDebt = Math.max(0, feature.techDebt - 2); // Reduce tech debt
            });

        },
        DEVOPS: (turn) => {
            this.stats[turn].cash -= 500; // Example cost
            this.stats[turn].opsMaturity += 1; // Increase operational maturity
        },
        TRAINING: (turn) => {
            this.stats[turn].cash -= constants.TRAINING_COST_CLOUD;
            this.stats[turn].cloudNativeSkills += 1; // Increase cloud-native skills
        },
        TRAINING_LEGACY: (turn) => {
            this.stats[turn].cash -= constants.TRAINING_COST_LEGACY;
            this.stats[turn].legacySkills += 1; // Increase legacy skills
        },
        LAUNCH_MARKETING_CAMPAIGN: (turn) => {
            this.stats[turn].cash -= constants.MARKETING_COST;
            this.stats[turn].customers += 2; // Example new customers
        },
        OPTIMIZE_PRICING: (turn) => {
            this.stats[turn].cash -= 700; // Example cost
            this.stats[turn].revenue += 1000; // Example revenue increase
        }
    };


    this.eventHandlers = {
        TECH_DEBT_REDUCTION: (turn) => {
            this.features.forEach((feature) => {
                feature.techDebt = Math.max(0, feature.techDebt - 1);
            });
        },
        REVENUE_BOOST: (turn) => {
            this.features.forEach((feature) => {
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
            if (this.features.some(f => f.architecture === 'microservice')) {
                this.stats[turn].customers += 1;
            }
        },
        MARKET_DISRUPTION: (turn) => {
            this.features.forEach((feature) => {
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


    this.finishTurn = function (turn) {
        let featureRevenue = 0;
        this.features.forEach((feature) => {
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


module.exports = SingleTenantPlayer;