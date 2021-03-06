const R = require('ramda');
const runStrategy = require('../runner');

const params = {
  symbol: 'ETHBTC',
  interval: '1m',
  limit: 60,
  tickerType: 'backtest',
  fileName: "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv",
  strategy: 'mlpClosePrice',
  postWindowSize: 20,
  modelFile: "tensorflow/t1m;w60;pw20;l1128;d10.5;l232;d20.5;lr0.01;dec0.0.bin",
  comission: 0.0005,
  logId: 'test',
};
const run = async () => {
  let res = await runStrategy(params);
  console.log('Results: ', res);
};

run();

