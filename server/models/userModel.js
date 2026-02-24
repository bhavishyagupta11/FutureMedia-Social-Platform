const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    img: { type: String, default: "" },
    followings: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    followersList: [{ type: String, default: "" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
