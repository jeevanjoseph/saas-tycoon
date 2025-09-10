const mongoPlayer = require('./mongoPlayer');

// --- OpenTelemetry ---
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('playerDAO');

const requestCount = meter.createCounter('player_dao_requests', {
  description: 'Count of requests to playerDAO functions'
});
const errorCount = meter.createCounter('player_dao_errors', {
  description: 'Count of errors in playerDAO functions'
});
const requestDuration = meter.createHistogram('player_dao_duration_ms', {
  description: 'Duration of playerDAO functions in ms'
});

class PlayerDAO {
    constructor() {
        this.players = {}; // in-memory fallback
        this.mongoAvailable = false;
        this.init();
    }

    async init() {
        const start = Date.now();
        requestCount.add(1, { function: 'init' });
        try {
            await mongoPlayer.findByCode('__test__');
            this.mongoAvailable = true;
            console.log('DB is available for player storage.');
        } catch (err) {
            errorCount.add(1, { function: 'init' });
            console.warn('MongoDB unavailable, using in-memory player store.');
            this.mongoAvailable = false;
        } finally {
            requestDuration.record(Date.now() - start, { function: 'init' });
        }
    }

    async insertMany(players) {
        const start = Date.now();
        requestCount.add(1, { function: 'insertMany' });
        try {
            if (this.mongoAvailable) {
                return await mongoPlayer.insertMany(players);
            }
            for (const player of players) {
                this.players[player.playerCode] = player;
            }
            return { insertedCount: players.length };
        } catch (err) {
            console.error('Error importing players:', err);
            errorCount.add(1, { function: 'insertMany' });
            throw err;
        } finally {
            requestDuration.record(Date.now() - start, { function: 'insertMany' });
        }
    }

    async findByCode(playerCode) {
        const start = Date.now();
        requestCount.add(1, { function: 'findByCode' });
        try {
            if (this.mongoAvailable) {
                return await mongoPlayer.findByCode(playerCode);
            }
            return this.players[playerCode] || null;
        } catch (err) {
            console.error(`Error finding player by code ${playerCode}:`, err);
            errorCount.add(1, { function: 'findByCode' });
            throw err;
        } finally {
            requestDuration.record(Date.now() - start, { function: 'findByCode' });
        }
    }

    async findByEmail(playerEmail) {
        const start = Date.now();
        requestCount.add(1, { function: 'findByEmail' });
        try {
            if (this.mongoAvailable) {
                return await mongoPlayer.findByEmail(playerEmail);
            }
            return this.players[Object.values(this.players).find(p => p.playerEmail === playerEmail)?.playerCode] || null;
        } catch (err) {
            console.error(`Error finding player by email ${playerEmail}:`, err);
            errorCount.add(1, { function: 'findByEmail' });
            throw err;
        } finally {
            requestDuration.record(Date.now() - start, { function: 'findByEmail' });
        }
    }
}

module.exports = new PlayerDAO();