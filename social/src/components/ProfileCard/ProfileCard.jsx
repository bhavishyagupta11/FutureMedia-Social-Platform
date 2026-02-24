import React, { useEffect, useState } from "react";
import Cover from "../../img/cover.jpg";
import ProfileImage from "../../img/profileImg.jpg";
import "./ProfileCard.css";
import { apiFetch } from "../../utils/api";

const ProfileCard = () => {
  const [profileData, setProfileData] = useState("");

  const fetchInfo = async () => {
    const formData = {
      userId: localStorage.getItem("userId"),
    };

    try {
      const response = await apiFetch("/api/profile/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Fetching profile info response", response);

      if (response.ok) {
        const resp = await response.json();
        setProfileData(resp);
      }
    } catch (error) {
      console.error("Failed to fetch profile info:", error);
      setProfileData("");
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const ProfilePage = true;

  return (
    <div className="ProfileCard">
      <div className="ProfileImages">
        <img src={Cover} alt="" />
        <img src={localStorage.getItem("image") || ProfileImage} alt="" />
      </div>

      <div className="ProfileName">
        <span>{localStorage.getItem("name")}</span>
      </div>

      <div className="followStatus">
        <div>
          <div className="follow">
            <span>{profileData?.followings}</span>
            <span className="textbased">Followings</span>
          </div>

          <div className="follow">
            <span>{profileData?.followers}</span>
            <span>Followers</span>
          </div>

          {ProfilePage && (
            <>
              <div className="follow">
                <span>{profileData?.posts}</span>
                <span>Posts</span>
              </div>
            </>
          )}
        </div>
      </div>

      {ProfilePage ? "" : <span>My Profile</span>}
    </div>
  );
};

export default ProfileCard;
