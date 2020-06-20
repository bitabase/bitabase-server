const { promisify } = require('util');

const rqlite = {
  connect: promisify(require('rqlite-fp/connect')),
  getAll: promisify(require('rqlite-fp/getAll')),
  getOne: promisify(require('rqlite-fp/getOne')),
  run: promisify(require('rqlite-fp/run'))
};

async function setupServerSyncer (config) {
  const hostAddress = `http://${config.bindHost}:${config.bindPort}`;

  if (!config.rqliteAddr) {
    console.log('Syncing Disabled: No rqlite address provided');
    return;
  }

  const dbConnection = await rqlite.connect(config.rqliteAddr, {
    retries: 3,
    retryDelay: 250,
    onRetry: () => console.log('Could not connect to: ' + config.dataServer + '. Trying again...')
  });

  await rqlite.run(dbConnection, 'CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY AUTOINCREMENT, host TEXT, lastPing INTEGER)');

  async function pingSelfInDatabase () {
    const server = await rqlite.getOne(dbConnection, 'SELECT * FROM servers WHERE host = ?', [hostAddress]);
    if (!server) {
      await rqlite.run(dbConnection, 'INSERT INTO servers (host, lastPing) VALUES (?, ?)', [hostAddress, Date.now()]);
    } else {
      await rqlite.run(dbConnection, 'UPDATE servers SET lastPing = ? WHERE host = ?', [Date.now(), hostAddress]);
    }
  }

  const timer = setInterval(pingSelfInDatabase, 5000);

  pingSelfInDatabase();

  function stop (callback) {
    clearInterval(timer);
    callback && callback();
  }

  return {
    stop
  };
}

module.exports = setupServerSyncer;