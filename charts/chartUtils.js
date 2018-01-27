const R = require('ramda');

const getValuesForIndices = R.useWith(R.ap, [R.map(R.nth), R.of]);
const isBuyCommand = R.compose(R.equals('buy'), R.prop(1));
const getBuyIndices = R.compose(
  R.map(R.nth(0)),
  R.filter(isBuyCommand),
);
const isSellCommand = R.compose(R.equals('sell'), R.prop(1));
const getSellIndices = R.compose(
  R.map(R.nth(0)),
  R.filter(isSellCommand),
);

module.exports = {
  getValuesForIndices,
  isBuyCommand,
  getBuyIndices,
  isSellCommand,
  getSellIndices,
};
