const R = require('ramda');
const runStrategy = require('../runner');

const params = {
  strategy: 'sma',
  tickerType: 'backtest',
  fileName: "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  limit: 30,
  logId: 'test',
  short_period: 3,
  long_period: 30,
  cutoff: 0.01
};
const run = async () => {
  let res = await runStrategy(params);
  console.log('Results: ', res);
};

run();

