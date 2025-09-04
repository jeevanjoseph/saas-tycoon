const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.post('/playerlist-upload', playerController.playerlistUpload);

module.exports = router;