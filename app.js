const R = require('ramda');
const { restApi, wsApi } = require('./api');

const pairName = 'LTCBTC';
const purchasePrice = 0.017255;
const amount = 0.2;
const ratio = 2;            // take-profit-diff = ratio * stop-loss-diff
const stopLossDiff = 0.05;  // in percent

const stopLoss = purchasePrice * (1 - stopLossDiff);
const takeProfit = purchasePrice * (1 + stopLossDiff * ratio);

console.log(`Price:          ${purchasePrice}`);
console.log(`Stop loss at:   ${stopLoss}`);
console.log(`Take profit at: ${takeProfit}`);

const getPrice = R.prop("currDayClosingPrice");

wsApi.onTicker(pairName, (data) => {
  const price = getPrice(data);
  (shouldSell(price))
    ? sell(price)
    : wait(price);
});

const shouldSell = (price) => {
  return (price <= stopLoss || price >= takeProfit);
};

const sell = (price) => {
  console.log(`Selling at ${price}`);
};

const wait = (price) => {
  console.log(`Waiting at ${price}`);
};
