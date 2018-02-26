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

  const rsi = {
    x: indices,
    y: R.map(R.path(['stratData', 'rsi']), actions),
    mode: 'lines',
    name: 'RSI',
    line: {
      color: '#5353DD',
    },
  };
  const closePrices = {
    x: indices,
    y: prices,
    mode: 'lines',
    name: 'Close Prices',
    line: {
      color: '#7E7E7E',
    },
    yaxis: 'y2',
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
    yaxis: 'y2',
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
    yaxis: 'y2',
  };

  const chartData = [ rsi, closePrices, buyPoints, sellPoints ];
  const layout = {
    yaxis: {domain: [0, 0.19], fixedrange: true, range: [0, 100]},
    yaxis2: {domain: [0.21, 1]},
    shapes: [{
      type: 'rect',
      xref: 'paper',
      yref: 'y',
      x0: 0,
      x1: 1,
      y0: 30,
      y1: 70,
      fillcolor: '#d3d3d3',
      opacity: 0.2,
      layer: 'below',
      line: {
        width: 1
      }
    }]
  };

  return renderChart(chartData, layout, fileName, dirName);
});

const makePlotter = async ({
  strategy,
}) => {
  if (R.any(R.isNil, [
    strategy,
  ])) {
    throw new Error(`Not all args are setup`);
  }

  const dirName = strategy;
  const fileName = `test`;
  return {
    plot: plot(fileName, dirName)
  };
};

module.exports = makePlotter;

if (require.main === module) {
  async function run() {
    const plotter = await makePlotter({
      strategy: 'test',
    });
    console.log(plotter.plot([
      {
        trend: 'up',
        action: 'buy',
        price: 1,
        time: 1,
        stratData: {
          rsi: 10,
        }
      },
      {
        trend: 'up',
        action: 'none',
        price: 2,
        time: 2,
        stratData: {
          rsi: 30,
        }
      },
      {
        trend: 'down',
        action: 'sell',
        price: 3,
        time: 3,
        stratData: {
          rsi: 80,
        }
      },
      {
        trend: 'down',
        action: 'none',
        price: 3,
        time: 4,
        stratData: {
          rsi: 60,
        }
      },
    ]));
  };
  run();
}
