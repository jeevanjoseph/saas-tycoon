# SaaS Tycoon Server v2

This is the backend server for the SaaS Tycoon game. It is built using Node.js and Express and provides APIs to manage game sessions, players, and game actions.

## Features

- Create and manage game sessions.
- Players can join sessions and perform actions.
- Game logic includes turn-based mechanics, events, and revenue calculations.
- Supports Monolith architecture for players.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd saas_tycoon_server_v2
   ```
2. Install dependencies:
    ```
    npm install
    ```

3. Start the server:
    ```
    npm start
    ```

The server will run on http://localhost:3000 by default.

## API Endpoints
### Game Sessions

- **GET `/api/game`**  
  Retrieve all game sessions.

- **POST `/api/game`**  
  Create a new game session.  
  **Request Body:**  
  ```json
  {
    "playerLimit": 5
  }
  ```
- **POST `/api/game/:id/join`**  
  Join a game session.
  **Request Body:**  
  ```json
  {
  "playerName": "Player1"
  }
  ```
- **POST `/api/game/:id/ready`**  
  Mark a player as ready to start the game.
  **Request Body:**  
  ```json
  {
  "playerId": "player-id"
  }
  ```
- **GET `/api/game/:id`**  
  Retrieve details of a specific game session.
- **POST `/api/game/:id/action`**  
  Submit an action for the current turn.
  **Request Body:**  
  ```json
  {
  "playerId": "player-id",
  "action": "Build New Feature",
  "turn": 1
  }
  ```
- **GET `/api/game/:id/event`**  
  Retrieve the last event and current turn of the game.

## Project Structure

- **`index.js`**: Entry point of the server.
- **`routes/gameRoutes.js`**: Defines API routes for game sessions.
- **`controllers/gameController.js`**: Contains logic for handling API requests.
- **`models/`**: Contains game-related models such as `MonolithPlayer`, `MonolithFeature`, and `gameSession`.
- **`middleware/`**: Contains middleware for request validation and error handling.
- **`utils/`**: Utility functions used across the project.

