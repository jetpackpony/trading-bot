const R = require('ramda');

const pow = R.flip(Math.pow);
/**
 * Slope of a function
 * (n*sum((xy)) - sum(x)*sum(y)) / (n*sum(x^2) - sum(x)^2)
 */
const slope = R.curry((x, y) => {
  const n = x.length;
  return (n * R.sum(R.map(R.product, R.zip(x, y))) - R.sum(x) * R.sum(y)) /
          (n * R.sum(R.map(pow(2), x)) - pow(2, R.sum(x)));

});

module.exports = {
  slope
}

if (require.main === module) {
  let x = [1,2,3,4,5];
  let y = [1,2,3,4,5];

  console.log(slope([1,2], [1,2]));
  console.log(slope(x, y));
  debugger;
}
