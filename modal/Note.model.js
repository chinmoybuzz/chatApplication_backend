const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

const {Status, ratingNumber} =require("../helper/typeconfig")
const { ObjectId } = require("mongoose").Types;


const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, lowercase: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, unique: true },
    category: { type: ObjectId, ref: "Categories", default: null },
    content: { type: String, trim: true },
    tags: { type: [String], default: [] },
    owner:{ type: ObjectId, ref: "Users", default: null},
    rating: { type: Number, enum: ratingNumber, default: ratingNumber[0] },
    status: { type: Number, enum: Status, default: Status[1] },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: ObjectId, ref: "Users", default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);
noteSchema.index({ category: 1 });
noteSchema.index({ status: 1 });
noteSchema.index({ deletedAt: 1 });

noteSchema.plugin(mongoosePaginate);

const productModel = mongoose.model("Notes", noteSchema);
module.exports = productModel;
