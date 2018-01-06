const R = require('ramda');

const createDotsMaker = (min = 1, max = 7) => {
  let dotsNum = min - 1;
  const makeDots = (num) => R.times(() => ".", num).join("");
  return () => {
    dotsNum++;
    if (dotsNum % max === 0) {
      dotsNum = min - 1;
    }
    return makeDots(dotsNum);
  };
};

module.exports = createDotsMaker;
