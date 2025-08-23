const mongoPlayer = require('./mongoPlayer');

class PlayerDAO {
    constructor() {
        this.players = {}; // in-memory fallback
        this.mongoAvailable = false;
        this.init();
    }

    async init() {
        try {
            // Try connecting to MongoDB
            await mongoPlayer.findByCode('__test__'); // test
            this.mongoAvailable = true;
        } catch (err) {
            console.warn('MongoDB unavailable, using in-memory player store.');
            this.mongoAvailable = false;
        }
    }

    async insertMany(players) {
        if (this.mongoAvailable) {
            return await mongoPlayer.insertMany(players);
        }
        // In-memory fallback: store by playerCode
        for (const player of players) {
            this.players[player.playerCode] = player;
        }
        return { insertedCount: players.length };
    }

    async findByCode(playerCode) {
        if (this.mongoAvailable) {
            return await mongoPlayer.findByCode(playerCode);
        }
        return this.players[playerCode] || null;
    }

    async findByEmail(playerEmail) {
        if (this.mongoAvailable) {
            return await mongoPlayer.findByEmail(playerEmail);
        }
        return this.players[Object.values(this.players).find(p => p.playerEmail === playerEmail)?.playerCode] || null;
    }
}

module.exports = new PlayerDAO();