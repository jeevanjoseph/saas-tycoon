const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/api/game', gameController.getAllSessions);
router.post('/api/game', gameController.createSession);
router.post('/api/game/:id/join', gameController.joinSession);
router.post('/api/game/:id/ready', gameController.setPlayerReady);
router.get('/api/game/:id', gameController.getGameSession);
router.get('/api/game/:id/event', gameController.getGameSession);
router.post('/api/game/:id/action', gameController.getGameSession);

module.exports = router;