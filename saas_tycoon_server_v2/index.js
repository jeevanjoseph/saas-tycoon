const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const gameRoutes = require('./routes/gameRoutes');
app.use('/api/game', gameRoutes);

app.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});