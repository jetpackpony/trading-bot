const R = require('ramda');
const runStrategy = require('../runner');

const params = {
  strategy: 'stochRSI',
  tickerType: 'backtest',
  fileName: "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv",
  //fileName: "analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  logId: 'test',
  cutoff: 0.01
};
const run = async () => {
  let res = await runStrategy(R.merge(
    params,
    {
      limit: 300
    }
  ));
  console.log('Results: ', res);
};

run();

