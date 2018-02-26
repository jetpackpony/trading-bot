const R = require('ramda');
const math = require('mathjs');
const { SAR, ADX } = require('../../ta-promise');

const makePredictor = async ({
  shortSMA,
  longSMA,
  normalizePeriod,
  normCutoff
}) => {
  if (R.any(R.isNil, [
    shortSMA,
    longSMA,
    normalizePeriod,
    normCutoff
  ])) {
    throw new Error(`Not all args are setup`);
  }
  const getSAR = SAR(0.02, 0.2);
  const getADX = ADX(14);

  return {
    predict: async (klines, actions) => {
      const data = {
        low: R.pluck('low')(klines),
        high: R.pluck('high')(klines),
        close: R.pluck('close')(klines),
      };
      const sar = R.last(await getSAR(data));
      const adx = R.last(await getADX(data));
      const price = R.last(data.close);

      let res = {
        trend: 'none',
        price,
        time: R.last(klines).endTime,
        stratData: {
          sar,
          adx,
        }
      };
      if (sar < price) {
        res.trend = 'up';
      }
      if (sar > price) {
        res.trend = 'down';
      }
      return res;
    }
  }
};

module.exports = makePredictor;

if (require.main === module) {
  console.log(calcSlope(4, [-24, 15, 1,2,3]));
}
