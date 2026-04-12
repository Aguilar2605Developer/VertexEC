const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  project_id: { type: String, required: true },
  user_id: { type: String, required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);