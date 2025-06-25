import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

const Rewards = () => {
  const { user } = useContext(UserContext);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`/api/rewards/${user.user_id}`)
        .then(res => setRewards(res.data))
        .catch(err => console.error("Error fetching rewards:", err));
    }
  }, [user]);

  return (
    <div className="rewards-container">
      <h2>Your Rewards</h2>
      {rewards.map((reward, idx) => (
        <div key={idx} className="reward-card">
          <p><strong>Badge:</strong> {reward.badge_name}</p>
          <p><strong>Points:</strong> {reward.points}</p>
          <p><strong>Event ID:</strong> {reward.event_id}</p>
          <p><small>Awarded At: {new Date(reward.awarded_at).toLocaleString()}</small></p>
        </div>
      ))}
    </div>
  );
};

export default Rewards;