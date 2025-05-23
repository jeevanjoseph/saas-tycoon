import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import axios from 'axios';

const API = 'http://localhost:3000/api/game';
const actions = [
  { id: 1, name: "Build New Feature", code: "BUILD_NEW_FEATURE", description: "Develop a new feature to attract more customers.", cost: 1000, icon: "pi pi-cog" },
  { id: 2, name: "Fix Bugs", code: "FIX_BUGS", description: "Address existing bugs to improve customer satisfaction.", cost: 400, icon: "pi pi-wrench" },
  { id: 3, name: "Training", code: "TRAINING", description: "Train the team to improve operational maturity.", cost: 500, icon: "pi pi-server" },
  { id: 4, name: "Launch Marketing Campaign", code: "LAUNCH_MARKETING_CAMPAIGN", description: "Run a marketing campaign to attract new customers.", cost: 800, icon: "pi pi-megaphone" },
  { id: 5, name: "DevOps", code: "DEVOPS", description: "Transition to a devops model, where developers own the complete service lifecycle", cost: 800, icon: "pi pi-cloud" },
  { id: 6, name: "Acquire Customers", code: "ACQUIRE_CUSTOMERS", description: "Focus on acquiring new customers through sales efforts.", cost: 300, icon: "pi pi-users" },
  { id: 7, name: "Reduce Tech Debt", code: "REDUCE_TECH_DEBT", description: "Allocate resources to refactor code and reduce tech debt.", cost: 500, icon: "pi pi-chart-line" },
  { id: 8, name: "Expand Team", code: "EXPAND_TEAM", description: "Hire more developers to increase productivity.", cost: 600, icon: "pi pi-user-plus" },
  { id: 9, name: "Optimize Pricing", code: "OPTIMIZE_PRICING", description: "Adjust pricing strategy to maximize revenue.", cost: 700, icon: "pi pi-dollar" },
  { id: 10, name: "Conduct Training", code: "CONDUCT_TRAINING", description: "Train the team to improve cloud-native or legacy skills.", cost: 400, icon: "pi pi-book" }
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
      <Button
        label="I'm Ready"
        icon="pi pi-check"
        onClick={setReady}
        className="p-button-warning"
      />

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
              <p><strong>Tech Debt:</strong> {currentTurnStats.techDebt}</p>
              <p><strong>Revenue:</strong> ${currentTurnStats.revenue}</p>
              <p><strong>Operational Maturity:</strong> {currentTurnStats.opsMaturity}</p>
              <h3>Features</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {currentTurnStats.features?.map((feature, index) => (
                  <Card
                    key={index}
                    title={`Feature ${index + 1}`}
                    style={{
                      width: '200px',
                      background: '#fff',
                      border: '1px solid #ddd',
                      padding: '1rem',
                      borderRadius: '8px'
                    }}
                  >
                    <p><strong>Name:</strong> {feature.name}</p>
                    <p><strong>Cost:</strong> ${feature.cost}</p>
                    <p><strong>Revenue:</strong> ${feature.revenue}</p>
                    <p><strong>Status:</strong> {feature.status}</p>
                  </Card>
                ))}
              </div>
              <h3>Actions</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                {actions.map((action) => (
                  <Button
                    key={action.id}
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