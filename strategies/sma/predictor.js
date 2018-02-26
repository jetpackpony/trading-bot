const R = require('ramda');
const math = require('mathjs');
const talib = require('talib');
const { SMA } = require('../../ta-promise');

const makePredictor = async ({ short_period, long_period }) => {
  if (R.any(R.isNil, [short_period, long_period])) {
    throw new Error(`Not all args are setup`);
  }
  const getShort = SMA(short_period);
  const getLong = SMA(long_period);

  return {
    predict: async (klines) => {
      const prices = R.pluck('close')(klines);
      const short = await getShort(prices);
      const long = await getLong(prices);
      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        stratData: {
          shortSMA: R.last(short),
          longSMA: R.last(long)
        }
      };
      if (R.last(short) > R.last(long)) {
        res.trend = 'up';
      }
      if (R.last(short) < R.last(long)) {
        res.trend = 'down';
      }
      return res;
    }
  }
};

module.exports = makePredictor;

if (require.main === module) {
  async function run() {
    let data = [1,2,3,4,5,6,7,8,9,10,11,12,13];
    let res = await SMA(8, data);
    console.log(res);
  };
  run();
}
