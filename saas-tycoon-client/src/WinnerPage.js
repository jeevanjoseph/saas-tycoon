import React from 'react';
import { Card } from 'primereact/card';
import { formatCurrency } from './utils/formatCurrency';
import Confetti from 'react-confetti';

function WinnerPage({ game }) {
  if (!game) return null;

  const lastTurn = game.currentTurn;
  const sortedPlayers = [...game.players]
    .map(player => ({
      ...player,
      finalCash: player.stats?.[lastTurn]?.cash ?? 0
    }))
    .sort((a, b) => b.finalCash - a.finalCash);

  const top3 = sortedPlayers.slice(0, 3);

  // Get window size for confetti (fallback for SSR)
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });
  React.useEffect(() => {
    function updateSize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const placeColors = ['gold', 'silver', 'bronze'];
  const placeLabels = ['1st', '2nd', '3rd'];

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
          </div>
        </div>
      </div>
      <div className="gamepage-root" style={{ position: 'relative', minHeight: '100vh' }}>
        <Confetti width={dimensions.width} height={dimensions.height} numberOfPieces={350} recycle={false} />
        <h1 className="gamepage-title">🏆 Game Over!</h1>
        <div className='winner-content'>
          {top3.map((player, idx) => {
            const stats = player.stats?.[lastTurn] || {};
            return (
              <Card
                key={player.id}
                className={`winner-card winner-card-${placeColors[idx]}${idx === 0 ? ' winner-card-current' : ''}`}
              >
                <div className="winner-card-header">
                  <div className="winner-card-name">
                    {player.name} <span className="winner-card-place">({placeLabels[idx]} Place)</span>
                  </div>
                  <div className="winner-card-status">
                    <span
                      className={`winner-status-dot winner-status-dot-${idx === 0 ? 'victory' : 'played'}`}
                    />
                    <span className={`winner-status-label winner-status-label-${idx === 0 ? 'victory' : 'played'}`}>
                      {idx === 0 ? 'Victory' : 'Played'}
                    </span>
                  </div>
                </div>
                <div className="winner-card-class">{player.playerClass}</div>
                <div className="winner-card-stats">
                  <div className="winner-card-cash">
                    <i className="pi pi-dollar" />
                    <span>{formatCurrency(player.finalCash)}</span>
                  </div>
                  <div className="winner-card-customers">
                    <i className="pi pi-users" />
                    <span>{stats.customers ?? 0} Customers</span>
                  </div>
                </div>
                <div className="winner-card-skills">
                  <div>
                    <i className="pi pi-database" />
                    <span>Legacy: {stats.legacySkills ?? 0}</span>
                  </div>
                  <div>
                    <i className="pi pi-cloud" />
                    <span>Cloud: {stats.cloudNativeSkills ?? 0}</span>
                  </div>
                  <div>
                    <i className="pi pi-shield" />
                    <span>Ops: {stats.opsMaturity ?? 0}</span>
                  </div>
                </div>
                <div className="winner-card-features">
                  <i className="pi pi-star" />
                  Features Built: {player.features?.length ?? 0}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WinnerPage;