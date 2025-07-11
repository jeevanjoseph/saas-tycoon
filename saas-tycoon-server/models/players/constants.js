
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

module.exports = {
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
    ACTION_COOLDOWN_PERIODS
};