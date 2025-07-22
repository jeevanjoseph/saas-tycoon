import { 
  DEV_COST_MONOLITH,
  DEV_COST_MULTI_TENANT,
  DEV_COST_SINGLE_TENANT,
  DEV_COST_CONTROL_PLANE,
  RELEASE_RAMP_MONOLITH,
  RELEASE_RAMP_SINGLE_TENANT,
  RELEASE_RAMP_MULTI_TENANT,
  SKILL_RAMP_LEGACY,
  SKILL_RAMP_CLOUD_NATIVE,
  CUSTOMER_RAMP_MONOLITH,
  CUSTOMER_RAMP_SINGLE_TENANT,
  CUSTOMER_RAMP_MULTI_TENANT,
  OPS_MATURITY_RAMP_MONOLITH,
  OPS_MATURITY_RAMP_SINGLE_TENANT,
  OPS_MATURITY_RAMP_MULTI_TENANT
} from '../constants';

// Monolith Feature Cost Calculation
export function calculateMonolithDevCost(player, turn) {
  const featureCount = player.features.filter(f => f.architecture === 'monolith').length;
  const opsMaturity = player.stats[turn]?.opsMaturity || 0;
  const legacySkills = player.stats[turn]?.legacySkills || 0;
  const customers = player.stats[turn]?.customers || 0;

  let devCost = DEV_COST_MONOLITH;
  if (featureCount > RELEASE_RAMP_MONOLITH) {
    devCost += (featureCount - RELEASE_RAMP_MONOLITH) * 1000;
  }
  if (legacySkills >= SKILL_RAMP_LEGACY) {
    devCost -= (legacySkills - SKILL_RAMP_LEGACY) * 200;
  }
  if (customers >= CUSTOMER_RAMP_MONOLITH) {
    devCost += (customers - CUSTOMER_RAMP_MONOLITH) * 3000;
  }
  if (opsMaturity >= OPS_MATURITY_RAMP_MONOLITH) {
    devCost -= (opsMaturity - OPS_MATURITY_RAMP_MONOLITH) * 400;
  }
  devCost = Math.max(devCost, DEV_COST_MONOLITH);
  return devCost;
}

// Single Tenant Microservice Cost Calculation
export function calculateSingleTenantMicroserviceDevCost(player, turn) {
  const featureCount = player.features.filter(f => f.architecture === 'microservice').length;
  const opsMaturity = player.stats[turn]?.opsMaturity || 0;
  const cloudSkills = player.stats[turn]?.cloudNativeSkills || 0;
  const customers = player.stats[turn]?.customers || 0;

  let devCost = DEV_COST_SINGLE_TENANT;
  if (featureCount > RELEASE_RAMP_SINGLE_TENANT) {
    devCost += (featureCount - RELEASE_RAMP_SINGLE_TENANT) * 1000;
  }
  if (cloudSkills >= SKILL_RAMP_CLOUD_NATIVE) {
    devCost -= (cloudSkills - SKILL_RAMP_CLOUD_NATIVE) * 200;
  }
  if (customers >= CUSTOMER_RAMP_SINGLE_TENANT) {
    devCost += (customers - CUSTOMER_RAMP_SINGLE_TENANT) * 3000;
  }
  if (opsMaturity >= OPS_MATURITY_RAMP_SINGLE_TENANT) {
    devCost -= (opsMaturity - OPS_MATURITY_RAMP_SINGLE_TENANT) * 400;
  }
  devCost = Math.max(devCost, DEV_COST_SINGLE_TENANT);
  return devCost;
}

// Multi Tenant Microservice Cost Calculation
export function calculateMultiTenantMicroserviceDevCost(player, turn) {
  const featureCount = player.features.filter(f => f.architecture === 'mt-microservice').length;
  const opsMaturity = player.stats[turn]?.opsMaturity || 0;
  const cloudSkills = player.stats[turn]?.cloudNativeSkills || 0;
  const customers = player.stats[turn]?.customers || 0;

  let devCost = DEV_COST_MULTI_TENANT;
  if (featureCount > RELEASE_RAMP_MULTI_TENANT) {
    devCost += (featureCount - RELEASE_RAMP_MULTI_TENANT) * 1000;
  }
  if (cloudSkills >= SKILL_RAMP_CLOUD_NATIVE) {
    devCost -= (cloudSkills - SKILL_RAMP_CLOUD_NATIVE) * 200;
  }
  if (customers >= CUSTOMER_RAMP_MULTI_TENANT) {
    devCost += (customers - CUSTOMER_RAMP_MULTI_TENANT) * 3000;
  }
  if (opsMaturity >= OPS_MATURITY_RAMP_MULTI_TENANT) {
    devCost -= (opsMaturity - OPS_MATURITY_RAMP_MULTI_TENANT) * 400;
  }
  devCost = Math.max(devCost, DEV_COST_MULTI_TENANT);
  return devCost;
}

// Control Plane cost is usually fixed, but you can add logic if needed
export function calculateControlPlaneDevCost() {
  return DEV_COST_CONTROL_PLANE;
}