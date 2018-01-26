const R = require('ramda');
const moment = require('moment');
const makeRealTicker = require('./realTicker');
const makeBacktestTicker = require('./backtestTicker');
const makeTrader = require('./trader');
const argv = require('minimist')(process.argv.slice(2));

const args = R.merge(
  {
    strategy: null,
    tickerType: 'backtest',
    symbol: null,
    interval: '1m',
    limit: null,
    comission: 0.0005,
    logId: moment().valueOf()
  },
  argv
);

if (R.any(R.isNil, args)) {
  throw new Error(`Not all args are setup ${JSON.stringify(args, null, 2)}`);
}

const makePredictor = require(`./strategies/${args.strategy}/predictor`);
const makeHandler = require(`./strategies/${args.strategy}/predictionHandler`);

async function run() {
  const predictor = await makePredictor(args);
  const trader = await makeTrader({
    logId: args.logId,
    predictor,
    handlePrediction: makeHandler(args)
  });

  if (args.tickerType === 'backtest') {
    const ticker = await makeBacktestTicker(args);
    await ticker.start(trader.handleData);
    console.log(JSON.stringify(getStats(trader.getDeals()), null, 2));
  } else {
    const ticker = await makeRealTicker(args);
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

