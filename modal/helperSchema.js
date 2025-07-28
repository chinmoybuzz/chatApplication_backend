const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
  url: { type: String, default: null },
  filename: { type: String, default: null },
  size: { type: String, default: null },
  extension: { type: String, default: null },
  ordering: { type: Number, default: 0 },
  status: { type: Number, enum: [1, 2], default: 1 },
});


const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  device: { type: String, default: "unknown" },
  expiresAt: { type: Date },
});
module.exports={
    fileSchema,
    refreshTokenSchema
}