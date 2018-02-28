const { setupDBPromise } = require('../db');
const R = require('ramda');

const makeLogger = async ({ logId }) => {
  await setupDBPromise();
  const Action = require('../db/models/action').model;
  const DailyStats = require('../db/models/dailyStats').model;

  const Deals = require('../db/models/deals').model;
  const runDeals = new Deals({ runId: logId });
  await runDeals.save();

  return {
    logAction: async (action) => {
      const act = new Action({ runLog: logId, action });
      await act.save();
    },
    logDeals: async (deals) => {
      await runDeals.update({ $set: { deals } });
    },
    logDailyStats: async (stats) => {
      const st = new DailyStats({ runLog: logId, stats });
      await st.save();
    }
  };
};

module.exports = makeLogger;
