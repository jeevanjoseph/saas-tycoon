const playerDAO = require('../db/playerDAO');
const csv = require('csv-parser');
const multer = require('multer');
const upload = multer();
const streamer = require('streamifier');

async function playerlistUpload(req, res) {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const results = [];
    const errors = [];
    let rowNum = 1;

    streamer.createReadStream(req.file.buffer)
        .pipe(csv(['playerFirstName', 'playerLastName', 'playerEmail', 'playerCode']))
        .on('data', (row) => {
            rowNum++;
            // Validate required fields
            if (!row.playerFirstName || !row.playerLastName || !row.playerEmail || !row.playerCode) {
                errors.push({ row: rowNum, error: 'Missing required field', data: row });
            } else {
                results.push(row);
            }
        })
        .on('end', async () => {
            if (results.length > 0) {
                try {
                    await playerDAO.insertMany(results);
                } catch (err) {
                    return res.status(500).json({ error: 'DB insert error', details: err.message });
                }
            }
            if (errors.length > 0) {
                return res.status(400).json({ message: 'Some rows could not be processed', errors });
            }
            res.json({ message: 'Upload successful', inserted: results.length });
        });
}

async function verifyPlayer(req, res) {
    const { playerCode } = req.body;
    if (!playerCode) return res.status(400).json({ error: 'playerCode required' });

    const player = await playerDAO.findByCode(playerCode);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
}

module.exports = {
    playerlistUpload: [upload.single('file'), playerlistUpload],
    verifyPlayer,
};