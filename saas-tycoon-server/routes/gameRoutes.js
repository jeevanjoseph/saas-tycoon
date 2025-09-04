const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const playerController = require('../controllers/playerController');

router.get('/', gameController.getAllSessions);
router.post('/', gameController.createSession);
router.get('/leaders', gameController.getTopPlayersSince);
router.post('/:id/join', gameController.joinSession);
router.post('/:id/ready', gameController.setPlayerReady);
router.get('/:id', gameController.getGameSession);
router.get('/:id/event', gameController.getLastEvent);
router.post('/:id/action', gameController.performAction);
router.post('/playerlist-upload', playerController.playerlistUpload);
router.post('/verify-player', playerController.verifyPlayer);

module.exports = router;