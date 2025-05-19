import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

function JoinGamePage({ playerName, setPlayerName, sessions, createGame, joinGame }) {
  const [selectedGameId, setSelectedGameId] = useState(null);
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
      <DataTable value={sessions.filter((s) => !s.started)} header={header} selectionMode="single" selection={selectedGameId} onSelectionChange={(e) => setSelectedGameId(e.value.id)} dataKey="id" responsiveLayout="scroll">
        <Column field="id" header="Game ID"></Column>
        <Column field="playerCount" header="Players"></Column>
        <Column field="playerLimit" header="Player Limit"></Column>
      </DataTable>
    </div>
  );
}

export default JoinGamePage;