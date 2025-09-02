const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetID: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true },
  details: { type: String, required: true },
  comments: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Log || mongoose.model('Log', LogSchema);