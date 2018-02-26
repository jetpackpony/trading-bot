const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  runId: { type: String },
  action: { type: Object },
});

module.exports = {
  schema: ActionSchema,
  model: mongoose.model('Action', ActionSchema)
};
