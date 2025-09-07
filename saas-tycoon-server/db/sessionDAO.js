const mongoGameSession = require('./mongoGameSession');

// --- OpenTelemetry ---
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('sessionDAO');

const requestCount = meter.createCounter('session_dao_requests', {
  description: 'Count of requests to sessionDAO functions'
});
const errorCount = meter.createCounter('session_dao_errors', {
  description: 'Count of errors in sessionDAO functions'
});
const requestDuration = meter.createHistogram('session_dao_duration_ms', {
  description: 'Duration of sessionDAO functions in ms'
});

class SessionDAO {
  constructor() {
    this.sessions = {}; // in-memory fallback
    this.mongoAvailable = false;
    this.init();
  }

  async init() {
    const start = Date.now();
    requestCount.add(1, { function: 'init' });
    try {
      await mongoGameSession.getAllSessions();
      this.mongoAvailable = true;
    } catch (err) {
      errorCount.add(1, { function: 'init' });
      console.warn('MongoDB unavailable, using in-memory session store.');
      this.mongoAvailable = false;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'init' });
    }
  }

  async getAllSessions() {
    const start = Date.now();
    requestCount.add(1, { function: 'getAllSessions' });
    try {
      if (this.mongoAvailable) {
        return await mongoGameSession.getAllSessions();
      }
      return Object.values(this.sessions);
    } catch (err) {
      errorCount.add(1, { function: 'getAllSessions' });
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'getAllSessions' });
    }
  }

  async getSessionById(id) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionById' });
    try {
      if (this.mongoAvailable) {
        return await mongoGameSession.getSessionById(id);
      }
      return this.sessions[id];
    } catch (err) {
      errorCount.add(1, { function: 'getSessionById' });
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'getSessionById' });
    }
  }

  async saveSession(session) {
    const start = Date.now();
    requestCount.add(1, { function: 'saveSession' });
    try {
      if (this.mongoAvailable) {
        return await mongoGameSession.saveSession(session);
      }
      this.sessions[session.id] = session;
      return session;
    } catch (err) {
      errorCount.add(1, { function: 'saveSession' });
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'saveSession' });
    }
  }

  async updateSessionFields(id, update) {
    const start = Date.now();
    requestCount.add(1, { function: 'updateSessionFields' });
    try {
      if (this.mongoAvailable) {
        return await mongoGameSession.updateSessionFields(id, update);
      }
      if (this.sessions[id]) {
        Object.assign(this.sessions[id], update);
        return this.sessions[id];
      }
      return null;
    } catch (err) {
      errorCount.add(1, { function: 'updateSessionFields' });
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'updateSessionFields' });
    }
  }

  async getSessionByName(name) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionByName' });
    try {
      if (this.mongoAvailable) {
        const sessions = await mongoGameSession.getAllSessions();
        return sessions.find(session => session.name === name) || null;
      }
      return Object.values(this.sessions).find(session => session.name === name) || null;
    } catch (err) {
      errorCount.add(1, { function: 'getSessionByName' });
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'getSessionByName' });
    }
  }

  async getSessionsFinishedSince(timestamp) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionsFinishedSince' });
    try {
      if (this.mongoAvailable) {
        return await mongoGameSession.getSessionsFinishedSince(timestamp);
      }
      return Object.values(this.sessions).filter(session => session.state === 'finished' && session.createdAt > timestamp);
    } catch (err) {
      errorCount.add(1, { function: 'getSessionsFinishedSince' });
      throw err;
    } finally {
      requestDuration.record(Date.now() - start, { function: 'getSessionsFinishedSince' });
    }
  }
}

module.exports = new SessionDAO();