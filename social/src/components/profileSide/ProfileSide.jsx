import React from "react";
import ProfileCard from "../ProfileCard/ProfileCard";
import { UilSetting } from "@iconscout/react-unicons";
import HomeIcon from "@mui/icons-material/Home";
import { NavLink, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import "./ProfileSide.css";

const ProfileSide = () => {
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
    <div className="ProfileSide">
      <ProfileCard />
      <div className="Menu">
        <NavLink to="/home" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}>
          <div className="menu-items">
            <HomeIcon style={{ marginRight: 10, color: "#3db3f3" }} />
            Home
          </div>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}>
          <div className="menu-items">
            <AccountCircleIcon
              style={{ marginRight: 10, color: "#3db3f3" }}
            />
            Profile
          </div>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}>
          <div className="menu-items">
            <UilSetting style={{ marginRight: 10, color: "#3db3f3" }} />
            Settings
          </div>
        </NavLink>

        <button type="button" className="menu-items menu-logout" onClick={handleLogout}>
          <LogoutIcon style={{ marginRight: 10, color: "#3db3f3" }} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfileSide;
