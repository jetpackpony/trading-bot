const R = require('ramda');
const fs = require('fs');
const renderChart = require('../../charts/renderChart');
const {
  getCommands,
  getValuesForIndices,
  getBuyIndices,
  getSellIndices,
} = require('../../charts/chartUtils');

const plot = R.curry((fileName, dirName, actions) => {
  const prices = R.pluck('price', actions);
  const indices = R.times(R.identity, actions.length);
  const commands = R.zip(indices, R.pluck('action', actions));
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
  const smaShort = {
    x: indices,
    y: R.map(R.path(['stratData', 'shortSMA']), actions),
    mode: 'lines',
    name: 'SMA short',
    line: {
      color: '#FF3F33',
    },
  };
  const smaLong = {
    x: indices,
    y: R.map(R.path(['stratData', 'longSMA']), actions),
    mode: 'lines',
    name: 'SMA long',
    line: {
      color: '#3390FF',
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

  const chartData = [
    closePrices, smaShort, smaLong,
    buyPoints, sellPoints
  ];

  return renderChart(chartData, {}, fileName, dirName);
});

const makePlotter = async ({
  strategy,
  short_period,
  long_period
}) => {
  if (R.any(R.isNil, [
    strategy,
    short_period,
    long_period
  ])) {
    throw new Error(`Not all args are setup`);
  }

  const dirName = strategy;
  const fileName = `short=${short_period},long=${long_period}`;
  return {
    plot: plot(fileName, dirName)
  };
};

module.exports = makePlotter;

if (require.main === module) {
  async function run() {
    const plotter = await makePlotter({
      strategy: 'test',
      short_period: 5,
      long_period: 30
    });
    plotter.plot([
      {
        trend: 'up',
        price: 1,
        time: 1,
        stratData: {
          shortSMA: 0.5,
          longSMA: 0.3
        }
      },
      {
        trend: 'up',
        price: 2,
        time: 2,
        stratData: {
          shortSMA: 1.3,
          longSMA: 0.9
        }
      },
      {
        trend: 'down',
        price: 3,
        time: 3,
        stratData: {
          shortSMA: 2.6,
          longSMA: 1.3
        }
      },
      {
        trend: 'down',
        price: 3,
        time: 4,
        stratData: {
          shortSMA: 2.3,
          longSMA: 1.2
        }
      },
    ])
  };
  run();
}
