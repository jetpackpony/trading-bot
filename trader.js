const R = require('ramda');
const fs = require('fs');

const makeTrader = async ({
  plotInterval,
  logId,
  predictor,
  handler,
  plotter
}) => {

  let logFileName = `logs/dealsLog-${logId}.log`;
  let deals = { closed: [], open: null };
  let actions = [];
  return {
    handleData: async ({ klines, final }) => {
      if (final) {
        const pred = await predictor.predict(klines);
        ({ deals, actions } = await handler.handlePrediction(pred, deals, actions));
        fs.writeFileSync(logFileName, JSON.stringify(deals, null, 2));
        if (actions.length % plotInterval === 0) {
          console.log('Plotted to: ', plotter.plot(actions));
        }
      }
    },
    getDeals: () => deals,
    plotAll: () => plotter.plot(actions)
  };
};

module.exports = makeTrader;

