const R = require('ramda');
const runStrategy = require('../runner');

const params = {
  strategy: 'ema',
  tickerType: 'backtest',
  fileName: "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  logId: 'test',
  short_period: 3,
  long_period: 5,
  cutoff: 0.01
};
const run = async () => {
  let res = await runStrategy(R.merge(
    params,
    {
      limit: R.max(params.short_period, params.long_period)
    }
  ));
  console.log('Results: ', res);
};

run();

