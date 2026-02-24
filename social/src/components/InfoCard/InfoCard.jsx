import React, { useState } from "react";
import "./InfoCard.css";
import { UilPen } from "@iconscout/react-unicons";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useNavigate } from "react-router-dom";
const InfoCard = () => {
const [modalOpened, setModalOpened] = useState(false);
const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("image");
  localStorage.removeItem("followersList");
  localStorage.removeItem("name");
  localStorage.removeItem("bio");
  localStorage.removeItem("website");
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
<b>Status </b>
</span>
<span>in Relationship</span>
</div>
<div className="info">
<span>
<b>Lives in </b>
</span>
<span>Multan</span>
</div>
<div className="info">
<span>
<b>Works at </b>
</span>
<span>Zainkeepscode inst</span>
</div>
<button className="button logout-button" onClick={handleLogout}>Logout</button>
</div>
);
};
export default InfoCard;
