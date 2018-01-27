const R = require('ramda');
const fs = require('fs');
const renderChart = require('../../charts/renderChart');
const {
  getCommands,
  getValuesForIndices,
  getBuyIndices,
  getSellIndices,
} = require('../../charts/chartUtils');

const plot = R.curry((fileName, dirName, predictions) => {
  const prices = R.pluck('price', predictions);
  const indices = R.times(R.identity, predictions.length);
  const commands = R.zip(indices, getCommands(predictions));
  const buyIndices = getBuyIndices(commands);
  const sellIndices = getSellIndices(commands);

  const closePrices = {
    x: indices,
    y: prices,
    mode: 'lines',
    name: 'Close Prices',
    line: {
      color: '#7E7E7E',
    },
  };
  const buyPoints = {
    x: buyIndices,
    y: getValuesForIndices(buyIndices, prices),
    mode: 'markers',
    name: 'Buy points',
    marker: {
      color: '#44fc65',
      size: 14
    },
  };
  const sellPoints = {
    x: sellIndices,
    y: getValuesForIndices(sellIndices, prices),
    mode: 'markers',
    name: 'Sell points',
    marker: {
      color: '#f22e7c',
      size: 14
    },
  };

  const chartData = [ closePrices, buyPoints, sellPoints ];

  return renderChart(chartData, {}, fileName, dirName);
});

const makePlotter = async ({
  strategy,
  limit,
  postWindowSize
}) => {
  if (R.any(R.isNil, [
    strategy,
    limit,
    postWindowSize
  ])) {
    throw new Error(`Not all args are setup`);
  }

  const fileName = `limit=${limit},postWindowSize=${postWindowSize}`;
  const dirName = strategy;
  return {
    plot: plot(fileName, dirName)
  };
};

module.exports = makePlotter;

if (require.main === module) {
  async function run() {
    const plotter = await makePlotter({
      strategy: 'test',
      limit: 60,
      postWindowSize: 10
    });
    console.log(plotter.plot([
      {
        trend: 'up',
        price: 1,
        time: 1,
      },
      {
        trend: 'up',
        price: 2,
        time: 2,
      },
      {
        trend: 'down',
        price: 3,
        time: 3,
      },
      {
        trend: 'down',
        price: 3,
        time: 4,
      },
    ]));
  };
  run();
}
