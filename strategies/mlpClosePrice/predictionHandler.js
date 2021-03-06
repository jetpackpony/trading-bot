const R = require('ramda');

const handlePrediction =
  R.curry(async (timeToWait, comission, prediction, deals, actions) => {
    let { price, trend, time } = prediction;
    let { closed, open } = deals;
    let action = R.merge(prediction, { action: 'none' });
    if (open) {
      let profit = price / open.buyPrice - 1;
      open = updateDeal(comission, open, price, profit, time);
      if (time - open.checkTime >= timeToWait) {
        if (trend === 'down') {
          console.log(`Got down trend prediction, selling: ${price} (${profit})`);
          closed.push(open);
          open = null;
          action.action = 'sell';
        } else {
          console.log(`Trend is going up, standing by: ${price} (${profit})`);
          open.checkTime = time;
        }
      } else {
        console.log(`Waiting for the time window to pass: ${price} (${profit})`);
      }
    } else {
      if (trend === 'up') {
        console.log(`Buying for ${price}`);
        open = {
          buyTime: time,
          checkTime: time,
          buyPrice: price,
          sellTime: null,
          sellPrice: null,
          profit: null
        };
        action.action = 'buy';
      } else {
        console.log(`Standing by at price: ${price}`);
      }
    }
    return {
      deals: { closed, open },
      actions: R.append(action, actions)
    };
  });

const updateDeal = (comission, deal, price, profit, time) => {
  deal.sellPrice = price;
  deal.profit = profit;
  deal.sellTime = time;
  deal.profitWithComission = (deal.sellPrice * (1 - comission)) /
                               (deal.buyPrice * (1 + comission)) - 1;
  return deal;
};

const makeHandler = async ({ postWindowSize, comission }) => {
  if (R.any(R.isNil, [postWindowSize, comission])) {
    throw new Error(`Not all args are setup`);
  }
  return {
    handlePrediction: handlePrediction(postWindowSize * 60 * 1000, comission)
  };
};
module.exports = makeHandler;

if (require.main === module) {
  async function run() {
    let deals = { closed: [], open: null };

    deals = await handlePrediction(5 * 60 * 1000, {
      trend: 'up',
      price: 100,
      time: 0
    }, deals);
    deals = await handlePrediction(5 * 60 * 1000, {
      trend: 'up',
      price: 101,
      time: 5 * 60 * 1000
    }, deals);
    deals = await handlePrediction(5 * 60 * 1000, {
      trend: 'down',
      price: 102,
      time: 2 * 5 * 60 * 1000
    }, deals);
    deals = await handlePrediction(5 * 60 * 1000, {
      trend: 'up',
      price: 101,
      time: 3 * 5 * 60 * 1000
    }, deals);
    deals = await handlePrediction(5 * 60 * 1000, {
      trend: 'down',
      price: 102,
      time: 4 * 5 * 60 * 1000
    }, deals);
  };
  run();
}
