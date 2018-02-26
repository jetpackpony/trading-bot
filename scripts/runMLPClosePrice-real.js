const R = require('ramda');
const runStrategy = require('../runner');
const moment = require('moment');

const params = {
  symbol: 'ETHBTC',
  interval: '1m',
  limit: 60,
  tickerType: 'real',
  strategy: 'mlpClosePrice',
  postWindowSize: 20,
  modelFile: "tensorflow/t1m;w60;pw20;l1128;d10.5;l232;d20.5;lr0.01;dec0.0.bin",
  comission: 0.0005,
  logId: ''
};
const run = async () => {
  let res = await runStrategy(R.merge(
    params,
    {
      logId: `${params.symbol},${params.interval},limit=${params.limit},`
        + `strat=${params.strategy},postWindowSize=${params.postWindowSize},`
        + `comission=${params.comission},${moment().valueOf()}`
    }
  ));
  console.log('Results: ', res);
};

run();

