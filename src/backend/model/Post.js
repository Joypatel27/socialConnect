// model/Post.js
const mongoose = require('mongoose');
const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  replies: [replySchema], // recursive for nested replies
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now },
   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   comments: [commentSchema],
});

module.exports = mongoose.model('Post', postSchema);
