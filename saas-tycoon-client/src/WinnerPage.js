import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
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
  const others = sortedPlayers.slice(3);

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

  // Table columns for "others"
  const nameBody = (rowData) => (
    <span style={{ fontWeight: 600, color: 'var(--blue-800)' }}>{rowData.name}</span>
  );
  const classBody = (rowData) => (
    <Tag value={rowData.playerClass} severity="info" />
  );
  const cashBody = (rowData) => (
    <span>
      <i className="pi pi-dollar" style={{ color: 'var(--blue-800)', marginRight: 4 }} />
      {formatCurrency(rowData.finalCash)}
    </span>
  );
  const customersBody = (rowData) => (
    <span>
      <i className="pi pi-users" style={{ color: 'var(--blue-800)', marginRight: 4 }} />
      {rowData.stats?.[lastTurn]?.customers ?? 0}
    </span>
  );
  const legacyBody = (rowData) => (
    <span>
      <i className="pi pi-database" style={{ color: '#b03a2e', marginRight: 4 }} />
      {rowData.stats?.[lastTurn]?.legacySkills ?? 0}
    </span>
  );
  const cloudBody = (rowData) => (
    <span>
      <i className="pi pi-cloud" style={{ color: '#42A5F5', marginRight: 4 }} />
      {rowData.stats?.[lastTurn]?.cloudNativeSkills ?? 0}
    </span>
  );
  const opsBody = (rowData) => (
    <span>
      <i className="pi pi-shield" style={{ color: '#22c55e', marginRight: 4 }} />
      {rowData.stats?.[lastTurn]?.opsMaturity ?? 0}
    </span>
  );
  const featuresBody = (rowData) => (
    <span>
      <i className="pi pi-star" style={{ color: '#fbbf24', marginRight: 4 }} />
      {rowData.features?.length ?? 0}
    </span>
  );

  return (
    <div className="gamepage-container">
      <div className="top-banner">
        <h1 className="gamepage-title">SaaS Tycoon Conference Edition</h1>
        <div className="game-info">
          <span>Winners: {game.name ? game.name : game.id}</span>
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
        <h1 className="winnerpage-subtitle">🏆 Game Over!</h1>
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
                      className={`winner-status-dot winner-status-dot-${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'played'}`}
                    />
                    <span className={`winner-status-label winner-status-label-${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'played'}`}>
                      {idx === 0 ? 'Market Leader' : idx === 1 ? 'Challenger' : idx === 2 ? 'Visionary' : 'Niche Player'}
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
        {/* Table for the rest of the players */}
        {others.length > 0 && (
          <div style={{ marginTop: '2.5rem', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
            <DataTable value={others} stripedRows responsiveLayout="scroll" size="small">
              <Column field="name" header="Name" body={nameBody} />
              <Column field="playerClass" header="Class" body={classBody} />
              <Column field="finalCash" header="Cash" body={cashBody} />
              <Column field="customers" header="Customers" body={customersBody} />
              <Column field="legacySkills" header="Legacy" body={legacyBody} />
              <Column field="cloudNativeSkills" header="Cloud" body={cloudBody} />
              <Column field="opsMaturity" header="Ops" body={opsBody} />
              <Column field="features" header="Features" body={featuresBody} />
            </DataTable>
          </div>
        )}
      </div>
    </div>
  );
}

export default WinnerPage;