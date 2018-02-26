const R = require('ramda');
const math = require('mathjs');
const { MACD } = require('../../ta-promise');

const getHistRates = R.map(R.pathOr(0, ['stratData', 'histRate']));
const filter = (filt, value) => {
  return (math.abs(value) <= filt)
    ? 0
    : value
};
const makePredictor = async ({
  fast_period,
  slow_period,
  signal_period
}) => {
  if (R.any(R.isNil, [
    fast_period,
    slow_period,
    signal_period
  ])) {
    throw new Error(`Not all args are setup`);
  }
  const getMACD = MACD(fast_period, slow_period, signal_period);

  return {
    predict: async (klines, actions) => {
      const prices = R.pluck('close')(klines);
      const { macd, macdSignal, macdHist } = await getMACD(prices);
      const curHist = R.last(macdHist);
      const hists = R.map(R.pathOr(0, ['stratData', 'macdHist']), actions);
      const prevHist = R.last(hists);

      const histRate = curHist / prevHist - 1;
      const filt = math.std(R.append(histRate, getHistRates(actions)));
      const filteredRate = filter(filt, histRate);
      let res = {
        trend: 'none',
        price: R.last(prices),
        time: R.last(klines).endTime,
        stratData: {
          macdHist: curHist,
          histRate
        }
      };
      if (prevHist <= 0 && curHist > 0) {
        res.trend = 'up';
      }
      if (prevHist >= 0 && curHist < 0) {
        res.trend = 'down';
      }
      return res;
    }
  }
};

module.exports = makePredictor;

if (require.main === module) {
  async function run() {
    let data = [1,3,4,5,6,7,8,9,10,11,12,13,14,15];
    let res = await EMA(8, data);
    console.log(res);
  };
  run();
}
