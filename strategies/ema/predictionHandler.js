const R = require('ramda');

const handlePrediction =
  R.curry(async (comission, cutoff, prediction, deals, actions) => {
    let { price, trend, time } = prediction;
    let { closed, open } = deals;
    let action = R.merge(prediction, { action: 'none' });
    if (open) {
      let profit = price / open.buyPrice - 1;
      open = updateDeal(comission, cutoff, open, price, profit, time);
      if (open.sellPriceWithComission < open.stopLoss) {
        closed.push(open);
        open = null;
        action.action = 'sell';
      }
      /*
      if (trend === 'down') {
        //if (Math.abs(open.profitWithComission) > cutoff) {
        //console.log(`Got down trend prediction, selling: ${price} (${open.profitWithComission})`);
          closed.push(open);
          open = null;
          action.action = 'sell';
          //}
      } else {
        //console.log(`Trend is going up, standing by: ${price} (${open.profitWithComission})`);
        open.checkTime = time;
      }
      */
    } else {
      if (trend === 'up') {
        //console.log(`Buying for ${price}`);
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
        //console.log(`Standing by at price: ${price}`);
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

const makeHandler = async ({ comission, cutoff }) => {
  if (R.any(R.isNil, [comission, cutoff])) {
    throw new Error(`Not all args are setup`);
  }
  return {
    handlePrediction: handlePrediction(comission, cutoff )
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
