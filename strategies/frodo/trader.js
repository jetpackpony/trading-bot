const R = require('ramda');
const fs = require('fs');
const { round, floor } = require('math-precision');
const createDotsMaker = require('../../helpers/dots');
const {
  eraseWrite,
  consoleReset
} = require('../../helpers/ansiConsole');

const makeTrader = async (logId, postWindowSize) => {
  const getDots = createDotsMaker();
  const timeToWait = postWindowSize * 60 * 1000;
  let deals = [];
  let openDeal = null;
  let logFileName = `logs/dealsLog-${logId}.log`;

  return {
    trade: (prediction) => {
      let price = prediction.currentPrice;
      let trend = prediction.trend;
      let time  = prediction.time;
      if (openDeal) {
        let profit = round(price / openDeal.buyPrice * 100 - 100, 2);
        openDeal = updateDeal(openDeal, price, profit, time);
        if (time - openDeal.checkTime >= timeToWait) {
          if (trend === 'down') {
            eraseWrite(`Got down trend prediction, selling: `
              + `${price}${getDots()}`
              + ` (${profit}%)\n`);
            deals.push(openDeal);
            fs.writeFileSync(logFileName, JSON.stringify(deals, null, 2));
            openDeal = null;
          } else {
            eraseWrite(`Trend is going up, standing by: `
              + `${price}${getDots()}`
              + ` (${profit}%)\n`);
            openDeal.checkTime = time;
          }
        } else {
          eraseWrite(`Waiting for the time window to pass: `
            + `${price}${getDots()}`
            + ` (${profit}%)\n`);
        }
      } else {
        if (trend === 'up') {
          eraseWrite(`Buying for ${price}\n`);
          openDeal = {
            buyTime: time,
            checkTime: time,
            buyPrice: price,
            sellTime: null,
            sellPrice: null,
            profit: null
          };
        } else {
          eraseWrite(`Standing by at price: ${price}${getDots()}`);
        }
      }
    },
    getDeals: () => deals,
    closeAll: () => {
      console.log('Closing');
      deals.push(openDeal);
      fs.writeFileSync(logFileName, JSON.stringify(deals, null, 2));
      openDeal = null;
    }
  }
};

const updateDeal = (deal, price, profit, time) => {
  deal.sellPrice = price;
  deal.profit = profit;
  deal.sellTime = time;
  return deal;
};

if (require.main === module) {
  async function run() {
    const trader = await makeTrader(123, 5);

    trader.trade({
      trend: 'up',
      currentPrice: 100,
      time: 0
    });
    trader.trade({
      trend: 'up',
      currentPrice: 101,
      time: 5 * 60 * 1000
    });
    trader.trade({
      trend: 'down',
      currentPrice: 102,
      time: 2 * 5 * 60 * 1000
    });
    trader.trade({
      trend: 'up',
      currentPrice: 101,
      time: 3 * 5 * 60 * 1000
    });
    trader.trade({
      trend: 'down',
      currentPrice: 102,
      time: 4 * 5 * 60 * 1000
    });
  };
  run();
}

module.exports = makeTrader;
