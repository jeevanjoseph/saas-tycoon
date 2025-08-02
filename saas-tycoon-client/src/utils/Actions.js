const actions_build = [
  { code: "BUILD_CONTROL_PLANE", name: "Build Control Plane", description: "Develop a new control plane feature to attract more customers. Control planes are required for multitenant services as they manage and orchestrate the underlying cloud infrastructure resources. They generate no revenue, but does carry an infrastructure cost to operate. Cloud Native features attract tech debt slowly.", icon: "pi pi-cog", cost: DEV_COST_CONTROL_PLANE, unit: "feature", per_unit: false, revenue: CUSTOMER_PRICE_CONTROL_PLANE, releaseRamp: RELEASE_RAMP_MONOLITH, skillRamp: SKILL_RAMP_LEGACY, customerRamp: CUSTOMER_RAMP_MONOLITH, opsMaturityRamp: OPS_MATURITY_RAMP_MONOLITH },
  { code: "BUILD_MULTITENANT_FEATURE", name: "Build Multitenant Feature", description: "Distributed systems that serve multiple customers with a pool of instances(replicas) of the service/application. They are designed to be scalable and are often more profitable to operate in the long term. They are expensive to build than other arhitectures, but infrastructure cost remains the same as customers grow. Cloud Native features attract tech debt slowly.", icon: "pi pi-wrench", cost: DEV_COST_MULTI_TENANT, unit: "feature", per_unit: false, revenue: CUSTOMER_PRICE_MULTI_TENANT, releaseRamp: RELEASE_RAMP_MULTI_TENANT, skillRamp: SKILL_RAMP_CLOUD_NATIVE, customerRamp: CUSTOMER_RAMP_MULTI_TENANT, opsMaturityRamp: OPS_MATURITY_RAMP_MULTI_TENANT },
  { code: "BUILD_SINGLETENANT_FEATURE", name: "Build Singletentant Feature", description: "Develop a feature using a modern stack, but deployed on customer specific infrastructure. Cheaper to build than a multitenant system, but attracts tech debt quicker than multitenant. Infrastructure costs grow with customers.", icon: "pi pi-users", cost: DEV_COST_SINGLE_TENANT, unit: "feature", per_unit: false, revenue: CUSTOMER_PRICE_SINGLE_TENANT, releaseRamp: RELEASE_RAMP_SINGLE_TENANT, skillRamp: SKILL_RAMP_CLOUD_NATIVE, customerRamp: CUSTOMER_RAMP_SINGLE_TENANT, opsMaturityRamp: OPS_MATURITY_RAMP_SINGLE_TENANT },
  { code: "BUILD_MONOLITH_FEATURE", name: "Build Monolith Feature", description: "Cheapest to build, but the older architecture and techstack attracts tech debt the fastest. Infrastructure costs grow with customers. ", icon: "pi pi-database", cost: DEV_COST_MONOLITH, unit: "feature", per_unit: false, revenue: CUSTOMER_PRICE_MONOLITH, releaseRamp: RELEASE_RAMP_MONOLITH, skillRamp: SKILL_RAMP_LEGACY, customerRamp: CUSTOMER_RAMP_MONOLITH, opsMaturityRamp: OPS_MATURITY_RAMP_MONOLITH },
];

const actions_tech_debt_reduction = [
  { code: "TECH_DEBT_REDUCTION", name: "Modularize", description: "Break down large tightly coupled components. Improves maintainability and sets the stage for future refactoring.", icon: "pi pi-wrench", multiplier: 1, cost: TECH_DEBT_REDUCTION_COST, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Instrumentation", description: "Use logs, metrics, and traces to better understand bottlenecks or fragile code paths. Data-driven insights help justify debt remediation.", icon: "pi pi-hammer", multiplier: 2, cost: TECH_DEBT_REDUCTION_COST * 1.8, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Code Audit", description: "Perform a thorough code audit and identify areas for improving and modernizing the code base.", icon: "pi pi-search", multiplier: 3, cost: TECH_DEBT_REDUCTION_COST * 2.7, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Dependency Audit", description: "Audit application dependencies, evaluate newer libraries and APIs for improved performance and stability.", icon: "pi pi-check-square", multiplier: 4, cost: TECH_DEBT_REDUCTION_COST * 3.6, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Defensive Coding", description: "Implement defensive coding practices for better resiliency, security and operational posture.", icon: "pi pi-trophy", multiplier: 5, cost: TECH_DEBT_REDUCTION_COST * 4.5, unit: "feature", per_unit: true },
];

const actions_ops_maturity = [
  { code: "DEVOPS", name: "DevOps Culture", description: "Create a DevOps culture in the team. Your developers build better services when they also operate the service.", icon: "pi pi-shield", level: 1, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Observability", description: "Leverage built-in dashboards and metrics to keep up to date on your service health.", icon: "pi pi-shield", level: 2, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Metrics & Tracing", description: "Emit custom metrics and traces from your application, providing a high fidelity lens in to your application.", icon: "pi pi-shield", level: 3, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Incident Management", description: "Implement advanced incident management practices, including post-incident reviews and blameless retrospectives to continuously improve operational excellence.", icon: "pi pi-shield", level: 4, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Feature Flags", description: "Implement a Feature Flag system to decouple deployment from release, enabling safer rollout and faster iteration while reducing release risks. Every Ops Maturity skill point from this level will reduce the cost to scale your services to larger audiences", icon: "pi pi-star", level: 5, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "DevOps KPIs", description: "Implement an Ops call for developers. Pivot from shipping software to owning an always on service.", icon: "pi pi-shield", level: 6, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Canary Testing", description: "Implement canary testing in your pipelines to validate new features with a small subset of users before full rollout.", icon: "pi pi-shield", level: 7, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Graceful Degradation", description: "Design your application to gracefully degrade in case of failures, ensuring critical functionality remains available even under stress.", icon: "pi pi-shield", level: 8, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Self-Healing", description: "Implement self-healing patterns for applications that can automatically recover from failures, reducing downtime and improving reliability.", icon: "pi pi-shield", level: 9, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Chaos Engineering", description: "Practice chaos engineering to proactively identify weaknesses in your system and improve resilience under failure conditions.", icon: "pi pi-shield", level: 10, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Self-Healing", description: "Implement advanced self-healing patterns that can automatically adapt to changing conditions and recover from complex failures.", icon: "pi pi-shield", level: 11, cost: DEVOPS_COST, unit: "level", per_unit: true },

];

const actions_cloud_skills = [
  { code: "TRAINING", name: "Container Basics", description: "Learn container basics and orchestration concepts.", icon: "pi pi-cloud", level: 1, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Cloud Native Patterns", description: "Learn cloud-native application design patterns and methodologies like the 12-factor application principles.", icon: "pi pi-cloud", level: 2, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Design for scale and resiliency", description: "All systems fail, but there is a difference when a failure results in service degradation vs. service outage. Learn the principles to design scalable a resilient applications.", icon: "pi pi-cloud", level: 3, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Infrastructure as Code", description: "Adopt Infrastructure as Code (IaC) practices. Drive toward an automation driven repeatable and ephemeral infrastructure approach", icon: "pi pi-cloud", level: 4, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Release Automation", description: "Enable automated canary testing and quality gates in pipelines. Deploy frequently. Decouple deployments from releases using feature flags. Unlock this training level to permanently reduce the cool down period for cloud feature builds by 1. Every subsequent level also reduces cloud feature development cost.", icon: "pi pi-star", level: 5, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Advanced monitoring and custom metrics", description: "Implement advanced monitoring and alerting for cloud workloads. Understand and implement custom metrics that can drive better insights in to application usage patterns and behaviors.", icon: "pi pi-cloud", level: 6, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Autoscaling & Cost Optimization", description: "Use the metrics and usage data to enable autoscaling and cost optimization strategies. Unlocking this level permanently reduces cloud feature build cool down period by 1.", icon: "pi pi-star", level: 7, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Cloud Native DevOps", description: "Achieve full cloud native maturity with self-healing application design.", icon: "pi pi-cloud", level: 8, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
];

const actions_legacy_skills = [
  { code: "TRAINING_LEGACY", name: "Java EE Training", description: "Learn Java EE basics and application server concepts.", icon: "pi pi-database", level: 1, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Weblogic Basics", description: "Understand deployment on WebLogic and EAR/WAR packaging.", icon: "pi pi-database", level: 2, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Scaling Weblogic Apps", description: "Master JDBC, JNDI, and connection pooling in Java EE.", icon: "pi pi-database", level: 3, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "ADF-BC Best Practices", description: "Implement ADF-BC best practices.", icon: "pi pi-database", level: 4, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "App Performance Tuning", description: "Weblogic Application performance tuning. Unlock this training level to permanently reduce the cool down period for monolith feature builds by 1. Every subsequent level also reduces monolith feature development cost.", icon: "pi pi-star", level: 5, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "JVM Tuning", description: "Tune JVM for performance and scalability.", icon: "pi pi-database", level: 6, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Integration Best Practices", description: "Integrate legacy systems using SOAP and JCA adapters. Unlock this training level to permanently reduce the cool down period for monolith feature builds by 1.", icon: "pi pi-star", level: 7, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Security and IDCS integration", description: "Implement security and SSO in Java EE applications.", icon: "pi pi-database", level: 8, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Legacy Skills", description: "Automate deployments with WLST and scripting.", icon: "pi pi-database", level: 9, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Legacy Skills", description: "Migrate and modernize legacy Java EE applications.", icon: "pi pi-database", level: 10, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true }
];

const actions_bonus = [
  { code: "LAUNCH_MARKETING_CAMPAIGN", name: "Launch Marketing Campaign", description: "Run a marketing campaign to increase brand awareness. Based on the number of features you have and how good your operational maturity is, you may add customers. This is always a roll of the dice, but more features and better operational maturity increase your odds of success. It does not matter if you have cloud-native or legacy features, or if you have high tech debt, of what your skill level is. Customers care most about feature richness and stability.", icon: "pi pi-megaphone", cost: MARKETING_COST, unit: "feature", per_unit: false },
  { code: "OPTIMIZE_PRICING", name: "Optimize Pricing", description: "Raise your prices by $500/feature. Improves revenue, but you run the risk of losing customers. Customer audits will reveal your tech debt, and this along with your operational maturity will determine if you lose customers.", icon: "pi pi-dollar", cost: 3000, unit: "feature", per_unit: false },

];

module.exports = {
    actions_build,
    actions_tech_debt_reduction,
    actions_ops_maturity,
    actions_cloud_skills,
    actions_legacy_skills,
    actions_bonus
};