const R = require('ramda');
const fs = require('fs');

const makeTrader = async ({
  plotInterval,
  logId,
  predictor,
  handlePrediction,
  plotter
}) => {

  let logFileName = `logs/dealsLog-${logId}.log`;
  let deals = { closed: [], open: null };
  let predictions = [];
  return {
    handleData: async ({ klines, final }) => {
      if (final) {
        const pred = await predictor.predict(klines);
        deals = await handlePrediction(pred, deals);
        fs.writeFileSync(logFileName, JSON.stringify(deals, null, 2));
        predictions.push(pred);
        if (predictions.length % plotInterval === 0) {
          console.log('Plotted to: ', plotter.plot(predictions));
        }
      }
    },
    getDeals: () => deals,
    plotAll: () => plotter.plot(predictions)
  };
};

module.exports = makeTrader;

