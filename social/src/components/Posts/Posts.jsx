import React, { useEffect, useState } from "react";
import "./Posts.css";
import "../Post/Post.css";
import { PostsData } from "../../Data/PostsData";
import Comment from "../../img/comment.png";
import Share from "../../img/share.png";
import Heart from "../../img/like.png";
import NotLike from "../../img/notlike.png";
import ProfileImage from "../../img/profileImg.jpg";
import { apiFetch } from "../../utils/api";

const normalizePost = (post) => {
  const source = post?._doc || post || {};
  const id = source._id || `demo-${Math.random().toString(36).slice(2, 10)}`;
  const base64Url =
    source.format === "image" && (source.image || source.postBase64)
      ? `data:image/jpeg;base64,${source.image || source.postBase64}`
      : "";

  return {
    _id: id,
    name: source.name || "FSM User",
    username: source.username || "fsm",
    desc: source.desc || "",
    likes: Number(source.likes || 0),
    likedUser: Array.isArray(source.likedUser) ? source.likedUser : [],
    format: source.format || (base64Url ? "image" : "text"),
    imageUrl: source.imageUrl || base64Url || "",
    avatar: source.avatar || source.img || ProfileImage,
    isDemo: Boolean(source.isDemo),
    rawId: source._id || "",
  };
};

const withDemoFallback = (realPosts) => {
  const normalizedRealPosts = Array.isArray(realPosts) ? realPosts : [];
  const demos = PostsData.map(normalizePost);

  if (normalizedRealPosts.length === 0) {
    return demos;
  }

  // Keep real posts first, then add demo posts so feed is never visually empty.
  return [...normalizedRealPosts, ...demos];
};

const Posts = ({ refreshToken = 0 }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/api/post/all");
      if (!response.ok) {
        setPosts(withDemoFallback([]));
        return;
      }

      const converted = await response.json();
      if (!Array.isArray(converted) || converted.length === 0) {
        setPosts(withDemoFallback([]));
        return;
      }

      setPosts(withDemoFallback(converted.map(normalizePost).reverse()));
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts(withDemoFallback([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshToken]);

  useEffect(() => {
    const handlePostCreated = () => fetchPosts();
    window.addEventListener("post:created", handlePostCreated);
    return () => window.removeEventListener("post:created", handlePostCreated);
  }, []);

  const handleLikes = async (post) => {
    if (post.isDemo || !post.rawId) {
      setPosts((current) =>
        current.map((item) =>
          item._id === post._id ? { ...item, likes: item.likes + 1 } : item
        )
      );
      return;
    }

    const formData = {
      _id: post.rawId,
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

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Failed to update like:", error);
    }
  };

  if (loading) {
    return (
      <div className="Posts">
        <div className="postsLoader">Loading your feed...</div>
      </div>
    );
  }

  return (
    <div className="Posts">
      {posts.map((post) => {
        const isLikedByUser = post.likedUser?.includes(localStorage.getItem("userId"));

        return (
          <div className="Post" key={post._id}>
            <div className="postHeader">
              <img src={post.avatar || ProfileImage} alt={post.name} className="postAvatar" />
              <div>
                <span className="postName">{post.name}</span>
                <span className="postUser">@{post.username}</span>
              </div>
            </div>

            {post.format === "image" && post.imageUrl ? <img src={post.imageUrl} alt="post" /> : null}

            {post.desc ? <p className="postDesc">{post.desc}</p> : null}

            <div className="postReact">
              <img
                src={isLikedByUser ? Heart : NotLike}
                alt="like"
                style={{ cursor: "pointer" }}
                onClick={() => handleLikes(post)}
              />
              <img src={Comment} alt="comment" style={{ cursor: "pointer" }} />
              <img src={Share} alt="share" style={{ cursor: "pointer" }} />
            </div>

            <span className="postLikes">{post.likes} likes</span>
          </div>
        );
      })}
    </div>
  );
};

export default Posts;
