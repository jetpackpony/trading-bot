const nconf = require('nconf');
const path = require('path');

nconf
  .argv()
  .env([
    'API_KEY',
    'API_SECRET'
  ])
  .file({
    file: path.join(
      __dirname,
      `${process.env.NODE_ENV || 'development'}.config.json`
    )
  })
  .defaults({
    'RAW_DATA_PATH': path.join(
      __dirname, '..', 'analyser', 'rawData')
  });

// Check for required settings
checkConfig('API_KEY');
checkConfig('API_SECRET');

function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
}
function checkArg (argName) {
  if (!nconf.get(argName)) {
    throw new Error(`You must set ${argName} as an argument`);
  }
}

function loadScriptConfig (scriptName) {
  nconf
    .file({
      file: path.join(
        __dirname,
        'scriptConfig',
        `${scriptName}.json`
      )
    });
}

module.exports = {
  config: nconf,
  checkArg,
  loadScriptConfig
};
