import React, { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { formatCurrency } from './utils/formatCurrency';
import { fetchLeaders } from './services/gameService';

// Helper to format "X minutes/hours/days ago"
function timeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function LeadersPage({ defaultStartDate = '-7d' }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [apiStartDate, setApiStartDate] = useState(defaultStartDate);
  const intervalRef = useRef();

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      let data = await fetchLeaders(apiStartDate);
      // Sort by top player's totalCash descending
      data = data.sort((a, b) => {
        const aCash = a.topPlayers && a.topPlayers[0] ? a.topPlayers[0].totalCash || 0 : 0;
        const bCash = b.topPlayers && b.topPlayers[0] ? b.topPlayers[0].totalCash || 0 : 0;
        return bCash - aCash;
      });
      setSessions(data);
    } catch (err) {
      setSessions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Set up interval for auto-refresh
    intervalRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [apiStartDate]);

  const handleDateChange = (e) => {
    setStartDate(e.value);
  };

  const handleFetch = () => {
    if (startDate) {
      setApiStartDate(startDate);
    }
  };

  return (
    <div className="gamepage-container">
      <div className="top-banner">
        <h1 className="gamepage-title">SaaS Tycoon Conference Edition</h1>
        <div className="game-info">
          <span>Leaderboard</span>
        </div>
      </div>
      <div className="leaderboard-container">
        <span style={{ fontWeight: 600 }}>Leaderboard for games since </span>
        <Calendar
          value={startDate}
          onChange={handleDateChange}
          dateFormat="yy-mm-dd"
          placeholder="Pick a date"
          showIcon
          style={{ minWidth: 160 }}
        />
        <Button label="Show Leaderboard" icon="pi pi-search" onClick={handleFetch} disabled={!startDate} />
      </div>
      <div className="gamepage-root" style={{ position: 'relative', minHeight: '100vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>
        ) : (
          sessions.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>No finished sessions found.</div>
          ) : (
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th colSpan={3}>Top 3 Players</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <React.Fragment key={session.sessionId}>
                      <tr>
                        {/* Session Info */}
                        <td className="leaderboard-session-cell">
                          <div>
                            {session.sessionName || session.sessionId}
                          </div>
                          <div className="leaderboard-session-id">
                            Session ID: {session.sessionId}
                          </div>
                          <div className="leaderboard-session-id">
                            Started: {session.startTime ? timeAgo(session.startTime) : '-'}
                          </div>
                          <div className="leaderboard-session-id">
                            Ended: {session.endTime ? timeAgo(session.endTime) : '-'}
                          </div>
                        </td>
                        {/* Top 3 Players */}
                        {[0, 1, 2].map(idx => {
                          const player = session.topPlayers && session.topPlayers[idx];
                          return (
                            <td key={idx} className="leaderboard-player-cell">
                              {player ? (
                                <div className={
                                  "leaderboard-player-card" +
                                  (idx === 0 ? " gold" : "")
                                }>
                                  <div className="player-name">
                                    {player.name}
                                    {idx === 0 && <i className="pi pi-crown player-crown" />}
                                  </div>
                                  <Tag value={player.playerClass} severity="info" className="player-class-tag" />
                                  <div className="player-cash">
                                    <i className="pi pi-dollar" />
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(player.totalCash)}</span>
                                  </div>
                                  <div className="player-features">
                                    <i className="pi pi-th-large" />
                                    Features: {player.featureCount ?? 0}
                                  </div>
                                </div>
                              ) : (
                                <div className="leaderboard-player-card-empty">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {/* All players row (optional, can be removed if not needed) */}
                      {session.topPlayers && session.topPlayers.length > 3 && (
                        <tr className="leaderboard-other-players-row">
                          <td></td>
                          <td colSpan={3}>
                            <div className="leaderboard-other-players-list">
                              {session.topPlayers.slice(3).map((player, idx) => (
                                <div key={player.name} className="leaderboard-other-player-card">
                                  <div className="player-name">{player.name}</div>
                                  <Tag value={player.playerClass} severity="info" className="player-class-tag" />
                                  <div className="player-cash">
                                    <i className="pi pi-dollar" />
                                    {formatCurrency(player.totalCash)}
                                  </div>
                                  <div className="player-features">
                                    <i className="pi pi-th-large" />
                                    Features: {player.featureCount ?? 0}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default LeadersPage;