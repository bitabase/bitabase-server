const connectWithCreate = require('./connectWithCreate');
const sqlite = require('sqlite-fp');

const cachedConnections = new Map();
const clearTimers = new Map();

function upClearTimer (config, databaseFile) {
  const existingTimer = clearTimers.get(databaseFile);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    sqlite.close(cachedConnections.get(databaseFile));
    cachedConnections.delete(databaseFile);
  }, config.databaseKeepAlive);
  clearTimers.set(databaseFile, timer);
}

function getConnection (config, databaseFile, callback) {
  if (cachedConnections.get(databaseFile)) {
    upClearTimer(config, databaseFile);
    return callback(null, cachedConnections.get(databaseFile));
  }

  connectWithCreate(databaseFile, function (error, connection) {
    connection.timeOpened = Date.now();
    upClearTimer(config, databaseFile);
    if (connection) {
      cachedConnections.set(databaseFile, connection);
    }
    callback(error, connection);
  });
}

function flushCache () {
  clearTimers.forEach(clearTimeout);
  clearTimers.clear();
  cachedConnections.clear();
}

module.exports = {
  getConnection,
  flushCache
};
