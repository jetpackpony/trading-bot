const R = require('ramda');
const fs = require('fs');
const sleep = require('sleep').sleep;
const moment = require('moment');
const { round, floor } = require('math-precision');
const { getKlines, onKline } = require('./api');
const { isGoingToGrow } = require('./predict');
const createDotsMaker = require('./helpers/dots');
const {
  eraseWrite,
  consoleReset
} = require('./helpers/ansiConsole');

const getDots = createDotsMaker();

const stopLoss = 0.01;
const takeProfit = 0.02;
const windowSize = 24;
const postHistoryWindow = 5 * 60 * 60 * 1000;

const symbol = 'ETHBTC';
const interval = '1h';
getKlines({ symbol, interval, limit: windowSize })
  .then((initKlines) => {
    console.log(`Got ${initKlines.length} klines with the last `
      + `ending ${initKlines[initKlines.length - 1].closeTime}`);

    let klines = initKlines;
    onKline(symbol, interval, (data) => {
      klines = updateKlines(klines, data.kline);
      processNewKlines(klines);
    });

    /*
    const func = (data) => {
      klines = updateKlines(klines, data);
      processNewKlines(klines);
    };
    func({ close: 0.0911, endTime: 1 });
    sleep(1);
    func({ close: 0.0915, endTime: 1 });
    sleep(1);
    func({ close: 0.092, endTime: 1 });
    sleep(1);
    func({ close: 0.093, endTime: 1 });
    sleep(1);
    func({ close: 0.22, endTime: 1 });
    sleep(1);

    func({ close: 0.100, endTime: 1 });
    sleep(1);
    func({ close: 0.102, endTime: 1 });
    sleep(1);
    func({ close: 0.0983, endTime: 1 });
    sleep(1);
    func({ close: 0.095, endTime: 1 });

    sleep(1);
    func({ close: 0.0100, endTime: 1 });
    sleep(1);
    func({ close: 0.0101, endTime: 1 });
    sleep(1);
    func({ close: 0.01045, endTime: 1 });
    sleep(1);
    func({ close: 0.0099, endTime: 1 });
    sleep(1);
    func({ close: 0.0106, endTime: 1 });
    */

  })
  .catch((err) => {
    console.error(err);
  });

let deals = [];
let openDeal = null;
const processNewKlines = (klines) => {
  let price = R.last(klines).close;
  if (openDeal) {
    let profit = round(price / openDeal.buyPrice * 100 - 100, 2);
    if (shouldBuySell(price, openDeal.stopLossPrice,
      openDeal.takeProfitPrice)) {
      eraseWrite(`Selling at: ${price}. `
                 + `Profit/loss: ${profit}%\n`);
      openDeal = sell(openDeal, price, profit);
      deals.push(openDeal);
      openDeal = null;
    } else {
      if (moment() - openDeal.buyTime < postHistoryWindow) {
        eraseWrite(`Waiting for sale at price: `
          + `${price}${getDots()}`
          + ` (${profit}%)`);
      } else {
        eraseWrite(`Cant wait any longer, selling: `
          + `${price}${getDots()}`
          + ` (${profit}%)\n`);
        openDeal = sell(openDeal, price, profit);
        deals.push(openDeal);
        openDeal = null;
      }
    }
  } else {
    if (shouldWeBuy(klines)) {
      eraseWrite(`Buying for ${price}\n`);
      openDeal = {
        buyTime: moment(),
        buyPrice: price,
        sellTime: null,
        sellPrice: null,
        profit: null,
        stopLossPrice: round(price * (1 - stopLoss), 8),
        takeProfitPrice: round(price * (1 + takeProfit), 8)
      };
    } else {
      eraseWrite(`Standing by at price: ${price}${getDots()}`);
    }
  }
};

const sell = (deal, price, profit) => {
  deal.sellPrice = price;
  deal.profit = profit;
  deal.sellTime = moment();
  const dealJSON = JSON.stringify(deal, null, 2);
  console.log(`Deal details: ${dealJSON}`);
  fs.appendFileSync('log.log', dealJSON);
  return deal;
};

const updateKlines =
  (origKlines, line) => {
    return (R.last(origKlines).endTime === line.endTime)
      ? R.append(line, R.slice(0, -1, origKlines))
      : R.append(line, R.slice(1, Infinity, origKlines));
  };

const shouldWeBuy =
  (klines) => {
    return isGoingToGrow(R.pluck('close')(klines));
  };

const shouldBuySell =
  (price, stopLossPrice, takeProfitPrice) => {
    return (price <= stopLossPrice || price >= takeProfitPrice);
  };
