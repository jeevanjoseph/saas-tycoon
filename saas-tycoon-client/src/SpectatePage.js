import React from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { formatCurrency } from './utils/formatCurrency';

function SpectatePage({ game }) {
  if (!game) return null;

  const lastTurn = game.currentTurn;
  // Sort players by cash descending
  const sortedPlayers = [...game.players]
    .map(player => ({
      ...player,
      finalCash: player.stats?.[lastTurn]?.cash ?? 0
    }))
    .sort((a, b) => b.finalCash - a.finalCash);

  const progressValue = game.total_turns
    ? Math.round(((game.currentTurn) / game.total_turns) * 100)
    : 0;

  return (
    <div className="gamepage-container">
      <div className="top-banner">
        <h1 className="gamepage-title">SaaS Tycoon Conference Edition</h1>
        <div className="game-info">
          <span>Spectating: {game.name ? game.name : game.id}</span>
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
      <div className="gamepage-root" style={{ position: 'relative', minHeight: '100vh' }}>
        {sortedPlayers.map((player, idx) => {
          const stats = player.stats?.[lastTurn] || {};
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
              className="player-status-card"
              style={{
                minWidth: 260,
                maxWidth: 340,
                margin: '0 auto',
                position: 'relative',
                border: '2.5px solid #2563eb',
                boxShadow: idx === 0 ? '0 0 16px #ffd70055' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '1.1em', color: '#2563eb' }}>
                  {player.name}
                  {idx === 0 && <i className="pi pi-crown" style={{ color: '#2563eb' }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="player-status-dot"
                    style={{
                      background: statusColor,
                      width: 14,
                      height: 14,
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

export default SpectatePage;