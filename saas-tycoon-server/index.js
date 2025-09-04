const express = require('express');
const cors = require('cors');
const app = express();
const adminApp = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 5002;

app.use(cors());
app.use(express.json());
adminApp.use(cors());
adminApp.use(express.json());

// Admin routes
const adminRoutes = require('./routes/adminRoutes');
adminApp.use('/api/admin', adminRoutes);

adminApp.listen(ADMIN_PORT, () => {
  console.log(`Admin server running on http://localhost:${ADMIN_PORT}`);
});

const gameRoutes = require('./routes/gameRoutes');
app.use('/api/game', gameRoutes);

app.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Shutting down gracefully...');
  // Perform any cleanup actions here (e.g., closing database connections)
  process.exit(0);
});