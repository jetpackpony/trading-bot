const moment = require('moment');
const sleep = require('sleep-promise');
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

/*
{
  "symbol": "ETHBTC",
  "orderId": 71218347,
  "clientOrderId": "Y21xgVwAQxSuvuanQz2zsO",
  "transactTime": 1517833235716,
  "price": "0.00000000",
  "origQty": "0.01300000",
  "executedQty": "0.01300000",
  "status": "FILLED",
  "timeInForce": "GTC",
  "type": "MARKET",
  "side": "BUY"
}
*/
const buyLimit = (pairName, quantity, price) => {
  return new Promise((resolve, reject) => {
    binanceRest.newOrder({
      symbol: pairName,
      side: "BUY",
      type: "LIMIT",
      timeInForce: "GTC",
      quantity,
      price
    }, (err, data) => {
      if (err) {
        reject({ err, data });
      }
      resolve(data);
    });
  });
};
const sellLimit = (pairName, quantity, price) => {
  return new Promise((resolve, reject) => {
    binanceRest.newOrder({
      symbol: pairName,
      side: "SELL",
      type: "LIMIT",
      timeInForce: "GTC",
      quantity,
      price
    }, (err, data) => {
      if (err) {
        reject({ err, data });
      }
      resolve(data);
    });
  });
};

const queryOrder = (pairName, orderId) => {
  return new Promise((resolve, reject) => {
    binanceRest.queryOrder({
      symbol: pairName,
      orderId
    }, (err, data) => {
      if (err) {
        reject({ err, data });
      }
      resolve(data);
    });
  });
};

const cancelOrder = (pairName, orderId) => {
  return new Promise((resolve, reject) => {
    binanceRest.cancelOrder({
      symbol: pairName,
      orderId
    }, (err, data) => {
      if (err) {
        reject({ err, data });
      }
      resolve(data);
    });
  });
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

const onKline = binanceWS.onKline.bind(binanceWS);

const waitUntilFilled =
  async (symbol, orderId, timeToWait = 10 * 1000, interval = 1000) => {
    try {
      const start = moment();
      let response;
      while(moment() - start < timeToWait) {
        response = await queryOrder(symbol, orderId);
        if (response.status === 'FILLED') {
          const price = parseFloat(response.price);
          return {
            success: true,
            msg: `Order filled at price ${price}`,
            price,
            quantity: response.executedQty,
            side: response.side,
            response
          };
        }
        await sleep(interval);
      }
      return {
        success: false,
        msg: `Failed to fill the order in ${timeToWait / 1000} seconds`,
        price: 0.0,
        response
      };
    } catch(err) {
      console.log(err);
      throw new Error(err);
    }
  };

const buyAndWait =
  async (symbol, quantity, price, timeToWait = 10 * 1000) => {
    try {
      let order = await buyLimit(symbol, quantity, price);
      let status = await waitUntilFilled(symbol, order.orderId, timeToWait);
      if (status.success) {
        return status;
      } else {
        let cancelRes = await cancelOrder(symbol, order.orderId);
        return status;
      }
      console.log(status);
    } catch(err) {
      console.log(err);
      throw new Error(err);
    }
  };

const sellAndWait =
  async (symbol, quantity, price, timeToWait = 10 * 1000) => {
    try {
      let order = await sellLimit(symbol, quantity, price);
      let status = await waitUntilFilled(symbol, order.orderId, timeToWait);
      if (status.success) {
        return status;
      } else {
        let cancelRes = await cancelOrder(symbol, order.orderId);
        return status;
      }
      console.log(status);
    } catch(err) {
      console.log(err);
      throw new Error(err);
    }
  };

const allOrders = (symbol, limit) => {
  return new Promise((resolve, reject) => {
    binanceRest.allOrders({
      symbol,
      limit
    }, (err, data) => {
      if (err) {
        reject(err, data);
        return;
      }
      resolve(data);
    });
  });
};

const myTrades = (symbol, limit) => {
  return new Promise((resolve, reject) => {
    binanceRest.myTrades({
      symbol,
      limit
    }, (err, data) => {
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
  buyLimit,
  sellLimit,
  queryOrder,
  account,
  info,
  ticker24hr,
  getKlines,
  onKline,
  waitUntilFilled,
  cancelOrder,
  buyAndWait,
  sellAndWait,
  allOrders,
  myTrades,
};
