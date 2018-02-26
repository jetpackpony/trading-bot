const R = require('ramda');
const math = require('mathjs');
const { EMA, SMA } = require('../../ta-promise');
const { slope } = require('../../mathUtils');

const divMean = 0.0009597739775666071;
const divStd = 0.014946732088916531;

const normalize = (x, v) => {
  const min = Math.min(...x);
  const max = Math.max(...x);
  return R.map(v => ((v - min) / (max - min)), x);
};
const meanNormalize = (xs, v) => {
  const all = R.append(v, xs);
  const mean = math.mean(all);
  const std = math.std(all);
  return (v - mean) / std;
};
const getSign = (v) => v / math.abs(v);
const cutNegative = (v) => (v < 0) ? 0 : v;
const meanNormalizeSign = (xs, v) => {
  const all = R.map(math.abs, R.append(v, xs));
  const mean = math.mean(all);
  const std = math.std(all);
  return getSign(v) * cutNegative((math.abs(v) - mean) / std);
};
const minMaxNormalizeSign = (xs, v) => {
  const all = R.map(math.abs, R.append(v, xs));
  const min = math.min(all);
  const max = math.max(all);
  return getSign(v) * ((math.abs(v) - min) / (max - min));
};

const norm = (min, max, v) => {
  let res = (v - min) / (max - min);
  if (res < 0) {
    res = 0;
  }
  if (res > 1) {
    res = 1;
  }
  return res;
};
const meanNomr = (mean, std, v) => {
  return (v - mean) / std;
};
const getSlopes = R.map(R.pathOr(0, ['stratData', 'longSlope']));
const calcSlope = R.curry((num, data) => {
  const x = R.times(R.identity, num);
  const y = R.takeLast(num, data);

  return slope(x, y);
});
const filter = (filt, value) => {
  return (math.abs(value) <= filt)
    ? 0
    : value
};
const getDiv = (short, long, price) => {
  //return filter(0.02, (short - long) / price);
  return (short - long) / price;
};
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
  const getShort = SMA(shortSMA);
  const getLong = SMA(longSMA);

  return {
    predict: async (klines, actions) => {
      const prices = R.pluck('close')(klines);
      const short = R.last(await getShort(prices));
      const long = R.last(await getLong(prices));
      const div = getDiv(short, long, R.last(prices));
      //const lastDivs = R.map(R.path(['stratData', 'div']), R.takeLast(normalizePeriod, actions));
      //const divNorm = meanNormalize(lastDivs, div);
      let divNorm = meanNomr(divMean, divStd, div);
      if (divNorm > -normCutoff && divNorm < normCutoff) {
        divNorm = 0;
      }

      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        stratData: {
          short,
          long,
          div,
          divNorm
        }
      };
      if (divNorm < 0) {
        res.trend = 'down';
      }
      if (divNorm > 0) {
        res.trend = 'up';
      }
      return res;
    }
  }
};

module.exports = makePredictor;

if (require.main === module) {
  console.log(calcSlope(4, [-24, 15, 1,2,3]));
}
