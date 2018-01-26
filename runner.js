const R = require('ramda');
const moment = require('moment');
const makeRealTicker = require('./realTicker');
const makeBacktestTicker = require('./backtestTicker');
const makeTrader = require('./trader');

const isProfitEmpty = R.compose(
  R.not,
  R.propOr(false, 'profitWithComission')
);
const filterDeals = R.compose(
  R.reject(isProfitEmpty),
  R.reject(R.isNil),
  R.append
);
const getStats = ({ closed, open }) => {
  const deals = filterDeals(open, closed);
  return {
    numDeals: deals.length,
    totalProfit: R.sum(R.pluck('profit', deals)),
    totalProfitWithComission: R.sum(R.pluck('profitWithComission', deals))
  };
};

const defaultArgs = {
  strategy: null,
  tickerType: 'backtest',
  symbol: null,
  interval: '1m',
  limit: null,
  comission: 0.0005,
  cutoff: 0.01,               // price fluctuation after which we can sell, %
  logId: moment().valueOf()
};

const runStrategy = async (arguments) => {
  const args = R.merge(defaultArgs, arguments);
  if (R.any(R.isNil, args)) {
    throw new Error(`Not all args are setup ${JSON.stringify(args, null, 2)}`);
  }
  const makePredictor = require(`./strategies/${args.strategy}/predictor`);
  const makeHandler = require(`./strategies/${args.strategy}/predictionHandler`);
  const predictor = await makePredictor(args);
  const trader = await makeTrader({
    logId: args.logId,
    predictor,
    handlePrediction: makeHandler(args)
  });

  if (args.tickerType === 'backtest') {
    const ticker = await makeBacktestTicker(args);
    await ticker.start(trader.handleData);
    return getStats(trader.getDeals());
  } else {
    const ticker = await makeRealTicker(args);
    ticker.start();
    ticker.on('data', trader.handleData);
    return { msg: "Running on a real socket" };
  }
};

module.exports = runStrategy;

if (require.main === module) {
  async function run() {
    const argv = require('minimist')(process.argv.slice(2));
    const res = await runStrategy(argv);
    console.log(JSON.stringify(res, null, 2));
  }
  run();
}

