const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    refType: {
      type: String,
      required: true,
      enum: ['Product', 'Post', 'Article','Review'], 
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comments',
      default: null, 
    },
    comment: {
      type: String,
      required: true,
    },
    createdBy: { type: ObjectId, ref: "Users", default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comments', commentSchema);
