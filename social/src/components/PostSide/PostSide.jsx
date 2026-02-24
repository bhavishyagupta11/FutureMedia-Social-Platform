import React, { useState } from "react";
import Posts from "../Posts/Posts";
import PostShare from "../PostShare/PostShare";
import "./PostSide.css";

const PostSide = () => {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="PostSide">
      <PostShare onPostCreated={() => setRefreshToken((prev) => prev + 1)} />
      <Posts refreshToken={refreshToken} />
    </div>
  );
};

export default PostSide;
