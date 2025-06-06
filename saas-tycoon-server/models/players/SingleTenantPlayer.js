const { v4: uuidv4 } = require('uuid');
const MonolithFeature = require('../features/MonolithFeature');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const constants = require('./constants');
const PlayerStats = require('./PlayerStats');

function SingleTenantPlayer(name) {
    this.id = uuidv4();
    this.name = name;
    this.playerClass = 'SingleTenant';
    this.ready = false;
    this.features = [new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 2, 0)];
    this.stats = {
        0: new PlayerStats(
            cash = 5000,
            customers = 1,
            legacySkills = 1,
            cloudNativeSkills = 1,
            opsMaturity = 0
        )
    };
    this.turns = {};

    this.actions = {
        BUILD_MONOLITH_FEATURE: (turn, action) => {
            this.stats[turn].cash -= constants.DEV_COST_MONOLITH;
            this.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
        },
        BUILD_CONTROL_PLANE: (turn, action) => {
            if (this.stats[turn].cloudNativeSkills < 4) {
                throw new Error('Cloud Native skill must be 4 or more to build control plane.');
            }
            this.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
            this.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
        },
        BUILD_MULTITENANT_FEATURE: (turn, action) => {
            const hasControlPlane = this.features.some(
                feature => feature.architecture === 'control-plane'
            );
            if (!hasControlPlane) {
                throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
            }
            this.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
            this.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn));
        },
        BUILD_SINGLETENANT_FEATURE: (turn, action) => {
            if (this.stats[turn].cloudNativeSkills < 1) {
                throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
            }
            this.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
            this.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn));
        },
        TECH_DEBT_REDUCTION: (turn, action) => {
            const buggyFeatures = this.features.filter(feature => feature.techDebt > 0);
            this.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * buggyFeatures.length;
            buggyFeatures.forEach(feature => {
                feature.techDebt = Math.max(0, feature.techDebt - 2);
            });
        },
        DEVOPS: (turn, action) => {
            const currentOpsMaturity = this.stats[turn].opsMaturity;
            const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity + 1);
            this.stats[turn].cash -= upgradeCost;
            this.stats[turn].opsMaturity += 1;
        },
        TRAINING: (turn, action) => {
            const currentCloudSkills = this.stats[turn].cloudNativeSkills;
            const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills + 1);
            this.stats[turn].cash -= upgradeCost;
            this.stats[turn].cloudNativeSkills += 1;
        },
        TRAINING_LEGACY: (turn, action) => {
            const currentLegacySkills = this.stats[turn].legacySkills;
            const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills + 1);
            this.stats[turn].cash -= upgradeCost;
            this.stats[turn].legacySkills += 1;
        },
        LAUNCH_MARKETING_CAMPAIGN: (turn, action) => {
            this.stats[turn].cash -= constants.MARKETING_COST;
            const numFeatures = this.features.length;
            const opsMaturity = this.stats[turn].opsMaturity;
            let successChance = 0.2 + (numFeatures * 0.1) + (opsMaturity * 0.1);
            if (successChance > 0.9) successChance = 0.9;

            if (Math.random() < successChance) {
                const gainedCustomers = 1 + Math.round(numFeatures * 0.2) + Math.round(opsMaturity * 0.5);
                this.stats[turn].customers += gainedCustomers;
            }
        },
        OPTIMIZE_PRICING: (turn, action) => {
            this.stats[turn].cash -= 700;
            this.stats[turn].revenue += 1000;
        }
    };

    this.eventHandlers = {
        // Each team gains +1 operational maturity from the OSSP Lighthouse Program.
        LIGHTHOUSE_PROGRAM: (turn) => {
            this.stats[turn].opsMaturity += 1;
        },
        // Technical debt makes it hard to deliver new features and innovate. Teams with features having more than 4 tech debt points lose 1 customer.
        CUSTOMER_CHURN: (turn) => {
            let highTechDebtFeatures = this.features.filter(feature => feature.techDebt > 4);
            if (highTechDebtFeatures.length > 0) {
                this.stats[turn].customers = Math.max(0, this.stats[turn].customers - 1);
            }
        },
        // Teams with more cloud native features than legacy features gain 1 customer.
        CLOUD_MIGRATION: (turn) => {
            let cloudNativeFeatures = this.features.filter(feature => feature.architecture === 'microservice');
            let legacyFeatures = this.features.filter(feature => feature.architecture === 'monolith');
            if (cloudNativeFeatures.length > legacyFeatures.length) {
                this.stats[turn].customers += 1;
            }
        },

        // Highly skilled teams (both legacy or cloud native) with more than 5 skill points gain a customer.
        INNOVATION: (turn) => {
            let totalSkills = this.stats[turn].legacySkills + this.stats[turn].cloudNativeSkills;
            if (totalSkills > 5) {
                this.stats[turn].customers += 1;
            }
        },
        // A new competitor has entered the market.  All teams are forced to lower their feature pricing by 10% to compete.
        MARKET_DISRUPTION: (turn) => {
            this.features.forEach((feature) => {
                feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
            });

        },
        // You are required to pay the customer a fine dependent on your operational maturity gap.
        DOWNTIME: (turn) => {

            this.stats[turn].cash = Math.max(0, this.stats[turn].cash - (500 * (constants.OPS_MATURITY_MAX - this.stats[turn].opsMaturity)));
        },
        // Economic conditions have forced infrastructure costs to rise by 20% for all teams.
        RISING_COSTS: (turn) => {
            this.features.forEach((feature) => {
                feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2); // Increase dev cost by 20%
            });
        },
    };

    this.finishTurn = function (turn) {
        let featureRevenue = 0;
        this.features.forEach((feature) => {
            featureRevenue += feature.calculateRevenue(turn, this.stats[turn].customers);
            feature.updateTechDebt(turn);
        });
        this.stats[turn].cash += featureRevenue;
    };

    this.applyAction = function (action, turn) {
        if (this.actions[action.code]) {
            this.actions[action.code](turn, action);
        } else {
            console.log('Unknown action type:', action);
        }
    };
}

module.exports = SingleTenantPlayer;