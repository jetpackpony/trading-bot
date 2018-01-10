const R = require('ramda');
const { round, floor } = require('math-precision');
const inquirer = require('inquirer');
const { config, checkArg } = require('./config');
const {
  tickPrice,
  sellPair,
  buyPair
} = require('./api');
const createDotsMaker = require('./helpers/dots');
const {
  eraseWrite,
  consoleReset
} = require('./helpers/ansiConsole');

checkArg('pairName');
checkArg('purchasePrice');
checkArg('amount');

const pairName = config.get('pairName');
const purchasePrice = config.get('purchasePrice');
const amount = config.get('amount');
const buySell = (config.get('buySell') || 'SELL').toUpperCase();
// take-profit-price = profitLossRatio * stop-loss-price
const profitLossRatio = config.get('profitLossRatio') || 1.5;
// lower loss border in percent
const stopLoss = config.get('stopLoss') || 0.075;

const stopLossPrice = round(purchasePrice * (1 - stopLoss), 8);
const takeProfitPrice =
  round(purchasePrice * (1 + stopLoss * profitLossRatio), 8);

console.log(`             Watching: ${pairName}`);
console.log(`               Amount: ${amount}`);
console.log(`         Purchased at: ${purchasePrice.toFixed(8)}`);
console.log(`Order side (BUY/SELL): ${buySell}`)
console.log(`    Profit/Loss ratio: ${profitLossRatio}`);
console.log(`            Stop loss: ${stopLoss * 100}%`);
const stopLossPercent = (stopLossPrice / purchasePrice * 100).toFixed(2);
console.log(`         Stop loss at: ${stopLossPrice.toFixed(8)} (${stopLossPercent}%)`);
const takeProfitPercent = (takeProfitPrice / purchasePrice * 100).toFixed(2);
console.log(`       Take profit at: ${takeProfitPrice.toFixed(8)} (${takeProfitPercent}%)`);

inquirer
  .prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'All correct?',
    default: false
  })
  .then(({ confirm }) => {
    if (confirm) {
      return true;
    } else {
      throw Error("cancelled by user");
    }
  })
  .then(() => {
    eraseWrite('Connecting to the thing...', 1);
    let selling = false;
    const socket = tickPrice(pairName, (price) => {
      if (!selling) {
        if (shouldBuySell(price, stopLossPrice, takeProfitPrice)) {
          selling = true;
          if (buySell === 'SELL') {
            sell(pairName, amount, price);
          } else {
            buy(pairName, amount, price);
          }
        } else {
          wait(pairName, price);
        }
      }
    });

    const shouldBuySell = (price, stopLossPrice, takeProfitPrice) => {
      return (price <= stopLossPrice || price >= takeProfitPrice);
    };

    const sell = (pairName, amount, price) => {
      eraseWrite(`       Selling at: ${price}\n`);
      sellPair(pairName, amount, price, (err, data) => {
        if (err) {
          console.log(`Failed to sell. Err: ${err}`);
          console.log(`Data: ${JSON.stringify(data)}`);
        } else {
          console.log(`Created orderId: ${data.orderId}`, data);
        }
        consoleReset();
        socket.close();
      });
    };

    const buy = (pairName, amount, price) => {
      const amt = floor(amount / price, 5);
      eraseWrite(`Trying to buy ${amt} at ${price}\n`);
      buyPair(pairName, amt, price, (err, data) => {
        if (err) {
          console.log(`Failed to buy. Err: ${err}`);
          console.log(`Data: ${JSON.stringify(data)}`);
        } else {
          console.log(`Created orderId: ${data.orderId}`, data);
        }
        consoleReset();
        socket.close();
      });
    };

    const getDots = createDotsMaker();
    const wait = (pairName, price) => {
      const prc = `${price} (${(price / purchasePrice * 100).toFixed(2)}%)`
      eraseWrite(`        Current price: ${prc}${getDots()}`);
    };
  })
  .catch((err) => {
    console.error(err);
  });
