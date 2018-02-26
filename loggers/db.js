const { setupDBPromise } = require('../db');
const R = require('ramda');

const makeLogger = async ({ logId }) => {
  await setupDBPromise();
  const Run = require('../db/models/run').model;
  const Action = require('../db/models/action').model;
  const Deals = require('../db/models/deals').model;
  const runDeals = new Deals({ runId: logId });
  await runDeals.save();
  let prevDeals;

  return {
    log: async ({ deals, actions }) => {
      if (!R.equals(prevDeals, deals)) {
        await runDeals.update({ $set: { deals } });
        prevDeals = deals;
      }
      const act = new Action({ runLog: logId, action: R.last(actions) });
      await act.save();
    }
  };
};

module.exports = makeLogger;
