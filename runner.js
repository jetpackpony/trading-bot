const R = require('ramda');
const moment = require('moment');
const makeRealTicker = require('./realTicker');
const makeBacktestTicker = require('./backtestTicker');
const makeTrader = require('./trader');
const makePredictor = require('./strategies/mlpClosePrice/predictor');
const { handlePrediction } = require('./strategies/mlpClosePrice/trader');

const symbol = 'ETHBTC';
const interval = '1m';
const postWindowSize = 20;
const limit = 60;
const comission = 0.0005;
const fileName = "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv";
//const fileName = "analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv";
//const tickerType = 'real';
//const logId = moment().valueOf();
const tickerType = 'backtest';
const logId = 'test';

async function run() {
  const predictor = await makePredictor();
  const trader = await makeTrader({
    logId,
    predictor,
    handlePrediction: handlePrediction(postWindowSize * 60 * 1000, comission),
  });

  if (tickerType === 'backtest') {
    const ticker = await makeBacktestTicker({ limit, fileName });
    await ticker.start(trader.handleData);
    console.log(JSON.stringify(getStats(trader.getDeals()), null, 2));
  } else {
    const ticker = await makeRealTicker({ symbol, interval, limit });
    ticker.start();
    ticker.on('data', trader.handleData);
  }

  console.log('Completed');
};

run();

const getStats = ({ closed, open }) => {
  const deals = R.append(open, closed);
  return {
    numDeals: deals.length,
    totalProfit: R.sum(R.pluck('profit', deals)),
    totalProfitWithComission: R.sum(R.pluck('profitWithComission', deals))
  };
};

