const R = require('ramda');
const runStrategy = require('../runner');

const params = {
  strategy: 'ema',
  tickerType: 'backtest',
  //fileName: "analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv",
  //fileName: "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv",

  fileName: "analyser/rawData/test-sample-falling.csv",
  //fileName: "analyser/rawData/test-sample-flat.csv",
  //fileName: "analyser/rawData/test-sample-mixed.csv",
  //fileName: "analyser/rawData/test-sample-short.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  logId: 'test',
  short_period: 15,
  long_period: 10,
  cutoff: 0.01,
  filter_power: 0.8,
  //plotInterval: 500
};
const run = async () => {
  let res = await runStrategy(R.merge(
    params,
    {
      //limit: R.max(params.short_period, params.long_period)
      limit: 100
    }
  ));
  console.log('Results: ', res);
};

run();

