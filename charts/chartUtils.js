const R = require('ramda');

const lastCommand = R.compose(
  R.last,
  R.reject(R.equals('none'))
);
const getCommands = R.reduce((acc, p) => {
  if (p.trend === 'up' && lastCommand(acc) !== 'buy') {
    return R.append('buy', acc);
  }
  if (p.trend === 'down' && lastCommand(acc) !== 'sell') {
    return R.append('sell', acc);
  }
  return R.append('none', acc);
}, []);
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
  lastCommand,
  getCommands,
  getValuesForIndices,
  isBuyCommand,
  getBuyIndices,
  isSellCommand,
  getSellIndices,
};
