const HOST = process.env.GAME_API_HOST || 'localhost';
const PORT = process.env.GAME_API_PORT || '3000';
const API = `http://${HOST}:${PORT}/api/game`;

const getBaseUrl = () => {
  let url;
  switch(process.env.NODE_ENV) {
    case 'production':
      url = 'http://129.213.166.230:3000/api/game';
      break;
    case 'development':
    default:
      url = 'http://localhost:3000/api/game';
  }

  return url;
}

const OPS_MATURITY_MAX = 10;
const LEGACY_SKILLS_MAX = 10;
const CLOUD_NATIVE_SKILLS_MAX = 10;
const TECH_DEBT_MAX = 10;
const DEV_COST_MONOLITH = 1000;
const DEV_COST_CONTROL_PLANE = 2000;
const DEV_COST_MULTI_TENANT = 1500;
const DEV_COST_SINGLE_TENANT = 1200;
const CUSTOMER_PRICE_MULTI_TENANT = 1000;
const CUSTOMER_PRICE_SINGLE_TENANT = 1000;
const CUSTOMER_PRICE_CONTROL_PLANE = 0; // Control Plane does not have a customer price
const CUSTOMER_PRICE_MONOLITH = 1000;
const TECH_DEBT_REDUCTION_COST = 400; // Cost to reduce tech debt per feature
const DEVOPS_COST = 1000; // Cost for DevOps improvements per level of ops maturity
const TRAINING_COST_CLOUD = 500; // Cost for training to increase cloud-native skills
const TRAINING_COST_LEGACY = 250; // Cost for training to increase legacy skills
const MARKETING_COST = 5000; // Cost for marketing campaigns
//cooldown periods for actions
const ACTION_COOLDOWN_PERIODS = {
    BUILD_MONOLITH_FEATURE: 3,
    BUILD_CONTROL_PLANE: 3,
    BUILD_MULTITENANT_FEATURE: 3,
    BUILD_SINGLETENANT_FEATURE: 3,
    //TODO: Add more actions for marketing, price war and takeover.
};

//cost ramps for features. These are the points after  which feature development becomes more expsnsive
// as you have to manage releases across multiple features etc. Skill counteracts this effect
const RELEASE_RAMP_MONOLITH = 3
const RELEASE_RAMP_SINGLE_TENANT = 4
const RELEASE_RAMP_MULTI_TENANT = 5

// Skill Ramps. These ae the points after which skills counterbalance the dev ramp cost created by having 
// too many features

const SKILL_RAMP_LEGACY = 5
const SKILL_RAMP_CLOUD_NATIVE = 5

// Customer ramps. When you have a lot of customers, managing single tenant deployments become complex
// Each customer's tenant is handled separately, and that adds cost and complexity.
// Ops Maturity Counteracts this effect.
// Multi-Tenant apps are not affected (affected at level 99)

const CUSTOMER_RAMP_MONOLITH = 3
const CUSTOMER_RAMP_SINGLE_TENANT = 4
const CUSTOMER_RAMP_MULTI_TENANT = 6

//ops Maturity ramps. When you have a lot of customers, you need to invest in DevOps to manage the complexity

const OPS_MATURITY_RAMP_MONOLITH = 5
const OPS_MATURITY_RAMP_SINGLE_TENANT = 5
const OPS_MATURITY_RAMP_MULTI_TENANT = 99

// Starting stats for players

const MONOLITH_STARTING_STATS = {
    cash: 10000,
    customers: 1,
    legacySkills: 4,
    cloudNativeSkills: 0,
    opsMaturity: 0
};

const SINGLETENANT_STARTING_STATS = {
    cash: 8000,
    customers: 1,
    legacySkills: 4,
    cloudNativeSkills: 1,
    opsMaturity: 0
};

const MULTITENANT_STARTING_STATS = {
    cash: 5000,
    customers: 1,
    legacySkills: 0,
    cloudNativeSkills: 4,
    opsMaturity: 3
};


const DEFAULT_PLAYER_TYPE = 'Monolith';
const DEFAULT_PLAYER_COUNT = 10;

module.exports = {
    getBaseUrl,
    API,
    OPS_MATURITY_MAX,
    LEGACY_SKILLS_MAX,
    CLOUD_NATIVE_SKILLS_MAX,
    TECH_DEBT_MAX,
    DEV_COST_MONOLITH,
    DEV_COST_CONTROL_PLANE,
    DEV_COST_MULTI_TENANT,
    DEV_COST_SINGLE_TENANT,
    CUSTOMER_PRICE_MULTI_TENANT,
    CUSTOMER_PRICE_SINGLE_TENANT,
    CUSTOMER_PRICE_CONTROL_PLANE,
    CUSTOMER_PRICE_MONOLITH,
    TECH_DEBT_REDUCTION_COST,
    DEVOPS_COST,
    TRAINING_COST_CLOUD,
    TRAINING_COST_LEGACY,
    MARKETING_COST,
    ACTION_COOLDOWN_PERIODS,
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
    OPS_MATURITY_RAMP_MULTI_TENANT,
    MONOLITH_STARTING_STATS,
    SINGLETENANT_STARTING_STATS,
    MULTITENANT_STARTING_STATS,
    DEFAULT_PLAYER_TYPE,
    DEFAULT_PLAYER_COUNT,
    HOST,
    PORT
};