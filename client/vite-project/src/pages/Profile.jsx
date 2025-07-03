import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import '../Styles/Profile.css';

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [rewards, setRewards] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || ''
      });

      if (user.profile_image) {
        setProfilePic(`http://localhost:5000${user.profile_image}`);
      }

      // Fetch rewards only for volunteers
      if (user.role === 'volunteer') {
        fetchRewards(user.user_id);
      }
    }
  }, [user]);

  const fetchRewards = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/rewards/${userId}`);
      setRewards(res.data);
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('address', formData.address);
      if (profileFile) {
        payload.append('profileImage', profileFile);
      }

      const res = await axios.put(`http://localhost:5000/api/users/${user.user_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = {
        ...user,
        ...formData,
        profile_image: res.data.profile_image || user.profile_image
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('✅ Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('❌ Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      <div className="profile-card">
        <div className="profile-image">
          <img
            src={profilePic || '/default-profile.png'}
            alt="Profile"
            className="rounded-full w-32 h-32 object-cover"
          />
          {editMode && <input type="file" onChange={handleFileChange} />}
        </div>

        <div className="profile-details">
          {editMode ? (
            <>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
              <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
              <button onClick={handleUpdate}>Save</button>
              <button
                onClick={() => {
                  setFormData({
                    name: user.name,
                    email: user.email,
                    address: user.address || ''
                  });
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Address:</strong> {user.address || 'N/A'}</p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>

      {/* Show rewards only for volunteers */}
      {user.role === 'volunteer' && (
        <div className="rewards-section">
          <h3>Your Rewards</h3>
          {rewards.length === 0 ? (
            <p>No rewards yet</p>
          ) : (
            <table className="reward-table">
              <thead>
                <tr>
                  <th>Badge</th>
                  <th>Points</th>
                  <th>Event ID</th>
                  <th>Awarded At</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward, idx) => (
                  <tr key={idx}>
                    <td>{reward.badge_name}</td>
                    <td>{reward.points}</td>
                    <td>{reward.event_id}</td>
                    <td>{new Date(reward.awarded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
