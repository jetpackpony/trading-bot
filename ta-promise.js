const R = require('ramda');
const math = require('mathjs');
const talib = require('talib');

const padWithNans = (count) => R.concat(R.times(() => NaN, count));

const RSI = R.curry((period, data) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "RSI",
      startIdx: 0,
      endIdx: data.length - 1,
      inReal: data,
      optInTimePeriod: period
    }, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(padWithNans(result.begIndex)(result.result.outReal));
    });
  });
});
const EMA = R.curry((period, data, pad=true) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "EMA",
      startIdx: 0,
      endIdx: data.length - 1,
      inReal: data,
      optInTimePeriod: period
    }, (err, result) => {
      if (err) {
        reject(err);
      }
      if (pad) {
        resolve(padWithNans(result.begIndex)(result.result.outReal));
      } else {
        resolve(result.result.outReal);
      }
    });
  });
});

const StochRSI = R.curry((data) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "STOCHRSI",
      startIdx: 0,
      endIdx: data.length - 1,
      inReal: data,
      optInTimePeriod: 100,      // RSI period
      optInFastK_Period: 100,     // K-line period
      optInFastD_Period: 3,
      optInFastD_MAType: 0
    }, (err, result) => {
      if (err) {
        reject(err, data);
      }
      EMA(10, result.result.outFastK, false)
        .then((slowK) => {
          EMA(5, slowK, false)
            .then((slowD) => {
              resolve({
                slowK: padWithNans(data.length - slowK.length)(slowK),
                slowD: padWithNans(data.length - slowD.length)(slowD)
              });
            });
        });
    });
  });
});

const MACD = R.curry((fast_period, slow_period, signal_period, data) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "MACD",
      startIdx: 0,
      endIdx: data.length - 1,
      inReal: data,
      optInFastPeriod: fast_period,
      optInSlowPeriod: slow_period,
      optInSignalPeriod: signal_period,
    }, (err, result) => {
      if (err) {
        reject(err, data);
      }
      const { outMACD, outMACDSignal, outMACDHist } = result.result;
      resolve({
        macd: padWithNans(data.length - outMACD.length)(outMACD),
        macdSignal: padWithNans(data.length - outMACDSignal.length)(outMACDSignal),
        macdHist: padWithNans(data.length - outMACDHist.length)(outMACDHist),
      });
    });
  });
});

const SMA = R.curry((period, data) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "SMA",
      startIdx: 0,
      endIdx: data.length - 1,
      inReal: data,
      optInTimePeriod: period
    }, (err, result) => {
      if (err) {
        reject('Le error happened: ', err);
      }
      resolve(padWithNans(result.begIndex)(result.result.outReal));
    });
  });
});

const SAR = R.curry((acceleration, max, data) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "SAR",
      startIdx: 0,
      endIdx: data.low.length - 1,
      high: data.high,
      low: data.low,
      optInAcceleration: acceleration, // 0.02
      optInMaximum: max, // 0.2
    }, (err, result) => {
      if (err) {
        reject(`Le error happened: ${err.error}`);
      }
      resolve(padWithNans(result.begIndex)(result.result.outReal));
    });
  });
});

const ADX = R.curry((period, data) => {
  return new Promise((resolve, reject) => {
    talib.execute({
      name: "ADX",
      startIdx: 0,
      endIdx: data.low.length - 1,
      high: data.high,
      low: data.low,
      close: data.close,
      optInTimePeriod: period, // 14
    }, (err, result) => {
      if (err) {
        reject(`Le error happened: ${err.error}`);
      }
      resolve(padWithNans(result.begIndex)(result.result.outReal));
    });
  });
});
module.exports = {
  SMA,
  EMA,
  RSI,
  StochRSI,
  MACD,
  SAR,
  ADX,
}

if (require.main === module) {
  async function run() {
  const data = { low: [0.061262], high: [0.061304] };
    try {
      let res = await SAR(0.02, 0.2, data)
      console.log(res);
    } catch(e) {
      console.log(e);
    }
  };
  run();
}
