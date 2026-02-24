const express = require('express')
const multer = require('multer')
const path = require("path")
const fs = require('fs');
const postModel = require("../models/postModels");
const app = express()
var upload = multer({ dest: "./uploads" });
function generateRandomNumber() {
return Math.floor(100000 + Math.random() * 900000);
}
app.get("/fetchAllPosts", async (req, res) => {
    try {
    console.log("Hit")
const data = await postModel.find();
const modifiedData = await Promise.all(data.map((post) => {
// Read the video file content
const newObj = {...post};
const videoContent = fs.readFileSync(post.imgPath);
    console.log("Path", post.imgPath)
// Convert the video content to base64
const base64Video = videoContent.toString('base64');
    newObj.postBase64 = base64Video;
return newObj;
}));
    res.status(200).send(modifiedData)
}
catch (err) {
    console.log("Error ", err)
    res.status(500).send({ message: err })
}
})
app.get("/all", async (req, res) => {
    try {
    const data = await postModel.find();
const modifiedData = await Promise.all(data.map((post) => {
const newObj = {...post};
const videoContent = fs.readFileSync(post.imgPath);
const base64Video = videoContent.toString('base64');
    newObj.postBase64 = base64Video;
return newObj;
}));
    res.status(200).send(modifiedData)
}
catch (err) {
    console.log("Error ", err)
    res.status(500).send({ message: err })
}
})
app.post('/upload', upload.array('images', 5), async (req, res) => {
try {
const imageBlob = req.body.images;
const imageName = `${req.body.name}`;
const userId  = req.body.userId
if (!imageBlob || !userId) {
return res.status(400).send("Image and userId are required.");
}
// Create directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// Construct image path
const randomSixDigitNumber = generateRandomNumber();
const imagePath = path.join(uploadDir, `${imageName}-${randomSixDigitNumber}`);
let base64Image = imageBlob.split(';base64,').pop();
// Write image data to file
    fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, async (err) => {
if (err) {
        console.error('Error saving image:', err);
return res.status(500).send('Failed to save image.');
}
const postdata = new postModel({
imgPath: imagePath,
name: imageName,
format: "image",
userId : userId,
desc: req.body.desc || "",
likes: req.body.likes,
liked: req.body.liked
});
await postdata.save();
    console.log('Image saved successfully:', imagePath);
    res.status(200).send('Image uploaded successfully.');
})
}
catch (err) {
    console.log("Error ", err)
    res.status(500).send({ message: err })
}
});
app.post('/upload/video', upload.array('video', 5), async (req, res) => {
try {
    console.log("Video")
const imageBlob = req.body.images;
const imageName = `${req.body.name}`;
const userId = req.body.userId;
if (!imageBlob || !userId) {
return res.status(400).send("Video and userId are required.");
}
// Create directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/video');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// Construct image path
const randomSixDigitNumber = generateRandomNumber();
const imagePath = path.join(uploadDir, `${imageName}-${randomSixDigitNumber}`);
let base64Image = imageBlob.split(';base64,').pop();
// Write image data to file
    fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, async (err) => {
if (err) {
        console.error('Error saving image:', err);
return res.status(500).send('Failed to save image.');
}
const postdata = new postModel({
imgPath: imagePath,
name: imageName,
format: "video",
desc: req.body.desc || "",
likes: req.body.likes,
liked: req.body.liked,
userId : userId
});
await postdata.save();
    console.log('Image saved successfully:', imagePath);
    res.status(200).send('Image uploaded successfully.');
})
}
catch (err) {
    console.log("Error ", err)
    res.status(500).send({ message: err })
    }
});
module.exports = app;
