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

  const high = R.map(R.path(['line', 'high']), actions);
  const low = R.map(R.path(['line', 'low']), actions);
  const open = R.map(R.path(['line', 'open']), actions);
  const close = R.map(R.path(['line', 'close']), actions);

  const candles = {
    x: indices,
    high,
    low,
    open,
    close,
    decreasing: {line: {color: '#7F7F7F'}},
    increasing: {line: {color: '#17BECF'}},
    line: {color: 'rgba(31,119,180,1)'},
    type: 'candlestick',
  };
  const emaShort = {
    x: indices,
    y: R.map(R.path(['stratData', 'shortEMA']), actions),
    mode: 'lines',
    name: 'EMA short',
    line: {
      color: '#FF3F33',
    },
  };
  const emaLong = {
    x: indices,
    y: R.map(R.path(['stratData', 'longEMA']), actions),
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
      color: '#2bc62b',
      size: 14
    },
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
  };

  const chartData = [
    candles, emaShort, emaLong,
    buyPoints, sellPoints
  ];
  const layout = {
    xaxis: {
      rangeslider: {
        visible: false
      }
    }
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
        line: {
          high: 1,
          low: 0.3,
          open: 0.7,
          close: 0.5,
        },
        time: 1,
        stratData: {
        }
      },
      {
        trend: 'up',
        action: 'none',
        price: 2,
        line: {
          high: 1.8,
          low: 0.9,
          open: 1.3,
          close: 1.7,
        },
        time: 2,
        stratData: {
        }
      },
      {
        trend: 'down',
        action: 'sell',
        price: 3,
        line: {
          high: 3,
          low: 2.8,
          open: 2.8,
          close: 2.8,
        },
        time: 3,
        stratData: {
        }
      },
      {
        trend: 'down',
        action: 'none',
        price: 3,
        line: {
          high: 1,
          low: 0.3,
          open: 0.7,
          close: 0.3,
        },
        time: 4,
        stratData: {
        }
      },
    ]));
  };
  run();
}
