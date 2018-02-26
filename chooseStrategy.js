const R = require('ramda');
const runStrategy = require('./runner');
const fs = require('fs');
const moment = require('moment');
const math = require('mathjs');

const outFile = 'logs/followTrend-choose-strat.json';
const params = {
  strategy: 'followTrend',
  tickerType: 'backtest',
  fileName: "analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv",
  //fileName: "analyser/rawData/test-sample-short.csv",
  symbol: 'ETHBTC',
  interval: '1m',
  comission: 0.0005,
  logId: 'test',
  cutoff: 0.005,
  shortSMA: 15,
  longSMA: 200,
  normalizePeriod: 100,
  normCutoff: 1,
  //plotInterval: 500
};
const shorts = [5, 10, 20];
const longs = [100, 200, 300];
const normPeriods = [30, 200];
const normCutoffs = [1, 1.5, 2];
const cutoffs = [0.01, 0.005];
/*
const shorts = [5, 10];
const longs = [100];
const normPeriods = [30];
const normCutoffs = [1];
const cutoffs = [0.01];
*/

const total = shorts.length * longs.length * normPeriods.length
  * normCutoffs.length * cutoffs.length;

let results = [];
let i = 0;
let timeStart = moment();
let elapsedTime = moment() - timeStart;
const choose = async () => {
  for (let shortSMA of shorts) {
    for (let longSMA of longs) {
      for (let normalizePeriod of normPeriods) {
        for (let normCutoff of normCutoffs) {
          for (let cutoff of cutoffs) {
            timeStart = moment();
            const eta = moment.duration(elapsedTime * (total - i)).humanize();
            console.log(`Doing ${i}/${total}, ETA: ${eta}`);

            let res = await runStrategy(R.merge(
              params,
              {
                limit: math.max(longs),
                cutoff,
                shortSMA,
                longSMA,
                normalizePeriod,
                normCutoff,
              }
            ));
            results.push(R.merge(res, {
              cutoff,
              shortSMA,
              longSMA,
              normalizePeriod,
              normCutoff,
            }));
            fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
            elapsedTime = moment() - timeStart;
            i++;
          }
        }
      }
    }
  }
};

choose();

