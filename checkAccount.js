const R = require('ramda');
const round = require('math-precision').round;
const { account, ticker24hr, info } = require('./api');

const isPair =
  R.curry((info, baseAsset, quoteAsset) => (
    R.any(
      R.propEq('symbol', `${baseAsset}${quoteAsset}`)
    )(info.symbols)
  ));

const getMinL =
  R.curry((info, asset) => (
    parseFloat(info
      .symbols.find((s) => s.symbol === `${asset}BTC`)
      .filters.find((f) => f.filterType === 'LOT_SIZE')
      .stepSize)
  ));

const parseFloats =
  (balance) => (
    R.merge(balance, {
      free: parseFloat(balance.free),
      locked: parseFloat(balance.locked),
    })
  );

const addInBTC =
  (balance, priceInBTC) => ({
    priceInBTC,
    freeInBTC: round(balance.free * priceInBTC, 8),
    lockedInBTC: round(balance.locked * priceInBTC, 8)
  });

info((err, info) => {
  if (err) {
    console.error(err);
    return;
  }
  const isPairExist = isPair(info);
  const getMinLot = getMinL(info);
  account((err, data) => {
    if (err) {
      console.error(err, data);
      return;
    }
    const balances = data.balances.filter((b) => (
      b.free > 0 || b.locked > 0
    ));

    Promise.all(
      balances.map((balance) => {
        const bal = parseFloats(balance);
        return new Promise((resolve, reject) => {
          if (bal.asset === 'BTC') {
            resolve(
              R.mergeAll([
                bal,
                addInBTC(bal, 1),
                { minLotSize: 0.000001 }
              ])
            );
          } else if (isPairExist(bal.asset, 'BTC')) {
            console.log(`query balance for ${bal.asset}`);
            ticker24hr(`${bal.asset}BTC`, (err, { lastPrice }) => {
              if (err) {
                console.log(`Couldn't get prices for ${bal.asset}BTC`);
                resolve(null);
              }
              resolve(
                R.mergeAll([
                  bal,
                  addInBTC(bal, parseFloat(lastPrice)),
                  { minLotSize: getMinLot(bal.asset) }
                ])
              );
            })
          } else {
            console.log(`Couldn't find pair ${bal.asset}BTC`);
            resolve(null);
          }
        })
      })
    )
      .then(R.reject(R.isNil))
      .then((balances) => {
        console.log("Balances:");
        console.log(JSON.stringify(balances, null, 2));

        const balancesNoDust = balances.filter((b) => b.free >= b.minLotSize);
        console.log("Balances Without Dust:");
        console.log(JSON.stringify(balancesNoDust, null, 2));

        const totalFreeBTC = sumProps('freeInBTC', balances);
        console.log(`Total free in BTC: ${totalFreeBTC}`);

        const totalLockedBTC = sumProps('lockedInBTC', balances);
        console.log(`Total locked in BTC: ${totalLockedBTC}`);

        const totalNoDust = sumProps('freeInBTC', balancesNoDust);
        console.log(`Total free in BTC (dust excluded): ${totalNoDust}`);

        ticker24hr('BTCUSDT', (err, { lastPrice }) => {
          if (err) {
            console.error(`Can't get price for BTCUSDT`, err);
            return;
          }
          console.log(`Approx free value in USD: ${round(totalFreeBTC * lastPrice, 2)}`);
          console.log(`Approx value without dust in USD: ${round(totalNoDust * lastPrice, 2)}`);
        });
      })
      .catch((...args) => {
        console.error("Some error", args);
      });
  });
});

const sumProps =
  (propName, array) => round(R.sum(R.pluck(propName)(array)), 8);
