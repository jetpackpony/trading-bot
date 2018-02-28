const R = require('ramda');
const fs = require('fs');
const math = require('mathjs');

const makeTrader = async ({
  plotInterval,
  predictor,
  handler,
  plotter,
  logger,
}) => {

  let deals = { closed: [], open: null };
  let actions = [];
  let dailyStats = [];
  let dealsRecorded = 0;
  const recordDailyStats = () => {
    const dayDeals = R.slice(dealsRecorded, Infinity, deals.closed);
    dealsRecorded += dayDeals.length;
    let day = {
      numDeals: dayDeals.length,
      totalProfit: R.sum(R.pluck('profitWithComission', dayDeals))
    };
    dailyStats.push(day);
    return day;
  };
  return {
    handleData: async ({ klines, final }) => {
      if (final) {
        const pred = await predictor.predict(klines, actions);
        const prevDeals = deals;
        ({ deals, actions } = await handler.handlePrediction(pred, prevDeals, actions));

        const logs = [];
        logs.push(logger.logAction(R.last(actions)));
        if (!R.equals(prevDeals, deals)) {
          logs.push(logger.logDeals(deals));
        }
        if (actions.length % plotInterval === 0) {
          console.log('Plotted to: ', plotter.plot(actions));
        }
        if (actions.length % 1440 === 0) {
          const dayStats = recordDailyStats();
          logs.push(logger.logDailyStats(dayStats));
        }
        await Promise.all(logs);
      }
    },
    finish: async () => {
      const dayStats = recordDailyStats();
      await logger.logDailyStats(dayStats);
    },
    getActions: () => actions,
    getDeals: () => deals,
    plotAll: () => plotter.plot(actions),
    getStats: () => {
      const fDeals = filterDeals(deals.open, deals.closed);
      const posDays = R.filter(isPosDay, dailyStats);
      const negDays = R.filter(isNegDay, dailyStats);
      const divs = R.map(R.path(['stratData', 'div']), actions);
      debugger;
      return {
        days: dailyStats,
        numPosDays: posDays.length,
        numNegDays: negDays.length,
        avgPosDayReturn: math.mean(getProfits(posDays)),
        avgNegDayReturn: math.mean(getProfits(negDays)),
        maxPosDayReturn: math.max(getProfits(posDays)),
        maxNegDayReturn: math.min(getProfits(negDays)),
        totalDeals: fDeals.length,
        totalProfit: R.sum(R.pluck('profitWithComission', fDeals)),
        divMean: math.mean(divs),
        divStd: math.std(divs),
      };
    }
  };
};

module.exports = makeTrader;

const getProfits = (days) => {
  const profits = R.pluck('totalProfit', days);
  if (profits.length === 0) {
    return [0];
  }
  return profits;
};
const isNegDay = R.compose(
  R.gte(0),
  R.prop('totalProfit')
);
const isPosDay = R.compose(
  R.lt(0),
  R.prop('totalProfit')
);
const isProfitEmpty = R.compose(
  R.not,
  R.propOr(false, 'profitWithComission')
);
const filterDeals = R.compose(
  R.reject(isProfitEmpty),
  R.reject(R.isNil),
  R.append
);

