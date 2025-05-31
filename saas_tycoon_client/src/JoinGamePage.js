import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import './JoinGamePage.css';

function JoinGamePage({ playerName, setPlayerName, playerType, setPlayerType, sessions, createGame, joinGame }) {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [playerNameDialogVisible, setPlayerNameDialogVisible] = useState(!playerName);

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

  // Handler for closing the player name dialog
  const handlePlayerNameDialogClose = () => {
    if (playerName && playerName.trim().length > 0) {
      setPlayerNameDialogVisible(false);
    }
  };

  return (
    <div className="join-game-container">
      <Dialog
        header="Enter Player Name"
        visible={playerNameDialogVisible}
        closable={false}
        modal
        style={{ width: '350px' }}
        footer={
          <Button
            label="OK"
            icon="pi pi-check"
            disabled={!playerName || playerName.trim().length === 0}
            onClick={handlePlayerNameDialogClose}
            autoFocus
          />
        }
      >
        <div className="p-field" style={{ marginTop: 16 }}>
          <label htmlFor="playerName">Player Name</label>
          <InputText
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter name"
            autoFocus
            style={{ width: '100%' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && playerName && playerName.trim().length > 0) {
                handlePlayerNameDialogClose();
              }
            }}
          />
        </div>
      </Dialog>

      <h1>SaaS Tycoon</h1>
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
        value={sessions.filter((s) => !s.started)}
        header={
          <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold">Available Games</span>
            <Button
              label="Create Game"
              icon="pi pi-plus"
              onClick={createGame}
              disabled={!playerName}
              className="p-button-success"
            />
            <Button
              label="Join"
              icon="pi pi-sign-in"
              onClick={() => joinGame(selectedGameId)}
              className="p-button-primary"
              disabled={!playerName || !selectedGameId}
            />
          </div>
        }
        selectionMode="single"
        selection={selectedGameId}
        onSelectionChange={(e) => setSelectedGameId(e.value.id)}
        dataKey="id"
        responsiveLayout="scroll"
      >
        <Column field="id" header="Game ID"></Column>
        <Column field="playerCount" header="Players"></Column>
        <Column field="playerLimit" header="Player Limit"></Column>
      </DataTable>
    </div>
  );
}

export default JoinGamePage;