const fs = require('fs');

const makeLogger = async ({ logId }) => {
  let logFileName = `logs/dealsLog-${logId}.log`;

  return {
    logDeals: async (deals) => {
      fs.writeFileSync(logFileName, JSON.stringify(deals, null, 2));
    },
    logAction: async (action) => {},
    logDailyStats: async (stats) => {},
    stopLogger: async () => {}
  };
};
module.exports = makeLogger;
