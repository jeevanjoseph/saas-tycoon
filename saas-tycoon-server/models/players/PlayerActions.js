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



// --- OpenTelemetry ---
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('PlayerActions');

const requestCount = meter.createCounter('player_actions_requests', {
  description: 'Count of requests to PlayerActions functions'
});
const errorCount = meter.createCounter('player_actions_errors', {
  description: 'Count of errors in PlayerActions functions'
});
const requestDuration = meter.createHistogram('player_actions_duration_ms', {
  description: 'Duration of PlayerActions functions in ms'
});

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
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.BUILD_MONOLITH_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.BUILD_MONOLITH_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.BUILD_MONOLITH_FEATURE' });
      }
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.BUILD_CONTROL_PLANE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.BUILD_CONTROL_PLANE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.BUILD_CONTROL_PLANE' });
      }
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.BUILD_MULTITENANT_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.BUILD_MULTITENANT_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.BUILD_MULTITENANT_FEATURE' });
      }
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.BUILD_SINGLETENANT_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.BUILD_SINGLETENANT_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.BUILD_SINGLETENANT_FEATURE' });
      }
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.TECH_DEBT_REDUCTION' });
      try {
        const cashBefore = player.stats[turn].cash;
        const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
        player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * (action.multiplier - action.multiplier / 10) * buggyFeatures.length;
        buggyFeatures.forEach(feature => {
          feature.techDebt = Math.max(0, feature.techDebt - (action.multiplier + 1));
        });
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures.length} features.`, cashBefore, cashAfter);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.TECH_DEBT_REDUCTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.TECH_DEBT_REDUCTION' });
      }
    },
    DEVOPS: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.DEVOPS' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentOpsMaturity = player.stats[turn].opsMaturity;
        const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity - constants.MONOLITH_STARTING_STATS.opsMaturity + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].opsMaturity += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity + 1}. `, cashBefore, cashAfter);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.DEVOPS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.DEVOPS' });
      }
    },
    TRAINING: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.TRAINING' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentCloudSkills = player.stats[turn].cloudNativeSkills;
        const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills - constants.MONOLITH_STARTING_STATS.cloudNativeSkills + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].cloudNativeSkills += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Cloud Native Training`, cashBefore, cashAfter);
        decrementCloudFeatureCooldowns(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.TRAINING' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.TRAINING' });
      }
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.TRAINING_LEGACY' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentLegacySkills = player.stats[turn].legacySkills;
        const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills - constants.MONOLITH_STARTING_STATS.legacySkills + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].legacySkills += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Legacy Training`, cashBefore, cashAfter);
        decrementLegacyFeatureCooldowns(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.TRAINING_LEGACY' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.TRAINING_LEGACY' });
      }
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.LAUNCH_MARKETING_CAMPAIGN' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.LAUNCH_MARKETING_CAMPAIGN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.LAUNCH_MARKETING_CAMPAIGN' });
      }
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.OPTIMIZE_PRICING' });
      try {
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
        let retainChance = Math.min(.95, (numFeatures * 0.1) + .5 + (opsMaturity * 0.08));
        if (Math.random() > retainChance) {
          const lostCustomers = 1
          player.stats[turn].customers = Math.max(1, player.stats[turn].customers - lostCustomers);
          details += ` successfully, but lost ${lostCustomers} customers, due to high pricing and lack of features & Ops maturity.`;
        } else {
          details += ' successfully, customers retained due the feature richness and operational maturity.';
        }
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Raised feature pricing to drive up margins. Customers feel squeezed, and may start looking for alternatives.`, cashBefore, cashAfter);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.OPTIMIZE_PRICING' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.OPTIMIZE_PRICING' });
      }
    }
  },
  SingleTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.BUILD_MONOLITH_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.BUILD_MONOLITH_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.BUILD_MONOLITH_FEATURE' });
      }
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.BUILD_CONTROL_PLANE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.BUILD_CONTROL_PLANE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.BUILD_CONTROL_PLANE' });
      }
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.BUILD_MULTITENANT_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.BUILD_MULTITENANT_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.BUILD_MULTITENANT_FEATURE' });
      }
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.BUILD_SINGLETENANT_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.BUILD_SINGLETENANT_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.BUILD_SINGLETENANT_FEATURE' });
      }
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.TECH_DEBT_REDUCTION' });
      try {
        const cashBefore = player.stats[turn].cash;
        const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
        player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * (action.multiplier - action.multiplier / 10) * buggyFeatures.length;
        buggyFeatures.forEach(feature => {
          feature.techDebt = Math.max(0, feature.techDebt - (action.multiplier + 1)); // +1 becassue the turn will a unit of tech debt.
        });
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures.length} features.`, cashBefore, cashAfter);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.TECH_DEBT_REDUCTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.TECH_DEBT_REDUCTION' });
      }
    },
    DEVOPS: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.DEVOPS' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentOpsMaturity = player.stats[turn].opsMaturity;
        const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity - constants.SINGLETENANT_STARTING_STATS.opsMaturity + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].opsMaturity += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity + 1}. `, cashBefore, cashAfter);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.DEVOPS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.DEVOPS' });
      }
    },
    TRAINING: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.TRAINING' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentCloudSkills = player.stats[turn].cloudNativeSkills;
        const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills - constants.SINGLETENANT_STARTING_STATS.cloudNativeSkills + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].cloudNativeSkills += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, 'Cloud Native Training', cashBefore, cashAfter);
        decrementCloudFeatureCooldowns(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.TRAINING' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.TRAINING' });
      }
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.TRAINING_LEGACY' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentLegacySkills = player.stats[turn].legacySkills;
        const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills - constants.SINGLETENANT_STARTING_STATS.legacySkills + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].legacySkills += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, 'Legacy Training', cashBefore, cashAfter);
        decrementLegacyFeatureCooldowns(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.TRAINING_LEGACY' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.TRAINING_LEGACY' });
      }
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.LAUNCH_MARKETING_CAMPAIGN' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.LAUNCH_MARKETING_CAMPAIGN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.LAUNCH_MARKETING_CAMPAIGN' });
      }
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.OPTIMIZE_PRICING' });
      try {
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

      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.OPTIMIZE_PRICING' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.OPTIMIZE_PRICING' });
      }
    }
  },
  MultiTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.BUILD_MONOLITH_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.BUILD_MONOLITH_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.BUILD_MONOLITH_FEATURE' });
      }
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.BUILD_CONTROL_PLANE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.BUILD_CONTROL_PLANE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.BUILD_CONTROL_PLANE' });
      }
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.BUILD_MULTITENANT_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.BUILD_MULTITENANT_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.BUILD_MULTITENANT_FEATURE' });
      }
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.BUILD_SINGLETENANT_FEATURE' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.BUILD_SINGLETENANT_FEATURE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.BUILD_SINGLETENANT_FEATURE' });
      }
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.TECH_DEBT_REDUCTION' });
      try {
        const cashBefore = player.stats[turn].cash;
        const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
        player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * (action.multiplier - action.multiplier / 10) * buggyFeatures.length;
        buggyFeatures.forEach(feature => {
          feature.techDebt = Math.max(0, feature.techDebt - (action.multiplier + 1)); // +1 becassue the turn will a unit of tech debt.
        });
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures.length} features.`, cashBefore, cashAfter);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.TECH_DEBT_REDUCTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.TECH_DEBT_REDUCTION' });
      }
    },
    DEVOPS: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.DEVOPS' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentOpsMaturity = player.stats[turn].opsMaturity;
        const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity - constants.MULTITENANT_STARTING_STATS.opsMaturity + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].opsMaturity += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity + 1}. `, cashBefore, cashAfter);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.DEVOPS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.DEVOPS' });
      }
    },
    TRAINING: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.TRAINING' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentCloudSkills = player.stats[turn].cloudNativeSkills;
        const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills - constants.MULTITENANT_STARTING_STATS.cloudNativeSkills + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].cloudNativeSkills += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, 'Cloud Native Training', cashBefore, cashAfter);
        decrementCloudFeatureCooldowns(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.TRAINING' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.TRAINING' });
      }
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.TRAINING_LEGACY' });
      try {
        const cashBefore = player.stats[turn].cash;
        const currentLegacySkills = player.stats[turn].legacySkills;
        const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills - constants.MULTITENANT_STARTING_STATS.legacySkills + 1);
        player.stats[turn].cash -= upgradeCost;
        player.stats[turn].legacySkills += 1;
        const cashAfter = player.stats[turn].cash;
        addPlayerLog(player, turn, action, 'Legacy Training', cashBefore, cashAfter);
        decrementLegacyFeatureCooldowns(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.TRAINING_LEGACY' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.TRAINING_LEGACY' });
      }
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.LAUNCH_MARKETING_CAMPAIGN' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.LAUNCH_MARKETING_CAMPAIGN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.LAUNCH_MARKETING_CAMPAIGN' });
      }
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.OPTIMIZE_PRICING' });
      try {
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
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.OPTIMIZE_PRICING' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.OPTIMIZE_PRICING' });
      }
    },
  }
};

// --- EVENT HANDLERS ---

const eventHandlers = {
  Monolith: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.LIGHTHOUSE_PROGRAM' });
      try {
        handleLighthouseProgram(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.LIGHTHOUSE_PROGRAM' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.LIGHTHOUSE_PROGRAM' });
      }
    },
    CUSTOMER_CHURN: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.CUSTOMER_CHURN' });
      try {
        handleCustomerChurn(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.CUSTOMER_CHURN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.CUSTOMER_CHURN' });
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.CLOUD_MIGRATION' });
      try {
        handleCloudMigration(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.CLOUD_MIGRATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.CLOUD_MIGRATION' });
      }
    },
    INNOVATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.INNOVATION' });
      try {
        handleInnovation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.INNOVATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.INNOVATION' });
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.MARKET_DISRUPTION' });
      try {
        handleMarketDisruption(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.MARKET_DISRUPTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.MARKET_DISRUPTION' });
      }
    },
    DOWNTIME: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.DOWNTIME' });
      try {
        handleDowntime(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.DOWNTIME' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.DOWNTIME' });
      }
    },
    RISING_COSTS: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.RISING_COSTS' });
      try {
        handleRisingCosts(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.RISING_COSTS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.RISING_COSTS' });
      }
    },
    FEATURE_INNOVATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.FEATURE_INNOVATION' });
      try {
        handleFeatureInnovation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.FEATURE_INNOVATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.FEATURE_INNOVATION' });
      }
    },
    OPERATIONAL_EXCELLENCE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.OPERATIONAL_EXCELLENCE' });
      try {
        handleOperationalExcellence(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.OPERATIONAL_EXCELLENCE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.OPERATIONAL_EXCELLENCE' });
      }
    },
    TECH_DEBT_CRISIS: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.TECH_DEBT_CRISIS' });
      try {
        handleTechDebtCrisis(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.TECH_DEBT_CRISIS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.TECH_DEBT_CRISIS' });
      }
    },
    LEGACY_SKILLS_SHORTAGE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.LEGACY_SKILLS_SHORTAGE' });
      try {
        handleLegacySkillsShortage(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.LEGACY_SKILLS_SHORTAGE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.LEGACY_SKILLS_SHORTAGE' });
      }
    },
    FEATURE_BLOAT: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.FEATURE_BLOAT' });
      try {
        handleFeatureBloat(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.FEATURE_BLOAT' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.FEATURE_BLOAT' });
      }
    },
    MARKET_SATURATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.MARKET_SATURATION' });
      try {
        handleMarketSaturation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.MARKET_SATURATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.MARKET_SATURATION' });
      }
    },
    REGULATORY_CHANGES: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.REGULATORY_CHANGES' });
      try {
        handleRegulatoryChanges(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.REGULATORY_CHANGES' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.REGULATORY_CHANGES' });
      }
    },
    BREAKING_VENDOR_LOCKIN: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.BREAKING_VENDOR_LOCKIN' });
      try {
        handleBreakingVendorLockin(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.BREAKING_VENDOR_LOCKIN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.BREAKING_VENDOR_LOCKIN' });
      }
    },
    CUSTOMER_EXPERIENCE_REVOLUTION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.CUSTOMER_EXPERIENCE_REVOLUTION' });
      try {
        handleCustomerExperienceRevolution(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.CUSTOMER_EXPERIENCE_REVOLUTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.CUSTOMER_EXPERIENCE_REVOLUTION' });
      }
    },
    MAJOR_CVE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'Monolith.MAJOR_CVE' });
      try {
        handleMajorCVE(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'Monolith.MAJOR_CVE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'Monolith.MAJOR_CVE' });
      }
    }
  },
  SingleTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.LIGHTHOUSE_PROGRAM' });
      try {
        handleLighthouseProgram(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.LIGHTHOUSE_PROGRAM' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.LIGHTHOUSE_PROGRAM' });
      }
    },
    CUSTOMER_CHURN: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.CUSTOMER_CHURN' });
      try {
        handleCustomerChurn(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.CUSTOMER_CHURN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.CUSTOMER_CHURN' });
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.CLOUD_MIGRATION' });
      try {
        handleCloudMigration(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.CLOUD_MIGRATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.CLOUD_MIGRATION' });
      }
    },
    INNOVATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.INNOVATION' });
      try {
        handleInnovation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.INNOVATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.INNOVATION' });
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.MARKET_DISRUPTION' });
      try {
        handleMarketDisruption(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.MARKET_DISRUPTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.MARKET_DISRUPTION' });
      }
    },
    DOWNTIME: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.DOWNTIME' });
      try {
        handleDowntime(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.DOWNTIME' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.DOWNTIME' });
      }
    },
    RISING_COSTS: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.RISING_COSTS' });
      try {
        handleRisingCosts(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.RISING_COSTS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.RISING_COSTS' });
      }
    },
    FEATURE_INNOVATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.FEATURE_INNOVATION' });
      try {
        handleFeatureInnovation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.FEATURE_INNOVATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.FEATURE_INNOVATION' });
      }
    },
    OPERATIONAL_EXCELLENCE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.OPERATIONAL_EXCELLENCE' });
      try {
        handleOperationalExcellence(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.OPERATIONAL_EXCELLENCE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.OPERATIONAL_EXCELLENCE' });
      }
    },
    TECH_DEBT_CRISIS: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.TECH_DEBT_CRISIS' });
      try {
        handleTechDebtCrisis(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.TECH_DEBT_CRISIS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.TECH_DEBT_CRISIS' });
      }
    },
    LEGACY_SKILLS_SHORTAGE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.LEGACY_SKILLS_SHORTAGE' });
      try {
        handleLegacySkillsShortage(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.LEGACY_SKILLS_SHORTAGE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.LEGACY_SKILLS_SHORTAGE' });
      }
    },
    FEATURE_BLOAT: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.FEATURE_BLOAT' });
      try {
        handleFeatureBloat(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.FEATURE_BLOAT' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.FEATURE_BLOAT' });
      }
    },
    MARKET_SATURATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.MARKET_SATURATION' });
      try {
        handleMarketSaturation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.MARKET_SATURATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.MARKET_SATURATION' });
      }
    },
    REGULATORY_CHANGES: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.REGULATORY_CHANGES' });
      try {
        handleRegulatoryChanges(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.REGULATORY_CHANGES' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.REGULATORY_CHANGES' });
      }
    },
    BREAKING_VENDOR_LOCKIN: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.BREAKING_VENDOR_LOCKIN' });
      try {
        handleBreakingVendorLockin(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.BREAKING_VENDOR_LOCKIN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.BREAKING_VENDOR_LOCKIN' });
      }
    },
    CUSTOMER_EXPERIENCE_REVOLUTION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.CUSTOMER_EXPERIENCE_REVOLUTION' });
      try {
        handleCustomerExperienceRevolution(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.CUSTOMER_EXPERIENCE_REVOLUTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.CUSTOMER_EXPERIENCE_REVOLUTION' });
      }
    },
    MAJOR_CVE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'SingleTenant.MAJOR_CVE' });
      try {
        handleMajorCVE(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'SingleTenant.MAJOR_CVE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'SingleTenant.MAJOR_CVE' });
      }
    }
  },
  MultiTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.LIGHTHOUSE_PROGRAM' });
      try {
        handleLighthouseProgram(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.LIGHTHOUSE_PROGRAM' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.LIGHTHOUSE_PROGRAM' });
      }
    },
    CUSTOMER_CHURN: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.CUSTOMER_CHURN' });
      try {
        handleCustomerChurn(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.CUSTOMER_CHURN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.CUSTOMER_CHURN' });
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.CLOUD_MIGRATION' });
      try {
        handleCloudMigration(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.CLOUD_MIGRATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.CLOUD_MIGRATION' });
      }
    },
    INNOVATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.INNOVATION' });
      try {
        handleInnovation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.INNOVATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.INNOVATION' });
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.MARKET_DISRUPTION' });
      try {
        handleMarketDisruption(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.MARKET_DISRUPTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.MARKET_DISRUPTION' });
      }
    },
    DOWNTIME: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.DOWNTIME' });
      try {
        handleDowntime(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.DOWNTIME' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.DOWNTIME' });
      }
    },
    RISING_COSTS: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.RISING_COSTS' });
      try {
        handleRisingCosts(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.RISING_COSTS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.RISING_COSTS' });
      }
    },
    FEATURE_INNOVATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.FEATURE_INNOVATION' });
      try {
        handleFeatureInnovation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.FEATURE_INNOVATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.FEATURE_INNOVATION' });
      }
    },
    OPERATIONAL_EXCELLENCE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.OPERATIONAL_EXCELLENCE' });
      try {
        handleOperationalExcellence(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.OPERATIONAL_EXCELLENCE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.OPERATIONAL_EXCELLENCE' });
      }
    },
    TECH_DEBT_CRISIS: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.TECH_DEBT_CRISIS' });
      try {
        handleTechDebtCrisis(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.TECH_DEBT_CRISIS' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.TECH_DEBT_CRISIS' });
      }
    },
    LEGACY_SKILLS_SHORTAGE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.LEGACY_SKILLS_SHORTAGE' });
      try {
        handleLegacySkillsShortage(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.LEGACY_SKILLS_SHORTAGE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.LEGACY_SKILLS_SHORTAGE' });
      }
    },
    FEATURE_BLOAT: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.FEATURE_BLOAT' });
      try {
        handleFeatureBloat(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.FEATURE_BLOAT' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.FEATURE_BLOAT' });
      }
    },
    MARKET_SATURATION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.MARKET_SATURATION' });
      try {
        handleMarketSaturation(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.MARKET_SATURATION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.MARKET_SATURATION' });
      }
    },
    REGULATORY_CHANGES: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.REGULATORY_CHANGES' });
      try {
        handleRegulatoryChanges(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.REGULATORY_CHANGES' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.REGULATORY_CHANGES' });
      }
    },
    BREAKING_VENDOR_LOCKIN: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.BREAKING_VENDOR_LOCKIN' });
      try {
        handleBreakingVendorLockin(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.BREAKING_VENDOR_LOCKIN' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.BREAKING_VENDOR_LOCKIN' });
      }
    },
    CUSTOMER_EXPERIENCE_REVOLUTION: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.CUSTOMER_EXPERIENCE_REVOLUTION' });
      try {
        handleCustomerExperienceRevolution(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.CUSTOMER_EXPERIENCE_REVOLUTION' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.CUSTOMER_EXPERIENCE_REVOLUTION' });
      }
    },
    MAJOR_CVE: function (player, turn) {
      const start = Date.now();
      requestCount.add(1, { function: 'MultiTenant.MAJOR_CVE' });
      try {
        handleMajorCVE(player, turn);
      } catch (err) {
        errorCount.add(1, { function: 'MultiTenant.MAJOR_CVE' });
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'MultiTenant.MAJOR_CVE' });
      }
    }
  }
};

// --- MAIN APPLY FUNCTION ---

function applyAction(player, action, turn) {
  const start = Date.now();
  requestCount.add(1, { function: 'applyAction' });
  try {
    const playerType = player.playerClass;
    const playerActions = actions[playerType];
    if (playerActions && playerActions[action.code]) {
      playerActions[action.code](player, turn, action);
    } else {
      throw new Error('Unknown action type: ' + action.code);
    }
  } catch (err) {
    errorCount.add(1, { function: 'applyAction', code: action.code });
    throw err;
  } finally {
    requestDuration.record(Date.now() - start, { function: 'applyAction' });
  }
}

function applyEvent(player, event, turn) {
  const start = Date.now();
  requestCount.add(1, { function: 'applyEvent' });
  try {
    const playerType = player.playerClass;
    const playerEventHandlers = eventHandlers[playerType];
    if (playerEventHandlers && playerEventHandlers[event.type]) {
      playerEventHandlers[event.type](player, turn);
    } else {
      throw new Error('Unknown event type: ' + event.type);
    }
  } catch (err) {
    errorCount.add(1, { function: 'applyEvent', code: event.type });
    throw err;
  } finally {
    requestDuration.record(Date.now() - start, { function: 'applyEvent' });
  }
}

function finishTurn(player, turn) {
  const start = Date.now();
  requestCount.add(1, { function: 'finishTurn' });
  try {
    let featureRevenue = 0;
    player.features.forEach((feature) => {
      FeatureActions.updateTechDebt(feature, turn);
      featureRevenue += FeatureActions.calculateRevenue(feature, turn, player.stats[turn].customers);
    });
    player.stats[turn].cash += featureRevenue;
    decrementActionCooldowns(player, turn);
  } catch (err) {
    errorCount.add(1, { function: 'finishTurn' });
    throw err;
  } finally {
    requestDuration.record(Date.now() - start, { function: 'finishTurn' });
  }
}

module.exports = {
  applyAction,
  applyEvent,
  finishTurn,
  decrementActionCooldowns
};