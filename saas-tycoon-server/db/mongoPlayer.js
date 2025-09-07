const { MongoClient } = require('mongodb');

// --- OpenTelemetry ---
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('mongoPlayer');

const requestCount = meter.createCounter('mongo_player_requests', {
    description: 'Count of requests to mongoPlayer functions'
});
const errorCount = meter.createCounter('mongo_player_errors', {
    description: 'Count of errors in mongoPlayer functions'
});
const requestDuration = meter.createHistogram('mongo_player_duration_ms', {
    description: 'Duration of mongoPlayer functions in ms'
});

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'saas_tycoon';
const collectionName = 'players';

const client = new MongoClient(uri, {});
let db;
let collection;

async function connect() {
    const start = Date.now();
    requestCount.add(1, { function: 'connect' });
    try {
        await client.connect();
        db = client.db(dbName);
        collection = db.collection(collectionName);
        return collection;
    } catch (err) {
        errorCount.add(1, { function: 'connect' });
        throw err;
    } finally {
        requestDuration.record(Date.now() - start, { function: 'connect' });
    }
}

async function insertMany(players) {
    const start = Date.now();
    requestCount.add(1, { function: 'insertMany' });
    try {
        const col = await connect();
        return await col.insertMany(players);
    } catch (err) {
        errorCount.add(1, { function: 'insertMany' });
        throw err;
    } finally {
        requestDuration.record(Date.now() - start, { function: 'insertMany' });
    }
}

async function findByCode(playerCode) {
    const start = Date.now();
    requestCount.add(1, { function: 'findByCode' });
    try {
        const col = await connect();
        return await col.findOne({ playerCode });
    } catch (err) {
        errorCount.add(1, { function: 'findByCode' });
        throw err;
    } finally {
        requestDuration.record(Date.now() - start, { function: 'findByCode' });
    }
}

async function findByEmail(playerEmail) {
    const start = Date.now();
    requestCount.add(1, { function: 'findByEmail' });
    try {
        const col = await connect();
        return await col.findOne({ playerEmail });
    } catch (err) {
        errorCount.add(1, { function: 'findByEmail' });
        throw err;
    } finally {
        requestDuration.record(Date.now() - start, { function: 'findByEmail' });
    }
}

module.exports = {
    insertMany,
    findByCode,
    findByEmail,
};