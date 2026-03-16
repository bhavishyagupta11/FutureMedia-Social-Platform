import React, { useEffect, useState } from "react";
import "./InfoCard.css";
import { UilPen } from "@iconscout/react-unicons";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useNavigate } from "react-router-dom";
import { clearUserSession, getStoredUserProfile } from "../../utils/session";
const InfoCard = () => {
const [modalOpened, setModalOpened] = useState(false);
const navigate = useNavigate();
const [profile, setProfile] = useState(getStoredUserProfile());

useEffect(() => {
  const syncProfile = () => setProfile(getStoredUserProfile());
  window.addEventListener("session:updated", syncProfile);
  window.addEventListener("profile:updated", syncProfile);
  return () => {
    window.removeEventListener("session:updated", syncProfile);
    window.removeEventListener("profile:updated", syncProfile);
  };
}, []);

const handleLogout = () => {
  clearUserSession();
  navigate("/");
};

return (
<div className="InfoCard">
<div className="infoHead">
<h4>Your Info</h4>
<div>
<UilPen
            width="2rem"
            height="1.2rem"
            onClick={() => setModalOpened(true)}
/>
<ProfileModal
            modalOpened={modalOpened}
            setModalOpened={setModalOpened}
/>
</div>
</div>
<div className="info">
<span>
<b>Display Name </b>
</span>
<span>{profile.displayName || "FSM User"}</span>
</div>
<div className="info">
<span>
<b>Bio </b>
</span>
<span>{profile.bio || "Add a bio from Edit Profile or Settings."}</span>
</div>
<div className="info">
<span>
<b>Website </b>
</span>
<span>{profile.website || "Add your website to share more about yourself."}</span>
</div>
<button className="button logout-button" onClick={handleLogout}>Logout</button>
</div>
);
};
export default InfoCard;
