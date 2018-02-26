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

  const macds = R.map(R.path(['stratData', 'macdHist']), actions);
  const maxMacds = Math.max(...R.map(Math.abs, macds)) * 1.2;
  const range = [-maxMacds, maxMacds];
  const macd = {
    x: indices,
    y: macds,
    mode: 'lines',
    name: 'MACD Hist',
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

  const chartData = [
    macd,
    closePrices,
    buyPoints, sellPoints
  ];

  const layout = {
    yaxis: {domain: [0, 0.19], fixedrange: true, range },
    yaxis2: {domain: [0.21, 1]},
    shapes: [{
      type: 'line',
      xref: 'paper',
      yref: 'y',
      x0: 0,
      x1: 1,
      y0: 0,
      y1: 0,
      fillcolor: '#d3d3d3',
      layer: 'below',
      opacity: 0.2,
      line: {
        width: 1
      }
    }]
  };

  return renderChart(chartData, layout, fileName, dirName);
});

const makePlotter = async ({
  strategy,
  fast_period,
  slow_period,
  signal_period
}) => {
  if (R.any(R.isNil, [
    strategy,
    fast_period,
    slow_period,
    signal_period
  ])) {
    throw new Error(`Not all args are setup`);
  }

  const dirName = strategy;
  const fileName = `fast=${fast_period},slow=${slow_period},signal=${signal_period}`;
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
    console.log(plotter.plot([
      {
        trend: 'up',
        action: 'buy',
        price: 1,
        time: 1,
        stratData: {
          macdHist: 0.023,
        }
      },
      {
        trend: 'up',
        action: 'none',
        price: 2,
        time: 2,
        stratData: {
          macdHist: -0.049,
        }
      },
      {
        trend: 'down',
        action: 'sell',
        price: 3,
        time: 3,
        stratData: {
          macdHist: 0.003,
        }
      },
      {
        trend: 'down',
        action: 'none',
        price: 3,
        time: 4,
        stratData: {
          macdHist: -0.5,
        }
      },
    ]))
  };
  run();
}
