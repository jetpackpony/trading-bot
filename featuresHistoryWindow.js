const R = require('ramda');
const fs = require('fs');
const readline = require('readline');
const { round } = require('math-precision');
const {
  eraseWrite,
  consoleReset
} = require('./helpers/ansiConsole');
let {
  convertWindow,
  willPriceJump,
  countOnes,
  getYWithGaps,
  calcDealsPerDay
} = require('./featuresUtils');

const extractFeatures =
  (
    inputFile,
    outputFile,
    tickInterval,
    windowSize,
    postWindowSize,
    topPercent,
    bottomPercent,
    writeData = false
  ) => {
    return new Promise((resolve, reject) => {
      const convWindow =
        convertWindow(windowSize,
          willPriceJump(topPercent, bottomPercent));

      const outputStream =
        (writeData)
        ? fs.createWriteStream(outputFile)
        : null;
      const inputStream = readline.createInterface({
        input: fs.createReadStream(inputFile)
      });
      let curWindow = [];
      let totalExamples = 0;
      let posExamples = 0;
      let rows = 0;
      let ys = [];
      inputStream
        .on('line', (line) => {
          eraseWrite(`Doing row ${rows++}`);
          curWindow = R.append(R.split(',', line), curWindow);
          if (curWindow.length > windowSize + postWindowSize) {
            // Header line gets removed the first time we here
            curWindow = curWindow.slice(1);
            let wind = convWindow(curWindow);
            totalExamples++;
            ys.push(R.last(wind));
            (R.last(wind) === 1) ? posExamples++ : null;
            if (writeData) {
              outputStream.write(R.join(',', wind) + '\n');
            }
          }
        })
        .on('close', () => {
          if (writeData) {
            outputStream.end();
          }
          consoleReset();
          const yWithGaps = getYWithGaps(postWindowSize, ys);
          const posWithGaps = countOnes(yWithGaps);
          const dealsPerDay =
            calcDealsPerDay(tickInterval,
              yWithGaps.length, posWithGaps);

          const expectedProfit =
            0.7 * topPercent - 0.3 * bottomPercent;
          const profPerDay =
            Math.pow(1 + expectedProfit, dealsPerDay) - 1;
          const output = {
            windowSize, postWindowSize,
            topPercent, bottomPercent,
            totalExamples, posExamples,
            posWithGaps, dealsPerDay,
            expectedProfit, profPerDay
          };
          resolve(output);
        });
    });
  };

module.exports = {
  extractFeatures
};
