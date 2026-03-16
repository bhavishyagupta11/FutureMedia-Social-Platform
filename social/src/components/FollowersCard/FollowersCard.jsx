import React, { useEffect, useState } from "react";
import "./FollowersCard.css";
import { apiFetch } from "../../utils/api";
import ProfileImage from "../../img/profileImg.jpg";
import { getSessionUserId, getStoredUserProfile, persistUserSession } from "../../utils/session";

const FollowersCard = () => {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState(getStoredUserProfile().followingList);
  const [loadingUserId, setLoadingUserId] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await apiFetch("/api/user/all");
      if (!response.ok) {
        console.error("Error fetching users:", response.status);
        setUsers([]);
        return;
      }
      const converted = await response.json();
      setUsers(converted);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const syncSession = () => setFollowing(getStoredUserProfile().followingList);
    window.addEventListener("session:updated", syncSession);
    window.addEventListener("profile:updated", syncSession);
    return () => {
      window.removeEventListener("session:updated", syncSession);
      window.removeEventListener("profile:updated", syncSession);
    };
  }, []);

  const handleFollow = async (follower) => {
    const formData = {
      currentUserId: getSessionUserId(),
      targetUserId: follower._id,
    };

    try {
      setLoadingUserId(follower._id);
      const response = await apiFetch("/api/profile/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.error("Error updating follow state:", response.status);
        return;
      }

      const userData = await response.json();
      persistUserSession(userData.currentUser);
      setFollowing(userData.currentUser?.followingsList || []);
      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === follower._id ? userData.targetUser : item
        )
      );
      window.dispatchEvent(new Event("profile:updated"));
    } catch (err) {
      console.error("Error updating follow state:", err);
    } finally {
      setLoadingUserId("");
    }
  };

  const currentUserId = getSessionUserId();

  return (
    <div className="FollowersCard">
      <h3>People you may follow</h3>

      {users.length > 0
        ? users
            .filter((item) => item._id !== currentUserId)
            .map((follower) => (
              <div className="follower" key={follower._id}>
                <div>
                  <img
                    src={follower.img || ProfileImage}
                    alt={follower.username}
                    className="followerImage"
                  />
                  <div className="name">
                    <span>{follower.firstName}</span>
                    <span>@{follower.username}</span>
                  </div>
                </div>

                <button
                  className="button fc-button"
                  onClick={() => handleFollow(follower)}
                  disabled={loadingUserId === follower._id}
                >
                  {loadingUserId === follower._id
                    ? "Saving..."
                    : following?.includes(follower._id)
                      ? "Unfollow"
                      : "Follow"}
                </button>
              </div>
            ))
        : null}
    </div>
  );
};

export default FollowersCard;
