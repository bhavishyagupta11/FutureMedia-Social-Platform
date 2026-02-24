import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLeft from "../../components/ProfileLeft/ProfileLeft";
import RightSide from "../../components/RightSide/RightSide";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(localStorage.getItem("name") || "");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [website, setWebsite] = useState(localStorage.getItem("website") || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSave = (event) => {
    event.preventDefault();
    localStorage.setItem("name", displayName.trim());
    localStorage.setItem("bio", bio.trim());
    localStorage.setItem("website", website.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="SettingsPage">
      <ProfileLeft />
      <div className="SettingsCenter">
        <div className="settingsCard">
          <h2>Account Settings</h2>
          <p>Customize your profile details and social identity.</p>

          <form onSubmit={handleSave} className="settingsForm">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />

            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself"
              rows={4}
            />

            <label htmlFor="website">Website</label>
            <input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-site.com"
            />

            <button className="button settingsSaveButton" type="submit">
              Save Changes
            </button>
            {saved ? <span className="settingsSaved">Saved successfully.</span> : null}
          </form>
        </div>
      </div>
      <RightSide />
    </div>
  );
};

export default Settings;
