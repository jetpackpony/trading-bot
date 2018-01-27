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
  const emaShort = {
    x: indices,
    y: R.map(R.path(['stratData', 'shortEMA']), predictions),
    mode: 'lines',
    name: 'EMA short',
    line: {
      color: '#FF3F33',
    },
  };
  const emaLong = {
    x: indices,
    y: R.map(R.path(['stratData', 'longEMA']), predictions),
    mode: 'lines',
    name: 'EMA long',
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
    closePrices, emaShort, emaLong,
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
          shortEMA: 0.5,
          longEMA: 0.3
        }
      },
      {
        trend: 'up',
        price: 2,
        time: 2,
        stratData: {
          shortEMA: 1.3,
          longEMA: 0.9
        }
      },
      {
        trend: 'down',
        price: 3,
        time: 3,
        stratData: {
          shortEMA: 2.6,
          longEMA: 1.3
        }
      },
      {
        trend: 'down',
        price: 3,
        time: 4,
        stratData: {
          shortEMA: 2.3,
          longEMA: 1.2
        }
      },
    ])
  };
  run();
}
