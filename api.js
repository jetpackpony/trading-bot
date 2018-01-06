const binance = require('binance');
const config = require('./config');

const binanceRest = new binance.BinanceRest({
  key: config.get('API_KEY'),
  secret: config.get('API_SECRET')
});

const binanceWS = new binance.BinanceWS();

module.exports = {
  restApi: binanceRest,
  wsApi: binanceWS
};
