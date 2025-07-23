import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import { Stepper } from 'primereact/stepper'; 
import { StepperPanel } from 'primereact/stepperpanel';
import { fetchLatestEvent } from './services/eventService';
import { submitPlayerAction } from './services/actionService';
import {
  DEV_COST_CONTROL_PLANE,
  DEV_COST_MONOLITH,
  DEV_COST_MULTI_TENANT,
  DEV_COST_SINGLE_TENANT,
  DEVOPS_COST,
  MARKETING_COST,
  TECH_DEBT_REDUCTION_COST,
  TRAINING_COST_CLOUD,
  TRAINING_COST_LEGACY,
  CUSTOMER_PRICE_CONTROL_PLANE,
  CUSTOMER_PRICE_MULTI_TENANT,
  CUSTOMER_PRICE_SINGLE_TENANT,
  CUSTOMER_PRICE_MONOLITH,
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
} from './constants';
import WinnerPage from './WinnerPage';
import { formatCurrency } from './utils/formatCurrency';
import { Tag } from 'primereact/tag';
import {
  calculateMonolithDevCost,
  calculateSingleTenantMicroserviceDevCost,
  calculateMultiTenantMicroserviceDevCost,
  calculateControlPlaneDevCost
} from './utils/costCalulator';

//TODO refactor this in to 4 action groups.
// Fist set to build features.
// second set is a skill tree for improving ops maturity
// third set is a skill tree for improving cloud native skills
// fourth is a set of actions like marketing, that is a bit of a gamble.
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
  { code: "PRICE_WAR", name: "Start a Price War", description: "Lower your feature price by 25%, forcing all players to lower theirs by 20%. Create downward market pressure on your competition.", icon: "pi pi-flag", cost: 1000, unit: "feature", per_unit: false },
  { code: "HOSTILE_TAKEOVER", name: "Hostile Takeover", description: "Pay 2X the market cap of one of the other players to acquire all their features, customers, and liabilities.", icon: "pi pi-exclamation-triangle", cost: 100000, unit: "feature", per_unit: false },
];

function GamePage({ gameId, game, playerId, setReady }) {
  const [latestEvent, setLatestEvent] = useState(null);
  const [eventDialogVisible, setEventDialogVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const lastEventIdRef = useRef(null);
  const toast = useRef(null);
  const shownEventLogIdsRef = useRef(new Set());
  const stepperRef = useRef(null);

  useEffect(() => {
    if (game && game.currentTurn >= game.total_turns) {
      setShowWinner(true);
    }
  }, [game]);

  // Fetch the latest event
  useEffect(() => {
    const pollLatestEvent = async () => {
      const newEvent = await fetchLatestEvent(gameId);
      if (newEvent && newEvent.id !== lastEventIdRef.current) {
        setLatestEvent(newEvent);
        setEventDialogVisible(true);
        lastEventIdRef.current = newEvent.id;
      }
    };

    const interval = setInterval(pollLatestEvent, 5000);
    return () => clearInterval(interval);
  }, [gameId]);



  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    try {
      const response = await submitPlayerAction({
        gameId,
        playerId,
        action: pendingAction,
        turn: game?.currentTurn
      });
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: `Turn ${game?.currentTurn} complete`,
          detail: `${pendingAction.name} completed`,
          life: 6000
        });
      }
    } catch (error) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: `${pendingAction.name} Failed`,
          detail: `${error.response?.data?.error || ''}`,
          life: 6000
        });
      }
    }
    setPendingAction(null);
  };



  useEffect(() => {
    if (!game || !toast.current) return;

    // Find the current player
    const currentPlayer = game.players?.find(p => p.id === playerId);
    if (!currentPlayer || !Array.isArray(currentPlayer.log)) return;

    // Find the most recent event log for the current turn
    const eventLogsThisTurn = currentPlayer.log.filter(
      log => typeof log === 'object' && log.turn === game.currentTurn - 1 && log.type === 'event'
    );
    if (eventLogsThisTurn.length > 0) {
      const lastEvent = eventLogsThisTurn[eventLogsThisTurn.length - 1];
      // Use a unique key for the log (turn + code + details)
      const logKey = `${lastEvent.turn}_${lastEvent.code}_${lastEvent.details}`;
      if (!shownEventLogIdsRef.current.has(logKey)) {
        shownEventLogIdsRef.current.add(logKey);
        toast.current.show({
          severity: 'info',
          summary: lastEvent.code || 'Event',
          detail: lastEvent.details,
          sticky: true
        });
      }
    }
  }, [game?.currentTurn, game?.players, playerId]);

  // Wrapper for setPendingAction, now sets cost using costCalculator
  const prepareAction = (action, player, turn) => {
    let updatedAction = { ...action };

    // Set cost dynamically for build actions
    if (action.code === "BUILD_MONOLITH_FEATURE") {
      updatedAction.cost = calculateMonolithDevCost(player, turn);
      updatedAction.cooldown = player.actionCooldowns ? player.actionCooldowns[action.code] || 0 : 0;
    } else if (action.code === "BUILD_SINGLETENANT_FEATURE") {
      updatedAction.cost = calculateSingleTenantMicroserviceDevCost(player, turn);
      updatedAction.cooldown = player.actionCooldowns ? player.actionCooldowns[action.code] || 0 : 0;
    } else if (action.code === "BUILD_MULTITENANT_FEATURE") {
      updatedAction.cost = calculateMultiTenantMicroserviceDevCost(player, turn);
      updatedAction.cooldown = player.actionCooldowns ? player.actionCooldowns[action.code] || 0 : 0;
    } else if (action.code === "BUILD_CONTROL_PLANE") {
      updatedAction.cost = calculateControlPlaneDevCost(player, turn);
      updatedAction.cooldown = player.actionCooldowns ? player.actionCooldowns[action.code] || 0 : 0;
    }
    // You can add similar logic for other action types if needed

    setPendingAction(updatedAction);
  };

  if (showWinner && game) {
    return <WinnerPage game={game} />;
  }

  return (
    <div className="gamepage-container">
      <div className="top-banner">
        <h1 className="gamepage-title">SaaS Tycoon Conference Edition</h1>
        <div className="game-info">
          {game && (game.name || game.id) && (
            <span >Current Session: {game.name ? game.name : game.id}</span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="gamepage-turn" style={{ margin: 0 }}>
              <i className="pi pi-calendar" style={{ marginRight: '0.5rem', fontSize: '1.2em' }} />
              {game ? 2025 + Math.floor(game.currentTurn / 4) + 'Q' + (game.currentTurn % 4 + 1) : 'Loading...'}
            </span>
            {game && (
              <div style={{ minWidth: 200, flex: 1 }}>
                <ProgressBar
                  value={Math.round((game.currentTurn / (game.total_turns || 1)) * 100)}
                  showValue={false}
                  style={{ height: '.3rem' }}
                >
                  {`${game.currentTurn} / ${game.total_turns} turns`}
                </ProgressBar>
              </div>
            )}
          </div>
        </div>

      </div>
      <div className="gamepage-root">
        <Toast ref={toast} />



        {/* Latest Event Dialog */}
        {latestEvent && (
          <Dialog
            header="News Update"
            visible={!!latestEvent && eventDialogVisible}
            style={{ width: '30vw', minWidth: 300 }}
            onHide={() => setEventDialogVisible(false)}
            closable
            modal
            contentClassName="latest-event-dialog-content"
          >
            {latestEvent && (
              <>
                <h3>{latestEvent.title}</h3>
                <p>{latestEvent.description}</p>
              </>
            )}
          </Dialog>
        )}



        <div className="gamepage-main three-column-layout">
          {/* Left Column: Player Status */}
          <div className="left-column-status">
            <div className="player-status-row">
              {game?.players?.slice()
                .sort((a, b) => {
                  const aStats = a.stats?.[game.currentTurn] || {};
                  const bStats = b.stats?.[game.currentTurn] || {};
                  return (bStats.cash || 0) - (aStats.cash || 0);
                }).map((player, index) => {
                  const hasPlayedCurrentTurn = game.currentTurn >= 0 && player.turns[game.currentTurn];
                  const currentStats = player.stats?.[game.currentTurn] || {};
                  const statusText = player.ready
                    ? (hasPlayedCurrentTurn ? 'Turn Complete' : 'Waiting')
                    : 'Not Ready';
                  const statusColor = hasPlayedCurrentTurn
                    ? '#22c55e'
                    : '#fbbf24';

                  // Find the most recent 'action' log for this player for the current turn or previous turn
                  let recentActionLog = null;
                  if (Array.isArray(player.log)) {
                    // Try to find the last 'action' log for the current turn
                    const logsThisTurn = player.log.filter(
                      log => typeof log === 'object' && log.turn === game.currentTurn && log.type === 'action'
                    );
                    if (logsThisTurn.length > 0) {
                      recentActionLog = logsThisTurn[logsThisTurn.length - 1];
                    } else if (game.currentTurn > 0) {
                      // If not found, try previous turn
                      const logsPrevTurn = player.log.filter(
                        log => typeof log === 'object' && log.turn === game.currentTurn - 1 && log.type === 'action'
                      );
                      if (logsPrevTurn.length > 0) {
                        recentActionLog = logsPrevTurn[logsPrevTurn.length - 1];
                      }
                    }
                  }

                  return (
                    <Card
                      key={player.id}
                      className={`player-status-card${player.id === playerId ? ' current' : ''}${player.ready ? ' ready' : ''}`}
                      style={{ marginBottom: '1rem', minWidth: 260, maxWidth: 320, position: 'relative' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1em' }}>
                          {player.name} {player.id === playerId && <span style={{ color: '#2563eb' }}>(You)</span>}
                          {index === 0 && <i className="pi pi-crown" style={{ color: '#2563eb' }} />}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            className="player-status-dot"
                            style={{
                              background: statusColor,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              display: 'inline-block',
                              marginRight: 6
                            }}
                          />
                          <span style={{ fontSize: '0.95em', color: '#666', fontWeight: 500 }}>{statusText}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95em', color: '#888', marginBottom: 8 }}>
                        {player.playerClass}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="pi pi-dollar" style={{ color: '#2563eb' }} />
                          <span style={{ fontWeight: 600 }}>{formatCurrency(currentStats.cash ?? 0)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="pi pi-users" style={{ color: '#2563eb' }} />
                          <span>{currentStats.customers ?? 0} Customers</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="pi pi-database" style={{ color: '#b03a2e' }} />
                          <span>Legacy: {currentStats.legacySkills ?? 0}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="pi pi-cloud" style={{ color: '#42A5F5' }} />
                          <span>Cloud: {currentStats.cloudNativeSkills ?? 0}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="pi pi-shield" style={{ color: '#22c55e' }} />
                          <span>Ops: {currentStats.opsMaturity ?? 0}</span>
                        </div>
                      </div>
                      {/* Show the most recent action for this player for this turn or previous turn */}
                      {recentActionLog && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'left', gap: 4, fontSize: '0.7em', color: '#666' }}>
                            <i className="pi pi-comments" style={{ color: '#22c55e' }} />
                            <span>{recentActionLog.details}. Spent {formatCurrency(recentActionLog.cashSpent ?? 0)}</span>


                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Center Column: Current Player & Actions */}
          <div className="current-player-center">
            {game?.players?.map((player) => {
              if (player.id === playerId) {
                const currentTurnStats = player.stats[game.currentTurn];
                const cashHistory = Object.entries(player.stats)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([turn, stats]) => stats.cash);
                const sortedStats = Object.entries(player.stats)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([turn, stats]) => stats);
                // Calculate infra cost and tech debt cost per turn
                const infraCostHistory = [];
                const techDebtCostHistory = [];

                // Aggregates for feature stats
                const archCounts = {};
                let totalRevenue = 0;
                let totalInfraCost = 0;
                let totalTechDebtCost = 0;
                let totalNetRevenue = 0;

                player.features?.forEach(feature => {
                  // Count by architecture
                  archCounts[feature.architecture] = (archCounts[feature.architecture] || 0) + 1;
                  // Use the latest revenueStats entry if available
                  const lastStats = feature.revenueStats?.length > 0 ? feature.revenueStats[feature.revenueStats.length - 1] : null;
                  if (lastStats) {
                    totalRevenue += lastStats.featureRevenue || 0;
                    totalInfraCost += lastStats.infrastructureCost || 0;
                    totalTechDebtCost += lastStats.techDebtCost || 0;
                    totalNetRevenue += lastStats.netRevenue || 0;
                  }
                });

                // Prepare history for infra and tech debt cost graphs
                sortedStats.forEach((stats, idx) => {
                  let infraCost = 0;
                  let techDebtCost = 0;

                  // Sum up from all features for this turn
                  if (player.features) {
                    player.features.forEach(feature => {
                      // Find the revenueStats for this turn
                      const revStat = feature.revenueStats?.[idx];
                      if (revStat) {
                        infraCost -= revStat.infrastructureCost || 0;
                        techDebtCost -= revStat.techDebtCost || 0;
                      }
                    });
                  }

                  infraCostHistory.push(infraCost);
                  techDebtCostHistory.push(techDebtCost);
                });
                const turnLabels = Object.keys(player.stats)
                  .sort((a, b) => Number(a) - Number(b))
                  .map(turn => `'${25 + Math.floor(Number(turn) / 4) + 'Q' + (Number(turn) % 4 + 1)}`);

                if (!player.ready) {
                  

                  const steps = [
                    {
                      header: "Feature Types",
                      content: (
                        <>
                          <h2>Feature Types</h2>
                          <p>
                            <b>Monolith:</b> Cheapest to build, but attracts tech debt quickly and scales poorly.<br />
                            <b>Single Tenant Microservice:</b> Modern stack, deployed per customer. Moderate cost, scales with customer count.<br />
                            <b>Multi-Tenant Microservice:</b> Most scalable and profitable, but expensive to build.<br />
                            <b>Control Plane:</b> Required for managing multi-tenant features, does not generate revenue but is essential for scaling.
                          </p>
                        </>
                      )
                    },
                    {
                      header: "Operational Maturity",
                      content: (
                        <>
                          <h2>Operational Maturity</h2>
                          <p>
                            Improves your ability to scale and manage complexity. Higher ops maturity reduces costs and helps you handle more customers efficiently.
                          </p>
                        </>
                      )
                    },
                    {
                      header: "Tech Debt",
                      content: (
                        <>
                          <h2>Tech Debt</h2>
                          <p>
                            Accumulates as you build features, especially with older architectures. High tech debt increases costs and can slow you down. Manage it with dedicated actions.
                          </p>
                        </>
                      )
                    },
                    {
                      header: "Skills",
                      content: (
                        <>
                          <h2>Skills</h2>
                          <p>
                            <b>Legacy Skills:</b> Help manage and reduce costs for monolith features.<br />
                            <b>Cloud Native Skills:</b> Reduce costs and complexity for modern features and multi-tenant systems.<br />
                            Train your team to improve these skills and unlock new capabilities!
                          </p>
                        </>
                      )
                    }
                  ];

                  return (
                    <div style={{  margin: '2rem auto' }}>
                      <Stepper ref={stepperRef}>
                        {steps.map((step, idx) => (
                          <StepperPanel key={step.header} header={step.header}>
                            <div style={{ minHeight: 180, padding: '1.5rem 0' }}>
                              {step.content}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                              <Button
                                label="Previous"
                                icon="pi pi-arrow-left"
                                onClick={() => stepperRef.current.prevCallback()}
                                disabled={idx === 0}
                                className="p-button-secondary"
                              />
                              {idx < steps.length - 1 ? (
                                <Button
                                  label="Next"
                                  icon="pi pi-arrow-right"
                                  iconPos="right"
                                  onClick={() => stepperRef.current.nextCallback()}
                                  className="p-button-primary"
                                />
                              ) : (
                                <Button
                                  label="I'm Ready"
                                  icon="pi pi-check"
                                  onClick={setReady}
                                  className="p-button-success"
                                />
                              )}
                            </div>
                          </StepperPanel>
                        ))}
                      </Stepper>
                    </div>
                  );
                }
                return (

                  <Card
                    key={player.id}
                    title={player.name}
                    className="current-player-card"
                  >
                    <Tag value={player.playerClass} className="player-class-badge" severity="secondary" />
                    <div className="current-player-stats-row">
                      <div className="stat-card">
                        <i className="pi pi-dollar stat-icon" />
                        <div className="stat-value">{formatCurrency(currentTurnStats.cash)}</div>
                        <div className="stat-label">Cash</div>
                      </div>
                      <div className="stat-card">
                        <i className="pi pi-users stat-icon" />
                        <div className="stat-value">{currentTurnStats.customers}</div>
                        <div className="stat-label">Customers</div>
                      </div>
                      <div className="stat-card">
                        <i className="pi pi-th-large stat-icon" />
                        <div className="stat-value">
                          {Object.values(archCounts).reduce((a, b) => a + b, 0)}
                        </div>
                        <div className="stat-label">Total Features</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.95em', color: '#666' }}>
                          {Object.entries(archCounts).map(([arch, count]) => (
                            <li key={arch}>
                              <span style={{ textTransform: 'capitalize' }}>{arch.replace(/-|_/g, ' ')}:</span> {count}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="stat-card">
                        <i className="pi pi-sliders-h stat-icon" />
                        <div className="stat-value">
                          {currentTurnStats.legacySkills + currentTurnStats.cloudNativeSkills}
                        </div>
                        <div className="stat-label">Total Skills</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.95em', color: '#666' }}>
                          <li>
                            <span style={{ textTransform: 'capitalize' }}>Legacy:</span> {currentTurnStats.legacySkills}
                          </li>
                          <li>
                            <span style={{ textTransform: 'capitalize' }}>Cloud Native:</span> {currentTurnStats.cloudNativeSkills}
                          </li>
                        </ul>
                      </div>
                      <div className="stat-card">
                        <i className="pi pi-shield stat-icon" />
                        <div className="stat-value">{currentTurnStats.opsMaturity}</div>
                        <div className="stat-label">Operational Maturity</div>
                      </div>
                    </div>
                    <div className="current-player-charts">
                      <TabView>
                        <TabPanel header="Revenue Stats" className="full-width-tab-panel">
                          {/* Feature Portfolio Overview Card */}
                          <Card className="feature-portfolio-overview" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginTop: 0 }}>Quarterly Report</h3>
                            <div className="current-player-stats-row" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>

                              <div className="stat-card">
                                <i className="pi pi-chart-line stat-icon" />
                                <div className="stat-value">{formatCurrency(totalRevenue)}</div>
                                <div className="stat-label">Feature Revenue</div>
                              </div>
                              <div className="stat-card">
                                <i className="pi pi-server stat-icon" />
                                <div className="stat-value">{formatCurrency(totalInfraCost)}</div>
                                <div className="stat-label">Infra Cost</div>
                              </div>
                              <div className="stat-card">
                                <i className="pi pi-exclamation-triangle stat-icon" />
                                <div className="stat-value">{formatCurrency(totalTechDebtCost)}</div>
                                <div className="stat-label">Tech Debt Cost</div>
                              </div>
                              <div className="stat-card">
                                <i className="pi pi-wallet stat-icon" />
                                <div className="stat-value">{formatCurrency(totalNetRevenue)}</div>
                                <div className="stat-label">Net Revenue</div>
                              </div>
                            </div>

                          </Card>
                        </TabPanel>
                        <TabPanel header="Earnings History" className="full-width-tab-panel">
                          <div className="current-player-chart-card">
                            <Chart
                              type="line"
                              data={{
                                labels: turnLabels,
                                datasets: [
                                  {
                                    label: 'Cash',
                                    data: cashHistory,
                                    fill: false,
                                    borderColor: '#42A5F5',
                                    tension: 0.3
                                  },
                                  {
                                    label: 'Infra Cost (Quarterly)',
                                    data: infraCostHistory,
                                    fill: false,
                                    borderColor: '#b03a2e',
                                    tension: 0.3
                                  },
                                  {
                                    label: 'Tech Debt Cost (Quarterly)',
                                    data: techDebtCostHistory,
                                    fill: false,
                                    borderColor: '#f59e42',
                                    tension: 0.3
                                  }
                                ]
                              }}
                              options={{
                                animation: false,
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: { display: false }
                                },
                                scales: {
                                  y: { beginAtZero: true }
                                }
                              }}
                            />
                          </div>
                        </TabPanel>
                        <TabPanel header="Organization Health" className="full-width-tab-panel">
                          <div className="current-player-chart-card radar-chart-panel">
                            <Chart
                              type="radar"
                              data={{
                                labels: ['Customers', 'Legacy Skills', 'Cloud Native Skills', 'Ops Maturity'],
                                datasets: [
                                  {
                                    label: 'Current Stats',
                                    data: [
                                      currentTurnStats.customers,
                                      currentTurnStats.legacySkills,
                                      currentTurnStats.cloudNativeSkills,
                                      currentTurnStats.opsMaturity
                                    ],
                                    backgroundColor: 'rgba(66,165,245,0.2)',
                                    borderColor: '#42A5F5',
                                    pointBackgroundColor: '#42A5F5'
                                  }
                                ]
                              }}
                              options={{
                                animation: false,
                                responsive: true,
                                maintainAspectRatio: false,
                                elements: {
                                  line: {
                                    tension: .3
                                  }
                                },
                                plugins: {
                                  legend: { display: false }
                                },
                                scales: {
                                  r: {
                                    beginAtZero: true,
                                    min: 0
                                  }
                                }
                              }}
                            />
                          </div>
                        </TabPanel>
                        <TabPanel header="News" className="full-width-tab-panel">
                          <div className="current-player-chart-card player-news-container">
                            {game?.players &&
                              // Gather all logs, flatten, and sort by turn descending (most recent first)
                              game.players
                                .flatMap(player =>
                                  (player.log || []).map(log => ({
                                    ...log,
                                    playerName: player.name,
                                    playerId: player.id
                                  }))
                                )
                                .sort((a, b) => (b.turn ?? 0) - (a.turn ?? 0))
                                .map((log, idx) => (
                                  <div key={log.playerId + '_' + log.turn + '_' + idx} style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                                    <div className="player-news-avatar">
                                      {log.playerName[0]}
                                    </div>
                                    <div>
                                      <div className='player-news-name'>
                                        {log.playerName} <span className='player-news-subtext'>Turn {log.turn}</span> <span className='player-news-subtext'>Spent {formatCurrency(log.cashSpent ?? 0)}</span>
                                      </div>
                                      <div className='player-news-detail'>{log.details}</div>
                                    </div>
                                  </div>
                                ))
                            }
                            {(!game?.players?.some(player =>
                              (player.log || []).some(log => typeof log === 'object' && log.type === 'event')
                            )) && (
                                <div style={{ color: '#888', fontStyle: 'italic', marginTop: '1rem' }}>
                                  No news yet.
                                </div>
                              )}
                          </div>
                        </TabPanel>
                      </TabView>
                    </div>


                    {/* Tabs for actions (replace Accordion) */}
                    <TabView>
                      {[
                        { header: "Build Features", actions: actions_build },
                        { header: "Manage Tech Debt", actions: actions_tech_debt_reduction },
                        { header: "Ops Maturity", actions: actions_ops_maturity },
                        { header: "Cloud Skills", actions: actions_cloud_skills },
                        { header: "Legacy Skills", actions: actions_legacy_skills },
                        { header: "Bonus Actions", actions: actions_bonus }
                      ].map(({ header, actions }) => (
                        <TabPanel header={header} key={header}>
                          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            {/* Left: Action List */}
                            <div style={{ flex: 1 }}>
                              {actions.map((action) => {
                                // Determine current level for each skill tree
                                const currentPlayer = game?.players?.find(p => p.id === playerId);
                                let currentLevel = null;
                                if (header === "Ops Maturity") {
                                  currentLevel = currentPlayer?.stats?.[game.currentTurn]?.opsMaturity ?? 0;
                                } else if (header === "Cloud Skills") {
                                  currentLevel = currentPlayer?.stats?.[game.currentTurn]?.cloudNativeSkills ?? 0;
                                } else if (header === "Legacy Skills") {
                                  currentLevel = currentPlayer?.stats?.[game.currentTurn]?.legacySkills ?? 0;
                                }

                                // Icon logic
                                let statusIcon = null;
                                if (action.level) {
                                  if (currentLevel >= action.level) {
                                    statusIcon = <i className="pi pi-check" style={{ marginLeft: 8 }} />;
                                  } else {
                                    statusIcon = <i className="pi pi-lock" style={{ marginLeft: 8 }} />;
                                  }
                                }

                                return (
                                  <Button
                                    key={action.code + (action.level || '')}
                                    label={
                                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <span>{action.name}</span>
                                        {statusIcon}
                                      </span>
                                    }
                                    icon={action.icon}
                                    className={statusIcon ? currentLevel >= action.level ? "p-button-success" : currentLevel == action.level - 1 ? "p-button-primary" : "p-button-secondary" : "p-button-primary"}
                                    onClick={() => prepareAction(action, currentPlayer, game.currentTurn)}
                                    style={{ marginBottom: '0.5rem', marginRight: '0.5rem', width: '100%', textAlign: 'left' }}
                                  />
                                );
                              })}
                            </div>
                            {/* Right: Action Details & Confirm */}
                            <div style={{ flex: 3, minWidth: 260, background: '#f8fafc', borderRadius: 8, padding: '1rem', boxShadow: '0 0 0.5rem #e0e7ef' }}>
                              {pendingAction ? (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <i className={pendingAction.icon} style={{ fontSize: '1.5rem', color: '#2563eb', marginRight: 8 }} />
                                    <h3 style={{ marginTop: 0 }}>{pendingAction.name}</h3>
                                  </div>
                                  <div style={{ marginBottom: '1rem', color: '#444' }}>

                                    {pendingAction.description}
                                  </div>

                            
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-around',
                                  }}>
                                    <div className='feature-properties'>
                                      Cost: {formatCurrency(pendingAction.cost)}
                                      {pendingAction.per_unit && pendingAction.unit
                                        ? ` per ${pendingAction.unit}`
                                        : ''}

                                    </div>
                                    {pendingAction.revenue > -1 && (<div className='feature-properties'>
                                      Revenue: {formatCurrency(pendingAction.revenue)}
                                    </div>)}
                                    {pendingAction.releaseRamp && (

                                      <div className='feature-properties'>
                                        <Tooltip target=".tooltip-info" />
                                        Feature Ramp: {pendingAction.releaseRamp}
                                        {pendingAction.per_unit && pendingAction.unit
                                          ? ` per ${pendingAction.unit}`
                                          : ''}
                                        <i className="tooltip-info pi pi-info-circle p-text-secondary"
                                          data-pr-tooltip={`The point at which building more features becomes harder without improved skills. Once you hit ${pendingAction.releaseRamp} features of this type, the cost of building it progressively increases. Good skills can help you scale your development practices, and every skill point you earn from level ${pendingAction.skillRamp}, reduces development cost.`} data-pr-position="right"
                                          style={{ marginLeft:'.5em', cursor: 'pointer' }}>
                                          
                                        </i>
                                      </div>
                                    )}
                                    {pendingAction.customerRamp && (

                                      <div className='feature-properties'>
                                        <Tooltip target=".tooltip-info" />
                                        Customer Ramp: {pendingAction.customerRamp}
                                        {pendingAction.per_unit && pendingAction.unit
                                          ? ` per ${pendingAction.unit}`
                                          : ''}
                                        <i className="tooltip-info pi pi-info-circle p-text-secondary"
                                          data-pr-tooltip={`The point at which it becomes harder to scale your service to more users without good operational practices. The development cost increases progressively after onborading ${pendingAction.releaseRamp} customers. Good Operational maturity can help you scale to a larger userbase. Every Ops Maturity skill point you earn from level ${pendingAction.opsMaturityRamp}, reduces development cost.`} data-pr-position="right"
                                          style={{ marginLeft:'.5em', cursor: 'pointer' }}>
                                          
                                        </i>
                                      </div>
                                    )}
                                  </div>

                                  <div className='feature-properties'>
                                    Available {pendingAction.cooldown > 0 ? `in ${pendingAction.cooldown} turns` : 'Now'}
                                  </div>
                                  {/* Enable confirm only if skill is 1 below pendingAction.level */}
                                  <Button
                                    label={
                                      (() => {
                                        if (!pendingAction.level) return pendingAction.name;
                                        const currentPlayer = game?.players?.find(p => p.id === playerId);
                                        if (header === "Ops Maturity") {
                                          const currentOpsMaturity = currentPlayer?.stats?.[game.currentTurn]?.opsMaturity ?? 0;
                                          return currentOpsMaturity >= pendingAction.level ? "Already Implemented" : pendingAction.name;
                                        } else if (header === "Cloud Skills") {
                                          const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.cloudNativeSkills ?? 0;
                                          return currentSkillLevel >= pendingAction.level ? "Already Implemented" : pendingAction.name;
                                        } else if (header === "Legacy Skills") {
                                          const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.legacySkills ?? 0;
                                          return currentSkillLevel >= pendingAction.level ? "Already Implemented" : pendingAction.name;
                                        }
                                        return pendingAction.name;
                                      })()
                                    }
                                    icon="pi pi-check"
                                    className="p-button-success"
                                    onClick={handleConfirmAction}
                                    autoFocus
                                    disabled={
                                      (() => {
                                        if (!pendingAction.level) return false;
                                        const currentPlayer = game?.players?.find(p => p.id === playerId);
                                        if (header === "Ops Maturity") {
                                          const currentOpsMaturity = currentPlayer?.stats?.[game.currentTurn]?.opsMaturity ?? 0;
                                          return currentOpsMaturity !== (pendingAction.level - 1);
                                        } else if (header === "Cloud Skills") {
                                          const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.cloudNativeSkills ?? 0;
                                          return currentSkillLevel !== (pendingAction.level - 1);
                                        } else if (header === "Legacy Skills") {
                                          const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.legacySkills ?? 0;
                                          return currentSkillLevel !== (pendingAction.level - 1);
                                        }
                                        return false;
                                      })()
                                    }
                                  />
                                </>
                              ) : (
                                <div style={{ color: '#888', fontStyle: 'italic' }}>Select an action to see details.</div>
                              )}
                            </div>
                          </div>
                        </TabPanel>
                      ))}
                    </TabView>
                  </Card>
                );
              }
            })}
          </div>

          {/* Right Column: Scrollable Feature List */}
          <div className="right-column-features" >
            {game?.players?.find(p => p.id === playerId)?.features?.length > 0 && (
              <div>
                <h3>Features</h3>
                <ul className="feature-list">
                  {game?.players?.find(p => p.id === playerId)?.features?.sort((f1, f2) => f2.createdTurn - f1.createdTurn).map((feature, index) => (
                    <Card className="feature-list-item">
                      <div className="feature-detail-item">
                        <strong>{feature.name}</strong>
                        <Tag value={feature.architecture} severity="secondary" />

                      </div>

                      <div className="feature-detail-item">
                        <span>Infra cost: {formatCurrency(feature.infrastructureCost)}</span>
                        <span>Tech Debt: {feature.techDebt}</span>
                        <span>Age: {game.currentTurn - feature.createdTurn} Quarters</span>
                      </div>
                      {feature.revenueStats.length > 0 && feature.revenueStats[feature.revenueStats.length - 1] && (
                        <div>
                          <MeterGroup
                            max={feature.revenueStats[feature.revenueStats.length - 1].featureRevenue}
                            values={[
                              {
                                label: 'Infrastructure',
                                value: feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost,
                                color: '#b03a2e'
                              },
                              feature.revenueStats[feature.revenueStats.length - 1].techDebtCost > 0 ?
                                {
                                  label: 'TechDebt',
                                  value: feature.revenueStats[feature.revenueStats.length - 1].techDebtCost,
                                  color: '#f59e42'
                                } : null,
                            ].filter((cost) => cost !== null)}
                            style={{ margin: '0.5rem 0' }}
                          />
                          <div style={{ fontSize: '0.95em', color: '#444' }}>
                            <div className="feature-detail-item">
                              <span>Feature Revenue: {formatCurrency(feature.revenueStats[feature.revenueStats.length - 1].featureRevenue)}</span>
                              <span>Operational Costs: {formatCurrency(feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost +
                                feature.revenueStats[feature.revenueStats.length - 1].techDebtCost)}</span>
                              <span >Net Revenue: {formatCurrency(feature.revenueStats[feature.revenueStats.length - 1].netRevenue)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div >

  );
}

export default GamePage;