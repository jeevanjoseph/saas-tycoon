const { addPlayerLog } = require('../../util/PlayerLog');
const constants = require('../players/constants');

function handleLighthouseProgram(player, turn) {
    player.stats[turn].opsMaturity += 1;
    addPlayerLog(player, turn, { type: 'LIGHTHOUSE_PROGRAM' }, `Spectra Lighthouse Program engagement gives you tips of operational improvements, raising operational marturity to ${player.stats[turn].opsMaturity}`);
}

function handleCustomerChurn(player, turn) {
    let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 4);
    if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Out of control tech debt has resulted in frequent issues that are hard to address completely. Lost a customer.');
    } else {
        addPlayerLog(player, turn, { type: 'CUSTOMER_CHURN' }, 'Excellent discipline in managing (or avoiding) tech det earns you a loyal customer base. No effect due to this event');
    }
}

function handleCloudMigration(player, turn) {
    let cloudNativeFeatures = player.features.filter(feature => feature.architecture === 'microservice' || feature.architecture === 'mt-microservice');
    let legacyFeatures = player.features.filter(feature => feature.architecture === 'monolith');
    if (cloudNativeFeatures.length > legacyFeatures.length) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers find the mix of feature completeness and modern technology appealing.  Gained a customer');
    } else {
        addPlayerLog(player, turn, { type: 'CLOUD_MIGRATION' }, 'Customers are wary that despite feature completeness, the legacy technology may cause security and operational issues. Customers avoid your product as they make a cloud transformation.');
    }
}

function handleInnovation(player, turn) {
    let totalSkills = player.stats[turn].legacySkills + player.stats[turn].cloudNativeSkills;
    if (totalSkills > 5) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: gained a customer');
    } else {
        addPlayerLog(player, turn, { type: 'INNOVATION' }, 'Innovation event: no effect');
    }
}

function handleMarketDisruption(player, turn) {
    player.features.forEach((feature) => {
        feature.featurePrice = Math.max(0, feature.featurePrice - (feature.featurePrice * 0.1));
    });
    addPlayerLog(player, turn, { type: 'MARKET_DISRUPTION' }, 'New market entrants have disrupted the market, forcing you to reduce feature prices by 10% to compete. This is a good time to invest in features that are more resilient to price pressure.');
}

function handleDowntime(player, turn) {
    let penalty = 500 * (constants.OPS_MATURITY_MAX - player.stats[turn].opsMaturity);
    player.stats[turn].cash = Math.max(0, player.stats[turn].cash - penalty);
    addPlayerLog(player, turn, { type: 'DOWNTIME' }, `Downtime event: Having better operational maturity helps you deal with unexpected events better. Lost $${penalty} based on the current operational maturity of ${player.stats[turn].opsMaturity}.`);
}

function handleRisingCosts(player, turn) {
    player.features.forEach((feature) => {
        feature.infrastructureCost = Math.ceil(feature.infrastructureCost * 1.2);
    });
    addPlayerLog(player, turn, { type: 'RISING_COSTS' }, 'Increased infrastructure cost have put pressure on your cash flow. All features now require an increased infrastructure spend by 20%. MultiTenant features do not require dedicated infrastructure per customer are more resilient to this change.');
}

function handleFeatureInnovation(player, turn) {
    if (player.features.length > 3) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'FEATURE_INNOVATION' }, 'Feature innovation event: gained a customer');
    } else {
        addPlayerLog(player, turn, { type: 'FEATURE_INNOVATION' }, 'Feature innovation event: no effect');
    }
}

function handleOperationalExcellence(player, turn) {
    if (player.stats[turn].opsMaturity > 5) {
        player.stats[turn].customers += 1;
        addPlayerLog(player, turn, { type: 'OPERATIONAL_EXCELLENCE' }, 'Operational excellence event: gained a customer');
    } else {
        addPlayerLog(player, turn, { type: 'OPERATIONAL_EXCELLENCE' }, 'Operational excellence event: no effect');
    }
}

function handleTechDebtCrisis(player, turn) {
    let highTechDebtFeatures = player.features.filter(feature => feature.techDebt > 5);
    if (highTechDebtFeatures.length > 0) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
        addPlayerLog(player, turn, { type: 'TECH_DEBT_CRISIS' }, 'High tech debt has resulted in a crisis. Lost a customer.');
    } else {
        addPlayerLog(player, turn, { type: 'TECH_DEBT_CRISIS' }, 'Excellent management of tech debt has prevented a crisis. No effect due to this event');
    }
}

function handleLegacySkillsShortage(player, turn) {
    if (player.features.filter(feature => feature.architecture === 'monolith').length > 5 && player.stats[turn].legacySkills < 8) {
        player.features.forEach(feature => {
            feature.techDebt *= 2; // Double the tech debt
        });
        addPlayerLog(player, turn, { type: 'LEGACY_SKILLS_SHORTAGE' }, 'Legacy skills shortage has doubled your tech debt. Consider pivoting to cloud-native solutions.');
    } else {
        addPlayerLog(player, turn, { type: 'LEGACY_SKILLS_SHORTAGE' }, 'No effect due to sufficient legacy skills or fewer than 5 legacy features.');
    }
}

function handleFeatureBloat(player, turn) {
    if (player.features.length > 5 && player.features.reduce((sum, feature) => sum + feature.techDebt, 0) > 8) {
        player.stats[turn].cash *= 0.5; // Lose 50% revenue
        addPlayerLog(player, turn, { type: 'FEATURE_BLOAT' }, 'Feature bloat has resulted in a significant loss of revenue.');
    } else {
        addPlayerLog(player, turn, { type: 'FEATURE_BLOAT' }, 'No effect due to manageable feature count and tech debt.');
    }
}

function handleMarketSaturation(player, turn) {
    if (player.stats[turn].customers > 5 && player.stats[turn].opsMaturity < 5) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 1);
        addPlayerLog(player, turn, { type: 'MARKET_SATURATION' }, 'Market saturation has caused a loss of a customer due to insufficient operational maturity.');
    } else {
        addPlayerLog(player, turn, { type: 'MARKET_SATURATION' }, 'No effect due to sufficient customers or operational maturity.');
    }
}

function handleRegulatoryChanges(player, turn) {
    if (player.stats[turn].opsMaturity < 3) {
        player.stats[turn].cash = Math.max(0, player.stats[turn].cash - player.stats[turn].cash * 0.25); // Lose 25% revenue
        addPlayerLog(player, turn, { type: 'REGULATORY_CHANGES' }, 'Regulatory changes have resulted in a fine due to insufficient operational maturity.');
    } else {
        addPlayerLog(player, turn, { type: 'REGULATORY_CHANGES' }, 'No effect due to sufficient operational maturity.');
    }
}
function handleBreakingVendorLockin(player, turn) {
    if (player.features.some(feature => feature.featurePrice > 1500)) {
        player.stats[turn].customers = Math.ceil(Math.max(0, player.stats[turn].customers - 0.25 * player.stats[turn].customers)); // Lose 25% customers
        addPlayerLog(player, turn, { type: 'BREAKING_VENDOR_LOCKIN' }, 'Breaking vendor lock-in has caused a loss of customers due to high prices.');
    } else {
        addPlayerLog(player, turn, { type: 'BREAKING_VENDOR_LOCKIN' }, 'No effect due to competitive pricing.');
    }
}

function handleCustomerExperienceRevolution(player, turn) {
    if (player.stats[turn].opsMaturity > 7 && player.features.reduce((sum, feature) => sum + feature.techDebt, 0) < 5) {
        player.stats[turn].customers += 2;
        addPlayerLog(player, turn, { type: 'CUSTOMER_EXPERIENCE_REVOLUTION' }, 'Customer experience revolution has gained you 2 customers due to high operational maturity and low tech debt.');
    } else {
        addPlayerLog(player, turn, { type: 'CUSTOMER_EXPERIENCE_REVOLUTION' }, 'No effect due to insufficient operational maturity or high tech debt.');
    }
}

function handleMajorCVE(player, turn) {
    //A major CVE has been discovered, teams with more than 8 tech debt points lose upto  2 customers.
    if (player.features.reduce((sum, feature) => sum + feature.techDebt, 0) > 8) {
        player.stats[turn].customers = Math.max(0, player.stats[turn].customers - 2);
        addPlayerLog(player, turn, { type: 'MAJOR_CVE' }, 'A major CVE has caused a loss of 2 customers due to high tech debt.');
    } else {
        addPlayerLog(player, turn, { type: 'MAJOR_CVE' }, 'No effect due to manageable tech debt.');
    }
    
}



module.exports = {
    handleLighthouseProgram,
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
    handleMajorCVE
    // Other event handlers can be added here   
};