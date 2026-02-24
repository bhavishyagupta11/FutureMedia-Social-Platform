const express = require("express");
const mongoose = require("mongoose");

const User = require("./../models/userModel");
const Post = require("../models/postModels");
const { mapUserToPublic } = require("../utils/userMapper");

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

const fetchProfileData = async (userId) => {
  const posts = await Post.countDocuments({ userId });
  const userData = await User.findOne({ _id: userId });

  if (!userData) {
    return null;
  }

  return {
    posts,
    followers: userData.followers,
    followings: userData.followings,
  };
};

router.post("/data", async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!isValidId(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const profileData = await fetchProfileData(userId);
    if (!profileData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(profileData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/info", async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!isValidId(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const profileData = await fetchProfileData(userId);
    if (!profileData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(profileData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/follow", async (req, res) => {
  try {
    const { userId, followerId } = req.body || {};
    if (!isValidId(userId) || !isValidId(followerId)) {
      return res.status(400).json({ error: "Valid userId and followerId are required" });
    }

    if (String(userId) === String(followerId)) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const targetUser = await User.findOne({ _id: userId });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyFollowing = targetUser.followersList.includes(String(followerId));
    const update = alreadyFollowing
      ? { $pull: { followersList: String(followerId) }, $inc: { followers: -1 } }
      : { $addToSet: { followersList: String(followerId) }, $inc: { followers: 1 } };

    const updatedUser = await User.findOneAndUpdate({ _id: userId }, update, { new: true });
    return res.status(200).json(mapUserToPublic(updatedUser));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/like", async (req, res) => {
  try {
    const { _id, userId } = req.body || {};
    if (!isValidId(_id) || !isValidId(userId)) {
      return res.status(400).json({ error: "Valid post id and userId are required" });
    }

    const userLiked = await Post.findOne({ _id, likedUser: userId });
    if (userLiked) {
      const updatedPost = await Post.findOneAndUpdate(
        { _id, likedUser: userId },
        { $pull: { likedUser: userId }, $inc: { likes: -1 } },
        { new: true }
      );
      return res.status(200).json(updatedPost);
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id },
      { $addToSet: { likedUser: userId }, $inc: { likes: 1 } },
      { new: true }
    );
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
