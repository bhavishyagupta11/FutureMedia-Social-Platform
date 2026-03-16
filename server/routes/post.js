const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const postModel = require("../models/postModels");
const User = require("../models/userModel");

const app = express();

function generateRandomNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

const uploadsRoot = path.resolve(__dirname, "../uploads");

const ensureDirectory = async (directoryPath) => {
  await fs.mkdir(directoryPath, { recursive: true });
};

const sanitizeFileName = (value) =>
  String(value || "fsm-post")
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "fsm-post";

const createFileFromBase64 = async (base64Value, directoryPath, namePrefix) => {
  const [meta = "", encoded = ""] = String(base64Value || "").split(";base64,");
  const extensionMatch = meta.match(/data:(?:image|video)\/([a-zA-Z0-9.+-]+)/);
  const extension = extensionMatch?.[1]?.replace("jpeg", "jpg") || "bin";
  const fileName = `${sanitizeFileName(namePrefix)}-${generateRandomNumber()}.${extension}`;
  const filePath = path.join(directoryPath, fileName);

  await fs.writeFile(filePath, encoded, { encoding: "base64" });

  return filePath;
};

const mapPostForClient = (post) => {
  const source = typeof post.toObject === "function" ? post.toObject() : post;
  const user = source.userId && typeof source.userId === "object" ? source.userId : null;
  const fileName = source.imgPath ? path.basename(source.imgPath) : "";
  const isVideo = source.format === "video";
  const legacyUploadsPath = `${path.sep}routes${path.sep}uploads`;
  const usesLegacyUploads = typeof source.imgPath === "string" && source.imgPath.includes(legacyUploadsPath);
  const mediaFolder = isVideo ? "video" : "image";
  const mediaBasePath = usesLegacyUploads
    ? `/legacy-uploads/${isVideo ? "video/" : ""}${fileName}`
    : `/uploads/${mediaFolder}/${fileName}`;

  return {
    _id: String(source._id),
    name:
      user?.displayName ||
      source.name ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      "FSM User",
    username: user?.username || "fsm",
    desc: source.desc || "",
    likes: Number(source.likes || 0),
    liked: Boolean(source.liked),
    likedUser: Array.isArray(source.likedUser) ? source.likedUser : [],
    comments: Array.isArray(source.comments)
      ? source.comments.map((comment) => ({
          _id: String(comment._id),
          userId: String(comment.userId),
          userName: comment.userName,
          text: comment.text,
          createdAt: comment.createdAt,
        }))
      : [],
    format: source.format || "image",
    imageUrl: fileName ? mediaBasePath : "",
    avatar: user?.img || "",
    userId: user?._id ? String(user._id) : String(source.userId || ""),
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null,
  };
};

const fetchPosts = async () => {
  const posts = await postModel
    .find()
    .sort({ createdAt: -1 })
    .populate("userId", "firstName lastName displayName username img");

  return posts.map(mapPostForClient);
};

app.get("/fetchAllPosts", async (req, res) => {
  try {
    const posts = await fetchPosts();
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error ", err);
    res.status(500).send({ message: err.message || err });
  }
});

app.get("/all", async (req, res) => {
  try {
    const posts = await fetchPosts();
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error ", err);
    res.status(500).send({ message: err.message || err });
  }
});

app.post("/upload", async (req, res) => {
  try {
    const imageBlob = req.body.images;
    const imageName = `${req.body.name || "FSM User"}`;
    const userId = req.body.userId;

    if (!imageBlob || !userId) {
      return res.status(400).send("Image and userId are required.");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const uploadDir = path.join(uploadsRoot, "image");
    await ensureDirectory(uploadDir);
    const imagePath = await createFileFromBase64(imageBlob, uploadDir, imageName);

    const postdata = new postModel({
      imgPath: imagePath,
      name: user.displayName || imageName,
      format: "image",
      userId,
      desc: req.body.desc || "",
      likes: Number(req.body.likes || 0),
      liked: Boolean(req.body.liked),
    });
    await postdata.save();

    res.status(201).json(mapPostForClient(await postdata.populate("userId", "firstName lastName displayName username img")));
  } catch (err) {
    console.log("Error ", err);
    res.status(500).send({ message: err.message || err });
  }
});

app.post("/upload/video", async (req, res) => {
  try {
    const videoBlob = req.body.images;
    const imageName = `${req.body.name || "FSM User"}`;
    const userId = req.body.userId;

    if (!videoBlob || !userId) {
      return res.status(400).send("Video and userId are required.");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const uploadDir = path.join(uploadsRoot, "video");
    await ensureDirectory(uploadDir);
    const videoPath = await createFileFromBase64(videoBlob, uploadDir, imageName);

    const postdata = new postModel({
      imgPath: videoPath,
      name: user.displayName || imageName,
      format: "video",
      desc: req.body.desc || "",
      likes: Number(req.body.likes || 0),
      liked: Boolean(req.body.liked),
      userId,
    });
    await postdata.save();

    res.status(201).json(mapPostForClient(await postdata.populate("userId", "firstName lastName displayName username img")));
  } catch (err) {
    console.log("Error ", err);
    res.status(500).send({ message: err.message || err });
  }
});

module.exports = app;
