const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'saas_tycoon';
const collectionName = 'players';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;
let collection;

async function connect() {
    await client.connect();
    db = client.db(dbName);
    collection = db.collection(collectionName);
    return collection;
}

async function insertMany(players) {
    const col = await connect();
    return await col.insertMany(players);
}

async function findByCode(playerCode) {
    const col = await connect();
    return await col.findOne({ playerCode });
}

module.exports = {
    insertMany,
    findByCode,
};