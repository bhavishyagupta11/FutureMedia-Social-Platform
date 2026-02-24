import React, { useEffect, useState } from "react";
import "./FollowersCard.css";
import { apiFetch } from "../../utils/api";

const FollowersCard = () => {
  const [users, setUsers] = useState([]);
  const [unfollow, setUnfollow] = useState([]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await apiFetch("/api/user/all");
      if (!response.ok) {
        console.error("Error fetching users:", response.status);
        setUsers([]);
        return;
      }
      const converted = await response.json();
      console.log("all users", converted);
      setUsers(converted);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    const storedFollowers = localStorage.getItem("followersList");
    // followersList is likely stored as a JSON string array of ids
    if (storedFollowers) {
      try {
        setUnfollow(JSON.parse(storedFollowers));
      } catch {
        // if for some reason it's a plain string
        setUnfollow(storedFollowers);
      }
    }
  }, []);

  const handleFollow = async (follower) => {
    const formData = {
      userId: localStorage.getItem("userId"),
      followerId: follower._id,
    };

    try {
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
      setUnfollow(userData.followersList);
      localStorage.setItem(
        "followersList",
        JSON.stringify(userData.followersList)
      );
      console.log("Posting..... info response", userData);
    } catch (err) {
      console.error("Error updating follow state:", err);
    }
  };

  const currentUserId = localStorage.getItem("userId");

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
                    src={follower.img}
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
                >
                  {unfollow?.includes(follower._id)
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
