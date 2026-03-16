const express = require("express");
const User = require("./../models/userModel");
const Post = require("../models/postModels");
const { hashPassword, verifyPassword, needsPasswordUpgrade } = require("../utils/password");
const { mapUserToPublic } = require("../utils/userMapper");

const router = express.Router();

const normalizeUsername = (username) => String(username || "").trim().toLowerCase();
const normalizeName = (name) => String(name || "").trim();
const normalizeOptional = (value) => String(value || "").trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findUserByUsernameCaseInsensitive = async (username) =>
  User.findOne({
    username: {
      $regex: `^${escapeRegex(username)}$`,
      $options: "i",
    },
  });

const validateSignupPayload = ({ firstName, lastName, username, password }) => {
  const cleanedFirstName = normalizeName(firstName);
  const cleanedLastName = normalizeName(lastName);
  const cleanedUsername = normalizeUsername(username);
  const cleanedPassword = String(password || "");

  if (!cleanedFirstName || !cleanedLastName || !cleanedUsername || !cleanedPassword) {
    return { valid: false, message: "All fields are required." };
  }

  if (cleanedUsername.length < 3) {
    return { valid: false, message: "Username must be at least 3 characters long." };
  }

  if (cleanedPassword.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long." };
  }

  return {
    valid: true,
    payload: {
      firstName: cleanedFirstName,
      lastName: cleanedLastName,
      username: cleanedUsername,
      password: cleanedPassword,
    },
  };
};

router.post("/signup", async (req, res) => {
  try {
    const validation = validateSignupPayload(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const { firstName, lastName, username, password } = validation.payload;
    const existingUser = await findUserByUsernameCaseInsensitive(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`.trim(),
      username,
      password: hashPassword(password),
    });
    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      data: mapUserToPublic(newUser),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: "Username already exists" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const user = await findUserByUsernameCaseInsensitive(username);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (needsPasswordUpgrade(user.password)) {
      user.password = hashPassword(password);
      await user.save();
    }

    return res.status(200).json({ message: "Login successful", data: mapUserToPublic(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetchUsers", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users.map(mapUserToPublic));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users.map(mapUserToPublic));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = normalizeOptional(req.query.q);
    if (query.length < 2) {
      return res.status(200).json({ users: [], posts: [] });
    }

    const regex = new RegExp(escapeRegex(query), "i");

    const [users, posts] = await Promise.all([
      User.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { displayName: regex },
          { username: regex },
          { bio: regex },
        ],
      })
        .sort({ updatedAt: -1 })
        .limit(6),
      Post.find({
        $or: [{ desc: regex }, { name: regex }],
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("userId", "displayName firstName lastName username img"),
    ]);

    return res.status(200).json({
      users: users.map(mapUserToPublic),
      posts: posts.map((post) => ({
        _id: String(post._id),
        desc: post.desc || "",
        name: post.name || "",
        format: post.format || "image",
        imageUrl: post.imgPath ? `/api/post/media/${String(post._id)}` : "",
        user: post.userId
          ? {
              _id: String(post.userId._id),
              displayName:
                post.userId.displayName ||
                `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim(),
              username: post.userId.username || "",
              img: post.userId.img || "",
            }
          : null,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(mapUserToPublic(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:userId/profile", async (req, res) => {
  try {
    const { displayName, bio, website, img } = req.body || {};
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cleanedDisplayName = normalizeOptional(displayName);
    user.displayName = cleanedDisplayName;
    user.bio = normalizeOptional(bio);
    user.website = normalizeOptional(website);

    if (typeof img === "string") {
      user.img = img.trim();
    }

    if (cleanedDisplayName) {
      const nameParts = cleanedDisplayName.split(/\s+/).filter(Boolean);
      user.firstName = nameParts[0] || user.firstName;
      user.lastName = nameParts.slice(1).join(" ") || "";
    }

    await user.save();

    return res.status(200).json(mapUserToPublic(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
