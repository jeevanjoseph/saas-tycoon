import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ProgressBar } from 'primereact/progressbar';
import './GamePage.css';
import { fetchLatestEvent } from './services/eventService';
import { submitPlayerAction } from './services/actionService';
import { DEV_COST_CONTROL_PLANE, DEV_COST_MONOLITH, DEV_COST_MULTI_TENANT, DEV_COST_SINGLE_TENANT, DEVOPS_COST, MARKETING_COST, TECH_DEBT_REDUCTION_COST, TRAINING_COST_CLOUD, TRAINING_COST_LEGACY } from './constants';
import WinnerPage from './WinnerPage';
import { formatCurrency } from './utils/formatCurrency';

//TODO refactor this in to 4 action groups.
// Fist set to build features.
// second set is a skill tree for improving ops maturity
// third set is a skill tree for improving cloud native skills
// fourth is a set of actions like marketing, that is a bit of a gamble.
const actions_build = [
  { code: "BUILD_CONTROL_PLANE", name: "Build Control Plane", description: "Develop a new control plane feature to attract more customers.", icon: "pi pi-cog", cost: DEV_COST_CONTROL_PLANE, unit: "feature", per_unit: false },
  { code: "BUILD_MULTITENANT_FEATURE", name: "Build Multitenant Feature", description: "Develop a multitenant feature to improve scalability.", icon: "pi pi-wrench", cost: DEV_COST_MULTI_TENANT, unit: "feature", per_unit: false },
  { code: "BUILD_SINGLETENANT_FEATURE", name: "Build Singletentant Feature", description: "Develop a singletentant feature for specific customer needs.", icon: "pi pi-users", cost: DEV_COST_SINGLE_TENANT, unit: "feature", per_unit: false },
  { code: "BUILD_MONOLITH_FEATURE", name: "Build Monolith Feature", description: "Develop a monolith feature for specific customer needs.", icon: "pi pi-database", cost: DEV_COST_MONOLITH, unit: "feature", per_unit: false },
];

const actions_tech_debt_reduction = [
  { code: "TECH_DEBT_REDUCTION", name: "Modularize (Level 1)", description: "Break down large tightly coupled components. Improves maintainability and sets the stage for future refactoring.", icon: "pi pi-tools", level: 1, cost: TECH_DEBT_REDUCTION_COST, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Instrumentation (Level 2)", description: "Use logs, metrics, and traces to better understand bottlenecks or fragile code paths. Data-driven insights help justify debt remediation.", icon: "pi pi-tools", level: 2, cost: TECH_DEBT_REDUCTION_COST, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Code Audit", description: "Perform a thorough code audit and identify areas for improving and modernizing the code base.", icon: "pi pi-tools", level: 3, cost: TECH_DEBT_REDUCTION_COST, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Dependency Audit", description: "Audit application dependencies, evaluate newer libraries and APIs for improved performance and stability.", icon: "pi pi-tools", level: 4, cost: TECH_DEBT_REDUCTION_COST, unit: "feature", per_unit: true },
  { code: "TECH_DEBT_REDUCTION", name: "Defensive Coding", description: "Implement defensive coding practices for better resiliency, security and operational posture.", icon: "pi pi-tools", level: 5, cost: TECH_DEBT_REDUCTION_COST, unit: "feature", per_unit: true },
];

const actions_ops_maturity = [
  { code: "DEVOPS", name: "DevOps Culture (Level 1)", description: "Create a DevOps culture in the team. Your developers build better services when they also operate the service.", icon: "pi pi-shield", level: 1, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Monitor and Use Metrics (Level 2)", description: "Leverage built-in dashboards and metrics to keep up to date on your service health.", icon: "pi pi-shield", level: 2, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Custom Metrics and Tracing (Level 3)", description: "Emit custom metrics and traces from your application, providing a high fidelity lens in to your application.", icon: "pi pi-shield", level: 3, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "Feature Flags (Level 4)", description: "Implement a Feature Flag system to decouple deployment from release, enabling safer rollout and faster iteration while reducing release risks.", icon: "pi pi-shield", level: 4, cost: DEVOPS_COST, unit: "level", per_unit: true },
  { code: "DEVOPS", name: "DevOps KPIs (Level 5)", description: "Implement an Ops call for developers. Pivot from shipping software to owning an always on service.", icon: "pi pi-shield", level: 5, cost: DEVOPS_COST, unit: "level", per_unit: true },
];

const actions_cloud_skills = [
  { code: "TRAINING", name: "Container Basics (Level 1)", description: "Learn container basics and orchestration concepts.", icon: "pi pi-cloud", level: 1, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Cloud Native Patterns (Level 2)", description: "Learn cloud-native application design patterns and methodologies like the 12-factor application principles.", icon: "pi pi-cloud", level: 2, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Design for scale and resiliency (Level 3)", description: "All systems fail, but there is a difference when a failure results in service degradation vs. service outage. Learn the principles to design scalable a resilient applications.", icon: "pi pi-cloud", level: 3, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Infrastructure as Code (Level 4)", description: "Adopt Infrastructure as Code (IaC) practices. Drive toward an automation driven repeatable and ephemeral infrastructure approach", icon: "pi pi-cloud", level: 4, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Release Automation (Level 5)", description: "Enable automated canary testing and quality gates in pipelines. Deploy frequently. Decouple deployments from releases using feature flags. ", icon: "pi pi-cloud", level: 5, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Advanced monitoring and custom metrics (Level 6)", description: "Implement advanced monitoring and alerting for cloud workloads. Understand and implement custom metrics that can drive better insights in to application usage patterns and behaviors.", icon: "pi pi-cloud", level: 6, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Autoscaling & Cost Optimization (Level 7)", description: "Use the metrics and usage data to enable autoscaling and cost optimization strategies.", icon: "pi pi-cloud", level: 7, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
  { code: "TRAINING", name: "Cloud Native DevOps (Level 8)", description: "Achieve full cloud native maturity with self-healing application design.", icon: "pi pi-cloud", level: 8, cost: TRAINING_COST_CLOUD, unit: "level", per_unit: true },
];

const actions_legacy_skills = [
  { code: "TRAINING_LEGACY", name: "Java EE Training (Level 1)", description: "Learn Java EE basics and application server concepts.", icon: "pi pi-database", level: 1, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Weblogic Basics (Level 2)", description: "Understand deployment on WebLogic and EAR/WAR packaging.", icon: "pi pi-database", level: 2, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Scaling Weblogic Apps (Level 3)", description: "Master JDBC, JNDI, and connection pooling in Java EE.", icon: "pi pi-database", level: 3, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "ADF-BC Best Practices (Level 4)", description: "Implement ADF-BC best practices.", icon: "pi pi-database", level: 4, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Clustering and Scaling WLS Apps (Level 5)", description: "Configure clustering and session replication in WebLogic.", icon: "pi pi-database", level: 5, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "JVM Tuning (Level 6)", description: "Tune JVM and WebLogic for performance and scalability.", icon: "pi pi-database", level: 6, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Integration Best Practices (Level 7)", description: "Integrate legacy systems using SOAP and JCA adapters.", icon: "pi pi-database", level: 7, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Security and IDCS integration (Level 8)", description: "Implement security and SSO in Java EE applications.", icon: "pi pi-database", level: 8, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Legacy Skills (Level 9)", description: "Automate deployments with WLST and scripting.", icon: "pi pi-database", level: 9, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true },
  { code: "TRAINING_LEGACY", name: "Legacy Skills (Level 10)", description: "Migrate and modernize legacy Java EE applications.", icon: "pi pi-database", level: 10, cost: TRAINING_COST_LEGACY, unit: "level", per_unit: true }
];

const actions_bonus = [
  { code: "LAUNCH_MARKETING_CAMPAIGN", name: "Launch Marketing Campaign", description: "Run a marketing campaign to increase brand awareness. Based on the number of features you have and how good your operational maturity is, you may add customers.", icon: "pi pi-bullhorn", cost: MARKETING_COST, unit: "feature", per_unit: false },
  { code: "OPTIMIZE_PRICING", name: "Optimize Pricing", description: "Adjust pricing to maximize revenue.", icon: "pi pi-chart-line", cost: 3000, unit: "feature", per_unit: false },
  { code: "PRICE_WAR", name: "Start a Price War", description: "Lower your feature price by 25%, forcing all players to do the same or lose 4 customers", icon: "pi pi-hammer", cost: 1000, unit: "feature", per_unit: false },
  { code: "HOSTILE_TAKEOVER", name: "Hostile Takeover", description: "Pay 2X the market cap of one of the other players to acquire all their features, customers, and liabilities.", icon: "pi pi-dollar", cost: 100000, unit: "feature", per_unit: false },
];

function GamePage({ gameId, game, playerId, setReady }) {
  const [latestEvent, setLatestEvent] = useState(null);
  const [eventDialogVisible, setEventDialogVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const lastEventIdRef = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    if (game && game.currentTurn + 1 >= game.total_turns) {
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

  const handleActionClick = (action) => {
    setPendingAction(action);
    setConfirmDialogVisible(true);
  };

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
    setConfirmDialogVisible(false);
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setConfirmDialogVisible(false);
    setPendingAction(null);
  };

  if (showWinner && game) {
    return <WinnerPage game={game} />;
  }

  return (
    <div className="gamepage-root">
      <Toast ref={toast} />
      <h1 className="gamepage-title">Game ID: {gameId}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
        <h2 className="gamepage-turn" style={{ margin: 0 }}>
          <i className="pi pi-calendar" style={{ marginRight: '0.5rem', color: '#2563eb', fontSize: '1em' }} />
          {game ? 2025 + Math.floor(game.currentTurn / 4) + 'Q' + (game.currentTurn % 4 + 1) : 'Loading...'}
        </h2>
        {game && (
          <div style={{ minWidth: 200, flex: 1 }}>
            <ProgressBar
              value={Math.round((game.currentTurn / (game.total_turns || 1)) * 100)}
              showValue
              style={{ height: '1.5rem' }}
            >
              {`${game.currentTurn + 1} / ${game.total_turns} turns`}
            </ProgressBar>
          </div>
        )}
      </div>

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

      {/* Action Confirmation Dialog */}
      <Dialog
        header={pendingAction ? pendingAction.name : ''}
        visible={confirmDialogVisible}
        style={{ width: '600px' }}
        onHide={handleCancelAction}
        closable
        modal
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={handleCancelAction} />
            <Button label="Confirm" icon="pi pi-check" className="p-button-success" onClick={handleConfirmAction} autoFocus />
          </div>
        }
        contentClassName="latest-event-dialog-content"
      >
        {pendingAction && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <i className={`${pendingAction.icon}`} style={{ fontSize: '2rem', color: '#2563eb' }} />
              <span>{pendingAction.description}</span>
            </div>
            <div style={{ marginTop: '0.5rem', color: '#444', fontWeight: 500 }}>
              Cost: {formatCurrency(pendingAction.cost)}
              {pendingAction.per_unit && pendingAction.unit
                ? ` per ${pendingAction.unit}`
                : ''}
            </div>
          </div>
        )}
      </Dialog>

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
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Center Column: Current Player */}
        <div className="current-player-center">
          {game?.players?.map((player) => {
            if (player.id === playerId) {
              const currentTurnStats = player.stats[game.currentTurn];
              const cashHistory = Object.entries(player.stats)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([turn, stats]) => stats.cash);
              const turnLabels = Object.keys(player.stats)
                .sort((a, b) => Number(a) - Number(b))
                .map(turn => `'${25 + Math.floor(Number(turn) / 4) + 'Q' + (Number(turn) % 4 + 1)}`);

              if (!player.ready) {
                return (
                  <Button
                    label="I'm Ready"
                    icon="pi pi-check"
                    onClick={setReady}
                    className="p-button-warning"
                  />
                );
              }
              return (

                <Card
                  key={player.id}
                  title={player.name}
                  className="current-player-card"
                >
                  <span className="player-class-badge">{player.playerClass}</span>
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
                      <i className="pi pi-database stat-icon" />
                      <div className="stat-value">{currentTurnStats.legacySkills}</div>
                      <div className="stat-label">Legacy Skills</div>
                    </div>
                    <div className="stat-card">
                      <i className="pi pi-cloud stat-icon" />
                      <div className="stat-value">{currentTurnStats.cloudNativeSkills}</div>
                      <div className="stat-label">Cloud Native Skills</div>
                    </div>
                    <div className="stat-card">
                      <i className="pi pi-shield stat-icon" />
                      <div className="stat-value">{currentTurnStats.opsMaturity}</div>
                      <div className="stat-label">Operational Maturity</div>
                    </div>
                  </div>
                  <div className="current-player-charts">
                    <TabView>
                      <TabPanel header="Quarterly Earnings" className="full-width-tab-panel">
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
                                }
                              ]
                            }}
                            options={{
                              animation: false,
                              responsive: true,
                              maintainAspectRatio: true,
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
                              maintainAspectRatio: true,
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
                    </TabView>
                  </div>
                  {/* Features as a list */}
                  <h3>Features</h3>
                  <ul className="feature-list">
                    {player.features?.map((feature, index) => (
                      <li key={index} className="feature-list-item">
                        <div>
                          <strong>{feature.name}</strong>
                          {feature.architecture && (
                            <span className="feature-arch">{feature.architecture}</span>
                          )}
                        </div>
                        <div>Infra cost: {formatCurrency(feature.infrastructureCost)}</div>
                        <div>Tech Debt: {feature.techDebt}</div>
                        <div>Age: {game.currentTurn - feature.createdTurn} Quarters</div>
                        {feature.revenueStats.length > 0 && feature.revenueStats[feature.revenueStats.length - 1] && (
                          <div>
                            <MeterGroup
                              max={
                                feature.revenueStats[feature.revenueStats.length - 1].featureRevenue
                              }
                              values={[
                                {
                                  label: 'Infra Cost',
                                  value: feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost,
                                  color: '#b03a2e'
                                },
                                feature.revenueStats[feature.revenueStats.length - 1].techDebtCost > 0 ?
                                  {
                                    label: 'Tech Debt Cost',
                                    value: feature.revenueStats[feature.revenueStats.length - 1].techDebtCost,
                                    color: '#f59e42'
                                  } : null,
                              ].filter((cost) => cost !== null)}
                              style={{ margin: '0.5rem 0' }}
                            />
                            <div style={{ fontSize: '0.95em', color: '#444' }}>
                              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                                <span>Feature Revenue: {formatCurrency(feature.revenueStats[feature.revenueStats.length - 1].featureRevenue)}</span>
                                <span>Operational Costs: {formatCurrency(feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost +
                                feature.revenueStats[feature.revenueStats.length - 1].techDebtCost )}</span>
                                <span >Net Revenue: {formatCurrency(feature.revenueStats[feature.revenueStats.length - 1].netRevenue)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            }
            return null;
          })}
        </div>

        {/* Right Column: Tabs */}
        <div className="right-column-tabs">
          <Accordion multiple>
            <AccordionTab header="Build Features">
              <div className="current-player-actions">
                {actions_build.map((action) => (
                  <Button
                    key={action.code}
                    label={action.name}
                    icon={action.icon}
                    className=" p-button-info"
                    onClick={() => handleActionClick(action)}
                    style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}
                  />
                ))}
              </div>
            </AccordionTab>
            <AccordionTab header="Manage Tech Debt">
              <div className="current-player-actions">
                {actions_tech_debt_reduction.map((action) => (
                  <Button
                    key={action.code}
                    label={action.name}
                    icon={action.icon}
                    className=" p-button-help"
                    onClick={() => handleActionClick(action)}
                    style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}
                  />
                ))}
              </div>
            </AccordionTab>
            <AccordionTab header="Ops Maturity">
              <div className="current-player-actions">
                {actions_ops_maturity.map((action) => {
                  const currentPlayer = game?.players?.find(p => p.id === playerId);
                  // Get the current ops maturity stat for this player
                  const currentOpsMaturity = currentPlayer?.stats?.[game.currentTurn]?.opsMaturity ?? 0;
                  // Enable only if currentOpsMaturity === action.level - 1
                  const enabled = currentOpsMaturity === (action.level - 1);

                  return (
                    <Button
                      key={action.code + action.level}
                      label={action.name}
                      icon={action.icon}
                      className=" p-button-help"
                      onClick={() => handleActionClick(action)}
                      style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}
                      disabled={!enabled}
                    />
                  );
                })}
              </div>
            </AccordionTab>
            <AccordionTab header="Cloud Skills">
              <div className="current-player-actions">
                {actions_cloud_skills.map((action) => {
                  const currentPlayer = game?.players?.find(p => p.id === playerId);
                  // Get the skill stat for this player
                  const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.cloudNativeSkills ?? 0;
                  // Enable only if currentOpsMaturity === action.level - 1
                  const enabled = currentSkillLevel === (action.level - 1);
                  return (
                    <Button
                      key={action.code + action.level}
                      label={action.name}
                      icon={action.icon}
                      className=" p-button-success"
                      onClick={() => handleActionClick(action)}
                      style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}
                      disabled={!enabled}
                    />
                  );
                })}
              </div>
            </AccordionTab>
            <AccordionTab header="Legacy Skills">
              <div className="current-player-actions">
                {actions_legacy_skills.map((action) => {
                  const currentPlayer = game?.players?.find(p => p.id === playerId);
                  // Get the skill stat for this player
                  const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.legacySkills ?? 0;
                  // Enable only if currentOpsMaturity === action.level - 1
                  const enabled = currentSkillLevel === (action.level - 1);
                  return (
                    <Button
                      key={action.code + action.level}
                      label={action.name}
                      icon={action.icon}
                      className=" p-button-success"
                      onClick={() => handleActionClick(action)}
                      style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}
                      disabled={!enabled}
                    />
                  );
                })}
              </div>
            </AccordionTab>
            <AccordionTab header="Bonus Actions">
              <div className="current-player-actions">
                {actions_bonus.map((action) => (
                  <Button
                    key={action.code}
                    label={action.name}
                    icon={action.icon}
                    className=" p-button-warning"
                    onClick={() => handleActionClick(action)}
                    style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}
                  />
                ))}
              </div>
            </AccordionTab>
            <AccordionTab header="Info">
              <div style={{ padding: '1rem', color: '#888' }}>
                Game info and help will appear here.
              </div>
            </AccordionTab>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default GamePage;