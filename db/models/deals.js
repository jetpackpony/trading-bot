const mongoose = require('mongoose');

const DealsSchema = new mongoose.Schema({
  runId: { type: String },
  deals: { type: Object },
});

module.exports = {
  schema: DealsSchema,
  model: mongoose.model('Deals', DealsSchema)
};
