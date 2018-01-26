const R = require('ramda');
const math = require('mathjs');
const talib = require('talib');

const padWithNans = (count) => R.concat(R.times(() => NaN, count));
const getEMA = R.curry((period, data) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "EMA",
      startIdx: 0,
      endIdx: data.length - 1,
      inReal: data,
      optInTimePeriod: period
    }, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(padWithNans(result.begIndex)(result.result.outReal));
    });
  });
});

const makePredictor = async ({ short_period, long_period }) => {
  if (R.any(R.isNil, [short_period, long_period])) {
    throw new Error(`Not all args are setup`);
  }
  const getShort = getEMA(short_period);
  const getLong = getEMA(long_period);

  return {
    predict: async (klines) => {
      const prices = R.pluck('close')(klines);
      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime
      };
      const short = await getShort(prices);
      const long = await getLong(prices);
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
    let data = [1,3,4,5,6,7,8,9,10,11,12,13,14,15];
    let res = await getEMA(8, data);
    console.log(res);
  };
  run();
}
