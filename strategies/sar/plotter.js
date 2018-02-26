const R = require('ramda');
const fs = require('fs');
const renderChart = require('../../charts/renderChart');
const {
  getCommands,
  getValuesForIndices,
  getBuyIndices,
  getSellIndices,
  getDownIndices,
} = require('../../charts/chartUtils');

const getStratData = (prop) => R.map(R.path(['stratData', prop]));

const plot = R.curry((fileName, dirName, actions) => {
  const prices = R.pluck('price', actions);
  const indices = R.times(R.identity, actions.length);
  const commands = R.zip(indices, R.pluck('action', actions));
  const buyIndices = getBuyIndices(commands);
  const sellIndices = getSellIndices(commands);
  const trends = R.zip(indices, R.pluck('trend', actions));
  const downIndices = getDownIndices(trends);

  const adxs = R.map(R.path(['stratData', 'adx']), actions);
  const maxAdx = Math.max(...R.map(Math.abs, adxs)) * 1.2;
  const range = [0, maxAdx];
  const adx = {
    x: indices,
    y: R.map(R.path(['stratData', 'adx']), actions),
    mode: 'lines',
    name: 'ADX',
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
  const sar = {
    x: indices,
    y: getStratData('sar')(actions),
    mode: 'markers',
    name: 'SAR',
    marker: {
      symbol: 'circle-dot',
      color: '#FF3F33',
      size: 8
    },
    yaxis: 'y2',
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
    yaxis: 'y2',
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
    yaxis: 'y2',
  };
  const downPoints = {
    x: downIndices,
    y: getValuesForIndices(downIndices, prices),
    mode: 'markers',
    name: 'Down points',
    marker: {
      symbol: 'triangle-down',
      color: '#2f7df9',
      size: 8
    },
    yaxis: 'y2',
  };

  const chartData = [
    adx,
    closePrices, sar,
    buyPoints, sellPoints, //downPoints
  ];
  const layout = {
    yaxis: {domain: [0, 0.19], fixedrange: true, range},
    yaxis2: {domain: [0.21, 1]},
    shapes: [{
      type: 'rect',
      xref: 'paper',
      yref: 'y',
      x0: 0,
      x1: 1,
      y0: 0,
      y1: 50,
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
  const fileName = `testme`;
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
          sar: 0.8,
          adx: 0,
        }
      },
      {
        trend: 'up',
        action: 'none',
        price: 2,
        time: 2,
        stratData: {
          sar: 1.8,
          adx: 23,
        }
      },
      {
        trend: 'down',
        action: 'sell',
        price: 3,
        time: 3,
        stratData: {
          sar: 2.8,
          adx: 60,
        }
      },
      {
        trend: 'down',
        action: 'none',
        price: 3,
        time: 4,
        stratData: {
          sar: 2.8,
          adx: 50,
        }
      },
    ]));
  };
  run();
}
