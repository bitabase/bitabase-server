const righto = require('righto');
const writeResponseError = require('./writeResponseError');
const logCollectionError = require('./logCollectionError');

function handleAndLogError (config, collection, error, response) {
  console.log(error);
  const logged = righto(logCollectionError, config, collection, error);
  logged(loggerError => {
    if (loggerError && ![404].includes(loggerError.statusCode || 500)) {
      loggerError && console.log(loggerError);
    }
    writeResponseError(error, response);
  });
}

module.exports = handleAndLogError;
