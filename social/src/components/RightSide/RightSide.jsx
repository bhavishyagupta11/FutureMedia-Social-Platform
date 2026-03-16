import React, { useState } from "react";
import "./RightSide.css";
import TrendCard from "../TrendCard/TrendCard";
import ShareModal from "../ShareModal/ShareModal";
import FollowersCard from "../FollowersCard/FollowersCard";
import LogoSearch from "../LogoSearch/LogoSearch";

const RightSide = () => {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <div className="RightSide">
      <LogoSearch />
      <FollowersCard />
      <button
        className="button r-button"
        onClick={() => setModalOpened(true)}
      >
        Share
      </button>
      <ShareModal
        modalOpened={modalOpened}
        setModalOpened={setModalOpened}
        onPostCreated={() => setModalOpened(false)}
      />
      <TrendCard />
    </div>
  );
};

export default RightSide;
