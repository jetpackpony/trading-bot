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
  short_period: 3,
  long_period: 5,
  cutoff: 0.01
};
const run = async () => {
  let res = await runStrategy(R.merge(
    params,
    {
      limit: R.max(params.short_period, params.long_period),
      logId: `${params.symbol},${params.interval},limit=${params.limit},`
        + `strat=${params.strategy},short=${params.short_period},`
        + `long=${params.long_period},cutoff=${params.cutoff},`
        + `comission=${params.comission},${moment().valueOf()}`
    }
  ));
  console.log('Results: ', res);
};

run();

