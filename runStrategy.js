//const makeTicker = require('./realTicker');
const makeTicker = require('./backtestTicker');
const makePredictor = require('./strategies/frodo/predictor');
const makeTrader = require('./strategies/frodo/trader');

const symbol = 'ETHBTC';
const interval = '1m';
const limit = 2;
const fileName = "analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv";

const ticker = makeTicker({ symbol, interval, limit, fileName });
const predictor = makePredictor();
const trader = makeTrader();

ticker.on('data', predictor.predict);
predictor.on('prediction', trader.trade);

const tick = ticker.start();
predictor.on('ready', tick);
tick();

ticker.on('end', ({ err, data }) => {
  console.log('Things ended: ', err, data);
  console.log(trader.getDeals());
});


