const R = require('ramda');
const { buyAndWait, sellAndWait } = require('../../api');

const lastNAreDown = (n) => R.compose(
  R.all(R.equals('down')),
  R.pluck('trend'),
  R.takeLast(n),
);
const lastNAreUp = (n) => R.compose(
  R.all(R.equals('up')),
  R.pluck('trend'),
  R.takeLast(n),
);

const prevTrends = 5;
const curTrends = 5;
const allAreDown = R.all(R.equals('down'));
const allAreUp = R.all(R.equals('up'));
const sellTrend = [allAreUp, allAreDown];
const buyTrend = [allAreDown, allAreUp];
const shouldWeMove = (move) => R.compose(
  R.apply(R.useWith(R.and, (move === 'buy') ? buyTrend : sellTrend)),
  R.splitAt(prevTrends),
  R.pluck('trend'),
  R.takeLast(prevTrends + curTrends)
);
const shouldWeBuy = shouldWeMove('buy');
const shouldWeSell = shouldWeMove('sell');

const handlePrediction =
  R.curry(async (realMoney, positionSize, comission, cutoff, prediction, deals, actions) => {
    let { price, trend, time } = prediction;
    let { closed, open } = deals;
    let action = R.merge(prediction, { action: 'none' });

    if (open) {
      let profit = price / open.buyPrice - 1;
      open = updateDeal(comission, cutoff, open, price, profit, time);
      //if (trend === 'down' && shouldWeSell(actions)) {
      if (trend === 'down' && R.propOr(true, 'trend', R.last(actions)) === 'up') {
        if (realMoney) {
          console.log(`Selling for real money, position: ${positionSize}`);
        } else {
          closed.push(open);
          open = null;
          action.action = 'sell';
        }
      }
    } else {
      //if (trend === 'up' && shouldWeBuy(actions)) {
      if (trend === 'up' && R.propOr(true, 'trend', R.last(actions)) === 'down') {
        if (realMoney) {
          console.log(`Buying for real money, position: ${positionSize}`);
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
    let actions = [
      { trend: 'down' },
      { trend: 'down' },
      { trend: 'down' },
      { trend: 'down' },
      { trend: 'down' },
      { trend: 'up' },
      { trend: 'up' },
      { trend: 'up' },
      { trend: 'up' },
      { trend: 'up' },
    ];
    console.log(shouldWeBuy(actions));
  };
  run();
}
