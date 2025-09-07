const { MongoClient, ObjectId } = require('mongodb');

// --- OpenTelemetry ---
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('mongoGameSession');

const requestCount = meter.createCounter('mongo_game_session_requests', {
    description: 'Count of requests to mongoGameSession functions'
});
const errorCount = meter.createCounter('mongo_game_session_errors', {
    description: 'Count of errors in mongoGameSession functions'
});
const requestDuration = meter.createHistogram('mongo_game_session_duration_ms', {
    description: 'Duration of mongoGameSession functions in ms'
});

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'saas_tycoon';
const collectionName = 'game_sessions';

const client = new MongoClient(uri, {});
let db;
let collection;

async function connect() {
    const start = Date.now();
    requestCount.add(1, { function: 'connect' });
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        db = client.db(dbName);
        collection = db.collection(collectionName);
        return collection;
    } catch (err) {
        errorCount.add(1, { function: 'connect' });
        console.error('MongoDB connection error:', err);
        throw new Error('Failed to connect to MongoDB');
    } finally {
        requestDuration.record(Date.now() - start, { function: 'connect' });
    }
}

async function saveSession(session) {
    const start = Date.now();
    requestCount.add(1, { function: 'saveSession' });
    try {
        const col = await connect();
        if (session._id) {
            await col.replaceOne({ _id: session._id }, session, { upsert: true });
        } else {
            const result = await col.insertOne(session);
            session._id = result.insertedId;
        }
        return session;
    } catch (err) {
        errorCount.add(1, { function: 'saveSession' });
        console.error('Error saving session:', err);
        throw new Error('Failed to save session');
    } finally {
        requestDuration.record(Date.now() - start, { function: 'saveSession' });
    }
}

async function getSessionById(id) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionById' });
    try {
        const col = await connect();
        return await col.findOne({ id });
    } catch (err) {
        errorCount.add(1, { function: 'getSessionById' });
        console.error('Error fetching session by id:', err);
        throw new Error('Failed to fetch session');
    } finally {
        requestDuration.record(Date.now() - start, { function: 'getSessionById' });
    }
}

async function getAllSessions() {
    const start = Date.now();
    requestCount.add(1, { function: 'getAllSessions' });
    try {
        const col = await connect();
        return await col.find({}).toArray();
    } catch (err) {
        errorCount.add(1, { function: 'getAllSessions' });
        console.error('Error fetching all sessions:', err);
        throw new Error('Failed to fetch sessions');
    } finally {
        requestDuration.record(Date.now() - start, { function: 'getAllSessions' });
    }
}

async function updateSessionFields(id, update) {
    const start = Date.now();
    requestCount.add(1, { function: 'updateSessionFields' });
    try {
        const col = await connect();
        return await col.updateOne({ id }, { $set: update });
    } catch (err) {
        errorCount.add(1, { function: 'updateSessionFields' });
        console.error('Error updating session fields:', err);
        throw new Error('Failed to update session');
    } finally {
        requestDuration.record(Date.now() - start, { function: 'updateSessionFields' });
    }
}

async function close() {
    const start = Date.now();
    requestCount.add(1, { function: 'close' });
    try {
        await client.close();
        console.log('MongoDB connection closed gracefully.');
    } catch (err) {
        errorCount.add(1, { function: 'close' });
        console.error('Error closing MongoDB connection:', err);
    } finally {
        requestDuration.record(Date.now() - start, { function: 'close' });
    }
}

async function getSessionsFinishedSince(timestamp) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionsFinishedSince' });
    try {
        const col = await connect();
        return await col.find({ state: 'finished', createdAt: { $gte: timestamp } }).toArray();
    } catch (err) {
        errorCount.add(1, { function: 'getSessionsFinishedSince' });
        console.error('Error fetching sessions finished since timestamp:', err);
        throw new Error('Failed to fetch sessions');
    } finally {
        requestDuration.record(Date.now() - start, { function: 'getSessionsFinishedSince' });
    }
}

module.exports = {
    saveSession,
    getSessionById,
    getAllSessions,
    updateSessionFields,
    close,
    getSessionsFinishedSince,
};