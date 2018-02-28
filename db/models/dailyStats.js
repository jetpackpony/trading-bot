const mongoose = require('mongoose');

const DailyStatsSchema = new mongoose.Schema({
  runId: { type: String },
  stats: { type: Object },
});

module.exports = {
  schema: DailyStatsSchema,
  model: mongoose.model('DailyStats', DailyStatsSchema)
};

