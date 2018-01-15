const R = require('ramda');
const fs = require('fs');
const csv = require('fast-csv');
const { round } = require('math-precision');
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

      let writeCSVStream;
      let writeToCSV;
      if (writeData) {
        writeCSVStream = csv.createWriteStream();
        const writableStream = fs.createWriteStream(outputFile);
        writeCSVStream.pipe(writableStream);
        writeToCSV =
          writeCSVStream.write.bind(writeCSVStream);
      }

      let curWindow = [];
      let totalExamples = 0;
      let posExamples = 0;
      let ys = [];
      const readCSVSteam =
        csv()
        .on("data", function(line){
          // Header line gets removed before we start to work
          curWindow.push(line);
          if (curWindow.length > windowSize + postWindowSize) {
            curWindow = curWindow.slice(1);
            let wind = convWindow(curWindow);
            totalExamples++;
            ys.push(R.last(wind));
            (R.last(wind) === 1) ? posExamples++ : null;
            if (writeData) {
              writeToCSV(wind);
            }
          }
        })
        .on("end", function(){
          if (writeData) {
            writeCSVStream.end();
          }
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
      const readFileStream = fs.createReadStream(inputFile);
      readFileStream.pipe(readCSVSteam);
    });
  };

module.exports = {
  extractFeatures
};
