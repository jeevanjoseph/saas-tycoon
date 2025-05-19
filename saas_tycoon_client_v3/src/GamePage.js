import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import axios from 'axios';

const API = 'http://localhost:3000/api/game';

function GamePage({ gameId, game, playerId, setReady }) {
  const actions = [
    { id: 1, name: "Build New Feature", code: "BUILD_NEW_FEATURE", description: "Develop a new feature to attract more customers.", cost: 300, icon: "pi pi-cog" },
    { id: 2, name: "Fix Bugs", code: "FIX_BUGS", description: "Address existing bugs to improve customer satisfaction.", cost: 300, icon: "pi pi-wrench" },
    { id: 3, name: "Upgrade Infrastructure", code: "UPGRADE_INFRASTRUCTURE", description: "Enhance the infrastructure to improve operational maturity.", cost: 300, icon: "pi pi-server" },
    { id: 4, name: "Launch Marketing Campaign", code: "LAUNCH_MARKETING_CAMPAIGN", description: "Run a marketing campaign to attract new customers.", cost: 300, icon: "pi pi-megaphone" },
    { id: 5, name: "Migrate to Cloud", code: "MIGRATE_TO_CLOUD", description: "Transition legacy systems to cloud-native architecture.", cost: 300, icon: "pi pi-cloud" },
    { id: 6, name: "Acquire Customers", code: "ACQUIRE_CUSTOMERS", description: "Focus on acquiring new customers through sales efforts.", cost: 300, icon: "pi pi-users" },
    { id: 7, name: "Reduce Tech Debt", code: "REDUCE_TECH_DEBT", description: "Allocate resources to refactor code and reduce tech debt.", cost: 300, icon: "pi pi-chart-line" },
    { id: 8, name: "Expand Team", code: "EXPAND_TEAM", description: "Hire more developers to increase productivity.", cost: 300, icon: "pi pi-user-plus" },
    { id: 9, name: "Optimize Pricing", code: "OPTIMIZE_PRICING", description: "Adjust pricing strategy to maximize revenue.", cost: 300, icon: "pi pi-dollar" },
    { id: 10, name: "Conduct Training", code: "CONDUCT_TRAINING", description: "Train the team to improve cloud-native or legacy skills.", cost: 300, icon: "pi pi-book" }
  ];
  const [selectedAction, setSelectedAction] = useState(null);
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
  const handleActionSubmit = async () => {
    if (!selectedAction) {
      alert("Please select an action before submitting.");
      return;
    }

    try {
      const response = await axios.post(`${API}/${gameId}/action`, {
        playerId,
        action: selectedAction.code,
        turn: game?.currentTurn 
      });
      console.log("Action submitted successfully:", response.data);
      alert(`Action "${selectedAction.name}" submitted successfully!`);
    } catch (error) {
      console.error("Error submitting action:", error);
      alert("Failed to submit action. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Game ID: {gameId}</h1>
      <h2>Turn: {game?2025+Math.floor(game.currentTurn/4)+'Q'+(game.currentTurn%4+1) : 'Loading...'}</h2>
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
       <div className="actions" style={{ marginTop: '2rem' }}>
        <h3>Select an Action</h3>
        <div className="action-tray" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '1rem',
          background: '#f9f9f9',
          borderRadius: '8px',
          justifyContent: 'space-between',
          maxWidth: '890px' // Ensures 5 cards per row (150px each + gaps)
        }}>
          {actions.map((action) => (
            <Card
              key={action.id}
              title={action.name}
              className={`action-card ${selectedAction?.id === action.id ? 'selected' : ''}`}
              style={{
                width: '150px',
                cursor: 'pointer',
                border: selectedAction?.id === action.id ? '2px solid #007ad9' : '1px solid #ccc',
                textAlign: 'center',
                padding: '0.5rem'
              }}
              onClick={() => setSelectedAction(action)}
            >
              <i className={`${action.icon}`} style={{ fontSize: '2rem', color: '#007ad9' }}></i>
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{action.description}</p>
              <p style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Cost: ${action.cost}</p>
            </Card>
          ))}
        </div>
        <Button
          label="Submit Action"
          icon="pi pi-send"
          onClick={handleActionSubmit}
          className="p-button-success"
          style={{ marginTop: '1rem' }}
        />
      </div>
      <div className="players" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        {game?.players?.map((player) => (
          <Card
            key={player.id}
            title={`${player.name} ${player.id === playerId ? '(You)' : ''}`}
            className="player-card"
            style={{
              width: player.id === playerId ? '100%' : '300px',
              flex: player.id === playerId ? '1 1 100%' : '1 1 calc(33.333% - 1rem)',
              boxSizing: 'border-box'
            }}
          >
            <div>
              <p><strong>Cash:</strong> ${player.cash}</p>
              <p><strong>Customers:</strong> {player.customers}</p>
              <p><strong>Features:</strong> {player.features?.length || 0}</p>
              <p><strong>Cloud Skills:</strong> {player.skills?.cloudNative || 0}</p>
              <p><strong>Legacy Skills:</strong> {player.skills?.legacy || 0}</p>
              <p><strong>Op Maturity:</strong> {player.opMaturity || 0}</p>
              <p><strong>Tech Debt:</strong> {player.techDebt || 0}</p>
              <p><strong>Revenue:</strong> ${player.revenue || 0}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default GamePage;