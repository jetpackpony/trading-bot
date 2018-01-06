const R = require('ramda');
const { restApi, wsApi } = require('./api');

const getPrices = R.pick([
  "currDayClosingPrice",
  "bestBidPrice",
  "bestAskPrice"
]);

wsApi.onTicker('ETHBTC', (data) => {
  console.log(getPrices(data));
});
