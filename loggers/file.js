const fs = require('fs');

const makeLogger = async ({ logId }) => {
  let logFileName = `logs/dealsLog-${logId}.log`;

  return {
    log: async ({ deals, actions }) => {
      fs.writeFileSync(logFileName, JSON.stringify(deals, null, 2));
    }
  };
};
module.exports = makeLogger;
