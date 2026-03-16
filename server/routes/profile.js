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
    user: mapUserToPublic(userData),
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
    const currentUserId = req.body?.currentUserId || req.body?.userId;
    const targetUserId = req.body?.targetUserId || req.body?.followerId;

    if (!isValidId(currentUserId) || !isValidId(targetUserId)) {
      return res.status(400).json({ error: "Valid currentUserId and targetUserId are required" });
    }

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findOne({ _id: currentUserId }),
      User.findOne({ _id: targetUserId }),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyFollowing = targetUser.followersList.includes(String(currentUserId));

    await Promise.all([
      User.findOneAndUpdate(
        { _id: targetUserId },
        alreadyFollowing
          ? { $pull: { followersList: String(currentUserId) }, $inc: { followers: -1 } }
          : { $addToSet: { followersList: String(currentUserId) }, $inc: { followers: 1 } },
        { new: true }
      ),
      User.findOneAndUpdate(
        { _id: currentUserId },
        alreadyFollowing
          ? { $pull: { followingsList: String(targetUserId) }, $inc: { followings: -1 } }
          : { $addToSet: { followingsList: String(targetUserId) }, $inc: { followings: 1 } },
        { new: true }
      ),
    ]);

    const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
      User.findOne({ _id: currentUserId }),
      User.findOne({ _id: targetUserId }),
    ]);

    return res.status(200).json({
      currentUser: mapUserToPublic(updatedCurrentUser),
      targetUser: mapUserToPublic(updatedTargetUser),
      following: !alreadyFollowing,
    });
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

router.post("/comment", async (req, res) => {
  try {
    const { _id, userId, text } = req.body || {};
    const cleanedText = String(text || "").trim();

    if (!isValidId(_id) || !isValidId(userId)) {
      return res.status(400).json({ error: "Valid post id and userId are required" });
    }

    if (!cleanedText) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      _id,
      {
        $push: {
          comments: {
            userId,
            userName: user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.username,
            text: cleanedText,
          },
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/comment/:postId/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.body?.userId || req.query?.userId;

    if (!isValidId(postId) || !isValidId(commentId) || !isValidId(userId)) {
      return res.status(400).json({ error: "Valid post id, comment id, and userId are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (String(comment.userId) !== String(userId)) {
      return res.status(403).json({ error: "You can only remove your own comments" });
    }

    comment.deleteOne();
    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
