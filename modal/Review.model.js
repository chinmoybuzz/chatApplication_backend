const mongoose = require('mongoose');
const {ratingNumber} =require("../helper/typeconfig")
const CommentModel=require("../modal/Comment.model")
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true,
    },
    rating: {type: Number, enum: ratingNumber, default: ratingNumber[0]},
    comment: {
      type: String,
      default: '',
    },
    createdBy: { type: ObjectId, ref: "Users", default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ReviewModel= mongoose.model('Reviews', reviewSchema);
module.exports =ReviewModel;
