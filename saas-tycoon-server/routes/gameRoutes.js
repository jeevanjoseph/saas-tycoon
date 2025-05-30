const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/', gameController.getAllSessions);
router.post('/', gameController.createSession);
router.post('/:id/join', gameController.joinSession);
router.post('/:id/ready', gameController.setPlayerReady);
router.get('/:id', gameController.getGameSession);
router.get('/:id/event', gameController.getLastEvent);
router.post('/:id/action', gameController.performAction);

module.exports = router;