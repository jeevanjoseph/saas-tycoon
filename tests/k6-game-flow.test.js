import http from 'k6/http';
import { check, sleep } from 'k6';

// Actions from GamePage.js (sync with your actual actions if you change them)
const actions_build = [
  { code: "BUILD_CONTROL_PLANE", name: "Build Control Plane", description: "Develop a new control plane feature to attract more customers. Control planes are required for multitenant services as they manage and orchestrate the underlying cloud infrastructure resources. They generate no revenue, but does carry an infrastructure cost to operate. Cloud Native features attract tech debt slowly.", icon: "pi pi-cog", cost: 2000, unit: "feature", per_unit: false, revenue: 1000, releaseRamp: 3, skillRamp: 5, customerRamp: 4, opsMaturityRamp: 5 },
  { code: "BUILD_MULTITENANT_FEATURE", name: "Build Multitenant Feature", description: "Distributed systems that serve multiple customers with a pool of instances(replicas) of the service/application. They are designed to be scalable and are often more profitable to operate in the long term. They are expensive to build than other arhitectures, but infrastructure cost remains the same as customers grow. Cloud Native features attract tech debt slowly.", icon: "pi pi-wrench", cost: 1500, unit: "feature", per_unit: false, revenue: 1000, releaseRamp: 5, skillRamp: 5, customerRamp: 5, opsMaturityRamp: 5 },
  { code: "BUILD_SINGLETENANT_FEATURE", name: "Build Singletentant Feature", description: "Develop a feature using a modern stack, but deployed on customer specific infrastructure. Cheaper to build than a multitenant system, but attracts tech debt quicker than multitenant. Infrastructure costs grow with customers.", icon: "pi pi-users", cost: 1100, unit: "feature", per_unit: false, revenue: 1200, releaseRamp: 4, skillRamp: 5, customerRamp: 4, opsMaturityRamp: 5 },
  { code: "BUILD_MONOLITH_FEATURE", name: "Build Monolith Feature", description: "Cheapest to build, but the older architecture and techstack attracts tech debt the fastest. Infrastructure costs grow with customers. ", icon: "pi pi-database", cost: 1000, unit: "feature", per_unit: false, revenue: 1000, releaseRamp: 3, skillRamp: 5, customerRamp: 4, opsMaturityRamp: 5 },
];

const actions_tech_debt_reduction = [
  { code: "TECH_DEBT_REDUCTION", name: "Modularize", description: "Break down large tightly coupled components. Improves maintainability and sets the stage for future refactoring.", icon: "pi pi-wrench", multiplier: 1, cost: 500, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Instrumentation", description: "Use logs, metrics, and traces to better understand bottlenecks or fragile code paths. Data-driven insights help justify debt remediation.", icon: "pi pi-hammer", multiplier: 2, cost: 500 * 1.8, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Code Audit", description: "Perform a thorough code audit and identify areas for improving and modernizing the code base.", icon: "pi pi-search", multiplier: 3, cost: 500 * 2.7, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Dependency Audit", description: "Audit application dependencies, evaluate newer libraries and APIs for improved performance and stability.", icon: "pi pi-check-square", multiplier: 4, cost: 500 * 3.6, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Defensive Coding", description: "Implement defensive coding practices for better resiliency, security and operational posture.", icon: "pi pi-trophy", multiplier: 5, cost: 500 * 4.5, unit: "feature", per_unit: true },
];

const actions_ops_maturity = [
  { code: "DEVOPS", name: "DevOps Culture", description: "Create a DevOps culture in the team. Your developers build better services when they also operate the service.", icon: "pi pi-shield", level: 1, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Observability", description: "Leverage built-in dashboards and metrics to keep up to date on your service health.", icon: "pi pi-shield", level: 2, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Metrics & Tracing", description: "Emit custom metrics and traces from your application, providing a high fidelity lens in to your application.", icon: "pi pi-shield", level: 3, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Incident Management", description: "Implement advanced incident management practices, including post-incident reviews and blameless retrospectives to continuously improve operational excellence.", icon: "pi pi-shield", level: 4, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Feature Flags", description: "Implement a Feature Flag system to decouple deployment from release, enabling safer rollout and faster iteration while reducing release risks. Every Ops Maturity skill point from this level will reduce the cost to scale your services to larger audiences", icon: "pi pi-star", level: 5, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "DevOps KPIs", description: "Implement an Ops call for developers. Pivot from shipping software to owning an always on service.", icon: "pi pi-shield", level: 6, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Canary Testing", description: "Implement canary testing in your pipelines to validate new features with a small subset of users before full rollout.", icon: "pi pi-shield", level: 7, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Graceful Degradation", description: "Design your application to gracefully degrade in case of failures, ensuring critical functionality remains available even under stress.", icon: "pi pi-shield", level: 8, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Self-Healing", description: "Implement self-healing patterns for applications that can automatically recover from failures, reducing downtime and improving reliability.", icon: "pi pi-shield", level: 9, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Chaos Engineering", description: "Practice chaos engineering to proactively identify weaknesses in your system and improve resilience under failure conditions.", icon: "pi pi-shield", level: 10, cost: 500, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Self-Healing", description: "Implement advanced self-healing patterns that can automatically adapt to changing conditions and recover from complex failures.", icon: "pi pi-shield", level: 11, cost: 500, unit: "level", per_unit: true },

];

const actions_cloud_skills = [
  { code: "TRAINING", name: "Container Basics", description: "Learn container basics and orchestration concepts.", icon: "pi pi-cloud", level: 1, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Cloud Native Patterns", description: "Learn cloud-native application design patterns and methodologies like the 12-factor application principles.", icon: "pi pi-cloud", level: 2, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Design for scale and resiliency", description: "All systems fail, but there is a difference when a failure results in service degradation vs. service outage. Learn the principles to design scalable a resilient applications.", icon: "pi pi-cloud", level: 3, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Infrastructure as Code", description: "Adopt Infrastructure as Code (IaC) practices. Drive toward an automation driven repeatable and ephemeral infrastructure approach", icon: "pi pi-cloud", level: 4, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Release Automation", description: "Enable automated canary testing and quality gates in pipelines. Deploy frequently. Decouple deployments from releases using feature flags. Unlock this training level to permanently reduce the cool down period for cloud feature builds by 1. Every subsequent level also reduces cloud feature development cost.", icon: "pi pi-star", level: 5, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Advanced monitoring and custom metrics", description: "Implement advanced monitoring and alerting for cloud workloads. Understand and implement custom metrics that can drive better insights in to application usage patterns and behaviors.", icon: "pi pi-cloud", level: 6, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Autoscaling & Cost Optimization", description: "Use the metrics and usage data to enable autoscaling and cost optimization strategies. Unlocking this level permanently reduces cloud feature build cool down period by 1.", icon: "pi pi-star", level: 7, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Cloud Native DevOps", description: "Achieve full cloud native maturity with self-healing application design.", icon: "pi pi-cloud", level: 8, cost: 500, unit: "level", per_unit: true },
];

const actions_legacy_skills = [
  { code: "TRAINING_LEGACY", name: "Java EE Training", description: "Learn Java EE basics and application server concepts.", icon: "pi pi-database", level: 1, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Weblogic Basics", description: "Understand deployment on WebLogic and EAR/WAR packaging.", icon: "pi pi-database", level: 2, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Scaling Weblogic Apps", description: "Master JDBC, JNDI, and connection pooling in Java EE.", icon: "pi pi-database", level: 3, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "ADF-BC Best Practices", description: "Implement ADF-BC best practices.", icon: "pi pi-database", level: 4, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "App Performance Tuning", description: "Weblogic Application performance tuning. Unlock this training level to permanently reduce the cool down period for monolith feature builds by 1. Every subsequent level also reduces monolith feature development cost.", icon: "pi pi-star", level: 5, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "JVM Tuning", description: "Tune JVM for performance and scalability.", icon: "pi pi-database", level: 6, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Integration Best Practices", description: "Integrate legacy systems using SOAP and JCA adapters. Unlock this training level to permanently reduce the cool down period for monolith feature builds by 1.", icon: "pi pi-star", level: 7, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Security and IDCS integration", description: "Implement security and SSO in Java EE applications.", icon: "pi pi-database", level: 8, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Legacy Skills", description: "Automate deployments with WLST and scripting.", icon: "pi pi-database", level: 9, cost: 500, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Legacy Skills", description: "Migrate and modernize legacy Java EE applications.", icon: "pi pi-database", level: 10, cost: 500, unit: "level", per_unit: true }
];

const actions_bonus = [
  { code: "LAUNCH_MARKETING_CAMPAIGN", name: "Launch Marketing Campaign", description: "Run a marketing campaign to increase brand awareness. Based on the number of features you have and how good your operational maturity is, you may add customers. This is always a roll of the dice, but more features and better operational maturity increase your odds of success. It does not matter if you have cloud-native or legacy features, or if you have high tech debt, of what your skill level is. Customers care most about feature richness and stability.", icon: "pi pi-megaphone", cost: 5000, unit: "feature", per_unit: false },
  { code: "OPTIMIZE_PRICING", name: "Optimize Pricing", description: "Raise your prices by $500/feature. Improves revenue, but you run the risk of losing customers. Customer audits will reveal your tech debt, and this along with your operational maturity will determine if you lose customers.", icon: "pi pi-dollar", cost: 3000, unit: "feature", per_unit: false },
  { code: "PRICE_WAR", name: "Start a Price War", description: "Lower your feature price by 25%, forcing all players to lower theirs by 20%. Create downward market pressure on your competition.", icon: "pi pi-flag", cost: 1000, unit: "feature", per_unit: false },
  { code: "HOSTILE_TAKEOVER", name: "Hostile Takeover", description: "Pay 2X the market cap of one of the other players to acquire all their features, customers, and liabilities.", icon: "pi pi-exclamation-triangle", cost: 100000, unit: "feature", per_unit: false },
];
// Combine all actions
const allActions = [
  ...actions_build,
  ...actions_tech_debt_reduction,
  ...actions_ops_maturity,
  ...actions_cloud_skills,
  ...actions_legacy_skills,
  ...actions_bonus
];

const BASE_URL = __ENV.K6_API_URL || 'http://localhost:3000/api/game';

export let options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  // 1. Open the page (simulate GET /)
  let res = http.get(BASE_URL);
  check(res, { 'homepage loaded': (r) => r.status === 200 });

  // 2. Get Sessions
  let sessionsRes = http.get(BASE_URL);
  check(sessionsRes, { 'sessions listed': (r) => r.status === 200 });

  // 3. Create a new session
  let sessionName = `k6-session-${Math.floor(Math.random() * 100000)}`;
  let createRes = http.post(BASE_URL, JSON.stringify({ playerLimit: 20, name: sessionName }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(createRes, { 'session created': (r) => r.status === 200 && r.json('gameId') });

  let gameId = createRes.json('gameId');

  // 4. Join the session with 10 players
  let playerIds = [];
  for (let i = 0; i < 10; i++) {
    let joinRes = http.post(`${BASE_URL}/${gameId}/join`, JSON.stringify({
      playerName: `K6Player${i + 1}`,
      playerType: 'Monolith'
    }), { headers: { 'Content-Type': 'application/json' } });
    check(joinRes, { [`player ${i + 1} joined`]: (r) => r.status === 200 && r.json('playerId') });
    playerIds.push(joinRes.json('playerId'));
    sleep(1);
  }

  // 5. Mark all players as ready
  for (let i = 0; i < playerIds.length; i++) {
    let readyRes = http.post(`${BASE_URL}/${gameId}/ready`, JSON.stringify({
      playerId: playerIds[i]
    }), { headers: { 'Content-Type': 'application/json' } });
    check(readyRes, { [`player ${i + 1} ready`]: (r) => r.status === 200 });
    sleep(1);
  }

  // 6. All players submit actions for 20 turns
  for (let turn = 0; turn < 20; turn++) {
    for (let i = 0; i < playerIds.length; i++) {
      let success = false;
      let attempts = 0;
      while (!success && attempts < allActions.length) {
        // Pick a random action
        let action = allActions[Math.floor(Math.random() * allActions.length)];
        let actionRes = http.post(`${BASE_URL}/${gameId}/action`, JSON.stringify({
          playerId: playerIds[i],
          action: action,
          turn: turn
        }), { headers: { 'Content-Type': 'application/json' } });
        if (actionRes.status === 200) {
          check(actionRes, { [`player ${i + 1} played action ${action.code} turn ${turn} on attempt${attempts}`]: (r) => r.status === 200 });
          success = true;
          sleep(1);
        } else {
          attempts++;
        }
      }
    }
  }

  // 7. Get game session info
  let gameRes = http.get(`${BASE_URL}/${gameId}`);
  check(gameRes, { 'game session fetched': (r) => r.status === 200 });

  sleep(1);
}