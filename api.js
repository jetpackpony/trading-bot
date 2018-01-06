const binance = require('binance');
const R = require('ramda');
const config = require('./config');

const binanceRest = new binance.BinanceRest({
  key: config.get('API_KEY'),
  secret: config.get('API_SECRET')
});

const binanceWS = new binance.BinanceWS();

const getPrice = R.prop("currDayClosingPrice");
const tickPrice = (pairName, callback) => {
  binanceWS.onTicker(pairName, (data) => {
    const price = getPrice(data);
    callback(price);
  });
};

module.exports = {
  restApi: binanceRest,
  wsApi: binanceWS,
  tickPrice
};
