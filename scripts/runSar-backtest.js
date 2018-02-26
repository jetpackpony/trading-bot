const R = require('ramda');
const runStrategy = require('../runner');

const params = {
  strategy: 'sar',
  tickerType: 'backtest',
  /*
  const divMean = -4.4741849547267676e-10;
  const divStd = 0.0000010083310600294418;
  fileName: "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv",
  fileName: "analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv",
  fileName: "analyser/rawData/2018-01-31_ETHBTC_1m_0.5_mon_.csv",
  */
  fileName: "analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv",
  //fileName: "analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv",
  //fileName: "analyser/rawData/test-sample-falling.csv",
  //fileName: "analyser/rawData/test-sample-flat.csv",
  //fileName: "analyser/rawData/test-sample-mixed.csv",
  //fileName: "analyser/rawData/test-sample-short.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  logId: 'test',
  cutoff: 0.01,
  shortSMA: 10,
  longSMA: 100,
  normalizePeriod: 30,
  normCutoff: 1,
  realMoney: false,
  positionSize: 0.012,
  limit: 150,
};

const run = async () => {
  try {
    let res = await runStrategy(params);
    console.log('Results: ', res);
  } catch(e) {
    console.log(e);

  }
};

run();

