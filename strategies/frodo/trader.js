
const makeTrader = () => {
  let deals = [];
  return {
    trade: (data) => {
      process.stdout.write('.');
    },
    getDeals: () => deals
  }
};

module.exports = makeTrader;
