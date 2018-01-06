const { restApi } = require('./api');

restApi
  .openOrders({ symbol: "ETHBTC" })
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.err(err);
  });
