const R = require('ramda');
const path = require('path');
const { extractFeatures } = require('./featuresHistoryWindow');

const rawDataPath = path.join('analyser', 'rawData');

// The size of each data point in minutes
const tickInterval = 60;
const inputFile = path.join('analyser', 'rawData',
                     '2018-01-12_ETHBTC_1h_4_mon_.csv');
/*
const tickInterval = 1;
const inputFile = path.join('analyser', 'rawData',
                    '2018-01-12_ETHUSDT_1m_1_mon_.csv');
*/
const outputFile = `${inputFile}-features.csv`;

/*
 * Setup for hour-based data
 */
const windowSize = 48;
const postWindowSize = 3;
const topPercent = 0.02;
const bottomPercent = 0.01;

extractFeatures(
  inputFile,
  outputFile,
  tickInterval,
  windowSize,
  postWindowSize,
  topPercent,
  bottomPercent
)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
