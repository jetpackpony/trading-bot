const R = require('ramda');
const { buyAndWait, sellAndWait } = require('../../api');

const shouldWeSell = (deal, cutoff) => {
  const profit = deal.profitWithComission;

  return (profit <= -cutoff || profit >= (cutoff * 2));
};
const handlePrediction =
  R.curry(async (realMoney, positionSize, comission, cutoff, prediction, deals, actions) => {
    let { price, trend, time } = prediction;
    let { closed, open } = deals;
    let action = R.merge(prediction, { action: 'none' });

    if (open) {
      let profit = price / open.buyPrice - 1;
      open = updateDeal(comission, cutoff, open, price, profit, time);
      if (open.sellPriceWithComission < open.stopLoss) {
        if (realMoney) {
          console.log(`Selling for real money, position: ${positionSize}`);
          let sell = await sellAndWait('ETHBTC', positionSize, price, 10 * 1000);
          if (sell.success) {
            closed.push(open);
            open = null;
            action.action = 'sell';
          } else {
            console.log("Something went wrong:");
            console.log(sell);
          }
        } else {
          closed.push(open);
          open = null;
          action.action = 'sell';
        }
      }
    } else {
      let buyInLimit = R.propOr(NaN, 'buyInLimit', R.last(actions));
      if (trend === 'down' && isNaN(buyInLimit)) {
        action.buyInLimit = price * (1 + cutoff);
      }
      if (!isNaN(buyInLimit)) {
        if (price > buyInLimit) {
          if (realMoney) {
            console.log(`Buying for real money, position: ${positionSize}`);
            let buy = await buyAndWait('ETHBTC', positionSize, price, 10 * 1000);
            if (buy.success) {
              const buyPriceWithComission = price * (1 + comission);
              open = {
                buyTime: time,
                checkTime: time,
                buyPrice: price,
                buyPriceWithComission,
                sellTime: null,
                sellPrice: null,
                profit: null,
                profitWithComission: null,
                takeProfit: cutoff,
                stopLoss: buyPriceWithComission * (1 - cutoff)
              };
              action.action = 'buy';
            } else {
              console.log("Something went wrong:");
              console.log(buy);
            }
          } else {
            const buyPriceWithComission = price * (1 + comission);
            open = {
              buyTime: time,
              checkTime: time,
              buyPrice: price,
              buyPriceWithComission,
              sellTime: null,
              sellPrice: null,
              profit: null,
              profitWithComission: null,
              takeProfit: cutoff,
              stopLoss: buyPriceWithComission * (1 - cutoff)
            };
            action.action = 'buy';
          }
        } else {
          const newBuyInLimit = price * (1 + cutoff);
          if (newBuyInLimit < buyInLimit || isNaN(buyInLimit)) {
            buyInLimit = newBuyInLimit;
          }
          action.buyInLimit = buyInLimit;
        }
      }
    }
    return {
      deals: { closed, open },
      actions: R.append(action, actions)
    };
  });

const updateDeal = (comission, cutoff, deal, price, profit, time) => {
  deal.sellPrice = price;
  deal.sellPriceWithComission = deal.sellPrice * (1 - comission);
  deal.profit = profit;
  deal.sellTime = time;
  deal.profitWithComission = deal.sellPriceWithComission /
                               deal.buyPriceWithComission - 1;

  const newStopLoss = deal.sellPriceWithComission * (1 - cutoff);
  deal.stopLoss =
    (newStopLoss > deal.stopLoss)
    ? newStopLoss
    : deal.stopLoss;
  return deal;
};

const makeHandler = async ({ comission, cutoff, realMoney, positionSize }) => {
  if (R.any(R.isNil, [comission, cutoff, realMoney, positionSize])) {
    throw new Error(`Not all args are setup`);
  }
  return {
    handlePrediction: handlePrediction(realMoney, positionSize, comission, cutoff )
  };
};

module.exports = makeHandler;


if (require.main === module) {
  async function run() {
    let deals = { closed: [], open: null };

    deals = await handlePrediction(0.0005, {
      trend: 'up',
      price: 100,
      time: 0
    }, deals);
  };
  run();
}
