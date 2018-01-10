const binance = require('binance');
const R = require('ramda');
const { config } = require('./config');

const binanceRest = new binance.BinanceRest({
  key: config.get('API_KEY'),
  secret: config.get('API_SECRET')
});

const binanceWS = new binance.BinanceWS();

const getPrice = R.prop("currDayClosingPrice");
const tickPrice = (pairName, callback) => {
  return binanceWS.onTicker(pairName, (data) => {
    const price = getPrice(data);
    callback(price);
  });
};

const sellPair = (pairName, qty, price, callback) => {
  binanceRest.newOrder({
    symbol: pairName,
    side: "SELL",
    type: "LIMIT",
    timeInForce: "GTC",
    quantity: qty,
    price
  }, callback);
};

const account = (callback) => {
  binanceRest.account({}, callback);
};

const ticker24hr = (pairName, callback) => {
  binanceRest.ticker24hr({ symbol: pairName }, callback);
};

const info = (callback) => binanceRest.exchangeInfo(callback);

module.exports = {
  restApi: binanceRest,
  wsApi: binanceWS,
  tickPrice,
  sellPair,
  account,
  info,
  ticker24hr
};
