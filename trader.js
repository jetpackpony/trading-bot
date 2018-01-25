const R = require('ramda');
const fs = require('fs');

const makeTrader = async ({
  logId,
  predictor,
  handlePrediction
}) => {

  let logFileName = `logs/dealsLog-${logId}.log`;
  let deals = { closed: [], open: null };
  return {
    handleData: async (klines) => {
      const pred = await predictor.predict(klines);
      deals = await handlePrediction(pred, deals);
      fs.writeFileSync(logFileName, JSON.stringify(deals, null, 2));
    },
    getDeals: () => deals
  };
};

module.exports = makeTrader;

