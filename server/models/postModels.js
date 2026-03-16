const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, _id: true }
);

const postSchema = new mongoose.Schema(
  {
    imgPath: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      default: "",
    },
    format: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    liked: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likedUser: [{ type: String, default: "" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

const postModel = mongoose.model("Post", postSchema);
module.exports = postModel;
