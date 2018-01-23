const R = require('ramda');
const fs = require('fs');
const readline = require('readline');
const {
  eraseWrite,
  consoleReset
} = require('./helpers/ansiConsole');

const countLines =
  (file) => {
    return 264125;
  };

const sliceFile =
  (
    inputFile,
    outputFile,
    startLine,
    endLine
  ) => {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(inputFile);

      const outputStream = fs.createWriteStream(outputFile);
      const inputStream = readline.createInterface({
        input: fs.createReadStream(inputFile)
      });
      let count = 0;
      inputStream
        .on('line', (line) => {
          count++;
          if (count >= startLine && count <= endLine) {
            outputStream.write(line + '\n');
          }
        })
        .on("end", () => {
          console.log('done');
        });

    });
  };

sliceFile(
  'analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_.csv',
  'analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_7k.csv',
  countLines() - 7000,
  Infinity
)
  .then((res) => {
    console.log(res);
  })
  .catch((res) => {
    console.error(res);
  });
