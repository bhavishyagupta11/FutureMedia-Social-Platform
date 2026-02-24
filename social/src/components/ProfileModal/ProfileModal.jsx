import React, { useState } from "react";
import "./ProfileModal.css";

const ProfileModal = ({ modalOpened, setModalOpened }) => {
  const [displayName, setDisplayName] = useState(localStorage.getItem("name") || "");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [website, setWebsite] = useState(localStorage.getItem("website") || "");

  if (!modalOpened) return null;

  const handleSave = (event) => {
    event.preventDefault();
    localStorage.setItem("name", displayName.trim());
    localStorage.setItem("bio", bio.trim());
    localStorage.setItem("website", website.trim());
    setModalOpened(false);
  };

  return (
    <div className="profileModalOverlay" onClick={() => setModalOpened(false)}>
      <div className="profileModalCard" onClick={(e) => e.stopPropagation()}>
        <div className="profileModalHeader">
          <h3>Edit Profile</h3>
          <button type="button" onClick={() => setModalOpened(false)}>
            Close
          </button>
        </div>

        <form className="profileModalForm" onSubmit={handleSave}>
          <label htmlFor="profile-name">Display Name</label>
          <input
            id="profile-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
          />

          <label htmlFor="profile-bio">Bio</label>
          <textarea
            id="profile-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio"
          />

          <label htmlFor="profile-website">Website</label>
          <input
            id="profile-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://your-site.com"
          />

          <button className="button profileSaveButton" type="submit">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
