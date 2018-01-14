const R = require('ramda');
const fs = require('fs');
const path = require('path');
const { round } = require('math-precision');
const { rangeStep } = require('./featuresUtils');
const { extractFeatures } = require('./featuresHistoryWindow');
require('console.table');
const {
  eraseWrite,
  consoleReset
} = require('./helpers/ansiConsole');

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
const postWindowSizes = [1, 2];
const percents = [0.01, 0.02];
/*
 * Setup for minute-based data
 *
const windowSize = 10 * 60;
const postWindowSizes = [3 * 60, 4 * 60];
const percents = [0.01, 0.02];
*/

// Calculate values in ranges
let windowRanges = rangeStep(
  round(60 / tickInterval), ...postWindowSizes);
let percentRanges =
  R.map(R.flip(round)(2), rangeStep(0.01, ...percents));

// Assemble parameter combinations
let combs = R.compose(
  R.map(R.prepend(windowSize)),
  R.map((v) => R.append(R.last(v), v)),
  R.xprod
)(windowRanges, percentRanges);

// Add combinactions with topPercent = 2 * bottomPercent
combs = R.concat(
  combs,
  R.map(
    (v) => R.append(round(R.last(v) / 2, 3), v.slice(0, -1))
  )(combs)
);

// Extract features for each param combination
console.log(`Created ${combs.length} params combinations`);
async function runThem() {
  let res = [];
  let i = 0;
  for (let comb of combs) {
    eraseWrite(`Processing [${comb}] `
      + `(${round(i++ / combs.length * 100)}% done)`);
    try {
      res.push(await extractFeatures(inputFile, outputFile,
                                tickInterval, ...comb));
    } catch(e) {
      console.log(e);
    }
  }
  consoleReset();
  console.log('');
  // Print everything and save in json file
  outputInfo(inputFile, res);
}

const sortByProfPerDay =
  R.sortWith([R.descend(R.prop('profPerDay'))]);
const outputInfo =
  (fileName, res) => {
    fs.writeFile(
      `${fileName}-featuresParams.json`,
      JSON.stringify(res, null, 2),
      'utf8',
      () => console.log('saved output as json')
    );
    console.table(R.map((line) => {
      return {
        w: line.windowSize,
        p: line.postWindowSize,
        tp: line.topPercent,
        bp: line.bottomPercent,
        te: line.totalExamples,
        pos: line.posExamples,
        posp: `${round(
          line.posExamples / line.totalExamples * 100)}%`,
        posg: line.posWithGaps,
        posgp: `${round(
          line.posWithGaps / line.totalExamples * 100)}%`,
        deals: round(line.dealsPerDay, 2),
        prof: `${round(line.expectedProfit * 100, 2)}%`,
        profPd: `${round(line.profPerDay * 100, 2)}%`
      };
    }, sortByProfPerDay(res)));
  };

runThem();
