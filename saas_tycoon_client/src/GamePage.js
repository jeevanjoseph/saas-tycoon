import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import axios from 'axios';

const API = 'http://localhost:3000/api/game';
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

function GamePage({ gameId, game, playerId, setReady }) {
  const [latestEvent, setLatestEvent] = useState(null);

  // Fetch the latest event
  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const response = await axios.get(`${API}/${gameId}/event`);
        setLatestEvent(response.data.event);
      } catch (error) {
        console.error("Error fetching the latest event:", error);
      }
    };

    const interval = setInterval(fetchLatestEvent, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [gameId]);

  const handleActionSubmit = async (action) => {
    try {
      const response = await axios.post(`${API}/${gameId}/action`, {
        playerId,
        action: action.code,
        turn: game?.currentTurn
      });
      console.log("Action submitted successfully:", response.data);
      alert(`Action "${action.name}" submitted successfully!`);
    } catch (error) {
      console.error("Error submitting action:", error);
      alert("Failed to submit action. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Game ID: {gameId}</h1>
      <h2>Turn: {game ? 2025 + Math.floor(game.currentTurn / 4) + 'Q' + (game.currentTurn % 4 + 1) : 'Loading...'}</h2>

      {/* Player Names and Ready Status Row */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        margin: '1.5rem 0 1rem 0',
        flexWrap: 'wrap'
      }}>
        {game?.players?.slice() // create a copy to avoid mutating original
          .sort((a, b) => {
            const aStats = a.stats?.[game.currentTurn] || {};
            const bStats = b.stats?.[game.currentTurn] || {};
            return (bStats.cash || 0) - (aStats.cash || 0);
          }).map((player) => {
            let hasPlayedCurrentTurn = game.currentTurn >= 0 && player.turns[game.currentTurn];
            return (
              <div key={player.id} style={{
                display: 'flex',
                alignItems: 'center',
                background: player.ready ? '#e0ffe0' : '#fffbe0',
                border: '1px solid #ddd',
                borderRadius: '999px',
                padding: '0.5rem 1rem',
                fontWeight: player.id === playerId ? 700 : 400,
                color: player.ready ? '#15803d' : '#b45309'
              }}>
                <span style={{ marginRight: '0.5rem' }}>
                  {player.name} {player.id === playerId && '(You)'}
                </span>
                <span style={{
                  display: 'inline-block',
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  background: hasPlayedCurrentTurn ? '#22c55e' : '#fbbf24',
                  marginRight: '0.5rem'
                }} />
                <span style={{ fontSize: '0.95em' }}>
                  {player.ready ? (hasPlayedCurrentTurn ? 'Turn Complete' : 'Waiting') : 'Not Ready'}
                </span>
              </div>
            )
          })}
      </div>

      {/* Latest Event Card */}
      {latestEvent && (
        <Card
          title="Latest Event"
          style={{
            marginTop: '2rem',
            background: '#f4f4f4',
            border: '1px solid #ddd',
            padding: '1rem',
            borderRadius: '8px'
          }}
        >
          <h3>{latestEvent.title}</h3>
          <p>{latestEvent.description}</p>
        </Card>
      )}

      {/* Current Player Card */}
      {game?.players?.map((player) => {
        if (player.id === playerId) {
          const currentTurnStats = player.stats[game.currentTurn];
          
          // Prepare chart data for cash across turns
          const cashHistory = Object.entries(player.stats)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([turn, stats]) => stats.cash);
          const turnLabels = Object.keys(player.stats)
            .sort((a, b) => Number(a) - Number(b))
            .map(turn => `T${Number(turn) + 1}`);

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
              title={`${player.name} (You) - ${player.playerClass}`}
              style={{
                marginTop: '2rem',
                background: '#f9f9f9',
                border: '1px solid #ddd',
                padding: '1rem',
                borderRadius: '8px'
              }}
            >
              <h3>Current Turn Stats</h3>
              <p><strong>Cash:</strong> ${currentTurnStats.cash}</p>
              <p><strong>Customers:</strong> {currentTurnStats.customers}</p>
              <p><strong>Legacy Skills:</strong> ${currentTurnStats.skills.legacy}</p>
              <p><strong>Cloud Native Skills:</strong> ${currentTurnStats.skills.cloudNative}</p>
              <p><strong>Operational Maturity:</strong> {currentTurnStats.opsMaturity}</p>
               {/* Cash History Chart */}
              <div style={{ maxWidth: 500, margin: '2rem 0' }}>
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
                    plugins: {
                      legend: { display: true }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
              <h3>Features</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {currentTurnStats.features?.map((feature, index) => (
                  <Card
                    key={index}
                    title={
                      <span>
                        Feature {index + 1}
                        {feature.architecture && (
                          <span
                            style={{
                              marginLeft: '0.5rem',
                              padding: '0.2em 0.7em',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              borderRadius: '999px',
                              fontSize: '0.85em',
                              fontWeight: 600,
                              verticalAlign: 'middle'
                            }}
                          >
                            {feature.architecture}
                          </span>
                        )}
                      </span>
                    }
                    style={{
                      width: '200px',
                      background: '#fff',
                      border: '1px solid #ddd',
                      padding: '1rem',
                      borderRadius: '8px'
                    }}
                  >
                    <p><strong>Name:</strong> {feature.name}</p>
                    <p><strong>Infra cost:</strong> ${feature.infrastructureCost}</p>
                    <p><strong>Tech Debt:</strong> {feature.techDebt}</p>
                    <p><strong>Age:</strong> {game.currentTurn - feature.createdTurn} Quarters</p>
                    {feature.revenueStats.length > 0 && feature.revenueStats[feature.revenueStats.length - 1] && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p><strong>Feature Revenue:</strong> ${feature.revenueStats[feature.revenueStats.length - 1].featureRevenue}</p>
                        <p><strong>Infrastructure Cost:</strong> ${feature.revenueStats[feature.revenueStats.length - 1].infrastructureCost}</p>
                        <p><strong>Tech Debt Cost:</strong> ${feature.revenueStats[feature.revenueStats.length - 1].techDebtCost}</p>
                        <p><strong>Net Revenue:</strong> ${feature.revenueStats[feature.revenueStats.length - 1].netRevenue}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              <h3>Actions</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                {actions.map((action) => (
                  <Button
                    key={action.code}
                    label={action.name}
                    icon={action.icon}
                    className="p-button-outlined p-button-info"
                    onClick={() => handleActionSubmit(action)}
                  />
                ))}
              </div>
            </Card>
          );
        }
        return null;
      })}

      {/* Other Players' Stats */}
      <div className="players" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        {game?.players?.map((player) => {
          if (player.id !== playerId) {
            const currentTurnStats = player.stats[game.currentTurn];
            return (
              <Card
                key={player.id}
                title={`${player.name} - ${player.playerClass}`}
                className="player-card"
                style={{
                  width: '300px',
                  flex: '1 1 calc(33.333% - 1rem)',
                  boxSizing: 'border-box'
                }}
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