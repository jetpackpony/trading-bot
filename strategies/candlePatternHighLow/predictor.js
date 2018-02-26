const R = require('ramda');
const math = require('mathjs');
const { EMA, SMA } = require('../../ta-promise');
const { slope } = require('../../mathUtils');

const isLowerHigh = (acc, x) => {
  return acc.length === 0 || x.high >= R.last(acc).high;
};
const isLowerLow = (acc, x) => {
  return acc.length === 0 || x.low >= R.last(acc).low;
};
const isHigherHigh = (acc, x) => {
  return acc.length === 0 || x.high <= R.last(acc).high;
};
const isHigherLow = (acc, x) => {
  return acc.length === 0 || x.low <= R.last(acc).low;
};
const candleReturn = (x) => {
  return x.close - x.open;
};
const isPosCandle = (x) => {
  return candleReturn(x) > 0;
};
const isNegCandle = (x) => {
  return candleReturn(x) < 0;
};


const isDownPattern = R.allPass([
  isLowerHigh,
  isLowerLow,
  //(_, x) => isNegCandle(x)
]);
const isUpPattern = R.allPass([
  isHigherHigh,
  isHigherLow,
  (_, x) => isPosCandle(x)
]);
/*
const isUpPattern = (acc, x) => {
  return isPosCandle(x);
};
*/


const collectStreak = (condition) => R.compose(
  R.reverse,
  R.reduceWhile(condition, R.flip(R.append), []),
  R.reverse
);
const priceChange = (streak) => {
  return R.last(streak).close / streak[0].close - 1;
};

const makePredictor = async ({ short_period, middle_period, long_period }) => {
  if (R.any(R.isNil, [ short_period, middle_period, long_period ])) {
    throw new Error(`Not all args are setup`);
  }
  const getBearStreak = collectStreak(isDownPattern);
  //const getBullStreak = collectStreak(isUpPattern);
  const getShort = EMA(20);
  const getLong = EMA(70);

  return {
    predict: async (klines, actions) => {
      const prices = R.pluck('close')(klines);
      const line = R.last(klines);
      const bearStreak = getBearStreak(R.slice(0, -1, klines));
      //const bullStreak = getBullStreak(R.slice(0, -1, klines));
      const shortEMA = R.last(await getShort(prices));
      const longEMA = R.last(await getLong(prices));

      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        line,
        stratData: {
          shortEMA,
          longEMA,
        }
      };

      if (bearStreak.length > 2
        && R.last(bearStreak).high < line.high
        && priceChange(bearStreak) < -0.003
        && shortEMA > longEMA
      ) {
        res.trend = 'up';
      }
        /*
      if (bullStreak.length > 2
        && R.last(bullStreak).high > line.high
        //&& priceChange(bullStreak) > 0.003
      ) {
        res.trend = 'down';
      }
      */
      return res;
    }
  }
};

module.exports = makePredictor;

if (require.main === module) {
  console.log(calcSlope(4, [-24, 15, 1,2,3]));
}
