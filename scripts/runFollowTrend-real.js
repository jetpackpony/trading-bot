const R = require('ramda');
const runStrategy = require('../runner');
const moment = require('moment');

const params = {
  strategy: 'followTrend',
  tickerType: 'real',
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  logId: '',
  cutoff: 0.01,
  shortSMA: 10,
  longSMA: 100,
  normalizePeriod: 30,
  normCutoff: 1,
  plotInterval: 1,
  realMoney: false,
  positionSize: 0.012,
  logToDB: true,
};

const run = async () => {
  try {
    let res = await runStrategy(R.merge(
      params,
      {
        limit: 600,
        logId: `realSocketFakeMoney;${moment().format("Y-M-D_H:m:s")}`
      }
    ));
    console.log('Results: ', res);
  } catch(e) {
    console.log(e);

  }
};

run();

