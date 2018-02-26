const R = require('ramda');
const math = require('mathjs');
const { EMA, SMA } = require('../../ta-promise');
const { slope } = require('../../mathUtils');

const divMean = -4.4741849547267676e-10;
const divStd = 0.0000010083310600294418;
const divMin = divMean - divStd * 3;
const divMax = divMean + divStd * 3;

const normalize = (x, v) => {
  const min = Math.min(...x);
  const max = Math.max(...x);
  return R.map(v => ((v - min) / (max - min)), x);
};
const norm = (min, max, v) => {
  return (v - min) / (max - min);
};
const getSlopes = R.map(R.pathOr(0, ['stratData', 'longSlope']));
const calcSlope = R.curry((num, data) => {
  const x = R.times(R.identity, num);
  const y = R.takeLast(num, data);

  return slope(x, y);
});
const makePredictor = async ({ short_period, middle_period, long_period }) => {
  if (R.any(R.isNil, [ short_period, middle_period, long_period ])) {
    throw new Error(`Not all args are setup`);
  }
  const getLong = SMA(long_period);
  const getSlope = calcSlope(8);     // 3

  return {
    predict: async (klines, actions) => {
      const prices = R.pluck('close')(klines);
      const long = await getLong(prices);
      const longSlope = getSlope(long);

      const size = 30;
      const tenSlopes = getSlopes(R.takeLast(size, actions));
      const slopesSMA =
        (tenSlopes.length >= size)
        ? R.last(await SMA(size, tenSlopes))
        : 0;

      const slopesDivergence = longSlope - slopesSMA;
      /*
      const slopesDs = R.append(slopesDivergence,
        R.map(R.path(['stratData', 'slopesDivergence']), R.takeLast(5000, actions)));
      let min = math.min(slopesDs);
      let max = math.max(slopesDs);
      */
      const slopeDNorm = norm(divMin, divMax, slopesDivergence);

      /*
      const slopes = R.append(longSlope,
        R.map(R.path(['stratData', 'longSlope']), R.takeLast(5000, actions)));
      let slopeMin = math.min(slopes);
      let slopeMax = math.max(slopes);
      const slopeNorm = norm(slopeMin, slopeMax, longSlope);
      */

      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        stratData: {
          long: R.last(long),
          longSlope,
          slopeNorm: slopeDNorm,
          slopesSMA,
          slopesDivergence,
          /*
          slopeMin,
          slopeMax,
          */
        }
      };
      if (slopeDNorm <= 0.25) {
        res.trend = 'up';
      }
      if (slopeDNorm >= 0.75) {
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
