const { MongoClient, ObjectId } = require('mongodb');

// --- OpenTelemetry ---
const { metrics, trace } = require('@opentelemetry/api');
const meter = metrics.getMeter('mongoGameSession');
const tracer = trace.getTracer('mongoGameSession');

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

async function connect(parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'connect' });
    return tracer.startActiveSpan('mongoGameSession.connect', { parent: parentSpan }, async (span) => {
        try {
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            db = client.db(dbName);
            collection = db.collection(collectionName);
            return collection;
        } catch (err) {
            errorCount.add(1, { function: 'connect' });
            span.recordException(err);
            throw new Error('Failed to connect to MongoDB');
        } finally {
            requestDuration.record(Date.now() - start, { function: 'connect' });
            span.end();
        }
    });
}

async function saveSession(session, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'saveSession' });
    return tracer.startActiveSpan('mongoGameSession.saveSession', { parent: parentSpan }, async (span) => {
        try {
            const col = await connect(span);
            if (session._id) {
                await col.replaceOne({ _id: session._id }, session, { upsert: true });
            } else {
                const result = await col.insertOne(session);
                session._id = result.insertedId;
            }
            return session;
        } catch (err) {
            errorCount.add(1, { function: 'saveSession' });
            span.recordException(err);
            throw new Error('Failed to save session');
        } finally {
            requestDuration.record(Date.now() - start, { function: 'saveSession' });
            span.end();
        }
    });
}

async function getSessionById(id, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionById' });
    return tracer.startActiveSpan('mongoGameSession.getSessionById', { parent: parentSpan }, async (span) => {
        try {
            const col = await connect(span);
            return await col.findOne({ id });
        } catch (err) {
            errorCount.add(1, { function: 'getSessionById' });
            span.recordException(err);
            throw new Error('Failed to fetch session');
        } finally {
            requestDuration.record(Date.now() - start, { function: 'getSessionById' });
            span.end();
        }
    });
}

async function getAllSessions(parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getAllSessions' });
    return tracer.startActiveSpan('mongoGameSession.getAllSessions', { parent: parentSpan }, async (span) => {
        try {
            const col = await connect(span);
            return await col.find({}).toArray();
        } catch (err) {
            errorCount.add(1, { function: 'getAllSessions' });
            span.recordException(err);
            throw new Error('Failed to fetch sessions');
        } finally {
            requestDuration.record(Date.now() - start, { function: 'getAllSessions' });
            span.end();
        }
    });
}

async function getOngoingSessionList(parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getOngoingSessions' });
    return tracer.startActiveSpan('mongoGameSession.getOngoingSessions', { parent: parentSpan }, async (span) => {
        try {
            const col = await connect(span);
            const sessionList =  await col.find({ state: { $ne: 'finished' } }).project({ id: 1, name: 1, state: 1, playerCount: { $size: "$players" }, playerLimit: 1, currentTurn: 1, total_turns: 1, createdAt: 1, finishedAt: 1 }).toArray();
            return sessionList;
        } catch (err) {
            errorCount.add(1, { function: 'getOngoingSessions' });
            span.recordException(err);
            throw new Error('Failed to fetch ongoing sessions');
        } finally {
            requestDuration.record(Date.now() - start, { function: 'getOngoingSessions' });
            span.end();
        }
    });

}

async function updateSessionFields(id, update, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'updateSessionFields' });
    return tracer.startActiveSpan('mongoGameSession.updateSessionFields', { parent: parentSpan }, async (span) => {
        try {
            const col = await connect(span);
            return await col.updateOne({ id }, { $set: update });
        } catch (err) {
            errorCount.add(1, { function: 'updateSessionFields' });
            span.recordException(err);
            throw new Error('Failed to update session');
        } finally {
            requestDuration.record(Date.now() - start, { function: 'updateSessionFields' });
            span.end();
        }
    });
}

async function close(parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'close' });
    return tracer.startActiveSpan('mongoGameSession.close', { parent: parentSpan }, async (span) => {
        try {
            await client.close();
        } catch (err) {
            errorCount.add(1, { function: 'close' });
            span.recordException(err);
        } finally {
            requestDuration.record(Date.now() - start, { function: 'close' });
            span.end();
        }
    });
}

async function getSessionsFinishedSince(timestamp, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionsFinishedSince' });
    return tracer.startActiveSpan('mongoGameSession.getSessionsFinishedSince', { parent: parentSpan }, async (span) => {
        try {
            const col = await connect(span);
            return await col.find({ state: 'finished', createdAt: { $gte: timestamp } }).toArray();
        } catch (err) {
            errorCount.add(1, { function: 'getSessionsFinishedSince' });
            span.recordException(err);
            throw new Error('Failed to fetch sessions');
        } finally {
            requestDuration.record(Date.now() - start, { function: 'getSessionsFinishedSince' });
            span.end();
        }
    });
}

module.exports = {
    saveSession,
    getSessionById,
    getAllSessions,
    updateSessionFields,
    close,
    getSessionsFinishedSince,
    getOngoingSessionList,
};