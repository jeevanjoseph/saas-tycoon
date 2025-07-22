const FeatureActions = {
  monolith: {
    calculateRevenue: function (feature, turn, customers) {
      let featureRevenue = feature.featurePrice * customers;
      let infrastructureCost = feature.infrastructureCost * customers;
      let techDebtCost =  Math.min(900, feature.techDebt * 100);
      let netRevenue = featureRevenue - infrastructureCost - techDebtCost;
      feature.revenueStats.push({
        turn,
        featureRevenue,
        infrastructureCost,
        techDebtCost,
        netRevenue
      });
      return netRevenue;
    },
    updateTechDebt: function (feature, turn) {
      let featureAge = turn - feature.createdTurn;
      if (typeof feature.techDebt !== 'number' || isNaN(feature.techDebt)) {
        feature.techDebt = 0;
      }
      if (featureAge > 2) {
        feature.techDebt += 1;
      }
    }
  },
  microservice: {
    calculateRevenue: function (feature, turn, customers) {
      let featureRevenue = feature.featurePrice * customers;
      let infrastructureCost = feature.infrastructureCost * customers;
      let techDebtCost = Math.min(900, feature.techDebt * 100);
      let netRevenue = featureRevenue - infrastructureCost - techDebtCost;
      feature.revenueStats.push({
        turn,
        featureRevenue,
        infrastructureCost,
        techDebtCost,
        netRevenue
      });
      return netRevenue;
    },
    updateTechDebt: function (feature, turn) {
      let featureAge = turn - feature.createdTurn;
      if (typeof feature.techDebt !== 'number' || isNaN(feature.techDebt)) {
        feature.techDebt = 0;
      }
      if (featureAge > 4) {
        feature.techDebt += 1;
      }
    }
  },
  'mt-microservice': {
    calculateRevenue: function (feature, turn, customers) {
      let featureRevenue = feature.featurePrice * customers;
      let infrastructureCost = feature.infrastructureCost;
      let techDebtCost = Math.min(900, feature.techDebt * 100);
      let netRevenue = featureRevenue - infrastructureCost - techDebtCost;
      feature.revenueStats.push({
        turn,
        featureRevenue,
        infrastructureCost,
        techDebtCost,
        netRevenue
      });
      return netRevenue;
    },
    updateTechDebt: function (feature, turn) {
      let featureAge = turn - feature.createdTurn;
      if (typeof feature.techDebt !== 'number' || isNaN(feature.techDebt)) {
        feature.techDebt = 0;
      }
      if (featureAge > 8) {
        feature.techDebt += 1;
      }
    }
  },
  'control-plane': {
    calculateRevenue: function (feature, turn, customers) {
      let featureRevenue = 0;
      let infrastructureCost = feature.infrastructureCost;
      let techDebtCost = Math.min(800, feature.techDebt * 100);
      let netRevenue = featureRevenue - infrastructureCost - techDebtCost;
      feature.revenueStats.push({
        turn,
        featureRevenue,
        infrastructureCost,
        techDebtCost,
        netRevenue
      });
      return netRevenue;
    },
    updateTechDebt: function (feature, turn) {
      let featureAge = turn - feature.createdTurn;
      if (typeof feature.techDebt !== 'number' || isNaN(feature.techDebt)) {
        feature.techDebt = 0;
      }
      if (featureAge > 8) {
        feature.techDebt += 1;
      }
    }
  }
};

// Generic dispatcher functions
function calculateRevenue(feature, turn, customers) {
  const type = feature.architecture;
  if (FeatureActions[type] && FeatureActions[type].calculateRevenue) {
    return FeatureActions[type].calculateRevenue(feature, turn, customers);
  }
  throw new Error(`Unknown feature type for calculateRevenue: ${type}`);
}

function updateTechDebt(feature, turn) {
  const type = feature.architecture;
  if (FeatureActions[type] && FeatureActions[type].updateTechDebt) {
    return FeatureActions[type].updateTechDebt(feature, turn);
  }
  throw new Error(`Unknown feature type for updateTechDebt: ${type}`);
}

module.exports = {
  calculateRevenue,
  updateTechDebt
};