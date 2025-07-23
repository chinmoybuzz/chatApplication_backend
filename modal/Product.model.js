const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

const {fileSchema,}=require("../modal/helperSchema")
const {Status, ratingNumber} =require("../helper/typeconfig")
const { ObjectId } = require("mongoose").Types;


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, lowercase: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, unique: true },
    sku: { type: String, unique: true, uppercase: true, trim: true },
    image: { type: fileSchema, default: null },
    category: { type: ObjectId, ref: "Categories", default: null },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, default: 0, min: 0 },
    shortDescription: { type: String, maxlength: 200, trim: true },
    description: { type: String, trim: true },
    tags: { type: [String], default: [] },
    rating: { type: Number, enum: ratingNumber, default: ratingNumber[0] },
    status: { type: Number, enum: Status, default: Status[1] },
    isPublished: { type: Boolean, default: true },
    variants: [{
     name: String,
     options: [String],
    }],
    dimensions: {
     length: Number,
     width: Number,
     height: Number,
    },
    weight: { type: Number },
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
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ deletedAt: 1 });

productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model("Products", productSchema);
module.exports = productModel;
