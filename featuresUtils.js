const R = require('ramda');

const conv = (n) => R.map((v) => v ? n : 0);
const convDrops = conv(-2);
const convJumps = conv(1);
const hasJumpBeforeDrop =
  R.useWith(
    R.compose(
      R.lt(0),
      R.length,               // Count left over ones
      R.filter(R.lt(0)),      // Filter out zeros
      R.takeWhile(R.lte(0)), // Take all until negative
      R.zipWith(R.add)
    ),
    [convJumps, convDrops]
  );

const highPriceId = 1;
const lowPriceId = 2;
const willPriceJump =
  R.curry((topPercent, bottomPercent, origPrice, nextPrices) => {
    const topPrice = origPrice * (1 + topPercent);
    const bottomPrice = origPrice * (1 - bottomPercent);
    const minPrices = nextPrices.map(R.nth(lowPriceId));
    const maxPrices = nextPrices.map(R.nth(highPriceId));

    const drops = minPrices.map(R.gte(bottomPrice));
    const jumps = maxPrices.map(R.lte(topPrice));
    return hasJumpBeforeDrop(jumps, drops);
  });

const getClosePrice = R.nth(4);
const getOHLCPices = R.slice(1, 5);
const getX =
  (windowSize) => R.compose(
    R.map(getClosePrice),
    R.slice(0, windowSize)
  );

const getNextPries =
  (windowSize) => R.compose(
    R.map(getOHLCPices),
    R.slice(windowSize, Infinity)
  );

const convertWindow =
  R.curry((windowSize, willPriceJump, wind) => {
    let x = getX(windowSize)(wind);
    let nextPrices = getNextPries(windowSize)(wind);
    let y = willPriceJump(R.last(x), nextPrices) ? 1 : 0;
    return R.append(y, x);
  });

const countOnes =
  R.compose(
    R.length,
    R.filter(R.equals(1))
  );

const anyOnesInWindow =
  R.compose(
    R.any(R.equals(1)),
    R.takeLast
  );
const reducer =
  R.curry((postWindowSize, list, v) => (
    (anyOnesInWindow(postWindowSize, list))
    ? R.append(0, list)
    : R.append(v, list)
  ));
const getYWithGaps =
  (postWindowSize, ys) => (
    R.reduce(reducer(postWindowSize), [], ys)
  );

const minsInDay = 24*60;
const calcDealsPerDay =
  (tickInterval, total, posWithGaps) => (
    posWithGaps / ((tickInterval * total) / minsInDay)
  );

const rangeStep =
  (step, start, stop) => R.map(
    n => start + step * n,
    R.range(0, (1 + (stop - start) / step) >>> 0)
  );

module.exports = {
  convertWindow,
  hasJumpBeforeDrop,
  willPriceJump,
  countOnes,
  getYWithGaps,
  calcDealsPerDay,
  rangeStep,
};
