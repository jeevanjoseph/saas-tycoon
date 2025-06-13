const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'saas_tycoon';
const collectionName = 'game_sessions';

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
);
let db;
let collection;

async function connect() {
    try {

        await client.connect();
        await client.db("admin").command({ ping: 1 });
        db = client.db(dbName);
        collection = db.collection(collectionName);

        return collection;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw new Error('Failed to connect to MongoDB');
    }
}

async function saveSession(session) {
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
        console.error('Error saving session:', err);
        throw new Error('Failed to save session');
    }
}

async function getSessionById(id) {
    try {
        const col = await connect();
        return await col.findOne({ id });
    } catch (err) {
        console.error('Error fetching session by id:', err);
        throw new Error('Failed to fetch session');
    }
}

async function getAllSessions() {
    try {
        const col = await connect();
        return await col.find({}).toArray();
    } catch (err) {
        console.error('Error fetching all sessions:', err);
        throw new Error('Failed to fetch sessions');
    }
}

async function updateSessionFields(id, update) {
    try {
        const col = await connect();
        return await col.updateOne({ id }, { $set: update });
    } catch (err) {
        console.error('Error updating session fields:', err);
        throw new Error('Failed to update session');
    }
}

module.exports = {
    saveSession,
    getSessionById,
    getAllSessions,
    updateSessionFields,
};