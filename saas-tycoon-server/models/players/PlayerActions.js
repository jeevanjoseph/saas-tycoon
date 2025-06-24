const MonolithFeature = require('../features/MonolithFeature');
const MultiTenantControlPlane = require('../features/MultiTenantControlPlane');
const MultiTenantMicroservice = require('../features/MultiTenantMicroservice');
const SingleTenantMicroservice = require('../features/SingleTenantMicroservice');
const FeatureActions = require('../features/FeatureActions');
const constants = require('./constants');

// --- LOGGING HELPER ---
function addPlayerLog(player, turn, actionOrEvent, details, cashBefore, cashAfter) {
  if (!player.log) player.log = [];
  const cashSpent = Math.max(0, cashBefore - cashAfter);
  player.log.push({
    turn,
    type: actionOrEvent.type ? 'event' : 'action',
    code: actionOrEvent.code || actionOrEvent.type,
    details,
    cashSpent
  });
}

// --- ACTIONS ---

const actions = {
  Monolith: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.DEV_COST_MONOLITH;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Built Monolith Feature. Feature rich products attract customers, but a key metric for your success - operational cost - is high and may hurt you in the long term.', cashBefore, cashAfter);
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      player.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Pivoting to an efficient SaaS model, and built a MultiTenant Control Plane', cashBefore, cashAfter);
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Committed to a business transformation, and built MultiTenant Feature', cashBefore, cashAfter);
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Implementing a modernization strategy by building a SingleTenant Microservice', cashBefore, cashAfter);
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(0, feature.techDebt - 2);
      });
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures} features.`, cashBefore, cashAfter);
    },
    DEVOPS: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity+1}. `, cashBefore, cashAfter);
    },
    TRAINING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Cloud Native Training', cashBefore, cashAfter);
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Legacy Training', cashBefore, cashAfter);
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.MARKETING_COST;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let successChance = 0.05 + (numFeatures * 0.05) + (opsMaturity * 0.08);
      if (successChance > 0.9) successChance = 0.9;
      let details = 'Launched Marketing Campaign';
      if (Math.random() < successChance) {
        const gainedCustomers = 1 + Math.round(numFeatures * 0.2) + Math.round(opsMaturity * 0.5);
        player.stats[turn].customers += gainedCustomers;
        details += ` successfully, gained ${gainedCustomers} customers.`;
      } else {
        details += ' , but due to lack of features and operational maturity, it has failed to attract new customers. Customers look for feature rich products with a proven track record for operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, details, cashBefore, cashAfter);
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= 700;
      player.stats[turn].revenue += 1000;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Raised feature pricing to drive up margins. Customers feel squeezed, and may start looking for alternatives.', cashBefore, cashAfter);
    }
  },
  SingleTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.DEV_COST_MONOLITH;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Building a Monolith feature. They are cheap and quick to build, but they are hard to maintain and high operational costs.', cashBefore, cashAfter);
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      player.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Pivoting to a higher margin model afforded by a MultiTenant model and built a Control Plane', cashBefore, cashAfter);
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Committed to a true SaaS model and releases a new MultiTenant Microservice, with a better operational margin.', cashBefore, cashAfter);
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Built SingleTenant Microservice using a modern technology stack. However the single tenant model may not be as profitable in the long term.', cashBefore, cashAfter);
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 0);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(0, feature.techDebt - 2);
      });
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures} features.`, cashBefore, cashAfter);
    },
    DEVOPS: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity+1}. `, cashBefore, cashAfter);
    },
    TRAINING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Cloud Native Training', cashBefore, cashAfter);
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Legacy Training', cashBefore, cashAfter);
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.MARKETING_COST;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let successChance = 0.05 + (numFeatures * 0.05) + (opsMaturity * 0.08);
      if (successChance > 0.9) successChance = 0.9;
      let details = 'Launched Marketing Campaign';
      if (Math.random() < successChance) {
        const gainedCustomers = 1 + Math.round(numFeatures * 0.2) + Math.round(opsMaturity * 0.5);
        player.stats[turn].customers += gainedCustomers;
        details += ` successfully, gained ${gainedCustomers} customers.`;
      } else {
        details += ' , but due to lack of features and operational maturity, it has failed to attract new customers. Customers look for feature rich products with a proven track record for operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, details, cashBefore, cashAfter);
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= 700;
      player.stats[turn].revenue += 1000;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Raised feature pricing to drive up margins. Customers feel squeezed, and may start looking for alternatives.', cashBefore, cashAfter);
    }
  },
  MultiTenant: {
    BUILD_MONOLITH_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.DEV_COST_MONOLITH;
      player.features.push(new MonolithFeature(constants.CUSTOMER_PRICE_MONOLITH, constants.DEV_COST_MONOLITH, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Building a Monolith feature. They are cheap and quick to build, but they are hard to maintain and high operational costs.', cashBefore, cashAfter);
    },
    BUILD_CONTROL_PLANE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 4) {
        throw new Error('Cloud Native skill must be 4 or more to build control plane.');
      }
      player.stats[turn].cash -= constants.DEV_COST_CONTROL_PLANE;
      player.features.push(new MultiTenantControlPlane(constants.CUSTOMER_PRICE_CONTROL_PLANE, constants.DEV_COST_CONTROL_PLANE, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Laying the foundations for the business and has built a MultiTenant Control Plane', cashBefore, cashAfter);
    },
    BUILD_MULTITENANT_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const hasControlPlane = player.features.some(
        feature => feature.architecture === 'control-plane'
      );
      if (!hasControlPlane) {
        throw new Error('You must have at least one MultiTenantControlPlane feature to build a microservice feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_MULTI_TENANT;
      player.features.push(new MultiTenantMicroservice(constants.CUSTOMER_PRICE_MULTI_TENANT, constants.DEV_COST_MULTI_TENANT, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Releases a new MultiTenant Microservice. The low operational overhead per customer leads to much better margins.', cashBefore, cashAfter);
    },
    BUILD_SINGLETENANT_FEATURE: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      if (player.stats[turn].cloudNativeSkills < 1) {
        throw new Error('Cloud Native skill must be 1 or more to build single tenant feature.');
      }
      player.stats[turn].cash -= constants.DEV_COST_SINGLE_TENANT;
      player.features.push(new SingleTenantMicroservice(constants.CUSTOMER_PRICE_SINGLE_TENANT, constants.DEV_COST_SINGLE_TENANT, 0, turn));
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Built SingleTenant Microservice using a modern technology stack. However the single tenant model may not be as profitable in the long term.', cashBefore, cashAfter);
    },
    TECH_DEBT_REDUCTION: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const buggyFeatures = player.features.filter(feature => feature.techDebt > 2);
      player.stats[turn].cash -= constants.TECH_DEBT_REDUCTION_COST * buggyFeatures.length;
      buggyFeatures.forEach(feature => {
        feature.techDebt = Math.max(0, feature.techDebt - 3);
      });
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Investing in tech debt reduction. Upkeep effort reduced techdebt on ${buggyFeatures} features.`, cashBefore, cashAfter);
    },
    DEVOPS: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentOpsMaturity = player.stats[turn].opsMaturity;
      const upgradeCost = constants.DEVOPS_COST * (currentOpsMaturity + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].opsMaturity += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, `Increased operational maturity to level ${currentOpsMaturity+1}. `, cashBefore, cashAfter);
    },
    TRAINING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentCloudSkills = player.stats[turn].cloudNativeSkills;
      const upgradeCost = constants.TRAINING_COST_CLOUD * (currentCloudSkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].cloudNativeSkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Cloud Native Training', cashBefore, cashAfter);
    },
    TRAINING_LEGACY: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      const currentLegacySkills = player.stats[turn].legacySkills;
      const upgradeCost = constants.TRAINING_COST_LEGACY * (currentLegacySkills + 1);
      player.stats[turn].cash -= upgradeCost;
      player.stats[turn].legacySkills += 1;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Legacy Training', cashBefore, cashAfter);
    },
    LAUNCH_MARKETING_CAMPAIGN: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= constants.MARKETING_COST;
      const numFeatures = player.features.length;
      const opsMaturity = player.stats[turn].opsMaturity;
      let successChance = 0.2 + (numFeatures * 0.1) + (opsMaturity * 0.1);
      if (successChance > 0.9) successChance = 0.9;
      let details = 'Launched Marketing Campaign';
      if (Math.random() < successChance) {
        const gainedCustomers = 1 + Math.round(numFeatures * 0.2) + Math.round(opsMaturity * 0.5);
        player.stats[turn].customers += gainedCustomers;
         details += ` successfully, gained ${gainedCustomers} customers.`;
      } else {
        details += ' , but due to lack of features and operational maturity, it has failed to attract new customers. Customers look for feature rich products with a proven track record for operational maturity.';
      }
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, details, cashBefore, cashAfter);
    },
    OPTIMIZE_PRICING: function (player, turn, action) {
      const cashBefore = player.stats[turn].cash;
      player.stats[turn].cash -= 700;
      player.stats[turn].revenue += 1000;
      const cashAfter = player.stats[turn].cash;
      addPlayerLog(player, turn, action, 'Raised feature pricing to drive up margins. Customers feel squeezed, and may start looking for alternatives.', cashBefore, cashAfter);
    }
  }
};

// --- EVENT HANDLERS ---

const eventHandlers = {
  Monolith: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      player.stats[turn].opsMaturity += 1;
      addPlayerLog(player, turn, { type: 'LIGHTHOUSE_PROGRAM' }, `Spectra Lighthouse Program engagement gives you tips of operational improvements, raising operational marturity to ${player.stats[turn].opsMaturity}`);
    },
    CUSTOMER_CHURN: function (player, turn) {
      let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 4);
      if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Out of control tech debt has resulted in frequent issues that are hard to address completely. Lost a customer.');
      } else {
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Excellent discipline in managing (or avoiding) tech det earns you a loyal customer base. No effect due to this event');
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      let cloudNativeFeatures = player.features.filter(feature => feature.architecture === 'microservice' || feature.architecture === 'mt-microservice');
      let legacyFeatures = player.features.filter(feature => feature.architecture === 'monolith');
      if (cloudNativeFeatures.length > legacyFeatures.length) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers find the mix of feature completeness and modern technology appealing.  Gained a customer');
      } else {
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers are wary that despite feature completeness, the legacy technology may cause security and operational issues. Customers avoid your product as they make a cloud transformation.');
      }
    },
    INNOVATION: function (player, turn) {
      let totalSkills = player.stats[turn].legacySkills + player.stats[turn].cloudNativeSkills;
      if (totalSkills > 5) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: gained a customer');
      } else {
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: no effect');
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      player.features.forEach((feature) => {
        feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
      });
      addPlayerLog(player, turn, { type: 'MARKET_DISRUPTION' }, 'New market entrants have disrupted the market, forcing you to reduce feature prices by 10% to compete. This is a good time to invest in features that are more resilient to price pressure.');
    },
    DOWNTIME: function (player, turn) {
      let penalty = 500 * (constants.OPS_MATURITY_MAX - player.stats[turn].opsMaturity);
      player.stats[turn].cash = Math.max(0, player.stats[turn].cash - penalty);
      addPlayerLog(player, turn, { type: 'DOWNTIME' }, `Downtime event: Having better operational maturity helps you deal with unexpected events better. Lost $${penalty} based on the current operational maturity of ${player.stats[turn].opsMaturity}.`);
    },
    RISING_COSTS: function (player, turn) {
      player.features.forEach((feature) => {
        feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2);
      });
      addPlayerLog(player, turn, { type: 'RISING_COSTS' }, 'Increased infrastructure cost have put pressure on your cash flow. All features now require an increased infrastructure spend by 20%. MultiTenant features do not require dedicated infrastructure per customer are more resilient to this change.');
    }
  },
  SingleTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      player.stats[turn].opsMaturity += 1;
      addPlayerLog(player, turn, { type: 'LIGHTHOUSE_PROGRAM' }, 'Spectra Lighthouse Program engagement gives you tips of operational improvements, raising operational marturity to ${player.stats[turn].opsMaturity}');
    },
    CUSTOMER_CHURN: function (player, turn) {
      let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 4);
      if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Out of control tech debt has resulted in frequent issues that are hard to address completely. Lost a customer.');
      } else {
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Excellent discipline in managing (or avoiding) tech det earns you a loyal customer base. No effect due to this event');
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      let cloudNativeFeatures = player.features.filter(feature => feature.architecture === 'microservice' || feature.architecture === 'mt-microservice');
      let legacyFeatures = player.features.filter(feature => feature.architecture === 'monolith');
      if (cloudNativeFeatures.length > legacyFeatures.length) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers find the mix of feature completeness and modern technology appealing.  Gained a customer');
      } else {
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers are wary that despite feature completeness, the legacy technology may cause security and operational issues. Customers avoid your product as they make a cloud transformation.');
      }
    },
    INNOVATION: function (player, turn) {
      let totalSkills = player.stats[turn].legacySkills + player.stats[turn].cloudNativeSkills;
      if (totalSkills > 5) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: gained a customer');
      } else {
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: no effect');
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      player.features.forEach((feature) => {
        feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
      });
      addPlayerLog(player, turn, { type: 'MARKET_DISRUPTION' }, 'New market entrants have disrupted the market, forcing you to reduce feature prices by 10% to compete. This is a good time to invest in features that are more resilient to price pressure.');
    },
    DOWNTIME: function (player, turn) {
      let penalty = 500 * (constants.OPS_MATURITY_MAX - player.stats[turn].opsMaturity);
      player.stats[turn].cash = Math.max(0, player.stats[turn].cash - penalty);
      addPlayerLog(player, turn, { type: 'DOWNTIME' }, `Downtime event: Having better operational maturity helps you deal with unexpected events better. Lost $${penalty} based on the current operational maturity of ${player.stats[turn].opsMaturity}.`);
    },
    RISING_COSTS: function (player, turn) {
      player.features.forEach((feature) => {
        feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2);
      });
      addPlayerLog(player, turn, { type: 'RISING_COSTS' }, 'Increased infrastructure cost have put pressure on your cash flow. All features now require an increased infrastructure spend by 20%. MultiTenant features do not require dedicated infrastructure per customer are more resilient to this change.');
    }
  },
  MultiTenant: {
    LIGHTHOUSE_PROGRAM: function (player, turn) {
      player.stats[turn].opsMaturity += 1;
      addPlayerLog(player, turn, { type: 'LIGHTHOUSE_PROGRAM' }, 'Spectra Lighthouse Program engagement gives you tips of operational improvements, raising operational marturity to ${player.stats[turn].opsMaturity}');
    },
    CUSTOMER_CHURN: function (player, turn) {
      let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 4);
      if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Out of control tech debt has resulted in frequent issues that are hard to address completely. Lost a customer.');
      } else {
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Excellent discipline in managing (or avoiding) tech det earns you a loyal customer base. No effect due to this event');
      }
    },
    CLOUD_MIGRATION: function (player, turn) {
      let cloudNativeFeatures = player.features.filter(feature => feature.architecture === 'microservice' || feature.architecture === 'mt-microservice');
      let legacyFeatures = player.features.filter(feature => feature.architecture === 'monolith');
      if (cloudNativeFeatures.length > legacyFeatures.length) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers find the mix of feature completeness and modern technology appealing.  Gained a customer');
      } else {
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers are wary that despite feature completeness, the legacy technology may cause security and operational issues. Customers avoid your product as they make a cloud transformation.');
      }
    },
    INNOVATION: function (player, turn) {
      let totalSkills = player.stats[turn].legacySkills + player.stats[turn].cloudNativeSkills;
      if (totalSkills > 5) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: gained a customer');
      } else {
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: no effect');
      }
    },
    MARKET_DISRUPTION: function (player, turn) {
      player.features.forEach((feature) => {
        feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
      });
      addPlayerLog(player, turn, { type: 'MARKET_DISRUPTION' }, 'New market entrants have disrupted the market, forcing you to reduce feature prices by 10% to compete. This is a good time to invest in features that are more resilient to price pressure.');
    },
    DOWNTIME: function (player, turn) {
      let penalty = 500 * (constants.OPS_MATURITY_MAX - player.stats[turn].opsMaturity);
      player.stats[turn].cash = Math.max(0, player.stats[turn].cash -penalty);
      addPlayerLog(player, turn, { type: 'DOWNTIME' }, `Downtime event: Having better operational maturity helps you deal with unexpected events better. Lost $${penalty} based on the current operational maturity of ${player.stats[turn].opsMaturity}.`);
    },
    RISING_COSTS: function (player, turn) {
      player.features.forEach((feature) => {
        feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2);
      });
      addPlayerLog(player, turn, { type: 'RISING_COSTS' }, 'Increased infrastructure cost have put pressure on your cash flow. All features now require an increased infrastructure spend by 20%. MultiTenant features do not require dedicated infrastructure per customer are more resilient to this change.');
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