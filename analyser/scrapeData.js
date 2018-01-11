const R = require('ramda');
const fs = require('fs');
const csv = require('fast-csv');
const { getKlines } = require('../api');
const { config, checkArg } = require('../config');
const moment = require('moment');

const symbol = 'ETHBTC';
const interval = '1h';
const timeMonths = 6;
const fileName = 'test.csv';

const isDataCorrect = R.pathOr(false, ['0', 'openTime']);
const fromTime = moment().add(timeMonths * -1, 'months').valueOf();
const processLoad =
  (data) => {
    if (!isDataCorrect(data)) {
      console.log(`Failed to parse data: ${JSON.stringify(data, null, 2)}`);
      return null;
    }
    const start = data[data.length - 1].openTime;
    const end = data[0].closeTime;
    console.log(`Got data ${moment(start)} - ${moment(end)}`);

    return (start >= fromTime)
      ? getKlines({ symbol, interval, endTime: start - 1 })
      : null;
  };

async function runThings() {
  let data;
  const csvStream = csv.createWriteStream({headers: true});
  const writableStream = fs.createWriteStream(fileName);
  writableStream.on("finish", function(){
    console.log("DONE!");
  });
  csvStream.pipe(writableStream);
  const writeToCSV = csvStream.write.bind(csvStream);

  try {
    data = await getKlines({ symbol, interval });
    while(data) {
      data = data.reverse();
      data.forEach(writeToCSV);
      data = await processLoad(data);
    }
  } catch(err) {
    console.log(`Couldn't get klines: ${err}`);
    console.log(data);
  }
  csvStream.end();
}

runThings();
