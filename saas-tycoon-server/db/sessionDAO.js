const mongoGameSession = require('./mongoGameSession');

class SessionDAO {
  constructor() {
    this.sessions = {}; // in-memory fallback
    this.mongoAvailable = false;
    this.init();
  }

  async init() {
    try {
      // Try connecting to MongoDB
      await mongoGameSession.getAllSessions();
      this.mongoAvailable = true;
    } catch (err) {
      console.warn('MongoDB unavailable, using in-memory session store.');
      this.mongoAvailable = false;
    }
  }

  async getAllSessions() {
    if (this.mongoAvailable) {
      return await mongoGameSession.getAllSessions();
    }
    return Object.values(this.sessions);
  }

  async getSessionById(id) {
    if (this.mongoAvailable) {
      return await mongoGameSession.getSessionById(id);
    }
    return this.sessions[id];
  }

  async saveSession(session) {
    if (this.mongoAvailable) {
      return await mongoGameSession.saveSession(session);
    }
    this.sessions[session.id] = session;
    return session;
  }

  async updateSessionFields(id, update) {
    if (this.mongoAvailable) {
      return await mongoGameSession.updateSessionFields(id, update);
    }
    if (this.sessions[id]) {
      Object.assign(this.sessions[id], update);
      return this.sessions[id];
    }
    return null;
  }
}

module.exports = new SessionDAO();