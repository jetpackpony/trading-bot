const R = require('ramda');
const math = require('mathjs');
const talib = require('talib');
const { EMA, RSI, StochRSI } = require('../../ta-promise');

const makePredictor = async () => {
  /*
  if (R.any(R.isNil, [short_period, long_period])) {
    throw new Error(`Not all args are setup`);
  } */

  return {
    predict: async (klines) => {
      const prices = R.pluck('close')(klines);
      const rsi = await RSI(14, prices);
      const r = R.last(rsi);

      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        stratData: {
          rsi: r
        }
      };
      if (r <= 20) {
        res.trend = 'up';
      }
      if (r >= 80) {
        res.trend = 'down';
      }
      return res;
    }
  }
};

module.exports = makePredictor;

const getRandomArray = (num, min = -10, max = 10) => {
  return R.times(R.partial(getRandomNumber, [min, max]), num);
};
const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};
if (require.main === module) {
  async function run() {
    let data = getRandomArray(22);
    let res = await RSI(14, data);
    console.log(res);
  };
  run();
}

