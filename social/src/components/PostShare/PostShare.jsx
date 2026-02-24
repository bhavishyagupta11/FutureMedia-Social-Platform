import React, { useState, useRef } from "react";
import "./PostShare.css";
import { UilScenery } from "@iconscout/react-unicons";
import { UilPlayCircle } from "@iconscout/react-unicons";
import { UilTimes } from "@iconscout/react-unicons";
import { apiFetch } from "../../utils/api";

const PostShare = () => {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [desc, setDesc] = useState("");

  const imageRef = useRef();
  const videoRef = useRef();

  const onImageChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        // e.target.result contains the base64 string representation
        setImage({
          image: URL.createObjectURL(img),
          base64String: e.target.result,
        });
      };

      reader.readAsDataURL(img);
      event.target.value = null;
    }
  };

  const postImage = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      const isImage = image !== null;

      if (isImage) {
        console.log("Hit in the image");
        formData.append("images", image.base64String);
      } else if (video !== null) {
        console.log("Hit in the video");
        formData.append("images", video.base64String);
      } else {
        // nothing to upload
        return;
      }

      formData.append("name", "Tzuyu");
      formData.append("userId", localStorage.getItem("userId"));
      formData.append("desc", desc);
      formData.append("likes", 0);
      formData.append("liked", false);

      const response = await apiFetch("/api/post/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Media uploaded successfully");
      } else {
        console.error("Error uploading media");
      }
    } catch (error) {
      console.error("Error uploading media:", error);
    }

    // Reset state and inputs
    if (imageRef.current) imageRef.current.value = null;
    if (videoRef.current) videoRef.current.value = null;
    setImage(null);
    setVideo(null);
    setDesc("");
  };

  const onVideoChange = async (event) => {
    event.preventDefault();
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        setVideo({
          video: URL.createObjectURL(file),
          base64String: e.target.result,
        });
      };

      reader.readAsDataURL(file);
      // event.target.value = null;
    }
  };

  return (
    <div className="PostShare">
      <img src={localStorage.getItem("image")} alt="" />
      <div>
        <div className="InputContainer">
          <input
            placeholder="What's happening ?!"
            type="text"
            id="files"
            name="file"
            className="input"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className="postOptions">
          <div
            className="option"
            style={{ color: "var(--photo)" }}
            onClick={() => imageRef.current && imageRef.current.click()}
          >
            <UilScenery style={{ marginRight: 5 }} />
            Photo
          </div>

          <div
            className="option"
            style={{ color: "var(--video)" }}
            onClick={() => videoRef.current && videoRef.current.click()}
          >
            <UilPlayCircle style={{ marginRight: 5 }} />
            Video
          </div>

          <button className="button-share" onClick={postImage}>
            Share
          </button>

          <div style={{ display: "none" }}>
            <input
              type="file"
              name="file"
              ref={imageRef}
              accept="image/*"
              onChange={onImageChange}
            />
            <input
              type="file"
              name="videoFile"
              ref={videoRef}
              accept="video/*"
              onChange={onVideoChange}
            />
          </div>
        </div>

        {image && (
          <div className="previewImage">
            <UilTimes onClick={() => setImage(null)} />
            <img src={image.image} alt="" />
          </div>
        )}

        {video && (
          <div className="previewImage">
            <video
              src={video.video}
              controls
              style={{ maxWidth: "100%", borderRadius: "0.5rem" }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostShare;
