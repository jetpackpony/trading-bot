const R = require('ramda');
const round = require('math-precision').round;
const { tickPrice } = require('./api');
const createDotsMaker = require('./helpers/dots');
const {
  eraseWrite,
  consoleReset
} = require('./helpers/ansiConsole');



const pairName = 'LTCBTC';
const purchasePrice = 0.017255;
const amount = 0.2;
const ratio = 2;            // take-profit-diff = ratio * stop-loss-diff
const stopLossDiff = 0.05;  // in percent

const stopLoss = round(purchasePrice * (1 - stopLossDiff), 8);
const takeProfit = round(purchasePrice * (1 + stopLossDiff * ratio), 8);

console.log(`Purchase price: ${purchasePrice.toFixed(8)}`);
console.log(`Stop loss at:   ${stopLoss.toFixed(8)}`);
console.log(`Take profit at: ${takeProfit.toFixed(8)}`);
eraseWrite('Connecting to the thing...');

tickPrice(pairName, (price) => {
  (shouldSell(price, stopLoss, takeProfit))
    ? sell(pairName, price)
    : wait(pairName, price);
});

const shouldSell = (price, stopLoss, takeProfit) => {
  return (price <= stopLoss || price >= takeProfit);
};

const sell = (pairName, price) => {
  eraseWrite(`Selling at:     ${price}\n`);
  consoleReset();
};

const getDots = createDotsMaker();
const wait = (pairName, price) => {
  eraseWrite(`Waiting at:     ${price}${getDots()}`);
};
