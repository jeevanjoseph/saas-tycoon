import React, { useState, useEffect, useRef } from 'react';
import { InputOtp } from 'primereact/inputotp';
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
import { Badge } from 'primereact/badge';
import { Message } from 'primereact/message';

import constants from './utils/constants';
import { verifyPlayer } from './services/playerService'; // <-- Import the verifyPlayer function

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
  const [playerCode, setPlayerCode] = useState('');
  const [playerCodeTouched, setPlayerCodeTouched] = useState(false);
  const [playerCodeError, setPlayerCodeError] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const toast = useRef(null);

  const playerTypes = [
    {
      label: 'Classic Monolithic SaaS',
      value: 'Monolith',
      title: 'A powerhouse that needs modernization',
      description: [
        'Classic monolithic SaaS app.',

      ],
      icon: 'pi pi-database',
      properties: [
        'Mature business with a strong base and features.',
        'Older tech stack needs constant maintenance.',
        'Infrastructure cost is per customer.',
        'Can up-skill to build modern applications.'
      ],
      features: {
        Cash: "$10,000",
        Customers: 1,
        LegacySkills: 4,
        CloudNativeSkills: 0,
        OpsMaturity: 0,
        Feaures: 2

      }
    },
    {
      label: 'Single-Tenant Microservices',
      value: 'SingleTenant',
      title: 'Modern toolchains, but needs a culture shift',
      description: [
        'Microservice based single-tenant SaaS.',

      ],
      icon: 'pi pi-cloud',
      properties: [
        'On the path to modernization.',
        'A more modern tech-stack can stave off tech debt.',
        'Infrastructure cost is per customer.',
        'Can upskill to build multi-tenant applications.'
      ],
      features: {
        Cash: "$8,000",
        Customers: 1,
        LegacySkills: 4,
        CloudNativeSkills: 1,
        OpsMaturity: 0,
        Features: 1
      }
    },
    {
      label: 'Multi-Tenant Microservices',
      value: 'MultiTenant',
      title: 'Start with a skilled team, but low capital.',
      description: [
        'Modern multi-tenant SaaS, that is built for scalability and efficiency.',

      ],
      icon: 'pi pi-sparkles',
      properties: [
        'Capital intensive, slower initial growth.',
        'Long term potential tied to customer growth.',
        'Highly skilled team with modern toolchains.',
        'Infrastructure cost is per feature, leading to better margins.'
      ],
      features: {
        Cash: "$5,000",
        Customers: 1,
        LegacySkills: 4,
        CloudNativeSkills: 2,
        OpsMaturity: 0,
        Features: 0

      }
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

  
  const handlePlayerCodeChange = async (value) => {
    setPlayerCode(value);
    setPlayerCodeTouched(true);
    setPlayerInfo(null);
    setPlayerName(null);
    setPlayerCodeError('');
    if (value && value.length === 8) {
      setVerifying(true);
      try {
        const res = await verifyPlayer(value);
        setPlayerInfo(res);
        setPlayerName(res.playerEmail); // Set playerName to playerEmail
        setPlayerCodeError('');
      } catch (err) {
        setPlayerInfo(null);
        setPlayerName(null);
        setPlayerCodeError('Invalid player code');
      } finally {
        setVerifying(false);
      }
    }
  };


  return (
    <div className='gamepage-container'>
      <div className="top-banner">
        <h1 className="gamepage-title">SaaS Tycoon Conference Edition</h1>
        <div className="game-info">
          <span >Current Session: </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="gamepage-turn" style={{ margin: 0 }}>
              <i className="pi pi-calendar" style={{ marginRight: '0.5rem', fontSize: '1.2em' }} />

            </span>

          </div>
        </div>
      </div>
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
        {/* --- Player Code Section --- */}
        <div className="player-code-field" style={{ marginBottom: 24 }}>
          <Badge value="1" size="xlarge" />
          <label htmlFor="playerCode" style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Player Code</label>
          <InputOtp
            id="playerCode"
            value={playerCode}
            onChange={(e) => handlePlayerCodeChange(e.value)}
            length={8}
            disabled={verifying}
            invalid={!!playerCodeError}
            autoFocus
          />
          {verifying && (
            <small style={{ color: '#888', display: 'block', marginTop: 4 }}>Verifying...</small>
          )}
          {playerCodeTouched && playerCodeError && (
            <small className="p-error" style={{ display: 'block', marginTop: 4 }}>
              {playerCodeError}
            </small>
          )}
          
         
        </div>
         {/* {playerInfo && (
            <div style={{ marginTop: 8, background: '#f6fafd', borderRadius: 6, padding: 12 }}>
              <div><strong>First Name:</strong> {playerInfo.playerFirstName}</div>
              <div><strong>Last Name:</strong> {playerInfo.playerLastName}</div>
              <div><strong>Email:</strong> {playerInfo.playerEmail}</div>
            </div>
          )} */}
        {/* --- Player Name and Type Section --- */}
        <div className="player-name-field">
           <Badge value="2" size="xlarge" ></Badge>
            <label htmlFor="playerName" style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Player Verification</label>
            <Message severity={playerName ? 'success':'info'} text={playerName ? playerName:'Verify your player code to auto-fill'} />

            {/* <InputText
              id="playerName"
              value={playerName}
              //onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Verify your player code to auto-fill"
              style={{ width: '275px' }}
              
              //onBlur={() => setNameTouched(true)}
              keyfilter="email"
              className={showNameError ? 'p-invalid' : ''}
              disabled // now disabled, because playerName is set from playerInfo.playerEmail
            />
            {showNameError && (
              <small className="p-error" style={{ display: 'block', marginTop: 4 }}>
                Player name is required.
              </small>
            )} */}
          </div>
        
        <div className="p-field player-type-section">
          <div className='player-name-field'>
            <Badge value="3" size="xlarge" ></Badge>
            <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Select Player Type</label>
          </div>

          <div className="player-type-cards">
            {playerTypes.map((type) => (
              <Card
                key={type.value}

                className={
                  ' player-type-card ' + type.value.toLowerCase() +
                  (playerType === type.value ? ' selected ' : '')
                }
              >
                <div className="class-card-content">


                  <div className="card-header">
                    <i className={type.icon} style={{ fontSize: '3rem', color: '#ffffffff' }} />
                    <span className="card-label">{type.label}</span>
                  </div>
                  <div className="card-title">{type.title}</div>

                  <div className="player-class-properties">
                    {type.properties.map((prop, idx) => (
                      <span key={idx}>
                        <i className="pi pi-check" style={{ color: '#4caf50', marginRight: '0.5rem' }} />
                        {prop}
                      </span>
                    ))}
                  </div>
                  <div className="player-class-features">
                    <h4>Starting Features:</h4>

                    {Object.entries(type.features).map(([key, value]) => (
                      <div className="player-class-features-list">
                        <span key={key}>
                          <strong>{key}:</strong>
                        </span>
                        <span>{value}</span>
                      </div>
                    ))}

                  </div>
                  <Button
                    label="Select"
                    icon={type.icon}
                    className="select-player-class"
                    onClick={() => setPlayerType(type.value)} />
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className='game-list'>
          <div className='player-name-field'>
            <Badge value="4" size="xlarge" ></Badge>
            <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Start or Join a Game.</label>
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
                    disabled={!playerName || !playerType}
                    className="p-button-success"
                  />
                  <Button
                    label="Join"
                    icon="pi pi-sign-in"
                    onClick={() => joinGame(selectedGameId)}
                    className="p-button-primary"
                    disabled={
                      !playerName || !playerType ||
                      !selectedGameId ||
                      sessions.find(s => s.id === selectedGameId)?.state === 'finished'
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
      </div>
    </div>
  );
}

export default JoinGamePage;