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
import { MARKETING_COST } from './utils/constants';
import WinnerPage from './WinnerPage';
import { formatCurrency } from './utils/formatCurrency';
import { Tag } from 'primereact/tag';
import {
  calculateMonolithDevCost,
  calculateSingleTenantMicroserviceDevCost,
  calculateMultiTenantMicroserviceDevCost,
  calculateControlPlaneDevCost
} from './utils/costCalulator';

import {
  actions_build,
  actions_tech_debt_reduction,
  actions_ops_maturity,
  actions_cloud_skills,
  actions_legacy_skills,
  actions_bonus
} from './utils/Actions';


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
    if (!currentPlayer) return;

    // Show "It's your turn now" toast if player is waiting, but only if not already shown
    const hasPlayedCurrentTurn = game.currentTurn >= 0 && currentPlayer.turns[game.currentTurn];
    const toastKey = `turn_${game.currentTurn}_your_turn`;
    if (
      currentPlayer.ready &&
      !hasPlayedCurrentTurn &&
      !shownEventLogIdsRef.current.has(toastKey)
    ) {
      shownEventLogIdsRef.current.add(toastKey);
      toast.current.show({
        severity: 'info',
        summary: 'Your Turn',
        detail: "It's your turn to make a move.",
        life: 8000
      });
    }

    // Existing event log toast logic
    if (!Array.isArray(currentPlayer.log)) return;
    const eventLogsThisTurn = currentPlayer.log.filter(
      log => typeof log === 'object' && log.turn === game.currentTurn - 1 && log.type === 'event'
    );
    if (eventLogsThisTurn.length > 0) {
      const lastEvent = eventLogsThisTurn[eventLogsThisTurn.length - 1];
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
    } else if (action.code === "LAUNCH_MARKETING_CAMPAIGN") {
      updatedAction.cost = MARKETING_COST
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
          <div className='game-info-detail'>
          {game && (game.name || game.id) && (
            <span >Current Session: {game.name ? game.name : game.id}</span>
          )}
          <span>
          {game ? 'Turn '+game.currentTurn + ' of ' + game.total_turns  : 'Loading...'}
          </span>
          </div>
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

                  return (
                    <Card
                      key={player.id}
                      className={`player-status-card${player.id === playerId ? ' current' : ''}${player.ready ? ' ready' : ''}`}
                      style={{ marginBottom: '1rem', minWidth: 260, maxWidth: 320, position: 'relative', fontSize: '0.85em' }}
                    >
                      <div style={{ display: 'flex', flexDirection:'column', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1em', paddingBottom: 4 }}>
                          {player.name} {player.id === playerId && <span style={{ fontSize:'.8em',color: '#2563eb' }}>(You)</span>}
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
                    <div className="intro-stepper">
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
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.95em', color: '#666' }}>
                          {Object.entries(archCounts).map(([arch, count]) => (
                            <li key={arch}>
                              <span style={{ textTransform: 'capitalize' }}>{arch.replace(/-|_/g, ' ')}:</span> {count}
                            </li>
                          ))}
                        </ul>
                        <div className="stat-label">Total Features</div>
                      </div>
                      <div className="stat-card">
                        <i className="pi pi-sliders-h stat-icon" />
                        <div className="stat-value">
                          {currentTurnStats.legacySkills + currentTurnStats.cloudNativeSkills}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.95em', color: '#666' }}>
                          <li>
                            <span style={{ textTransform: 'capitalize' }}>Legacy:</span> {currentTurnStats.legacySkills}
                          </li>
                          <li>
                            <span style={{ textTransform: 'capitalize' }}>Cloud Native:</span> {currentTurnStats.cloudNativeSkills}
                          </li>
                        </ul>
                        <div className="stat-label">Total Skills</div>
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
                            <div className="current-player-stats-row">

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
                        <TabPanel header={header} key={header} className='full-width-tab-panel'>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            {/* Left: Action List */}
                            <div style={{ flex: 1.5 }}>
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
                                    className={statusIcon ? currentLevel >= action.level ? "game-action-button p-button-success" : currentLevel == action.level - 1 ? "game-action-button p-button-primary" : "game-action-button p-button-secondary" : "game-action-button p-button-primary"}
                                    onClick={() => prepareAction(action, currentPlayer, game.currentTurn)}
                                    
                                  />
                                );
                              })}
                            </div>
                            {/* Right: Action Details & Confirm */}
                            <div className='action-details-panel'>
                              {pendingAction ? (
                                <>
                                  <div className='action-details-header'>
                                    <i className={pendingAction.icon}/>
                                    <h3 style={{ marginTop: 0 }}>{pendingAction.name}</h3>
                                  </div>
                                  {pendingAction.effect ? (
                                    <div className='action-details-effect'>
                                       {pendingAction.effect}
                                    </div>
                                  ) : null}
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
                                          style={{ marginLeft: '.5em', cursor: 'pointer' }}>

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
                                          style={{ marginLeft: '.5em', cursor: 'pointer' }}>

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
                                        //|| pendingAction.cost > currentTurnStats.cash
                                        let needsCooldown = false;
                                        let levelMismatch = false;
                                        if (pendingAction.cooldown) {
                                          needsCooldown = pendingAction.cooldown > 0;
                                        } else if (pendingAction.level) {
                                          const currentPlayer = game?.players?.find(p => p.id === playerId);
                                          if (header === "Ops Maturity") {
                                            const currentOpsMaturity = currentPlayer?.stats?.[game.currentTurn]?.opsMaturity ?? 0;
                                            levelMismatch = currentOpsMaturity !== (pendingAction.level - 1) ? true : false;
                                          } else if (header === "Cloud Skills") {
                                            const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.cloudNativeSkills ?? 0;
                                            levelMismatch = currentSkillLevel !== (pendingAction.level - 1) ? true : false;
                                          } else if (header === "Legacy Skills") {
                                            const currentSkillLevel = currentPlayer?.stats?.[game.currentTurn]?.legacySkills ?? 0;
                                            levelMismatch = currentSkillLevel !== (pendingAction.level - 1) ? true : false;
                                          }

                                        }
                                        return needsCooldown || levelMismatch;
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