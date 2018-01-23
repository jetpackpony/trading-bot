const moment = require('moment');
//const makeTicker = require('./realTicker');
const makeTicker = require('./backtestTicker');
const makePredictor = require('./strategies/frodo/predictor');
const makeTrader = require('./strategies/frodo/trader');

const symbol = 'ETHBTC';
const interval = '1m';
const intervalMs = 1 * 60 * 1000;
const postWindowSize = 20;
const limit = 2;
const fileName = "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv";

async function run() {
  const ticker = await makeTicker({ symbol, interval, limit, fileName });
  const predictor = await makePredictor({ intervalMs });
  const trader = await makeTrader("test", postWindowSize);

  ticker.on('data', predictor.predict);
  predictor.on('prediction', trader.trade);

  const tick = ticker.start();
  predictor.on('ready', tick);
  tick();

  ticker.on('end', ({ err, data }) => {
    trader.closeAll();
    console.log('Things ended: ', err, data);
    console.log('Deals here: ', trader.getDeals());
  });
};

run();



