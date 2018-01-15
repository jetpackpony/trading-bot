const R = require('ramda');
const fs = require('fs');
const path = require('path');
const { round } = require('math-precision');
const { rangeStep } = require('./featuresUtils');
const { extractFeatures } = require('./featuresHistoryWindow');
const { config, loadScriptConfig, checkArg } = require('./config');
require('console.table');
const {
  eraseWrite,
  consoleReset
} = require('./helpers/ansiConsole');

loadScriptConfig('selectFeaturesParams');
checkArg('tickInterval');
checkArg('inputFile');
checkArg('windowSize');
checkArg('postWindowSizeRange');
checkArg('percentsRange');

// The size of each data point in minutes
const tickInterval = config.get('tickInterval');
const inputFile = config.get('inputFile');
const outputFile = `${inputFile}-features.csv`;

// Calculate values from ranges
let windowSizeValues = rangeStep(round(60 / tickInterval),
                            ...config.get('postWindowSizeRange'));
let percentValues = R.map(R.flip(round)(2),
                rangeStep(0.01, ...config.get('percentsRange')));

// Assemble parameter combinations
let combs = R.compose(
  R.map(R.prepend(config.get('windowSize'))),
  R.map((v) => R.append(R.last(v), v)),
  R.xprod
)(windowSizeValues, percentValues);

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
