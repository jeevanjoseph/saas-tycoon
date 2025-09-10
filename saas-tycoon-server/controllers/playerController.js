const playerDAO = require('../db/playerDAO');
const csv = require('csv-parser');
const multer = require('multer');
const upload = multer();
const streamer = require('streamifier');

// --- OpenTelemetry ---
const { metrics, trace, context } = require('@opentelemetry/api');
const meter = metrics.getMeter('playerController');
const tracer = trace.getTracer('playerController');

const requestCount = meter.createCounter('player_controller_requests', {
    description: 'Count of requests to playerController functions'
});
const errorCount = meter.createCounter('player_controller_errors', {
    description: 'Count of errors in playerController functions'
});
const requestDuration = meter.createHistogram('player_controller_duration_ms', {
    description: 'Duration of playerController functions in ms'
});

async function playerlistUpload(req, res) {
    const start = Date.now();
    requestCount.add(1, { function: 'playerlistUpload' });
    const traceId = req.headers['request_X_B3_Traceid'];
    return tracer.startActiveSpan('playerlistUpload', { parent: traceId }, async (span) => {
        try {
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

        } catch (err) {
            errorCount.add(1, { function: 'playerlistUpload' });
            span.recordException(err);
            res.status(500).json({ error: 'Failed to upload player list' });
        } finally {
            requestDuration.record(Date.now() - start, { function: 'playerlistUpload' });
            span.end();
        }
    });
}


async function verifyPlayer(req, res) {
    const start = Date.now();
    requestCount.add(1, { function: 'verifyPlayer' });
    const traceId = req.headers['request_X_B3_Traceid'];
    return tracer.startActiveSpan('verifyPlayer', { parent: traceId }, async (span) => {
        try {
            const { playerCode } = req.body;
            if (!playerCode) return res.status(400).json({ error: 'playerCode required' });

            const player = await playerDAO.findByCode(playerCode);
            if (!player) return res.status(404).json({ error: 'Player not found' });
            res.json(player);
        } catch (err) {
            errorCount.add(1, { function: 'verifyPlayer' });
            span.recordException(err);
            res.status(500).json({ error: 'Failed to verify player' });
        } finally {
            requestDuration.record(Date.now() - start, { function: 'verifyPlayer' });
            span.end();
        }
    });
}

module.exports = {
    playerlistUpload: [upload.single('file'), playerlistUpload],
    verifyPlayer,
};