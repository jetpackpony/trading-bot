const R = require('ramda');

const handlePrediction =
  R.curry(async (comission, prediction, deals) => {
    let { price, trend, time } = prediction;
    let { closed, open } = deals;
    if (open) {
      let profit = price / open.buyPrice - 1;
      open = updateDeal(comission, open, price, profit, time);
      if (trend === 'down') {
        if (Math.abs(open.profitWithComission) >= 0.01) {
          console.log(`Got down trend prediction, selling: ${price} (${open.profitWithComission})`);
          closed.push(open);
          open = null;
        }
      } else {
        console.log(`Trend is going up, standing by: ${price} (${open.profitWithComission})`);
        open.checkTime = time;
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
      } else {
        console.log(`Standing by at price: ${price}`);
      }
    }
    return { closed, open };
  });

const updateDeal = (comission, deal, price, profit, time) => {
  deal.sellPrice = price;
  deal.profit = profit;
  deal.sellTime = time;
  deal.profitWithComission = (deal.sellPrice * (1 - comission)) /
                               (deal.buyPrice * (1 + comission)) - 1;
  return deal;
};

module.exports = ({ comission }) => {
  if (R.any(R.isNil, [comission])) {
    throw new Error(`Not all args are setup`);
  }
  return handlePrediction(comission);
};

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