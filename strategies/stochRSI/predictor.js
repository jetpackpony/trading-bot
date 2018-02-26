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
      const { slowK, slowD } = await StochRSI(prices);
      const rsi = await RSI(14, prices);
      const prev = R.takeLast(2, slowK)[0];
      const cur = R.last(slowK);
      const k = R.last(slowK);
      const d = R.last(slowD);
      const r = R.last(rsi);

      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        stratData: {
          slowK: R.last(slowK),
          slowD: R.last(slowD)
        }
      };
      debugger;
      if (prev < 20 && cur >= 20) {
        res.trend = 'up';
      }
      if (prev > 80 && cur <= 80) {
        res.trend = 'down';
      }
      /*
      if (k < 20 && d < 20 && k > d) {
        res.trend = 'up';
      }
      if (k > 80 && d > 80 && k < d) {
        res.trend = 'down';
      }
      */
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
    let res = await StochRSI(data);
    console.log(res);
  };
  run();
}

