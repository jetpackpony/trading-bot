const R = require('ramda');
const path = require('path');
const { extractFeatures } = require('./featuresHistoryWindow');
const { config, loadScriptConfig, checkArg } = require('./config');

loadScriptConfig('extractFeatures');
checkArg('tickInterval');
checkArg('inputFile');
checkArg('windowSize');
checkArg('postWindowSize');
checkArg('topPercent');
checkArg('bottomPercent');

extractFeatures(
  config.get('inputFile'),
  `${config.get('inputFile')}-features.csv`,
  config.get('tickInterval'),
  config.get('windowSize'),
  config.get('postWindowSize'),
  config.get('topPercent'),
  config.get('bottomPercent'),
  true  // tell it to write data
)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
