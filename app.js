const R = require('ramda');
const cursor = require('ansi')(process.stdout);
const { restApi, wsApi } = require('./api');
const round = require('math-precision').round;

const pairName = 'LTCBTC';
const purchasePrice = 0.017255;
const amount = 0.2;
const ratio = 2;            // take-profit-diff = ratio * stop-loss-diff
const stopLossDiff = 0.05;  // in percent

const stopLoss = round(purchasePrice * (1 - stopLossDiff), 8);
const takeProfit = round(purchasePrice * (1 + stopLossDiff * ratio), 8);

console.log(`Price:          ${purchasePrice}`);
console.log(`Stop loss at:   ${stopLoss}`);
console.log(`Take profit at: ${takeProfit}`);
cursor.write('Waiting for prices...');

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
  cursor.horizontalAbsolute(0).eraseLine();
  cursor.write(`Selling at ${price}\n`);
  cursor.reset();
};

const makeDots = (num) => R.times(() => ".", num).join("");
let dotsNum = 1;
const wait = (price) => {
  cursor.horizontalAbsolute(0).eraseLine();
  cursor.write(`Waiting at ${price}${makeDots(dotsNum)}`);
  dotsNum++;
  if (dotsNum % 7 === 0) {
    dotsNum = 1;
  }
};
