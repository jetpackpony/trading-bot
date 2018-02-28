const R = require('ramda');
const math = require('mathjs');
const moment = require('moment');
const makeRealTicker = require('./realTicker');
const makeBacktestTicker = require('./backtestTicker');
const makeTrader = require('./trader');

const defaultArgs = {
  strategy: null,
  tickerType: 'backtest',
  symbol: null,
  interval: '1m',
  limit: null,
  comission: 0.0005,
  cutoff: 0.01,               // price fluctuation after which we can sell, %
  logId: moment().valueOf(),
  plotInterval: 0,
  logToDB: false,
};

const runStrategy = async (arguments) => {
  const args = R.merge(defaultArgs, arguments);
  if (R.any(R.isNil, args)) {
    throw new Error(`Not all args are setup ${JSON.stringify(args, null, 2)}`);
  }
  const makePredictor = require(`./strategies/${args.strategy}/predictor`);
  const makeHandler = require(`./strategies/${args.strategy}/predictionHandler`);
  const makePlotter = require(`./strategies/${args.strategy}/plotter`);
  const makeLogger = require(`./loggers/${args.logToDB ? 'db' : 'file'}`);
  const predictor = await makePredictor(args);
  const plotter = await makePlotter(args);
  const handler = await makeHandler(args);
  const logger = await makeLogger(args);
  const trader = await makeTrader({
    plotInterval: args.plotInterval,
    predictor,
    handler,
    plotter,
    logger,
  });

  if (args.tickerType === 'backtest') {
    const ticker = await makeBacktestTicker(args);
    await ticker.start(trader.handleData);
    await trader.finish();
    console.log('Plotted at: ', trader.plotAll());
    return trader.getStats();
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

