const MonolithFeature = require('../features/MonolithFeature');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const FeatureActions = require('../features/FeatureActions');
const constants = require('./constants');

// --- ACTIONS ---

const actions = {
  Monolith: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      player.stats[turn].cash -= constants.DEV_COST_MONOLITH;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      player.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn));
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn));
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(0, feature.techDebt - 2);
      });
    },
    DEVOPS: function (player, turn, action) {
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
    },
    TRAINING: function (player, turn, action) {
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      player.stats[turn].cash -= constants.MARKETING_COST;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let successChance = 0.2 + (numFeatures * 0.1) + (opsMaturity * 0.1);
      if (successChance > 0.9) successChance = 0.9;
      if (Math.random() < successChance) {
        const gainedCustomers = 1 + Math.round(numFeatures * 0.2) + Math.round(opsMaturity * 0.5);
        player.stats[turn].customers += gainedCustomers;
      }
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      player.stats[turn].cash -= 700;
      player.stats[turn].revenue += 1000;
    }
  },
  SingleTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      player.stats[turn].cash -= constants.DEV_COST_MONOLITH;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      player.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn));
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn));
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(0, feature.techDebt - 2);
      });
    },
    DEVOPS: function (player, turn, action) {
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
    },
    TRAINING: function (player, turn, action) {
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      player.stats[turn].cash -= constants.MARKETING_COST;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let successChance = 0.2 + (numFeatures * 0.1) + (opsMaturity * 0.1);
      if (successChance > 0.9) successChance = 0.9;
      if (Math.random() < successChance) {
        const gainedCustomers = 1 + Math.round(numFeatures * 0.2) + Math.round(opsMaturity * 0.5);
        player.stats[turn].customers += gainedCustomers;
      }
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      player.stats[turn].cash -= 700;
      player.stats[turn].revenue += 1000;
    }
  },
  MultiTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      player.stats[turn].cash -= constants.DEV_COST_MONOLITH;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      player.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn));
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn));
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 2);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(0, feature.techDebt - 3);
      });
    },
    DEVOPS: function (player, turn, action) {
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
    },
    TRAINING: function (player, turn, action) {
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      player.stats[turn].cash -= constants.MARKETING_COST;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let successChance = 0.2 + (numFeatures * 0.1) + (opsMaturity * 0.1);
      if (successChance > 0.9) successChance = 0.9;
      if (Math.random() < successChance) {
        const gainedCustomers = 1 + Math.round(numFeatures * 0.2) + Math.round(opsMaturity * 0.5);
        player.stats[turn].customers += gainedCustomers;
      }
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      player.stats[turn].cash -= 700;
      player.stats[turn].revenue += 1000;
    }
  }
};

// --- EVENT HANDLERS ---

const eventHandlers = {
  Monolith: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      player.stats[turn].opsMaturity += 1;
    },
    CUSTOMER_CHURN: function (player, turn) {
      let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 4);
      if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      let cloudNativeFeatures = player.features.filter(feature => feature.architecture === 'microservice' || feature.architecture === 'mt-microservice');
      let legacyFeatures = player.features.filter(feature => feature.architecture === 'monolith');
      if (cloudNativeFeatures.length > legacyFeatures.length) {
        player.stats[turn].customers += 1;
      }
    },
    INNOVATION: function (player, turn) {
      let totalSkills = player.stats[turn].legacySkills + player.stats[turn].cloudNativeSkills;
      if (totalSkills > 5) {
        player.stats[turn].customers += 1;
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      player.features.forEach((feature) => {
        feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
      });
    },
    DOWNTIME: function (player, turn) {
      player.stats[turn].cash = Math.max(0, player.stats[turn].cash - (500 * (constants.OPS_MATURITY_MAX - player.stats[turn].opsMaturity)));
    },
    RISING_COSTS: function (player, turn) {
      player.features.forEach((feature) => {
        feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2);
      });
    }
  },
  SingleTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      player.stats[turn].opsMaturity += 1;
    },
    CUSTOMER_CHURN: function (player, turn) {
      let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 4);
      if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      let cloudNativeFeatures = player.features.filter(feature => feature.architecture === 'microservice' || feature.architecture === 'mt-microservice');
      let legacyFeatures = player.features.filter(feature => feature.architecture === 'monolith');
      if (cloudNativeFeatures.length > legacyFeatures.length) {
        player.stats[turn].customers += 1;
      }
    },
    INNOVATION: function (player, turn) {
      let totalSkills = player.stats[turn].legacySkills + player.stats[turn].cloudNativeSkills;
      if (totalSkills > 5) {
        player.stats[turn].customers += 1;
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      player.features.forEach((feature) => {
        feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
      });
    },
    DOWNTIME: function (player, turn) {
      player.stats[turn].cash = Math.max(0, player.stats[turn].cash - (500 * (constants.OPS_MATURITY_MAX - player.stats[turn].opsMaturity)));
    },
    RISING_COSTS: function (player, turn) {
      player.features.forEach((feature) => {
        feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2);
      });
    }
  },
  MultiTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      player.stats[turn].opsMaturity += 1;
    },
    CUSTOMER_CHURN: function (player, turn) {
      let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 4);
      if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      let cloudNativeFeatures = player.features.filter(feature => feature.architecture === 'microservice' || feature.architecture === 'mt-microservice');
      let legacyFeatures = player.features.filter(feature => feature.architecture === 'monolith');
      if (cloudNativeFeatures.length > legacyFeatures.length) {
        player.stats[turn].customers += 1;
      }
    },
    INNOVATION: function (player, turn) {
      let totalSkills = player.stats[turn].legacySkills + player.stats[turn].cloudNativeSkills;
      if (totalSkills > 5) {
        player.stats[turn].customers += 1;
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      player.features.forEach((feature) => {
        feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
      });
    },
    DOWNTIME: function (player, turn) {
      player.stats[turn].cash = Math.max(0, player.stats[turn].cash - (500 * (constants.OPS_MATURITY_MAX - player.stats[turn].opsMaturity)));
    },
    RISING_COSTS: function (player, turn) {
      player.features.forEach((feature) => {
        feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2);
      });
    }
  }
};

// --- MAIN APPLY FUNCTION ---

function applyAction(player, action, turn) {
  const playerType = player.playerClass;
  const playerActions = actions[playerType];
  if (playerActions && playerActions[action.code]) {
    playerActions[action.code](player, turn, action);
  } else {
    console.log('Unknown action type:', action);
  }
}

function applyEvent(player, event, turn) {
  const playerType = player.playerClass;
  const playerEventHandlers = eventHandlers[playerType];
  if (playerEventHandlers && playerEventHandlers[event.type]) {
    playerEventHandlers[event.type](player, turn);
  } else {
    console.log('Unknown event type:', event.type);
  }
}



function finishTurn(player, turn) {
  let featureRevenue = 0;
  player.features.forEach((feature) => {
    featureRevenue += FeatureActions.calculateRevenue(feature, turn, player.stats[turn].customers);
    FeatureActions.updateTechDebt(feature, turn);
  });
  player.stats[turn].cash += featureRevenue;
}

module.exports = {
  applyAction,
  applyEvent,
  finishTurn
};