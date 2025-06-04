import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import './GamePage.css';
import { fetchLatestEvent } from './services/eventService';
import { submitPlayerAction } from './services/actionService';

const actions = [
  { code: "BUILD_CONTROL_PLANE", name: "Build Control Plane", description: "Develop a new control plane feature to attract more customers.", icon: "pi pi-cog" },
  { code: "BUILD_MULTITENANT_FEATURE", name: "Build Multitenant Feature", description: "Develop a multitenant feature to improve scalability.", icon: "pi pi-wrench" },
  { code: "BUILD_SINGLETENANT_FEATURE", name: "Build Singletentant Feature", description: "Develop a singletentant feature for specific customer needs.", icon: "pi pi-users" },
  { code: "BUILD_MONOLITH_FEATURE", name: "Build Monolith Feature", description: "Develop a monolith feature for specific customer needs.", icon: "pi pi-database" },
  { code: "FIX_BUGS", name: "Fix Bugs", description: "Fix bugs to improve product quality and stability.", icon: "pi pi-tools" },
  { code: "TRAINING", name: "Training", description: "Train your team to improve skills and productivity.", icon: "pi pi-book" },
  { code: "LAUNCH_MARKETING_CAMPAIGN", name: "Launch Marketing Campaign", description: "Run a marketing campaign to increase brand awareness.", icon: "pi pi-bullhorn" },
  { code: "DEVOPS", name: "DevOps", description: "Invest in DevOps to improve deployment and reliability.", icon: "pi pi-shield" },
  { code: "ACQUIRE_CUSTOMERS", name: "Acquire Customers", description: "Acquire new customers to grow your business.", icon: "pi pi-user-plus" },
  { code: "REDUCE_TECH_DEBT", name: "Reduce Tech Debt", description: "Reduce technical debt to improve maintainability.", icon: "pi pi-chart-line" },
  { code: "EXPAND_TEAM", name: "Expand Team", description: "Hire more team members to increase capacity.", icon: "pi pi-users" },
  { code: "OPTIMIZE_PRICING", name: "Optimize Pricing", description: "Adjust pricing to maximize revenue.", icon: "pi pi-dollar" },
  { code: "CONDUCT_TRAINING", name: "Conduct Training", description: "Conduct training sessions to upskill your team.", icon: "pi pi-book" }
];

function GamePage({gameId, game, playerId, setReady }) {
  const [latestEvent, setLatestEvent] = useState(null);
  const [eventDialogVisible, setEventDialogVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const lastEventIdRef = useRef(null);
  const toast = useRef(null);

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

  return (
    <div className="gamepage-root">
      <Toast ref={toast} />
      <h1 className="gamepage-title">Game ID: {gameId}</h1>
      <h2 className="gamepage-turn">
        <i className="pi pi-calendar" style={{ marginRight: '0.5rem', color: '#2563eb', fontSize: '1em' }} />
        {game ? 2025 + Math.floor(game.currentTurn / 4) + 'Q' + (game.currentTurn % 4 + 1) : 'Loading...'}
      </h2>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className={`${pendingAction.icon}`} style={{ fontSize: '2rem', color: '#2563eb' }} />
            <span>{pendingAction.description}</span>
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
              }).map((player) => {
                let hasPlayedCurrentTurn = game.currentTurn >= 0 && player.turns[game.currentTurn];
                return (
                  <div
                    key={player.id}
                    className={`player-status-pill${player.id === playerId ? ' current' : ''}${player.ready ? ' ready' : ''}`}
                  >
                    <span className="player-status-name">
                      {player.name} ${player.stats?.[game.currentTurn]?.cash} {player.id === playerId && '(You)'}
                    </span>
                    <span
                      className="player-status-dot"
                      style={{ background: hasPlayedCurrentTurn ? '#22c55e' : '#fbbf24' }}
                    />
                    <span className="player-status-state">
                      {player.ready ? (hasPlayedCurrentTurn ? 'Turn Complete' : 'Waiting') : 'Not Ready'}
                    </span>
                  </div>
                )
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
                      <div className="stat-value">${currentTurnStats.cash}</div>
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
                        <div>Infra cost: ${feature.infrastructureCost}</div>
                        <div>Tech Debt: {feature.techDebt}</div>
                        <div>Age: {game.currentTurn - feature.createdTurn} Quarters</div>
                        {feature.revenueStats.length > 0 && feature.revenueStats[feature.revenueStats.length - 1] && (
                          <div>
                            <MeterGroup
                              max={
                                feature.revenueStats[feature.revenueStats.length - 1].netRevenue +
                                feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost +
                                feature.revenueStats[feature.revenueStats.length - 1].techDebtCost
                              }
                              values={[
                                {
                                  label: 'Net Revenue',
                                  value: feature.revenueStats[feature.revenueStats.length - 1].netRevenue,
                                  color: '#22c55e'
                                },
                                {
                                  label: 'Infra Cost',
                                  value: feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost,
                                  color: '#3b82f6'
                                },
                                {
                                  label: 'Tech Debt Cost',
                                  value: feature.revenueStats[feature.revenueStats.length - 1].techDebtCost,
                                  color: '#f59e42'
                                }
                              ]}
                              style={{ margin: '0.5rem 0' }}
                            />
                            <div style={{ fontSize: '0.95em', color: '#444' }}>
                              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                                <span>Feature Revenue: ${feature.revenueStats[feature.revenueStats.length - 1].featureRevenue}</span>
                                <span>Net Revenue: ${feature.revenueStats[feature.revenueStats.length - 1].netRevenue}</span>
                                <span>Infra Cost: ${feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost}</span>
                                <span>Tech Debt Cost: ${feature.revenueStats[feature.revenueStats.length - 1].techDebtCost}</span>
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
          <TabView>
            <TabPanel header="Actions">
              <div className="current-player-actions">
                {actions.map((action) => (
                  <Button
                    key={action.code}
                    label={action.name}
                    icon={action.icon}
                    className="p-button-outlined p-button-info"
                    onClick={() => handleActionClick(action)}
                  />
                ))}
              </div>
            </TabPanel>
            <TabPanel header="Upgrades">
              <div style={{ padding: '1rem', color: '#888' }}>
                Upgrades coming soon!
              </div>
            </TabPanel>
            <TabPanel header="Info">
              <div style={{ padding: '1rem', color: '#888' }}>
                Game info and help will appear here.
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      {/* Other Players' Stats */}
      <div className="players-lis t">
        {game?.players?.map((player) => {
          if (player.id !== playerId) {
            const currentTurnStats = player.stats[game.currentTurn];
            return (
              <Card
                key={player.id}
                title={`${player.name} - ${player.playerClass}`}
                className="player-card"
              >
                <div>
                  <p><strong>Cash:</strong> ${currentTurnStats.cash}</p>
                  <p><strong>Customers:</strong> {currentTurnStats.customers}</p>
                  <p><strong>Tech Debt:</strong> {currentTurnStats.techDebt}</p>
                  <p><strong>Revenue:</strong> ${currentTurnStats.revenue}</p>
                  <p><strong>Operational Maturity:</strong> {currentTurnStats.opsMaturity}</p>
                </div>
              </Card>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default GamePage;