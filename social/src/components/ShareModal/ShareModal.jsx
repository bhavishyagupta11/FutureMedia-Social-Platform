import React from "react";
import PostShare from "../PostShare/PostShare";
import "./ShareModal.css";

const ShareModal = ({ modalOpened, setModalOpened, onPostCreated }) => {
  if (!modalOpened) return null;

  return (
    <div className="shareModalOverlay" onClick={() => setModalOpened(false)}>
      <div className="shareModalCard" onClick={(e) => e.stopPropagation()}>
        <div className="shareModalHeader">
          <h3>Create New Post</h3>
          <button
            type="button"
            className="shareModalClose"
            onClick={() => setModalOpened(false)}
          >
            Close
          </button>
        </div>

        <div className="shareModalTips">
          <span>Choose post type:</span>
          <span>Photo</span>
          <span>Video</span>
        </div>

        <PostShare
          isCompact={false}
          onPostCreated={() => {
            if (typeof onPostCreated === "function") {
              onPostCreated();
            }
            setModalOpened(false);
          }}
        />
      </div>
    </div>
  );
};

export default ShareModal;
