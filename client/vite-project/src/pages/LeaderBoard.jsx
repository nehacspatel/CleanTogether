import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Leaderboard.css"; // Make sure this file exists

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const DEFAULT_IMAGE = "/default-profile.png"; // Place this in public/

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/leaderboard");
        const data = Array.isArray(res.data) ? res.data : [];
        setLeaders(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setLeaders([]);
      }
    };

    fetchLeaders();
  }, []);

  const getImageUrl = (profile_image) => {
    if (!profile_image) return DEFAULT_IMAGE;

    // Remove any starting slashes
    const cleanPath = profile_image.startsWith("/") ? profile_image.slice(1) : profile_image;

    // Ensure it prepends the server base path
    return `http://localhost:5000/${cleanPath}`;
  };

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">🏆 Monthly Top Volunteers</h2>

      <div className="leaderboard-grid">
        {leaders.length > 0 ? (
          leaders.map((user, index) => (
            <div key={user.user_id} className="leader-card">
              <div className="profile-pic-wrapper">
                <img
                  src={getImageUrl(user.profile_image)}
                  alt={user.name}
                  className="profile-pic"
                />
              </div>
              <h3 className="leader-name">{user.name}</h3>
              <p className="leader-points">Reward Points: {user.points}</p>
              <p className="leader-rank">🥇 Rank #{index + 1}</p>
            </div>
          ))
        ) : (
          <p className="no-data">No leaderboard data available.</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;