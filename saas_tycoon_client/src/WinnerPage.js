import React from 'react';
import { Card } from 'primereact/card';
import { formatCurrency } from './utils/formatCurrency';

function WinnerPage({ game }) {
  if (!game) return null;

  const lastTurn = game.currentTurn;
  // Sort all players by final cash descending
  const sortedPlayers = [...game.players]
    .map(player => ({
      ...player,
      finalCash: player.stats?.[lastTurn]?.cash ?? 0
    }))
    .sort((a, b) => b.finalCash - a.finalCash);

  const top3 = sortedPlayers.slice(0, 3);

  return (
    <div className="gamepage-root">
      <h1 className="gamepage-title">🏆 Game Over!</h1>
      <div style={{ margin: '2rem auto', maxWidth: 900, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {top3.map((player, idx) => {
          const stats = player.stats?.[lastTurn] || {};
          const placeColors = ['#ffd700', '#c0c0c0', '#cd7f32']; // gold, silver, bronze
          const placeLabels = ['1st', '2nd', '3rd'];
          return (
            <Card
              key={player.id}
              className={`player-status-card${idx === 0 ? ' current' : ''}`}
              style={{
                minWidth: 260,
                maxWidth: 340,
                margin: '0 auto',
                position: 'relative',
                border: `2.5px solid ${placeColors[idx]}`,
                boxShadow: idx === 0 ? '0 0 16px #ffd70055' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '1.1em', color: '#2563eb' }}>
                  {player.name} <span style={{ fontSize: '0.9em', color: '#888' }}>({placeLabels[idx]} Place)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="player-status-dot"
                    style={{
                      background: idx === 0 ? '#22c55e' : '#aaa',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: 6
                    }}
                  />
                  <span style={{
                    fontSize: '0.95em',
                    color: idx === 0 ? '#22c55e' : '#888',
                    fontWeight: 600
                  }}>
                    {idx === 0 ? 'Victory' : 'Played'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.95em', color: '#888', marginBottom: 8 }}>
                {player.playerClass}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginBottom: 4, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="pi pi-dollar" style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: 600 }}>{formatCurrency(player.finalCash)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="pi pi-users" style={{ color: '#2563eb' }} />
                  <span>{stats.customers ?? 0} Customers</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="pi pi-database" style={{ color: '#b03a2e' }} />
                  <span>Legacy: {stats.legacySkills ?? 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="pi pi-cloud" style={{ color: '#42A5F5' }} />
                  <span>Cloud: {stats.cloudNativeSkills ?? 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="pi pi-shield" style={{ color: '#22c55e' }} />
                  <span>Ops: {stats.opsMaturity ?? 0}</span>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', color: '#444', fontWeight: 500 }}>
                <i className="pi pi-star" style={{ color: '#fbbf24', marginRight: 6 }} />
                Features Built: {player.features?.length ?? 0}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default WinnerPage;