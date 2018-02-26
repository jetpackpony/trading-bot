const R = require('ramda');
const runStrategy = require('../runner');
const moment = require('moment');

const params = {
  symbol: 'ETHBTC',
  tickerType: 'real',
  interval: '1m',
  strategy: 'ema',
  comission: 0.0005,
  logId: '',
  short_period: 15,
  long_period: 44,
  filter_power: 0.8,
  cutoff: 0.01,
  limit: 100,
  plotInterval: 1
};
const run = async () => {
  let res = await runStrategy(R.merge(
    params,
    {
      logId: `${params.symbol},${params.interval},limit=${params.limit},`
        + `strat=${params.strategy},short=${params.short_period},`
        + `long=${params.long_period},cutoff=${params.cutoff},`
        + `comission=${params.comission},${moment().valueOf()}`
    }
  ));
  console.log('Results: ', res);
};

run();

