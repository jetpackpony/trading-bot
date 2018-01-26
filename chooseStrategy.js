const R = require('ramda');
const runStrategy = require('./runner');

const params = {
  strategy: 'sma',
  tickerType: 'backtest',
  fileName: "analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
};
/*
const shorts = [3, 5, 8, 13, 21, 34];
const longs = [5, 8, 13, 21, 34, 55, 89, 144];
const cutoffs = [0.01, 0.005];
*/
const shorts = [3];
const longs = [8];
const cutoffs = [0.005];

let results = [];
const choose = async () => {
  for (let short_period of shorts) {
    for (let long_period of longs) {
      for (let cutoff of cutoffs) {
        if (short_period >= long_period) {
          continue;
        }
        console.log(`Doing s-${short_period};l-${long_period};c-${cutoff}`);

        let res = await runStrategy(R.merge(
          params,
          {
            limit: R.max(short_period, long_period),
            logId: `choose;s-${short_period};l-${long_period};c-${cutoff}`,
            cutoff,
            short_period,
            long_period
          }
        ));
        results.push(R.merge(res, { short_period, long_period, cutoff }));
      }
    }
  }
  console.log('Results: ', results);
};

choose();

