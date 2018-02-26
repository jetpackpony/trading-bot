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
const isDownTrend = R.compose(R.equals('down'), R.prop(1));
const getDownIndices = R.compose(
  R.map(R.nth(0)),
  R.filter(isDownTrend),
);

module.exports = {
  getValuesForIndices,
  isBuyCommand,
  getBuyIndices,
  isSellCommand,
  getSellIndices,
  getDownIndices,
};
