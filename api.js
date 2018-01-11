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

const buyPair = (pairName, qty, price, callback) => {
  binanceRest.newOrder({
    symbol: pairName,
    side: "BUY",
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

/**
 * queryObj:
 * https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#klinecandlestick-data
 */
const getKlines = (queryObj) => {
  console.log(`Querying: ${JSON.stringify(queryObj, null, 2)}`);
  return new Promise((resolve, reject) => {
    binanceRest.klines(queryObj, (err, data) => {
      if (err) {
        reject(err, data);
        return;
      }
      resolve(data);
    });
  });
};

module.exports = {
  restApi: binanceRest,
  wsApi: binanceWS,
  tickPrice,
  sellPair,
  buyPair,
  account,
  info,
  ticker24hr,
  getKlines
};
