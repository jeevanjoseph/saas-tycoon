import React, { useState , useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import './JoinGamePage.css';
import constants from './constants';

function JoinGamePage({
  playerName,
  setPlayerName,
  playerType,
  setPlayerType,
  sessions,
  createGame,
  joinGame,
  error,
  setError,
  onSpectate 
}) {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [sessionName, setSessionName] = useState(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [gameConfigVisible, setGameConfigVisible] = useState(false);
  const [playerLimit, setPlayerLimit] = useState(constants.DEFAULT_PLAYER_LIMIT);
  const [playerLimitError, setPlayerLimitError] = useState('');
  const toast = useRef(null);

  const playerTypes = [
    {
      label: 'Classic Monolithic SaaS',
      value: 'Monolith',
      title: 'A powerhouse that needs modernization',
      description: [
        'Classic monolithic SaaS app.',
        'Players start off with completed features that start generating revenue immediately.',
        'These are legacy architectures built on older platforms that increase your tech debt.',
        'Infrastructure cost is per customer, and teams start out with no cloud native skills.'
      ],
      icon: 'pi pi-database'
    },
    {
      label: 'Single-Tenant Microservices',
      value: 'SingleTenant',
      title: 'Modern toolchains, but needs a culture shift',
      description: [
        'Microservice based single-tenant SaaS.',
        'Teams start with some monolith features and some modernized services.',
        'Teams are equipped with some cloud native skills, and can stave off tech debt.',
        'Infrastructure cost is per customer, since these are still single-tenant features.'
      ],
      icon: 'pi pi-user'
    },
    {
      label: 'Multi-Tenant Microservices',
      value: 'MultiTenant',
      title: 'Start-Up mode. Highly scalable, with an equally high upfront cost.',
      description: [
        'Modern multi-tenant SaaS, that is built for scalability and efficiency.',
        'Requires high initial investment, and patience, but pays off in the long run.',
        'Teams start with some cloud native skills, and can build features that are highly scalable.',
        'Infrastructure cost is per feature, since these are multi-tenant features.'
      ],
      icon: 'pi pi-users'
    }
  ];

  useEffect(() => {
    if (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 4000
      });
      setError(null);
    }
  }, [error]);

  const showNameError = nameTouched && !playerName;

  const validatePlayerLimit = (value) => {
    if (value < 3) {
      setPlayerLimitError('Player limit must be at least 3.');
      return false;
    }
    if (value > 16) {
      setPlayerLimitError('Player limit can be upto 16.');
      return false;
    }
    setPlayerLimitError('');
    return true;
  };

  const handlePlayerLimitChange = (e) => {
    const value = e.value ?? 10;
    setPlayerLimit(value);
    validatePlayerLimit(value);
  };

  const handleCreate = async () => {
    if (!validatePlayerLimit(playerLimit)) return;
    try {
      createGame(sessionName, playerLimit);
      setGameConfigVisible(false);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error || 'Failed to create game session',
        life: 4000
      });
    }
  };

  return (
    <div className="join-game-container">
      <Toast ref={toast} />
      <Dialog
        header="Create New Game Session"
        visible={gameConfigVisible}
        style={{ width: '520px' }}
        onHide={() => setGameConfigVisible(false)}
        modal
        footer={
          <div style={{ padding: '1rem' }}>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setGameConfigVisible(false)} />
            <Button label="Create" icon="pi pi-check" onClick={handleCreate} disabled={!!playerLimitError} autoFocus />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '1rem' }}>
          <label htmlFor="game-name" style={{ marginRight: 8 }}>Game Name (optional):</label>
          <InputText
            id="game-name"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            placeholder="Enter a name or leave blank"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '1rem' }}>
          <label htmlFor="player-limit" style={{ marginRight: 8 }}>Number of Players:</label>
          <InputNumber
            id="player-limit"
            value={playerLimit}
            onValueChange={handlePlayerLimitChange}
            min={3}
            max={16}
            showButtons
            style={{ width: '100%' }}
          />
          {playerLimitError && (
            <div style={{ color: 'red', fontSize: '0.9em', marginTop: 4 }}>{playerLimitError}</div>
          )}
        </div>
      </Dialog>
      <h1>SaaS Tycoon</h1>
      <div className="p-field" style={{ marginBottom: 24, maxWidth: 350 }}>
        <label htmlFor="playerName" style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Player Name</label>
        <InputText
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter name"
          style={{ width: '100%' }}
          autoFocus
          onBlur={() => setNameTouched(true)}
          className={showNameError ? 'p-invalid' : ''}
        />
        {showNameError && (
          <small className="p-error" style={{ display: 'block', marginTop: 4 }}>
            Player name is required.
          </small>
        )}
      </div>
      <div className="p-field player-type-section">
        <label>Select Player Type</label>
        <div className="player-type-cards">
          {playerTypes.map((type) => (
            <Card
              key={type.value}
              onClick={() => setPlayerType(type.value)}
              className={
                'player-type-card' +
                (playerType === type.value ? ' selected' : '')
              }
            >
              <div className="card-header">
                <i className={type.icon} style={{ fontSize: '2rem', color: '#007ad9' }} />
                <span className="card-label">{type.label}</span>
              </div>
              <div className="card-title">{type.title}</div>
              <div className="card-description">
                {type.description.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <DataTable
        value={sessions}
        header={
          <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold">Available Games</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center', paddingRight: 8 }}>
              <Button
                label="Create Game"
                icon="pi pi-plus"
                onClick={() => setGameConfigVisible(true)}
                disabled={!playerName}
                className="p-button-success"
              />
              <Button
                label="Join"
                icon="pi pi-sign-in"
                onClick={() => joinGame(selectedGameId)}
                className="p-button-primary"
                disabled={
                  !playerName ||
                  !selectedGameId ||
                  sessions.find(s => s.id === selectedGameId)?.state !== 'not_started'
                }
              />
              <Button
                label="Spectate"
                icon="pi pi-eye"
                className="p-button-info"
                onClick={() => onSpectate && onSpectate(selectedGameId)}
                disabled={!selectedGameId}
              />
            </div>
          </div>
        }
        selectionMode="single"
        selection={selectedGameId}
        onSelectionChange={(e) => setSelectedGameId(e.value.id)}
        dataKey="id"
        responsiveLayout="scroll"
      >
        <Column field="name" header="Name"></Column>
        <Column field="playerCount" header="Players"></Column>
        <Column field="playerLimit" header="Player Limit"></Column>
        <Column
          field="state"
          header="State"
          body={rowData => (
            <span>
              <Tag
                value={
                  rowData.state === 'not_started'
                    ? 'Not Started'
                    : rowData.state === 'started'
                      ? 'In Progress'
                      : rowData.state === 'finished'
                        ? 'Finished'
                        : rowData.state
                }
                severity={
                  rowData.state === 'not_started'
                    ? 'success'
                    : rowData.state === 'started'
                      ? 'warning'
                      : rowData.state === 'finished'
                        ? 'info'
                        : null
                }
              />
            </span>
          )}
        ></Column>
        <Column
          header="Progress"
          body={rowData => {
            const percent = rowData.total_turns
              ? Math.round((rowData.currentTurn / rowData.total_turns) * 100)
              : 0;
            return (
              <ProgressBar
                value={percent}
                showValue
                style={{ height: '1.5rem' }}
              >
                {percent}%
              </ProgressBar>
            );
          }}
        />
      </DataTable>
    </div>
  );
}

export default JoinGamePage;