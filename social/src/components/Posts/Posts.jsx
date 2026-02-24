import React, { useEffect, useState } from "react";
import "./Posts.css";
import { PostsData } from "../../Data/PostsData";
import Post from "../Post/Post";
import Comment from "../../img/comment.png";
import Share from "../../img/share.png";
import Heart from "../../img/like.png";
import NotLike from "../../img/notlike.png";
import { apiFetch } from "../../utils/api";

const Posts = () => {
  const [liked, setLiked] = useState("");
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await apiFetch("/api/post/all");

      if (!response.ok) {
        console.error("Failed to fetch posts:", response.status);
        setPosts([]);
        return;
      }

      const converted = await response.json();
      setPosts(converted);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLikes = async (post) => {
    console.log("Attributes", post);
    const formData = {
      _id: post._doc._id,
      userId: localStorage.getItem("userId"),
    };
    try {
      const response = await apiFetch("/api/profile/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log("like response", response);
      if (response.ok) {
        const resp = await response.json();
        console.log("Result : ", resp);
        fetchPosts();
      }
    } catch (error) {
      console.error("Failed to update like:", error);
    }
  };

  return (
    <div className="Posts">
      {posts.length > 0
        ? [...posts].reverse().map((post, id) => {
            const imageUrl =
              post._doc.format === "image"
                ? `data:image/jpeg;base64,${post._doc.image}`
                : "";
            const isLikedByUser = post._doc.likedUser?.includes(
              localStorage.getItem("userId")
            );

            return (
              <div className="Post" id={id} key={post._doc._id}>
                {post._doc.format === "image" && (
                  <img src={imageUrl} alt="imagePost" />
                )}

                <div className="postReact">
                  <img
                    src={isLikedByUser ? Heart : NotLike}
                    alt="like"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleLikes(post)}
                  />
                  <img
                    src={Comment}
                    alt="comment"
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src={Share}
                    alt="share"
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <span
                  style={{ color: "var(--gray)", fontSize: "12px" }}
                >
                  {post._doc.likes} likes
                </span>

                <div className="detail">
                  <span>
                    <b>{post._doc.name}</b>
                  </span>
                  <span>
                    {" "}
                    {post._doc.desc === undefined ? "" : post._doc.desc}
                  </span>
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
};

export default Posts;
