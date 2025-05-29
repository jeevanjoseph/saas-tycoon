import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

function JoinGamePage({ playerName, setPlayerName, playerType, setPlayerType, sessions, createGame, joinGame }) {
  const [selectedGameId, setSelectedGameId] = useState(null);

  const playerTypes = [
    { label: 'Monolith', value: 'Monolith' },
    { label: 'Single Tenant', value: 'SingleTenant' },
    { label: 'Multi Tenant', value: 'MultiTenant' }
  ];

  const header = (
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
  );

  return (
    <div className="container">
      <h1>SaaS Tycoon</h1>
      <div className="p-field">
        <label htmlFor="playerName">Enter Name</label>
        <InputText
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div className="p-field">
        <label htmlFor="playerType">Select Player Type</label>
        <Dropdown
          id="playerType"
          value={playerType}
          options={playerTypes}
          onChange={(e) => setPlayerType(e.value)}
          placeholder="Select a Player Type"
        />
      </div>
      <DataTable
        value={sessions.filter((s) => !s.started)}
        header={header}
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