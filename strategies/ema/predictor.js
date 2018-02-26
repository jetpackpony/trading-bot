const R = require('ramda');
const math = require('mathjs');
const { EMA, RSI } = require('../../ta-promise');

const getEMARates = R.map(R.pathOr(0, ['stratData', 'emaRate']));
const filter = (filt, value) => {
  return (math.abs(value) <= filt)
    ? 0
    : value
};
const makePredictor = async ({ short_period, long_period, filter_power }) => {
  if (R.any(R.isNil, [short_period, long_period, filter_power])) {
    throw new Error(`Not all args are setup`);
  }
  const getShort = EMA(short_period);
  const getLong = EMA(long_period);

  return {
    predict: async (klines, actions) => {
      const prices = R.pluck('close')(klines);
      const short = await getShort(prices);
      const long = await getLong(prices);
      const rsi = await RSI(28, prices);

      const cur = R.last(short);
      const prev = R.pathOr(NaN, ['stratData', 'shortEMA'], R.last(actions));
      const emaRate = cur / prev - 1;
      const filt = math.std(R.append(emaRate, getEMARates(actions))) * filter_power;
      const filteredRate = filter(filt, emaRate);

      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        stratData: {
          emaRate,
          rsi: R.last(rsi),
          shortEMA: cur,
          longEMA: R.last(long)
        }
      };
      if (filteredRate > 0) {
        res.trend = 'up';
      }
      if (filteredRate < 0) {
        res.trend = 'down';
      }
      /*
      if (R.last(short) > R.last(long)) {
        res.trend = 'up';
      }
      if (R.last(short) < R.last(long)) {
        res.trend = 'down';
      }
      */
      return res;
    }
  }
};

module.exports = makePredictor;

if (require.main === module) {
  async function run() {
    let data = [1,3,4,5,6,7,8,9,10,11,12,13,14,15];
    let res = await EMA(8, data);
    console.log(res);
  };
  run();
}
