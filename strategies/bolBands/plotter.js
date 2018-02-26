const R = require('ramda');
const fs = require('fs');
const renderChart = require('../../charts/renderChart');
const {
  getCommands,
  getValuesForIndices,
  getBuyIndices,
  getSellIndices,
} = require('../../charts/chartUtils');

const getStratData = (prop) => R.map(R.path(['stratData', prop]));

const plot = R.curry((fileName, dirName, actions) => {
  const prices = R.pluck('price', actions);
  const indices = R.times(R.identity, actions.length);
  const commands = R.zip(indices, R.pluck('action', actions));
  const buyIndices = getBuyIndices(commands);
  const sellIndices = getSellIndices(commands);

  const slopes = R.map(R.path(['stratData', 'longSlope']), actions);
  const maxSlopes = Math.max(...R.map(Math.abs, slopes)) * 1.2;
  const range = [-maxSlopes, maxSlopes];
  const slope = {
    x: indices,
    y: R.map(R.path(['stratData', 'longSlope']), actions),
    mode: 'lines',
    name: 'Slope of SMA',
    line: {
      color: '#5353DD',
    },
  };
  const slopesSMA = {
    x: indices,
    y: R.map(R.path(['stratData', 'slopesSMA']), actions),
    mode: 'lines',
    name: 'SMA of slope of SMA',
    line: {
      color: '#f96c34',
    },
  };
  const slopeNorm = {
    x: indices,
    y: R.map(R.path(['stratData', 'slopeNorm']), actions),
    mode: 'lines',
    name: 'Slope Norm',
    line: {
      color: '#5353DD',
    },
    yaxis: 'y2',
  };
  const closePrices = {
    x: indices,
    y: prices,
    mode: 'lines',
    name: 'Close Prices',
    line: {
      color: '#7E7E7E',
    },
    yaxis: 'y3',
  };
  const long = {
    x: indices,
    y: getStratData('long')(actions),
    mode: 'lines',
    name: 'SMA long',
    line: {
      color: '#3881f7',
    },
    yaxis: 'y3',
  };
  const buyPoints = {
    x: buyIndices,
    y: getValuesForIndices(buyIndices, prices),
    mode: 'markers',
    name: 'Buy points',
    marker: {
      color: '#2bc62b',
      size: 14
    },
    yaxis: 'y3',
  };
  const sellPoints = {
    x: sellIndices,
    y: getValuesForIndices(sellIndices, prices),
    mode: 'markers',
    name: 'Sell points',
    marker: {
      color: '#ed3841',
      size: 14
    },
    yaxis: 'y3',
  };

  const chartData = [
    slope, slopesSMA, slopeNorm,
    closePrices, long,
    buyPoints, sellPoints
  ];
  const layout = {
    yaxis: {domain: [0, 0.19], fixedrange: true, range },
    yaxis2: {domain: [0.21, 0.39], fixedrange: true, range: [0, 1] },
    yaxis3: {domain: [0.41, 1]},
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
  short_period,
  middle_period,
  long_period
}) => {
  if (R.any(R.isNil, [
    strategy,
    short_period,
    middle_period,
    long_period
  ])) {
    throw new Error(`Not all args are setup`);
  }

  const dirName = strategy;
  const fileName = `short=${short_period},middle=${middle_period},long=${long_period}`;
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
      middle_period: 20,
      long_period: 30
    });
    console.log(plotter.plot([
      {
        trend: 'up',
        action: 'buy',
        price: 1,
        time: 1,
        stratData: {
          short: 0.5,
          middle: 0.4,
          long: 0.3,
          longSlope: 0.3,
          slopeNorm: 0.1,
          slopesSMA: 0.2,
        }
      },
      {
        trend: 'up',
        action: 'none',
        price: 2,
        time: 2,
        stratData: {
          short: 0.1,
          middle: 0.2,
          long: 0.3,
          longSlope: -0.3,
          slopeNorm: 0.3,
          slopesSMA: 0.1,
        }
      },
      {
        trend: 'down',
        action: 'sell',
        price: 3,
        time: 3,
        stratData: {
          short: 1.2,
          middle: 0.8,
          long: 0.7,
          longSlope: -1.3,
          slopeNorm: 0.7,
          slopesSMA: -0.9,
        }
      },
      {
        trend: 'down',
        action: 'none',
        price: 3,
        time: 4,
        stratData: {
          short: 0.5,
          middle: 0.4,
          long: 0.3,
          longSlope: 0.8,
          slopeNorm: 0.9,
          slopesSMA: 0.7,
        }
      },
    ]));
  };
  run();
}
