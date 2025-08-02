const MonolithFeature = require('../features/MonolithFeature');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const FeatureActions = require('../features/FeatureActions');
const constants = require('./constants');
const { addPlayerLog } = require('../../util/PlayerLog')
const { handleLighthouseProgram,
  handleCustomerChurn,
  handleCloudMigration,
  handleInnovation,
  handleMarketDisruption,
  handleDowntime,
  handleRisingCosts,
  handleFeatureInnovation,
  handleOperationalExcellence,
  handleTechDebtCrisis,
  handleLegacySkillsShortage,
  handleFeatureBloat,
  handleMarketSaturation,
  handleRegulatoryChanges,
  handleBreakingVendorLockin,
  handleCustomerExperienceRevolution,
  handleMajorCVE } = require('../events/EventHandlers')



// Helper to check and decrement cooldowns at the start of each turn
function decrementActionCooldowns(player) {
  if (!player.actionCooldowns) player.actionCooldowns = {};
  for (const action in player.actionCooldowns) {
    if (player.actionCooldowns[action] > 0) {
      player.actionCooldowns[action] -= 1;
    }
  }
}

// Call decrementActionCooldowns(player) at the start of each turn for each player in your turn processing logic.

// Helper to check cooldown before executing an action
function checkActionCooldown(player, actionCode) {
  if (!player.actionCooldowns) player.actionCooldowns = {};
  if (player.actionCooldowns[actionCode] > 0) {
    throw new Error(`You must wait ${player.actionCooldowns[actionCode]} more turn(s) before using "${actionCode.replace(/_/g, ' ')}" again.`);
  }
}

// Decrement cooldowns based on training or ops maturity
function decrementCloudFeatureCooldowns(player, turn) {
  if (player.actionCooldowns && player.actionCooldowns['BUILD_SINGLETENANT_FEATURE']) {
    let singleTenantCooldownPeriod = player.actionCooldowns['BUILD_SINGLETENANT_FEATURE'];
    if (player.stats[turn].cloudNativeSkills >= 7) {
      singleTenantCooldownPeriod = Math.max(0, singleTenantCooldownPeriod - 2); // Reduce cooldown by 2 if cloud native skills are a greater 7  
    } else if (player.stats[turn].cloudNativeSkills >= 5) {
      singleTenantCooldownPeriod = Math.max(0, singleTenantCooldownPeriod - 1); // Reduce cooldown by 1 if cloud native skills are a greater 5
    }
    player.actionCooldowns['BUILD_SINGLETENANT_FEATURE'] = singleTenantCooldownPeriod;
    addPlayerLog(player, turn, { code: 'DECREMENT_COOLDOWNS' }, `Cooldowns adjusted based on skills:  SingleTenant ${singleTenantCooldownPeriod}`, player.stats[turn].cash, player.stats[turn].cash);
  }

  if (player.actionCooldowns && player.actionCooldowns['BUILD_MULTITENANT_FEATURE']) {
    let multitenantCooldownPeriod = player.actionCooldowns['BUILD_MULTITENANT_FEATURE'];
    if (player.stats[turn].cloudNativeSkills >= 7) {
      multitenantCooldownPeriod = Math.max(0, multitenantCooldownPeriod - 2); // Reduce cooldown by 2 if cloud native skills are a greater 7
    } else if (player.stats[turn].cloudNativeSkills >= 5) {
      multitenantCooldownPeriod = Math.max(0, multitenantCooldownPeriod - 1); // Reduce cooldown by 1 if cloud native skills are a greater 5
    }

    player.actionCooldowns['BUILD_MULTITENANT_FEATURE'] = multitenantCooldownPeriod;
    addPlayerLog(player, turn, { code: 'DECREMENT_COOLDOWNS' }, `Cooldowns adjusted based on skills: MultiTenant ${multitenantCooldownPeriod}`, player.stats[turn].cash, player.stats[turn].cash);
  }


}

// Decrement cooldowns based on training or ops maturity
function decrementLegacyFeatureCooldowns(player, turn) {
  if (player.actionCooldowns && player.actionCooldowns['BUILD_MONOLITH_FEATURE']) {
    let monolithCooldownPeriod = player.actionCooldowns['BUILD_MONOLITH_FEATURE'];
    if (player.stats[turn].legacySkills >= 7) {
      monolithCooldownPeriod = Math.max(0, monolithCooldownPeriod - 2); // Reduce cooldown by 2 if legacy skills are a greater 7
    } else if (player.stats[turn].legacySkills >= 5) {
      monolithCooldownPeriod = Math.max(0, monolithCooldownPeriod - 1); // Reduce cooldown by 1 if legacy skills are a greater 5
    }
    player.actionCooldowns['BUILD_MONOLITH_FEATURE'] = monolithCooldownPeriod;
    addPlayerLog(player, turn, { code: 'DECREMENT_COOLDOWNS' }, `Cooldowns adjusted based on skills: Monolith ${monolithCooldownPeriod}`, player.stats[turn].cash, player.stats[turn].cash);
  }
}

// Helper to set cooldown after executing an action
function setActionCooldown(player, turn, actionCode) {
  if (!player.actionCooldowns) player.actionCooldowns = {};
  let cooldownPeriod = constants.ACTION_COOLDOWN_PERIODS[actionCode] || 0;
  if (actionCode === 'BUILD_MONOLITH_FEATURE') {
    if (player.stats[turn].legacySkills >= 7) {
      cooldownPeriod = Math.max(0, cooldownPeriod - 2); // Reduce cooldown by 2 if legacy skills are a greater 7
    } else if (player.stats[turn].legacySkills >= 5) {
      cooldownPeriod = Math.max(0, cooldownPeriod - 1); // Reduce cooldown by 1 if legacy skills are a greater 5
    }
  }

  if (actionCode === 'BUILD_SINGLETENANT_FEATURE') {
    if (player.stats[turn].cloudNativeSkills >= 7) {
      cooldownPeriod = Math.max(0, cooldownPeriod - 2); // Reduce cooldown by 2 if cloud native skills are a greater 7  
    } else if (player.stats[turn].cloudNativeSkills >= 5) {
      cooldownPeriod = Math.max(0, cooldownPeriod - 1); // Reduce cooldown by 1 if cloud native skills are a greater 5
    }
  }

  if (actionCode === 'BUILD_MULTITENANT_FEATURE') {
    if (player.stats[turn].cloudNativeSkills >= 7) {
      cooldownPeriod = Math.max(0, cooldownPeriod - 2); // Reduce cooldown by 2 if cloud native skills are a greater 7
    } else if (player.stats[turn].cloudNativeSkills >= 5) {
      cooldownPeriod = Math.max(0, cooldownPeriod - 1); // Reduce cooldown by 1 if cloud native skills are a greater 5
    }
  }

  if (actionCode === 'LAUNCH_MARKETING_CAMPAIGN') {
    cooldownPeriod = constants.ACTION_COOLDOWN_PERIODS[actionCode]
  }
  if (cooldownPeriod < (constants.ACTION_COOLDOWN_PERIODS[actionCode] || 0)) {
    addPlayerLog(player, turn, { code: actionCode }, `Cooldown for ${actionCode.replace(/_/g, ' ')} reduced to ${cooldownPeriod} turns due to skill level.`, player.stats[turn].cash, player.stats[turn].cash);
  }
  player.actionCooldowns[actionCode] = cooldownPeriod
}

// --- ACTIONS ---

const actions = {
  Monolith: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_MONOLITH_FEATURE');
      const cashBefore = player.stats[turn].cash;
      const devCost = MonolithFeature.calculateMonolithDevCost(player, turn);

      player.stats[turn].cash -= devCost;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_MONOLITH_FEATURE');
      if (devCost > constants.DEV_COST_MONOLITH) {
        addPlayerLog(player, turn, action, `Monolith development cost for you have risen to ${devCost}. As you build more features, its harder for you to coordinate monolith releases. Improve your LEGACY skills to counter balance. As you add more customers, it difficult to keep up with your sprawling infra footprint. Improve your operational maturity to counter balance this.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, 'Built Monolith Feature. Keep track of your costs though as the stack requires more upkeep(tech debt) and you pay the infra costs for every customer you add.', cashBefore, cashAfter);
      }
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_CONTROL_PLANE');
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      const devCost = constants.DEV_COST_CONTROL_PLANE;
      player.stats[turn].cash -= devCost;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_CONTROL_PLANE');
      addPlayerLog(player, turn, action, 'Pivoting to an efficient SaaS model, and built a MultiTenant Control Plane', cashBefore, cashAfter);
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_MULTITENANT_FEATURE');
      const cashBefore = player.stats[turn].cash;
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      const devCost = MultiTenantMicroservice.calculateMultiTenantMicroserviceDevCost(player, turn);
      player.stats[turn].cash -= devCost;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_MULTITENANT_FEATURE');
      if (devCost > constants.DEV_COST_MULTI_TENANT) {
        addPlayerLog(player, turn, action, `MultiTenant Microservice development cost for you have risen to ${devCost}. As you build more features, you need improve your CLOUD skills to keep up with managing all your features.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, 'Committed to a business transformation, and built MultiTenant Feature', cashBefore, cashAfter);
      }
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_SINGLETENANT_FEATURE');
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      const devCost = SingleTenantMicroservice.calculateSingleTenantMicroserviceDevCost(player, turn);
      player.stats[turn].cash -= devCost;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_SINGLETENANT_FEATURE');
      if (devCost > constants.DEV_COST_SINGLE_TENANT) {
        addPlayerLog(player, turn, action, `SingleTenant Microservice development cost for you have risen to ${devCost}.As you build more features, its harder for you to coordinate releases across your many features. Improve your CLOUD skills to counter balance this effect. As you add more customers, it difficult to keep up with your sprawling infra footprint. Improve your operational maturity to counter balance this.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, 'Implementing a modernization strategy by building a SingleTenant Microservice', cashBefore, cashAfter);
      }
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * (action.multiplier - action.multiplier / 10) * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(-1, feature.techDebt - (action.multiplier + 1)); // +1 becassue the turn will a unit of tech debt.
      });
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures.length} features.`, cashBefore, cashAfter);
    },
    DEVOPS: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity - constants.MONOLITH_STARTING_STATS.opsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity + 1}. `, cashBefore, cashAfter);
    },
    TRAINING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills - constants.MONOLITH_STARTING_STATS.cloudNativeSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Cloud Native Training`, cashBefore, cashAfter);
      decrementCloudFeatureCooldowns(player, turn);
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills - constants.MONOLITH_STARTING_STATS.legacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Legacy Training`, cashBefore, cashAfter);
      decrementLegacyFeatureCooldowns(player, turn);
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      checkActionCooldown(player, 'LAUNCH_MARKETING_CAMPAIGN');
      player.stats[turn].cash -= constants.MARKETING_COST;
      let successChance = 0.05 + (numFeatures * 0.05) + (opsMaturity * 0.08);
      if (successChance > 0.9) successChance = 0.9;
      let details = 'Launched Marketing Campaign';
      if (Math.random() < successChance) {
        const gainedCustomers = Math.min(constants.MARKETING_MAX_CUSTOMERS, (Math.round(numFeatures * 0.25) + Math.round(opsMaturity * 0.25)));
        player.stats[turn].customers += gainedCustomers;
        details += ` successfully, gained ${gainedCustomers} customers.`;
      } else {
        details += ' , but due to lack of features and operational maturity, it has failed to attract new customers. Customers look for feature rich products with a proven track record for operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'LAUNCH_MARKETING_CAMPAIGN');
      addPlayerLog(player, turn, action, details, cashBefore, cashAfter);
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      checkActionCooldown(player, 'OPTIMIZE_PRICING');
      player.stats[turn].cash -= constants.OPTIMIZATION_COST;
      player.features.forEach(feature => {
        feature.featurePrice += 500;
      });
      setActionCooldown(player, turn, 'OPTIMIZE_PRICING');
      let details = 'Raised feature pricing to drive up margins';
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let retainChance = Math.min(.95, (numFeatures * 0.1) + .5 + (opsMaturity * 0.08)); //5% chance of losing customers
      if (Math.random() > retainChance) {
        const lostCustomers = 1
        player.stats[turn].customers = Math.max(1, player.stats[turn].customers - lostCustomers);
        details += ` successfully, but lost ${lostCustomers} customers, due to high pricing and lack of features & Ops maturity.`;
      } else {
        details += ' successfully, customers retained due the feature richness and operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Raised feature pricing to drive up margins. Customers feel squeezed, and may start looking for alternatives.`, cashBefore, cashAfter);
    }
  },
  SingleTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_MONOLITH_FEATURE');
      const cashBefore = player.stats[turn].cash;
      const devCost = MonolithFeature.calculateMonolithDevCost(player, turn);

      player.stats[turn].cash -= devCost;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_MONOLITH_FEATURE');
      if (devCost > constants.DEV_COST_MONOLITH) {
        addPlayerLog(player, turn, action, `Monolith development cost for you have risen to ${devCost}. As you build more features, its harder for you to coordinate monolith releases. Improve your LEGACY skills to counter balance. As you add more customers, it difficult to keep up with your sprawling infra footprint. Improve your operational maturity to counter balance this.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, `Building a Monolith feature. They are cheap and quick to build, but they are hard to maintain and high operational costs.`, cashBefore, cashAfter);
      }
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_CONTROL_PLANE');
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      const devCost = constants.DEV_COST_CONTROL_PLANE;
      player.stats[turn].cash -= devCost;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_CONTROL_PLANE');
      addPlayerLog(player, turn, action, `Pivoting to a higher margin model afforded by a MultiTenant model and built a Control Plane`, cashBefore, cashAfter);
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_MULTITENANT_FEATURE');
      const cashBefore = player.stats[turn].cash;
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      const devCost = MultiTenantMicroservice.calculateMultiTenantMicroserviceDevCost(player, turn);
      player.stats[turn].cash -= devCost;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_MULTITENANT_FEATURE');
      if (devCost > constants.DEV_COST_MULTI_TENANT) {
        addPlayerLog(player, turn, action, `MultiTenant Microservice development cost for you have risen to ${devCost}. As you build more features, you need improve your CLOUD skills to keep up with managing all your features.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, `Committed to a true SaaS model and releases a new MultiTenant Microservice, with a better operational margin.`, cashBefore, cashAfter);
      }
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_SINGLETENANT_FEATURE');
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      const devCost = SingleTenantMicroservice.calculateSingleTenantMicroserviceDevCost(player, turn);
      player.stats[turn].cash -= devCost;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_SINGLETENANT_FEATURE');
      if (devCost > constants.DEV_COST_SINGLE_TENANT) {
        addPlayerLog(player, turn, action, `SingleTenant Microservice development cost for you have risen to ${devCost}.As you build more features, its harder for you to coordinate releases across your many features. Improve your CLOUD skills to counter balance this effect. As you add more customers, it difficult to keep up with your sprawling infra footprint. Improve your operational maturity to counter balance this.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, `Built SingleTenant Microservice using a modern technology stack. However the single tenant model may not be as profitable in the long term.`, cashBefore, cashAfter);
      }
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * (action.multiplier - action.multiplier / 10) * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(-1, feature.techDebt - (action.multiplier + 1)); // +1 becassue the turn will a unit of tech debt.
      });
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures.length} features.`, cashBefore, cashAfter);
    },
    DEVOPS: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity - constants.SINGLETENANT_STARTING_STATS.opsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity + 1}. `, cashBefore, cashAfter);


    },
    TRAINING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills - constants.SINGLETENANT_STARTING_STATS.cloudNativeSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Cloud Native Training', cashBefore, cashAfter);
      decrementCloudFeatureCooldowns(player, turn);
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills - constants.SINGLETENANT_STARTING_STATS.legacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Legacy Training', cashBefore, cashAfter);
      decrementLegacyFeatureCooldowns(player, turn);
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      checkActionCooldown(player, 'LAUNCH_MARKETING_CAMPAIGN');
      player.stats[turn].cash -= constants.MARKETING_COST;
      let successChance = 0.05 + (numFeatures * 0.05) + (opsMaturity * 0.08);
      if (successChance > 0.9) successChance = 0.9;
      let details = 'Launched Marketing Campaign';
      if (Math.random() < successChance) {
        const gainedCustomers = Math.min(constants.MARKETING_MAX_CUSTOMERS, (Math.round(numFeatures * 0.25) + Math.round(opsMaturity * 0.25)));
        player.stats[turn].customers += gainedCustomers;
        details += ` successfully, gained ${gainedCustomers} customers.`;
      } else {
        details += ' , but due to lack of features and operational maturity, it has failed to attract new customers. Customers look for feature rich products with a proven track record for operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'LAUNCH_MARKETING_CAMPAIGN');
      addPlayerLog(player, turn, action, details, cashBefore, cashAfter);
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.OPTIMIZATION_COST;
      player.features.forEach(feature => {
        feature.featurePrice += 500;
      });
      let details = 'Raised feature pricing to drive up margins';
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let retainChance = Math.min(.95, .5 + (numFeatures * 0.1) + (opsMaturity * 0.08)); //5% chance of losing customers
      if (Math.random() > retainChance) {
        const lostCustomers = 1
        player.stats[turn].customers = Math.max(1, player.stats[turn].customers - lostCustomers);
        details += ` successfully, but lost ${lostCustomers} customers, due to high pricing and lack of features & Ops maturity.`;
      } else {
        details += ' successfully, customers retained due the feature richness and operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Raised feature pricing to drive up margins. Customers feel squeezed, and may start looking for alternatives.`, cashBefore, cashAfter);
    }
  },
  MultiTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_MONOLITH_FEATURE');
      const cashBefore = player.stats[turn].cash;
      const devCost = MonolithFeature.calculateMonolithDevCost(player, turn);

      player.stats[turn].cash -= devCost;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_MONOLITH_FEATURE');
      if (devCost > constants.DEV_COST_MONOLITH) {
        addPlayerLog(player, turn, action, `Monolith development cost for you have risen to ${devCost}. As you build more features, its harder for you to coordinate monolith releases. Improve your LEGACY skills to counter balance. As you add more customers, it difficult to keep up with your sprawling infra footprint. Improve your operational maturity to counter balance this.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, 'Building a Monolith feature. They are cheap and quick to build, but they are hard to maintain and high operational costs.', cashBefore, cashAfter);
      }
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_CONTROL_PLANE');
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      const devCost = constants.DEV_COST_CONTROL_PLANE;
      player.stats[turn].cash -= devCost;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_CONTROL_PLANE');
      addPlayerLog(player, turn, action, 'Laying the foundations for the business and has built a MultiTenant Control Plane', cashBefore, cashAfter);
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_MULTITENANT_FEATURE');
      const cashBefore = player.stats[turn].cash;
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      const devCost = MultiTenantMicroservice.calculateMultiTenantMicroserviceDevCost(player, turn);
      player.stats[turn].cash -= devCost;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_MULTITENANT_FEATURE');
      if (devCost > constants.DEV_COST_MULTI_TENANT) {
        addPlayerLog(player, turn, action, `MultiTenant Microservice development cost for you have risen to ${devCost}. As you build more features, you need improve your CLOUD skills to keep up with managing all your features.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, 'Releases a new MultiTenant Microservice. The low operational overhead per customer leads to much better margins.', cashBefore, cashAfter);
      }
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      checkActionCooldown(player, 'BUILD_SINGLETENANT_FEATURE');
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      const devCost = SingleTenantMicroservice.calculateSingleTenantMicroserviceDevCost(player, turn);
      player.stats[turn].cash -= devCost;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, devCost, 0, turn));
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'BUILD_SINGLETENANT_FEATURE');
      if (devCost > constants.DEV_COST_SINGLE_TENANT) {
        addPlayerLog(player, turn, action, `SingleTenant Microservice development cost for you have risen to ${devCost}.As you build more features, its harder for you to coordinate releases across your many features. Improve your CLOUD skills to counter balance this effect. As you add more customers, it difficult to keep up with your sprawling infra footprint. Improve your operational maturity to counter balance this.`, cashBefore, cashAfter);
      } else {
        addPlayerLog(player, turn, action, 'Built SingleTenant Microservice using a modern technology stack. However the single tenant model may not be as profitable in the long term.', cashBefore, cashAfter);
      }
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * (action.multiplier - action.multiplier / 10) * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(-1, feature.techDebt - (action.multiplier + 1)); // +1 becassue the turn will a unit of tech debt.
      });
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures.length} features.`, cashBefore, cashAfter);
    },
    DEVOPS: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity - constants.MULTITENANT_STARTING_STATS.opsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity + 1}. `, cashBefore, cashAfter);


    },
    TRAINING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills - constants.MULTITENANT_STARTING_STATS.cloudNativeSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Cloud Native Training', cashBefore, cashAfter);
      decrementCloudFeatureCooldowns(player, turn);
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills - constants.MULTITENANT_STARTING_STATS.legacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Legacy Training', cashBefore, cashAfter);
      decrementLegacyFeatureCooldowns(player, turn);
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      checkActionCooldown(player, 'LAUNCH_MARKETING_CAMPAIGN');
      player.stats[turn].cash -= constants.MARKETING_COST;
      let successChance = 0.05 + (numFeatures * 0.05) + (opsMaturity * 0.08);
      if (successChance > 0.9) successChance = 0.9;
      let details = 'Launched Marketing Campaign';
      if (Math.random() < successChance) {
        const gainedCustomers = Math.min(constants.MARKETING_MAX_CUSTOMERS, (Math.round(numFeatures * 0.25) + Math.round(opsMaturity * 0.25)));
        player.stats[turn].customers += gainedCustomers;
        details += ` successfully, gained ${gainedCustomers} customers.`;
      } else {
        details += ' , but due to lack of features and operational maturity, it has failed to attract new customers. Customers look for feature rich products with a proven track record for operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      setActionCooldown(player, turn, 'LAUNCH_MARKETING_CAMPAIGN');
      addPlayerLog(player, turn, action, details, cashBefore, cashAfter);
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.OPTIMIZATION_COST;
      player.features.forEach(feature => {
        feature.featurePrice += 500;
      });
      let details = 'Raised feature pricing to drive up margins';
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let retainChance = Math.min(.95, (numFeatures * 0.1) + (opsMaturity * 0.08)); //5% chance of losing customers
      if (Math.random() > retainChance) {
        const lostCustomers = 1
        player.stats[turn].customers = Math.max(1, player.stats[turn].customers - lostCustomers);
        details += ` successfully, but lost ${lostCustomers} customers, due to high pricing and lack of features & Ops maturity.`;
      } else {
        details += ' successfully, customers retained due the feature richness and operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Raised feature pricing to drive up margins. Customers feel squeezed, and may start looking for alternatives.`, cashBefore, cashAfter);
    }
  }
};

// --- EVENT HANDLERS ---

const eventHandlers = {
  Monolith: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      handleLighthouseProgram(player, turn);
    },
    CUSTOMER_CHURN: function (player, turn) {
      handleCustomerChurn(player, turn);
    },
    CLOUD_MIGRATION: function (player, turn) {
      handleCloudMigration(player, turn);
    },
    INNOVATION: function (player, turn) {
      handleInnovation(player, turn);
    },
    MARKET_DISRUPTION: function (player, turn) {
      handleMarketDisruption(player, turn);
    },
    DOWNTIME: function (player, turn) {
      handleDowntime(player, turn);
    },
    RISING_COSTS: function (player, turn) {
      handleRisingCosts(player, turn);
    },
    FEATURE_INNOVATION: function (player, turn) {
      handleFeatureInnovation(player, turn);
    },
    OPERATIONAL_EXCELLENCE: function (player, turn) {
      handleOperationalExcellence(player, turn);
    },
    TECH_DEBT_CRISIS: function (player, turn) {
      handleTechDebtCrisis(player, turn);
    },
    LEGACY_SKILLS_SHORTAGE: function (player, turn) {
      handleLegacySkillsShortage(player, turn);
    },
    FEATURE_BLOAT: function (player, turn) {
      handleFeatureBloat(player, turn);
    },
    MARKET_SATURATION: function (player, turn) {
      handleMarketSaturation(player, turn);
    },
    REGULATORY_CHANGES: function (player, turn) {
      handleRegulatoryChanges(player, turn);
    },
    BREAKING_VENDOR_LOCKIN: function (player, turn) {
      handleBreakingVendorLockin(player, turn);
    },
    CUSTOMER_EXPERIENCE_REVOLUTION: function (player, turn) {
      handleCustomerExperienceRevolution(player, turn);
    },
    MAJOR_CVE: function (player, turn) {
      handleMajorCVE(player, turn);
    }


  },
  SingleTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      handleLighthouseProgram(player, turn);
    },
    CUSTOMER_CHURN: function (player, turn) {
      handleCustomerChurn(player, turn);
    },
    CLOUD_MIGRATION: function (player, turn) {
      handleCloudMigration(player, turn);
    },
    INNOVATION: function (player, turn) {
      handleInnovation(player, turn);
    },
    MARKET_DISRUPTION: function (player, turn) {
      handleMarketDisruption(player, turn);
    },
    DOWNTIME: function (player, turn) {
      handleDowntime(player, turn);
    },
    RISING_COSTS: function (player, turn) {
      handleRisingCosts(player, turn);
    },
    FEATURE_INNOVATION: function (player, turn) {
      handleFeatureInnovation(player, turn);
    },
    OPERATIONAL_EXCELLENCE: function (player, turn) {
      handleOperationalExcellence(player, turn);
    },
    TECH_DEBT_CRISIS: function (player, turn) {
      handleTechDebtCrisis(player, turn);
    },
    LEGACY_SKILLS_SHORTAGE: function (player, turn) {
      handleLegacySkillsShortage(player, turn);
    },
    FEATURE_BLOAT: function (player, turn) {
      handleFeatureBloat(player, turn);
    },
    MARKET_SATURATION: function (player, turn) {
      handleMarketSaturation(player, turn);
    },
    REGULATORY_CHANGES: function (player, turn) {
      handleRegulatoryChanges(player, turn);
    },
    BREAKING_VENDOR_LOCKIN: function (player, turn) {
      handleBreakingVendorLockin(player, turn);
    },
    CUSTOMER_EXPERIENCE_REVOLUTION: function (player, turn) {
      handleCustomerExperienceRevolution(player, turn);
    },
    MAJOR_CVE: function (player, turn) {
      handleMajorCVE(player, turn);
    }
  },
  MultiTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      handleLighthouseProgram(player, turn);
    },
    CUSTOMER_CHURN: function (player, turn) {
      handleCustomerChurn(player, turn);
    },
    CLOUD_MIGRATION: function (player, turn) {
      handleCloudMigration(player, turn);
    },
    INNOVATION: function (player, turn) {
      handleInnovation(player, turn);
    },
    MARKET_DISRUPTION: function (player, turn) {
      handleMarketDisruption(player, turn);
    },
    DOWNTIME: function (player, turn) {
      handleDowntime(player, turn);
    },
    RISING_COSTS: function (player, turn) {
      handleRisingCosts(player, turn);
    },
    FEATURE_INNOVATION: function (player, turn) {
      handleFeatureInnovation(player, turn);
    },
    OPERATIONAL_EXCELLENCE: function (player, turn) {
      handleOperationalExcellence(player, turn);
    },
    TECH_DEBT_CRISIS: function (player, turn) {
      handleTechDebtCrisis(player, turn);
    },
    LEGACY_SKILLS_SHORTAGE: function (player, turn) {
      handleLegacySkillsShortage(player, turn);
    },
    FEATURE_BLOAT: function (player, turn) {
      handleFeatureBloat(player, turn);
    },
    MARKET_SATURATION: function (player, turn) {
      handleMarketSaturation(player, turn);
    },
    REGULATORY_CHANGES: function (player, turn) {
      handleRegulatoryChanges(player, turn);
    },
    BREAKING_VENDOR_LOCKIN: function (player, turn) {
      handleBreakingVendorLockin(player, turn);
    },
    CUSTOMER_EXPERIENCE_REVOLUTION: function (player, turn) {
      handleCustomerExperienceRevolution(player, turn);
    },
    MAJOR_CVE: function (player, turn) {
      handleMajorCVE(player, turn);
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
    FeatureActions.updateTechDebt(feature, turn);
    featureRevenue += FeatureActions.calculateRevenue(feature, turn, player.stats[turn].customers);
  });
  player.stats[turn].cash += featureRevenue;
  decrementActionCooldowns(player, turn);
}

module.exports = {
  applyAction,
  applyEvent,
  finishTurn,
  decrementActionCooldowns
};