const mongoGameSession = require('./mongoGameSession');

// --- OpenTelemetry ---
const { metrics, trace } = require('@opentelemetry/api');
const meter = metrics.getMeter('sessionDAO');
const tracer = trace.getTracer('sessionDAO');

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
    this.sessions = {};
    this.mongoAvailable = false;
    this.init();
  }

  async init(parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'init' });
    return tracer.startActiveSpan('sessionDAO.init', { parent: parentSpan }, async (span) => {
      try {
        await mongoGameSession.getAllSessions(span);
        this.mongoAvailable = true;
      } catch (err) {
        errorCount.add(1, { function: 'init' });
        span.recordException(err);
        this.mongoAvailable = false;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'init' });
        span.end();
      }
    });
  }

  async getAllSessions(parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getAllSessions' });
    return tracer.startActiveSpan('sessionDAO.getAllSessions', { parent: parentSpan }, async (span) => {
      try {
        if (this.mongoAvailable) {
          return await mongoGameSession.getAllSessions(span);
        }
        return Object.values(this.sessions);
      } catch (err) {
        errorCount.add(1, { function: 'getAllSessions' });
        span.recordException(err);
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'getAllSessions' });
        span.end();
      }
    });
  }

  async getSessionById(id, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionById' });
    return tracer.startActiveSpan('sessionDAO.getSessionById', { parent: parentSpan }, async (span) => {
      try {
        if (this.mongoAvailable) {
          return await mongoGameSession.getSessionById(id, span);
        }
        return this.sessions[id];
      } catch (err) {
        errorCount.add(1, { function: 'getSessionById' });
        span.recordException(err);
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'getSessionById' });
        span.end();
      }
    });
  }

  async saveSession(session, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'saveSession' });
    return tracer.startActiveSpan('sessionDAO.saveSession', { parent: parentSpan }, async (span) => {
      try {
        if (this.mongoAvailable) {
          return await mongoGameSession.saveSession(session, span);
        }
        this.sessions[session.id] = session;
        return session;
      } catch (err) {
        errorCount.add(1, { function: 'saveSession' });
        span.recordException(err);
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'saveSession' });
        span.end();
      }
    });
  }

  async updateSessionFields(id, update, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'updateSessionFields' });
    return tracer.startActiveSpan('sessionDAO.updateSessionFields', { parent: parentSpan }, async (span) => {
      try {
        if (this.mongoAvailable) {
          return await mongoGameSession.updateSessionFields(id, update, span);
        }
        if (this.sessions[id]) {
          Object.assign(this.sessions[id], update);
          return this.sessions[id];
        }
        return null;
      } catch (err) {
        errorCount.add(1, { function: 'updateSessionFields' });
        span.recordException(err);
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'updateSessionFields' });
        span.end();
      }
    });
  }

  async getSessionByName(name, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionByName' });
    return tracer.startActiveSpan('sessionDAO.getSessionByName', { parent: parentSpan }, async (span) => {
      try {
        if (this.mongoAvailable) {
          const sessions = await mongoGameSession.getAllSessions(span);
          return sessions.find(session => session.name === name) || null;
        }
        return Object.values(this.sessions).find(session => session.name === name) || null;
      } catch (err) {
        errorCount.add(1, { function: 'getSessionByName' });
        span.recordException(err);
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'getSessionByName' });
        span.end();
      }
    });
  }

  async getSessionsFinishedSince(timestamp, parentSpan) {
    const start = Date.now();
    requestCount.add(1, { function: 'getSessionsFinishedSince' });
    return tracer.startActiveSpan('sessionDAO.getSessionsFinishedSince', { parent: parentSpan }, async (span) => {
      try {
        if (this.mongoAvailable) {
          return await mongoGameSession.getSessionsFinishedSince(timestamp, span);
        }
        return Object.values(this.sessions).filter(session => session.state === 'finished' && session.createdAt > timestamp);
      } catch (err) {
        errorCount.add(1, { function: 'getSessionsFinishedSince' });
        span.recordException(err);
        throw err;
      } finally {
        requestDuration.record(Date.now() - start, { function: 'getSessionsFinishedSince' });
        span.end();
      }
    });
  }
}

module.exports = new SessionDAO();