const R = require('ramda');
const runStrategy = require('../runner');

const params = {
  strategy: 'followTrend',
  tickerType: 'backtest',
  /*
  fileName: "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv",
  fileName: "analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv",
  fileName: "analyser/rawData/2018-01-31_ETHBTC_1m_0.5_mon_.csv",
  */
  fileName: "analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv",
  //fileName: "analyser/rawData/test-sample-falling.csv",
  //fileName: "analyser/rawData/test-sample-flat.csv",
  //fileName: "analyser/rawData/test-sample-mixed.csv",
  //fileName: "analyser/rawData/test-sample-short.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  logId: 'test',
  cutoff: 0.007,
  shortSMA: 10,
  longSMA: 100,
  normalizePeriod: 30,
  normCutoff: 1,
  realMoney: false,
  positionSize: 0.012,
  logToDB: true,
};

const run = async () => {
  try {
    let res = await runStrategy(R.merge(
      params,
      {
        //limit: R.max(params.short_period, params.long_period)
        limit: 600
      }
    ));
    console.log('Results: ', res);
  } catch(e) {
    console.log(e);

  }
};

run();

