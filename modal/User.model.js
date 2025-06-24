const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fileSchema = mongoose.Schema({
  url: { type: String, default: null },
  filename: { type: String, default: null },
  size: { type: String, default: null },
  extension: { type: String, default: null },
  ordering: { type: Number, default: 0 },
  status: { type: Number, enum: [1, 2], default: 1 },
});
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      // unique: true, // ensures no duplicate emails
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // optional validation
    },
    image: { type: fileSchema, default: null },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    deletedAt: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
const userModel = mongoose.model("Users", userSchema);
module.exports = userModel;
